'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from '@/components/Toast';

interface User {
  id: number;
  username: string;
  fullname: string | null;
  email: string | null;
  activated: number;
}

export default function AdminEmailPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '500' });
    if (search) params.set('search', search);
    fetch(`/api/admin/users?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setUsers(d.users);
          setSelectAll(false);
        } else {
          toast.error('Failed to load users');
        }
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleUser = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
    setSelectAll(false);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      const withEmail = users.filter(u => u.email);
      setSelectedIds(withEmail.map(u => u.id));
      setSelectAll(true);
    }
  };

  const handleSend = async () => {
    if (!subject.trim()) { toast.error('Subject is required'); return; }
    if (!message.trim()) { toast.error('Message is required'); return; }
    if (selectedIds.length === 0) { toast.error('Select at least one user'); return; }

    if (!confirm(`Send email to ${selectedIds.length} recipient(s)?`)) return;

    setSending(true);
    try {
      const res = await fetch('/api/admin/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_ids: selectedIds, subject: subject.trim(), message: message.trim() }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(d.message);
        setSubject('');
        setMessage('');
        setSelectedIds([]);
        setSelectAll(false);
      } else {
        toast.error(d.error || 'Failed to send');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Send Email</h1>
        <p className="text-sm text-zinc-400">Compose and send emails to platform users</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Compose */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Email subject"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write your message here..."
                rows={14}
                className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={sending || selectedIds.length === 0}
              className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:opacity-50"
            >
              {sending
                ? `Sending to ${selectedIds.length} recipient(s)...`
                : `Send to ${selectedIds.length} recipient(s)`}
            </button>
          </div>
        </div>

        {/* User selector */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 p-4 pb-3">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-white"
            />
            <span className="text-xs text-zinc-400">
              {selectAll ? 'Deselect all' : 'Select all with email'} ({users.filter(u => u.email).length} available)
            </span>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-sm text-zinc-500">Loading...</div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-500">No users found.</div>
            ) : (
              users.map(u => (
                <label
                  key={u.id}
                  className={`flex cursor-pointer items-center gap-3 border-b border-zinc-800/50 px-4 py-2.5 text-sm transition hover:bg-zinc-800/50 ${!u.email ? 'opacity-40' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(u.id)}
                    onChange={() => toggleUser(u.id)}
                    disabled={!u.email}
                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-white"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-white">{u.username}</div>
                    <div className="truncate text-xs text-zinc-500">{u.email || 'No email'}</div>
                  </div>
                  {u.activated ? (
                    <span className="shrink-0 rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-medium text-green-400">Active</span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-zinc-700 px-2 py-0.5 text-[10px] font-medium text-zinc-400">Inactive</span>
                  )}
                </label>
              ))
            )}
          </div>

          <div className="border-t border-zinc-800 px-4 py-3 text-xs text-zinc-500">
            {selectedIds.length} of {users.filter(u => u.email).length} selected
          </div>
        </div>
      </div>
    </div>
  );
}
