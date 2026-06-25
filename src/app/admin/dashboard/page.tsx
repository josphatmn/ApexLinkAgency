'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/components/Toast';

interface AdminData {
  stats: {
    totalUsers: number;
    activatedUsers: number;
    totalCommissions: number;
    totalPaid: number;
    platformIncome: number;
    promoPot: number;
  };
  incomeBySource: { source: string; total: number }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin')
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d);
        else toast.error('Failed to load dashboard');
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
      </div>
    );
  }

  const stats = data?.stats;
  const incomeSources = data?.incomeBySource || [];

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Activated', value: stats?.activatedUsers ?? 0, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Commissions Paid', value: stats?.totalCommissions ?? 0, color: 'text-emerald-400', prefix: `${process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'KES'} `, bg: 'bg-emerald-500/10' },
    { label: 'Withdrawals Paid', value: stats?.totalPaid ?? 0, color: 'text-amber-400', prefix: `${process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'KES'} `, bg: 'bg-amber-500/10' },
    { label: 'Platform Income', value: stats?.platformIncome ?? 0, color: 'text-violet-400', prefix: `${process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'KES'} `, bg: 'bg-violet-500/10' },
    { label: 'Promo Pool', value: stats?.promoPot ?? 0, color: 'text-rose-400', prefix: `${process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'KES'} `, bg: 'bg-rose-500/10' },
  ];

  const sourceLabels: Record<string, string> = {
    activation: 'Activation Fees',
    commission_margin: 'Commission Margin',
    withdrawal_fee: 'Withdrawal Fees',
    promotion: 'Promotion Platform Cut',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-400">Platform overview and key metrics</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map(s => (
          <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">{s.label}</div>
            <div className={`mt-1 text-2xl font-extrabold ${s.color}`}>
              {s.prefix || ''}{typeof s.value === 'number' ? s.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 p-5">
          <h2 className="text-lg font-bold text-white">Income by Source</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-xs font-medium uppercase text-zinc-500">
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3 text-right">Total ({process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'KES'})</th>
              </tr>
            </thead>
            <tbody>
              {incomeSources.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-5 py-8 text-center text-zinc-500">No income data available.</td>
                </tr>
              ) : (
                incomeSources.map(s => (
                  <tr key={s.source} className="border-b border-zinc-800 last:border-0">
                    <td className="px-5 py-3 text-zinc-300">{sourceLabels[s.source] || s.source}</td>
                    <td className="px-5 py-3 text-right font-semibold text-white">
                      {s.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
