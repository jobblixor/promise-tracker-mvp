/**
 * Anti-abuse fingerprinting utilities for Promise Tracker.
 * Collects browser fingerprint, device ID, and IP address to prevent
 * trial abuse from repeated signups.
 */

/**
 * Simple string hash (djb2 algorithm). No crypto needed — this is
 * for fingerprint deduplication, not security.
 */
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return hash.toString(36);
}

/**
 * Generate a browser fingerprint hash from stable browser properties.
 */
export function getBrowserFingerprint() {
  const components = [
    screen.width,
    screen.height,
    navigator.language,
    (navigator.languages || []).join(','),
    navigator.userAgent,
    navigator.hardwareConcurrency,
    navigator.platform,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen.colorDepth,
    screen.pixelDepth,
  ];
  return hashString(components.join('|'));
}

/**
 * Get or create a persistent device ID stored in localStorage.
 */
export function getDeviceId() {
  const KEY = 'pt_device_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

/**
 * Fetch the user's public IP address.
 */
export async function getIpAddress() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch {
    return null;
  }
}
