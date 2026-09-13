#!/usr/bin/env node
// Usage: node scripts/trialused-backfill.mjs dry-run
//        node scripts/trialused-backfill.mjs flip <fingerprint-id> [...ids]
// Credentials are read only from GCLOUD_ACCESS_TOKEN; never written or logged.
const PROJECT = 'promise-tracker-mvp';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const [mode, ...ids] = process.argv.slice(2);

function validId(id) {
  return typeof id === 'string' && id.length > 0 && Buffer.byteLength(id, 'utf8') <= 1500
    && !/[\/\u0000-\u001f\u007f]/u.test(id) && id !== '.' && id !== '..'
    && !/^__.*__$/u.test(id);
}

function decode(value) {
  if ('nullValue' in value) return null;
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decode);
  if ('integerValue' in value) return Number(value.integerValue);
  return Object.values(value)[0];
}

function decodeFields(fields) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decode(value)]));
}

function document(raw) {
  return { id: raw.name.split('/').at(-1), data: decodeFields(raw.fields || {}), updateTime: raw.updateTime };
}

async function rest(path, { method = 'GET', body, allowMissing = false } = {}) {
  let response;
  try {
    response = await fetch(`${BASE}/${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${process.env.GCLOUD_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'x-goog-user-project': PROJECT,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error(`${method} Firestore request failed (network error; details suppressed).`);
  }
  if (allowMissing && response.status === 404) return null;
  if (!response.ok) throw new Error(`${method} Firestore request failed: HTTP ${response.status}.`);
  try {
    return await response.json();
  } catch {
    throw new Error(`${method} Firestore response was not valid JSON.`);
  }
}

async function list(collection) {
  const docs = [];
  let pageToken;
  do {
    const params = new URLSearchParams({ pageSize: '1000' });
    if (pageToken) params.set('pageToken', pageToken);
    const page = await rest(`${collection}?${params}`);
    docs.push(...(page.documents || []).map(document));
    pageToken = page.nextPageToken;
  } while (pageToken);
  return docs.sort((a, b) => a.id.localeCompare(b.id));
}

async function get(collection, id) {
  if (!validId(id)) return null;
  const raw = await rest(`${collection}/${encodeURIComponent(id)}`, { allowMissing: true });
  return raw ? document(raw) : null;
}

function classify(fingerprint, businesses, users) {
  const { userId, businessId } = fingerprint.data;
  const directBusiness = businesses.get(businessId);
  let ownedBusiness;
  if (typeof userId === 'string' && userId.length > 0) {
    if (directBusiness?.data.ownerId === userId) ownedBusiness = directBusiness;
    else if (!directBusiness) {
      ownedBusiness = [...businesses.values()].find((business) => business.data.ownerId === userId);
    }
  }
  const user = users.get(userId)?.data;
  const classification = ownedBusiness ? 'OWNER'
    : user && Object.hasOwn(user, 'role') && user.role !== 'owner' ? 'INVITE' : 'UNKNOWN';
  return {
    id: fingerprint.id,
    userId: userId ?? null,
    businessId: businessId ?? null,
    classification,
    trialUsedPresent: Object.hasOwn(fingerprint.data, 'trialUsed'),
    trialUsed: Object.hasOwn(fingerprint.data, 'trialUsed') ? fingerprint.data.trialUsed : 'MISSING',
    emailCanonical: fingerprint.data.emailCanonical ?? 'MISSING = pre-migration',
    ownerBusinessId: ownedBusiness?.id ?? null,
    businessPlan: (ownedBusiness || directBusiness)?.data.plan ?? 'MISSING',
    createdAt: fingerprint.data.createdAt ?? 'MISSING',
  };
}

const candidate = (row) => row.classification === 'OWNER' && row.trialUsed === false;
const byId = (docs) => new Map(docs.map((doc) => [doc.id, doc]));

async function snapshot() {
  const [fingerprints, businesses, users] = await Promise.all([
    list('fingerprints'), list('businesses'), list('users'),
  ]);
  const businessMap = byId(businesses);
  const userMap = byId(users);
  return fingerprints.map((doc) => classify(doc, businessMap, userMap));
}

function report(rows) {
  const counts = Object.fromEntries(['OWNER', 'INVITE', 'UNKNOWN'].map((kind) => [kind, {
    total: 0, true: 0, false: 0, missing: 0, other: 0,
  }]));
  for (const row of rows) {
    const count = counts[row.classification];
    count.total++;
    const bucket = !row.trialUsedPresent ? 'missing' : row.trialUsed === true ? 'true'
      : row.trialUsed === false ? 'false' : 'other';
    count[bucket]++;
  }
  console.log(JSON.stringify({
    project: PROJECT, mode: 'dry-run', total: rows.length, counts, documents: rows,
    candidateCount: rows.filter(candidate).length,
    candidates: rows.filter(candidate), unknown: rows.filter((row) => row.classification === 'UNKNOWN'),
  }, null, 2));
}

async function freshCandidate(id) {
  const fingerprint = await get('fingerprints', id);
  if (!fingerprint) throw new Error(`Refusing ${id}: fingerprint no longer exists.`);
  const { userId, businessId } = fingerprint.data;
  const [directBusiness, user] = await Promise.all([get('businesses', businessId), get('users', userId)]);
  const businesses = directBusiness ? [directBusiness] : await list('businesses');
  const row = classify(fingerprint, byId(businesses), byId(user ? [user] : []));
  if (!candidate(row)) throw new Error(`Refusing ${id}: no longer an OWNER trialUsed=false candidate.`);
  if (!fingerprint.updateTime) throw new Error(`Refusing ${id}: missing updateTime precondition.`);
  return fingerprint;
}

async function main() {
  if (!['dry-run', 'flip'].includes(mode)) throw new Error('Usage: dry-run OR flip <id> [...ids].');
  if (mode === 'dry-run' && ids.length) throw new Error('dry-run accepts no IDs.');
  if (mode === 'flip' && !ids.length) throw new Error('flip requires an explicit fingerprint ID list.');
  if (ids.some((id) => !validId(id))) throw new Error('Refusing invalid fingerprint ID.');
  if (new Set(ids).size !== ids.length) throw new Error('Refusing duplicate fingerprint IDs.');
  if (!process.env.GCLOUD_ACCESS_TOKEN?.trim()) throw new Error('GCLOUD_ACCESS_TOKEN environment variable is required.');

  const rows = await snapshot();
  if (mode === 'dry-run') return report(rows);
  const candidates = new Set(rows.filter(candidate).map((row) => row.id));
  for (const id of ids) {
    if (!candidates.has(id)) throw new Error(`Refusing ${id}: not an OWNER trialUsed=false candidate.`);
  }
  // Validate the whole explicit list before the first write, then refresh each
  // candidate and its ownership immediately before its conditional PATCH.
  for (const id of ids) await freshCandidate(id);
  console.log(`Preflight passed for ${ids.length} explicit IDs in ${PROJECT}.`);
  for (const id of ids) {
    const fingerprint = await freshCandidate(id);
    const params = new URLSearchParams({
      'updateMask.fieldPaths': 'trialUsed',
      'currentDocument.updateTime': fingerprint.updateTime,
    });
    console.log(`PATCH ${id}: trialUsed false -> true`);
    await rest(`fingerprints/${encodeURIComponent(id)}?${params}`, {
      method: 'PATCH', body: { fields: { trialUsed: { booleanValue: true } } },
    });
    const confirmed = await get('fingerprints', id);
    if (confirmed?.data.trialUsed !== true) throw new Error(`Confirmation failed for ${id}; stopping.`);
    console.log(`CONFIRMED ${id}: trialUsed=true updateTime=${confirmed.updateTime}`);
  }
  console.log(`Completed ${ids.length} flips. Run dry-run again to inspect remaining candidates.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
