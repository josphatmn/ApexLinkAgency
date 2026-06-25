'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/components/Toast';

const tabs = ['Pending', 'Completed', 'Rejected'];

interface Withdrawal {
  id: number;
  user_id: number;
  username: string;
  amount: number;
  method: string;
  account: string;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
}

export default function AdminWithdrawalsPage() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = () => {
    setLoading(true);
    fetch(`/api/admin/withdrawals?status=${activeTab.toLowerCase()}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setWithdrawals(d.withdrawals);
        else toast.error('Failed to load withdrawals');
      })
      .catch(() => toast.error('Failed to load withdrawals'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWithdrawals(); }, [activeTab]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    const res = await fetch('/api/admin/withdrawals/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawal_id: id, action }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success(action === 'approve' ? 'Withdrawal approved' : 'Withdrawal rejected');
      fetchWithdrawals();
    } else {
      toast.error(d.error || 'Action failed');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Withdrawals</h1>
        <p className="text-sm text-zinc-400">Manage withdrawal requests</p>
      </div>

      <div className="mb-6 flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-white text-zinc-900'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-xs font-medium uppercase text-zinc-500">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Account</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-zinc-500">Loading...</td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-zinc-500">No {activeTab.toLowerCase()} withdrawals.</td>
                </tr>
              ) : (
                withdrawals.map(w => (
                  <tr key={w.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50">
                    <td className="px-5 py-3 text-zinc-400">{w.id}</td>
                    <td className="px-5 py-3 font-medium text-white">{w.username}</td>
                    <td className="px-5 py-3 text-right font-semibold text-white">
                      {w.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 text-zinc-300">{w.method}</td>
                    <td className="px-5 py-3 text-zinc-400 font-mono text-xs">{w.account}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        w.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        w.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-zinc-400">{new Date(w.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right">
                      {w.status === 'pending' && (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleAction(w.id, 'approve')}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(w.id, 'reject')}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
