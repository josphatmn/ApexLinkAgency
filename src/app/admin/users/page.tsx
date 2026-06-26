'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/components/Toast';

interface User {
  id: number;
  username: string;
  fullname: string | null;
  email: string | null;
  phone: string;
  activated: number;
  balance: number;
  referral_code: string;
  referred_by_username: string | null;
  created_at: string;
  referrals: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [tokenUser, setTokenUser] = useState<User | null>(null);
  const [tokenAmount, setTokenAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    fetch(`/api/admin/users?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setUsers(d.users);
          setTotalPages(d.lastPage || 1);
        } else {
          toast.error('Failed to load users');
        }
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const toggleActivation = async (userId: number, current: number) => {
    const res = await fetch('/api/admin/users/toggle-activation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success(current ? 'User deactivated' : 'User activated');
      fetchUsers();
    } else {
      toast.error(d.error || 'Failed to toggle');
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editUser) return;
    setSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await fetch('/api/admin/users/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: editUser.id,
        fullname: formData.get('fullname') || null,
        email: formData.get('email') || null,
        phone: formData.get('phone') || null,
        activated: (form.querySelector('[name=activated]') as HTMLInputElement)?.checked || false,
        add_balance: formData.get('add_balance') || null,
      }),
    });
    const d = await res.json();
    setSubmitting(false);
    if (d.success) {
      toast.success('User updated');
      setEditUser(null);
      fetchUsers();
    } else {
      toast.error(d.error || 'Failed to update');
    }
  };

  const handleAddTokens = async () => {
    if (!tokenUser || !tokenAmount) return;
    const amount = parseInt(tokenAmount);
    if (!amount || amount < 1) {
      toast.error('Enter a valid token amount');
      return;
    }
    setSubmitting(true);
    const res = await fetch('/api/admin/users/add-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: tokenUser.id, tokens: amount }),
    });
    const d = await res.json();
    setSubmitting(false);
    if (d.success) {
      toast.success(d.message);
      setTokenUser(null);
      setTokenAmount('');
      fetchUsers();
    } else {
      toast.error(d.error || 'Failed to add tokens');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-sm text-zinc-400">Manage platform users</p>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by username, name, email, phone..."
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
        <button type="submit" className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200">
          Search
        </button>
      </form>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-xs font-medium uppercase text-zinc-500">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Activated</th>
                <th className="px-4 py-3 text-right">Balance</th>
                <th className="px-4 py-3 text-right">Tokens</th>
                <th className="px-4 py-3 text-right">Referrals</th>
                <th className="px-4 py-3">Referred By</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-zinc-500">Loading...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-zinc-500">No users found.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50">
                    <td className="px-4 py-3 text-zinc-400">{u.id}</td>
                    <td className="px-4 py-3 font-medium text-white">{u.username}</td>
                    <td className="px-4 py-3 text-zinc-300">{u.fullname || '--'}</td>
                    <td className="px-4 py-3 text-zinc-300">{u.email || '--'}</td>
                    <td className="px-4 py-3 text-zinc-300">{u.phone || '--'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActivation(u.id, u.activated)}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          u.activated
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                        }`}
                      >
                        {u.activated ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-white">
                      {parseFloat(u.balance as any).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-purple-400">
                      {parseFloat((u as any).apex_balance || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300">{u.referrals ?? 0}</td>
                    <td className="px-4 py-3 text-zinc-400">{u.referred_by_username || '--'}</td>
                    <td className="px-4 py-3 text-zinc-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditUser(u)}
                          className="rounded px-2 py-1 text-xs font-medium text-blue-400 hover:bg-blue-500/10"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { setTokenUser(u); setTokenAmount(''); }}
                          className="rounded px-2 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/10"
                        >
                          +Tokens
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-zinc-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setEditUser(null)}>
          <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Edit User — {editUser.username}</h2>
              <button onClick={() => setEditUser(null)} className="text-xl text-zinc-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">Full Name</label>
                <input type="text" name="fullname" defaultValue={editUser.fullname || ''}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">Email</label>
                <input type="email" name="email" defaultValue={editUser.email || ''}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">Phone</label>
                <input type="text" name="phone" defaultValue={editUser.phone || ''}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5">
                <span className="text-sm text-zinc-300">Account Active</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" name="activated" defaultChecked={!!editUser.activated} className="peer sr-only" />
                  <div className="h-6 w-11 rounded-full bg-zinc-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-green-500 peer-checked:after:translate-x-full" />
                </label>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">Add to Balance (KES)</label>
                <input type="number" name="add_balance" min="0" step="0.01" placeholder="0.00"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditUser(null)}
                  className="flex-1 rounded-lg border border-zinc-600 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tokenUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => { setTokenUser(null); setTokenAmount(''); }}>
          <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Add Tokens — {tokenUser.username}</h2>
              <button onClick={() => { setTokenUser(null); setTokenAmount(''); }} className="text-xl text-zinc-400 hover:text-white">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">Token Amount</label>
                <input type="number" value={tokenAmount} onChange={e => setTokenAmount(e.target.value)} min="1" step="1" required placeholder="e.g. 1000"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleAddTokens} disabled={submitting || !tokenAmount}
                  className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-amber-400 disabled:opacity-50">
                  {submitting ? 'Adding...' : 'Add Tokens'}
                </button>
                <button onClick={() => { setTokenUser(null); setTokenAmount(''); }}
                  className="flex-1 rounded-lg border border-zinc-600 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
