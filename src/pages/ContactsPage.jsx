import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';

export default function ContactsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    document.title = 'Contacts — Promise Tracker';
  }, []);

  useEffect(() => {
    if (!user?.businessId) return;
    const fetchContacts = async () => {
      try {
        const q = query(
          collection(db, 'contacts'),
          where('businessId', '==', user.businessId),
          orderBy('lastContact', 'desc')
        );
        const snap = await getDocs(q);
        setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Failed to fetch contacts:', err);
        toast.error('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [user]);

  const filtered = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPromises = contacts.reduce((sum, c) => sum + (c.promiseCount || 0), 0);
  const lastActivity = contacts.length > 0 && contacts[0]?.lastContact
    ? (() => {
        const d = contacts[0].lastContact.toDate ? contacts[0].lastContact.toDate() : new Date(contacts[0].lastContact);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      })()
    : '—';

  const handleSaveEdit = async (contactId) => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    try {
      await updateDoc(doc(db, 'contacts', contactId), {
        name: editName.trim(),
        nameLower: editName.trim().toLowerCase(),
      });
      setContacts(prev => prev.map(c =>
        c.id === contactId ? { ...c, name: editName.trim(), nameLower: editName.trim().toLowerCase() } : c
      ));
      setEditingId(null);
      toast.success('Contact updated');
    } catch (err) {
      toast.error('Failed to update contact');
    }
  };

  const handleDelete = async (contactId, name) => {
    if (!window.confirm(`Delete contact "${name}"? This won't affect any existing promises.`)) return;
    try {
      await deleteDoc(doc(db, 'contacts', contactId));
      setContacts(prev => prev.filter(c => c.id !== contactId));
      toast.success('Contact deleted');
    } catch (err) {
      toast.error('Failed to delete contact');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div>
            <div className="h-7 w-32 rounded-md bg-black/[0.06] animate-shimmer" />
            <div className="h-4 w-56 rounded-md bg-black/[0.04] animate-shimmer mt-2" />
          </div>
          {/* Stats shimmer */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-bg-card border border-border/40 shadow-sm rounded-xl p-4 flex flex-col items-center">
                <div className="h-7 w-10 rounded-md bg-black/[0.06] animate-shimmer" />
                <div className="h-3 w-16 rounded-md bg-black/[0.06] animate-shimmer mt-2" />
              </div>
            ))}
          </div>
          <div className="bg-bg-card border border-border/40 rounded-2xl p-6">
            <div className="h-5 w-28 rounded-md bg-black/[0.06] animate-shimmer mb-5" />
            <div className="divide-y divide-border/30">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3.5 px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-black/[0.06] animate-shimmer shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 rounded-md bg-black/[0.06] animate-shimmer" />
                    <div className="h-3 w-24 rounded-md bg-black/[0.04] animate-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Contacts</h1>
          <p className="text-sm text-text-secondary mt-1">
            {contacts.length} customer{contacts.length !== 1 ? 's' : ''} learned from your promises
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-bg-card border border-border/40 shadow-sm rounded-xl p-4 text-center animate-fade-in-up">
            <div className="text-2xl font-bold text-text-primary">{contacts.length}</div>
            <div className="text-[11px] text-text-muted mt-1">Contacts</div>
          </div>
          <div className="bg-bg-card border border-border/40 shadow-sm rounded-xl p-4 text-center animate-fade-in-up">
            <div className="text-2xl font-bold text-text-primary">{totalPromises}</div>
            <div className="text-[11px] text-text-muted mt-1">Total Promises</div>
          </div>
          <div className="bg-bg-card border border-border/40 shadow-sm rounded-xl p-4 text-center animate-fade-in-up">
            <div className="text-2xl font-bold text-text-primary">{lastActivity}</div>
            <div className="text-[11px] text-text-muted mt-1">Last Activity</div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-bg-card border border-border/40 shadow-sm rounded-2xl p-6 animate-fade-in-up">
          {/* Section header */}
          <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-4.5 h-4.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            All Contacts
          </h2>

          {/* Search */}
          {contacts.length > 0 && (
            <div className="relative mb-4">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-bg-card border border-border/40 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-all duration-200"
              />
              {search.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Empty state */}
          {contacts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-12 h-12 text-text-muted mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className="text-text-secondary font-medium">No contacts yet</p>
              <p className="text-xs text-text-muted mt-1 max-w-xs text-center">
                Contacts are automatically learned when you create promises via SMS
              </p>
            </div>
          )}

          {/* Contact list */}
          {filtered.length > 0 && (
            <div className="divide-y divide-border/30 stagger-children">
              {filtered.map((contact) => (
                <div key={contact.id} className="relative flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 hover:bg-bg-card-hover group overflow-hidden before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-0 before:bg-accent before:rounded-full group-hover:before:h-6 before:transition-all before:duration-200">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center text-base font-bold ring-1 ring-accent/20 shrink-0">
                      {contact.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    {/* Name + metadata */}
                    <div className="min-w-0 flex-1">
                      {editingId === contact.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(contact.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                            className="px-3 py-1.5 rounded-xl bg-bg-card border border-accent/40 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/25 transition-all duration-200"
                          />
                          <button
                            onClick={() => handleSaveEdit(contact.id)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-all duration-200"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-text-primary truncate">{contact.name}</p>
                      )}
                      {editingId !== contact.id && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-text-muted">
                            {contact.promiseCount || 0} promise{(contact.promiseCount || 0) !== 1 ? 's' : ''}
                          </span>
                          <span className="text-xs text-text-muted">·</span>
                          <span className="text-xs text-text-muted">
                            Last: {formatDate(contact.lastContact)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  {editingId !== contact.id && (
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={() => {
                          setEditingId(contact.id);
                          setEditName(contact.name || '');
                        }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-accent transition-colors duration-150"
                        title="Edit name"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id, contact.name)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-red-400 transition-colors duration-150"
                        title="Delete contact"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No search results */}
          {contacts.length > 0 && filtered.length === 0 && (
            <p className="text-sm text-text-muted text-center py-8">No contacts matching "{search}"</p>
          )}
        </div>

        <p className="text-center text-xs text-[#64748b] mt-8 pb-4">
          Need help?{' '}
          <a href="mailto:support@promisetracker.app" className="text-accent hover:underline">support@promisetracker.app</a>
        </p>
      </div>
    </Layout>
  );
}
