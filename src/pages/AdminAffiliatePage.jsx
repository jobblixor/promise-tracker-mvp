import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAIL = 'promisetrackermvp@gmail.com';

function formatCents(cents) {
  if (cents == null) return '$0.00';
  return '$' + (cents / 100).toFixed(2);
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function PlanBadge({ plan }) {
  const colors = {
    pro: 'bg-green-500/15 text-green-400 border border-green-500/25',
    trial: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
    trial_expired: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
    expired: 'bg-red-500/15 text-red-400 border border-red-500/25',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${colors[plan] || 'bg-gray-500/15 text-gray-400 border border-gray-500/25'}`}>
      {plan || 'unknown'}
    </span>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-bg-card border border-border shadow-sm rounded-xl p-5">
      <p className="text-[12px] font-medium text-text-secondary uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      {sub && <p className="text-[12px] text-text-muted mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminAffiliatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [affiliates, setAffiliates] = useState([]);
  const [affiliateStats, setAffiliateStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  // Guard: non-admin users are redirected
  useEffect(() => {
    if (user && user.email !== ADMIN_EMAIL) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const loadAffiliates = useCallback(async () => {
    setLoading(true);
    try {
      const affiliatesSnap = await getDocs(collection(db, 'affiliates'));
      const list = affiliatesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const statsMap = {};
      await Promise.all(
        list.map(async (affiliate) => {
          // Referred users
          const usersSnap = await getDocs(
            query(collection(db, 'users'), where('referralCode', '==', affiliate.code))
          );
          const referredUsers = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

          // Commission events
          const commissionsSnap = await getDocs(
            query(collection(db, 'commissionEvents'), where('affiliateCode', '==', affiliate.code))
          );
          const commissions = commissionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

          // Count paying customers
          let payingCount = 0;
          await Promise.all(
            referredUsers.map(async (u) => {
              if (u.businessId) {
                const bizDoc = await getDoc(doc(db, 'businesses', u.businessId));
                if (bizDoc.exists() && bizDoc.data().plan === 'pro') payingCount++;
              }
            })
          );

          statsMap[affiliate.id] = {
            referredCount: referredUsers.length,
            payingCount,
            totalEarned: commissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0),
            unpaidAmount: commissions
              .filter((c) => !c.paid)
              .reduce((sum, c) => sum + (c.commissionAmount || 0), 0),
          };
        })
      );

      setAffiliates(list);
      setAffiliateStats(statsMap);
    } catch (err) {
      console.error('Failed to load affiliates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      loadAffiliates();
    }
  }, [user, loadAffiliates]);

  const loadDetail = useCallback(async (affiliate) => {
    setDetailLoading(true);
    setDetailData(null);
    try {
      const usersSnap = await getDocs(
        query(collection(db, 'users'), where('referralCode', '==', affiliate.code))
      );
      const referredUsers = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const customersWithStatus = await Promise.all(
        referredUsers.map(async (u) => {
          let plan = 'unknown';
          if (u.businessId) {
            const bizDoc = await getDoc(doc(db, 'businesses', u.businessId));
            if (bizDoc.exists()) plan = bizDoc.data().plan || 'unknown';
          }
          return { ...u, plan };
        })
      );
      // Sort by signup date desc
      customersWithStatus.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      const commissionsSnap = await getDocs(
        query(collection(db, 'commissionEvents'), where('affiliateCode', '==', affiliate.code))
      );
      const commissions = commissionsSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const aTime = a.eventDate?.toMillis?.() || 0;
          const bTime = b.eventDate?.toMillis?.() || 0;
          return bTime - aTime;
        });

      setDetailData({ customers: customersWithStatus, commissions });
    } catch (err) {
      console.error('Failed to load affiliate detail:', err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleViewDetail = (affiliate) => {
    setSelectedAffiliate(affiliate);
    loadDetail(affiliate);
  };

  const handleCloseDetail = () => {
    setSelectedAffiliate(null);
    setDetailData(null);
  };

  const markAsPaid = async (commissionId) => {
    setMarkingPaid(true);
    try {
      await updateDoc(doc(db, 'commissionEvents', commissionId), {
        paid: true,
        paidDate: serverTimestamp(),
      });
      await loadDetail(selectedAffiliate);
      // Refresh stats
      const stats = affiliateStats[selectedAffiliate.id];
      if (stats) {
        const commissionDoc = detailData?.commissions.find((c) => c.id === commissionId);
        const amount = commissionDoc?.commissionAmount || 0;
        setAffiliateStats((prev) => ({
          ...prev,
          [selectedAffiliate.id]: {
            ...prev[selectedAffiliate.id],
            unpaidAmount: Math.max(0, (prev[selectedAffiliate.id]?.unpaidAmount || 0) - amount),
          },
        }));
      }
    } catch (err) {
      console.error('Failed to mark as paid:', err);
    } finally {
      setMarkingPaid(false);
    }
  };

  const markAllAsPaid = async () => {
    if (!detailData) return;
    const unpaid = detailData.commissions.filter((c) => !c.paid);
    if (unpaid.length === 0) return;
    setMarkingPaid(true);
    try {
      await Promise.all(
        unpaid.map((c) =>
          updateDoc(doc(db, 'commissionEvents', c.id), {
            paid: true,
            paidDate: serverTimestamp(),
          })
        )
      );
      await loadDetail(selectedAffiliate);
      setAffiliateStats((prev) => ({
        ...prev,
        [selectedAffiliate.id]: {
          ...prev[selectedAffiliate.id],
          unpaidAmount: 0,
        },
      }));
    } catch (err) {
      console.error('Failed to mark all as paid:', err);
    } finally {
      setMarkingPaid(false);
    }
  };

  // Overview totals
  const totalAffiliates = affiliates.length;
  const totalReferred = Object.values(affiliateStats).reduce((sum, s) => sum + (s.referredCount || 0), 0);
  const totalRevenue = Object.values(affiliateStats).reduce((sum, s) => sum + (s.totalEarned || 0), 0);
  const totalUnpaid = Object.values(affiliateStats).reduce((sum, s) => sum + (s.unpaidAmount || 0), 0);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Header */}
      <div className="border-b border-border bg-bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-text-primary">Affiliate Dashboard</h1>
            <p className="text-[12px] text-text-secondary mt-0.5">Admin view — manage referral partners</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-[13px] text-text-secondary hover:text-text-primary transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Overview */}
            <section className="mb-8">
              <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-4">Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Affiliates" value={totalAffiliates} />
                <StatCard label="Referred Customers" value={totalReferred} />
                <StatCard label="Total Commissions" value={formatCents(totalRevenue)} sub="all time" />
                <StatCard label="Unpaid Commissions" value={formatCents(totalUnpaid)} sub="pending payout" />
              </div>
            </section>

            {/* Affiliate List */}
            <section>
              <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-4">Affiliates</h2>
              {affiliates.length === 0 ? (
                <div className="bg-bg-card border border-border shadow-sm rounded-xl p-10 text-center">
                  <p className="text-text-secondary text-sm">No affiliates yet.</p>
                  <p className="text-text-muted text-[12px] mt-1">Add affiliate docs manually in Firestore under the <code className="text-accent">affiliates</code> collection.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {affiliates.map((affiliate) => {
                    const stats = affiliateStats[affiliate.id] || {};
                    const isSelected = selectedAffiliate?.id === affiliate.id;
                    return (
                      <div
                        key={affiliate.id}
                        className={`bg-bg-card border rounded-xl shadow-sm overflow-hidden transition-all duration-200 ${
                          isSelected ? 'border-accent/40' : 'border-border hover:border-border/60'
                        }`}
                      >
                        {/* Affiliate card row */}
                        <div className="p-5">
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            {/* Identity */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-[15px] font-semibold text-text-primary">{affiliate.name}</h3>
                                {!affiliate.active && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/25">
                                    Inactive
                                  </span>
                                )}
                              </div>
                              <p className="text-[12px] text-text-secondary mb-1">{affiliate.channelName || affiliate.email}</p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-mono text-[12px] text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded">
                                  ?ref={affiliate.code}
                                </span>
                                <button
                                  onClick={() =>
                                    navigator.clipboard?.writeText(`https://promisetracker.app?ref=${affiliate.code}`)
                                  }
                                  className="text-[11px] text-text-muted hover:text-text-primary transition-colors underline underline-offset-2"
                                >
                                  Copy link
                                </button>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 shrink-0">
                              <div className="text-center">
                                <p className="text-lg font-bold text-text-primary">{stats.referredCount ?? 0}</p>
                                <p className="text-[10px] text-text-muted uppercase tracking-wide">Referred</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-[#22c55e]">{stats.payingCount ?? 0}</p>
                                <p className="text-[10px] text-text-muted uppercase tracking-wide">Paying</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-text-primary">{formatCents(stats.totalEarned)}</p>
                                <p className="text-[10px] text-text-muted uppercase tracking-wide">Earned</p>
                              </div>
                              <div className="text-center">
                                <p className={`text-lg font-bold ${(stats.unpaidAmount || 0) > 0 ? 'text-yellow-500' : 'text-text-muted'}`}>
                                  {formatCents(stats.unpaidAmount)}
                                </p>
                                <p className="text-[10px] text-text-muted uppercase tracking-wide">Unpaid</p>
                              </div>
                            </div>

                            {/* Action */}
                            <div className="shrink-0">
                              <button
                                onClick={() => (isSelected ? handleCloseDetail() : handleViewDetail(affiliate))}
                                className="px-4 py-2 text-[13px] font-medium rounded-lg bg-bg-card-hover hover:bg-border text-text-primary transition-colors border border-border whitespace-nowrap"
                              >
                                {isSelected ? 'Hide Details' : 'View Details'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Detail Panel */}
                        {isSelected && (
                          <div className="border-t border-border bg-bg-card-hover px-5 pb-6 pt-5">
                            {detailLoading ? (
                              <div className="flex items-center justify-center py-10">
                                <div className="w-6 h-6 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
                              </div>
                            ) : detailData ? (
                              <div className="space-y-6">
                                {/* Referred Customers */}
                                <div>
                                  <h4 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-3">
                                    Referred Customers ({detailData.customers.length})
                                  </h4>
                                  {detailData.customers.length === 0 ? (
                                    <p className="text-[13px] text-text-muted">No referred customers yet.</p>
                                  ) : (
                                    <div className="rounded-lg border border-border overflow-hidden">
                                      <table className="w-full text-[13px]">
                                        <thead>
                                          <tr className="bg-bg-card-hover border-b border-border">
                                            <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Email</th>
                                            <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Business</th>
                                            <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Signed Up</th>
                                            <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Plan</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {detailData.customers.map((customer, i) => (
                                            <tr
                                              key={customer.id}
                                              className={i % 2 === 0 ? 'bg-transparent' : 'bg-black/[0.02]'}
                                            >
                                              <td className="px-4 py-3 text-text-primary">{customer.email}</td>
                                              <td className="px-4 py-3 text-text-secondary">{customer.businessName || '—'}</td>
                                              <td className="px-4 py-3 text-text-muted">{formatDate(customer.createdAt)}</td>
                                              <td className="px-4 py-3">
                                                <PlanBadge plan={customer.plan} />
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>

                                {/* Commission Events */}
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
                                      Commission Events ({detailData.commissions.length})
                                    </h4>
                                    {detailData.commissions.some((c) => !c.paid) && (
                                      <button
                                        onClick={markAllAsPaid}
                                        disabled={markingPaid}
                                        className="px-3 py-1.5 text-[12px] font-semibold rounded-lg bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/25 transition-colors disabled:opacity-50"
                                      >
                                        {markingPaid ? 'Marking...' : 'Mark All as Paid'}
                                      </button>
                                    )}
                                  </div>
                                  {detailData.commissions.length === 0 ? (
                                    <p className="text-[13px] text-text-muted">No commission events yet.</p>
                                  ) : (
                                    <div className="rounded-lg border border-border overflow-hidden">
                                      <table className="w-full text-[13px]">
                                        <thead>
                                          <tr className="bg-bg-card-hover border-b border-border">
                                            <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Date</th>
                                            <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Customer</th>
                                            <th className="text-right px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Payment</th>
                                            <th className="text-right px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Commission</th>
                                            <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Status</th>
                                            <th className="px-4 py-3" />
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {detailData.commissions.map((event, i) => (
                                            <tr
                                              key={event.id}
                                              className={i % 2 === 0 ? 'bg-transparent' : 'bg-black/[0.02]'}
                                            >
                                              <td className="px-4 py-3 text-text-muted">{formatDate(event.eventDate)}</td>
                                              <td className="px-4 py-3 text-text-primary">{event.customerEmail}</td>
                                              <td className="px-4 py-3 text-right text-text-secondary">{formatCents(event.paymentAmount)}</td>
                                              <td className="px-4 py-3 text-right font-semibold text-[#22c55e]">{formatCents(event.commissionAmount)}</td>
                                              <td className="px-4 py-3">
                                                {event.paid ? (
                                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-500/15 text-green-400 border border-green-500/25">
                                                    Paid {event.paidDate ? formatDate(event.paidDate) : ''}
                                                  </span>
                                                ) : (
                                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
                                                    Unpaid
                                                  </span>
                                                )}
                                              </td>
                                              <td className="px-4 py-3 text-right">
                                                {!event.paid && (
                                                  <button
                                                    onClick={() => markAsPaid(event.id)}
                                                    disabled={markingPaid}
                                                    className="px-3 py-1 text-[11px] font-semibold rounded-md bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/25 transition-colors disabled:opacity-50 whitespace-nowrap"
                                                  >
                                                    Mark Paid
                                                  </button>
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
