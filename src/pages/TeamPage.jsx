import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';

const roleBadgeColors = {
  owner: 'bg-green-500/15 text-green-400 ring-green-500/25',
  manager: 'bg-blue-500/15 text-blue-400 ring-blue-500/25',
  receptionist: 'bg-yellow-500/15 text-yellow-400 ring-yellow-500/25',
  tech: 'bg-gray-500/15 text-gray-400 ring-gray-500/25',
};

const roleOptions = ['manager', 'receptionist', 'tech'];

function CrownIcon() {
  return (
    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06l-3.69.97-3.34-5.42a1.5 1.5 0 00-2.4 0l-3.34 5.42-3.69-.97a1.5 1.5 0 00-1.84 1.06 1.5 1.5 0 00.14 1.14l2.65 4.22h16.56l2.65-4.22c.26-.36.32-.82.14-1.14z" />
    </svg>
  );
}

function MemberCard({ member, isOwner, currentUserId, onRemove, onRoleChange }) {
  const [roleDropdown, setRoleDropdown] = useState(false);
  const [removing, setRemoving] = useState(false);
  const isCurrentUser = member.uid === currentUserId;
  const isMemberOwner = member.role === 'owner';
  const joinedDate = member.createdAt?.toDate
    ? member.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : member.createdAt
      ? new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '—';

  return (
    <div className="group bg-bg-card border border-border/40 rounded-xl p-5 hover:border-border/70 hover:bg-bg-card-hover transition-all duration-200 animate-fade-in-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ring-1 shrink-0 ${
            isMemberOwner
              ? 'bg-accent/15 text-accent ring-accent/25'
              : 'bg-white/[0.06] text-text-muted ring-white/10'
          }`}>
            {member.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-text-primary truncate">
                {member.email?.split('@')[0] || 'Unknown'}
              </p>
              {isMemberOwner && <CrownIcon />}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ring-1 ${roleBadgeColors[member.role] || roleBadgeColors.tech}`}>
                {member.role}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5 truncate">{member.email}</p>
            <div className="flex items-center gap-4 mt-2">
              {member.phone && (
                <span className="text-[11px] text-text-muted flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {member.phone}
                </span>
              )}
              <span className="text-[11px] text-text-muted flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Joined {joinedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Actions — only owner can manage others */}
        {isOwner && !isMemberOwner && !isCurrentUser && (
          <div className="flex items-center gap-2 shrink-0">
            {/* Role dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdown(!roleDropdown)}
                className="px-2.5 py-1.5 text-[11px] font-medium text-text-muted bg-white/[0.04] hover:bg-white/[0.08] border border-border/40 rounded-lg transition-all duration-200"
              >
                Change role
              </button>
              {roleDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setRoleDropdown(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 bg-bg-card border border-border/60 rounded-xl shadow-xl shadow-black/30 py-1 min-w-[140px] animate-fade-in-up">
                    {roleOptions.map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          onRoleChange(member.uid, role);
                          setRoleDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors duration-150 ${
                          member.role === role
                            ? 'text-accent bg-accent/5'
                            : 'text-text-secondary hover:bg-white/[0.04]'
                        }`}
                      >
                        <span className="capitalize">{role}</span>
                        {member.role === role && <span className="ml-2 text-accent">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Remove button */}
            <button
              onClick={async () => {
                setRemoving(true);
                await onRemove(member.uid);
                setRemoving(false);
              }}
              disabled={removing}
              className="px-2.5 py-1.5 text-[11px] font-medium text-red-400/70 hover:text-red-400 bg-red-500/[0.04] hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {removing ? '...' : 'Remove'}
            </button>
          </div>
        )}
        {isCurrentUser && (
          <span className="text-[10px] font-medium text-text-muted bg-white/[0.04] px-2 py-1 rounded-md">You</span>
        )}
      </div>
    </div>
  );
}

function PendingInviteCard({ invite, onCopyLink }) {
  const createdDate = invite.createdAt?.toDate
    ? invite.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div className="bg-bg-card border border-dashed border-border/60 rounded-xl p-5 animate-fade-in-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center ring-1 ring-white/10 shrink-0">
            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary">{invite.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ring-1 ${roleBadgeColors[invite.role] || roleBadgeColors.tech}`}>
                {invite.role}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20">
                Pending
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-1.5">Invited {createdDate}</p>
          </div>
        </div>
        <button
          onClick={() => onCopyLink(invite.id)}
          className="px-3 py-1.5 text-[11px] font-medium text-accent bg-accent/[0.06] hover:bg-accent/15 border border-accent/15 hover:border-accent/25 rounded-lg transition-all duration-200 flex items-center gap-1.5 shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
          </svg>
          Copy Link
        </button>
      </div>
    </div>
  );
}

function SkeletonMemberCard() {
  return (
    <div className="bg-bg-card border border-border/40 rounded-xl p-5">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white/[0.06] animate-shimmer shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="h-4 w-28 rounded-md bg-white/[0.06] animate-shimmer" />
            <div className="h-4 w-16 rounded-full bg-white/[0.04] animate-shimmer" />
          </div>
          <div className="h-3 w-40 rounded-md bg-white/[0.04] animate-shimmer" />
          <div className="flex gap-4">
            <div className="h-3 w-24 rounded-md bg-white/[0.03] animate-shimmer" />
            <div className="h-3 w-20 rounded-md bg-white/[0.03] animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('tech');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviting, setInviting] = useState(false);

  const isOwner = user?.role === 'owner';

  // Subscribe to team members
  useEffect(() => {
    if (!user?.businessId) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'users'),
      where('businessId', '==', user.businessId),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
        // Sort: owner first, then alphabetical
        data.sort((a, b) => {
          if (a.role === 'owner') return -1;
          if (b.role === 'owner') return 1;
          return (a.email || '').localeCompare(b.email || '');
        });
        setMembers(data);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsubscribe;
  }, [user?.businessId]);

  // Subscribe to pending invites
  useEffect(() => {
    if (!user?.businessId) return;
    const q = query(
      collection(db, 'invites'),
      where('businessId', '==', user.businessId),
      where('status', '==', 'pending'),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInvites(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [user?.businessId]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await addDoc(collection(db, 'invites'), {
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
        phone: invitePhone.trim(),
        businessId: user.businessId,
        businessName: user.businessName,
        invitedBy: user.uid,
        createdAt: serverTimestamp(),
        status: 'pending',
      });
      toast.success('Invite sent successfully');
      setInviteEmail('');
      setInvitePhone('');
      setInviteRole('tech');
      setShowInviteForm(false);
    } catch {
      toast.error('Failed to send invite');
    }
    setInviting(false);
  };

  const handleCopyLink = (inviteId) => {
    const link = `${window.location.origin}/signup?invite=${inviteId}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard');
  };

  const handleRemoveMember = async (uid) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
      toast.success('Team member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const handleRoleChange = async (uid, newRole) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      toast.success('Role updated successfully');
    } catch {
      toast.error('Failed to update role');
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Team</h1>
            <p className="text-sm text-text-muted mt-1">
              {loading ? '...' : `${members.length} member${members.length !== 1 ? 's' : ''}`}
              {invites.length > 0 && ` · ${invites.length} pending`}
            </p>
          </div>
          {isOwner && (
            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              Invite Member
            </button>
          )}
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <div className="bg-bg-card border border-border/60 rounded-xl p-6 mb-6 animate-fade-in-up">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Invite a team member</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    placeholder="teammate@company.com"
                    className="w-full px-3.5 py-2.5 bg-bg-primary border border-border rounded-[10px] text-sm text-text-secondary placeholder:text-text-muted/40 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3.5 py-2.5 bg-bg-primary border border-border rounded-[10px] text-sm text-text-secondary placeholder:text-text-muted/40 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all duration-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bg-primary border border-border rounded-[10px] text-sm text-text-secondary focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="manager">Manager</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="tech">Tech</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-semibold rounded-[10px] transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.25)] flex items-center gap-2"
                >
                  {inviting ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                  ) : 'Send Invite'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text-secondary transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Pending Invites</h3>
            <div className="space-y-3 stagger-children">
              {invites.map((invite) => (
                <PendingInviteCard key={invite.id} invite={invite} onCopyLink={handleCopyLink} />
              ))}
            </div>
          </div>
        )}

        {/* Team Members */}
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Team Members</h3>
          {loading ? (
            <div className="space-y-3">
              <SkeletonMemberCard />
              <SkeletonMemberCard />
              <SkeletonMemberCard />
            </div>
          ) : members.length === 0 ? (
            <div className="bg-bg-card border border-border/40 rounded-xl p-12 text-center animate-fade-in-up">
              <p className="text-3xl mb-3">👥</p>
              <p className="text-sm font-semibold text-text-secondary">No team members yet</p>
              <p className="text-xs text-text-muted mt-1">Invite your first team member to get started</p>
            </div>
          ) : (
            <div className="space-y-3 stagger-children">
              {members.map((member) => (
                <MemberCard
                  key={member.uid}
                  member={member}
                  isOwner={isOwner}
                  currentUserId={user?.uid}
                  onRemove={handleRemoveMember}
                  onRoleChange={handleRoleChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
