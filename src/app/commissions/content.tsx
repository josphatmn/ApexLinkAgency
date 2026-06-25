'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatMoney } from '@/lib/utils';

export default function CommissionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get('p') || '1');
  const level = searchParams.get('level') || '';
  const dateFrom = searchParams.get('date_from') || '';
  const dateTo = searchParams.get('date_to') || '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ p: String(page) });
    if (level) params.set('level', level);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);

    fetch(`/api/commissions?${params}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, level, dateFrom, dateTo]);

  const filterParams = (p: number) => {
    const params = new URLSearchParams();
    if (level) params.set('level', level);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    params.set('p', String(p));
    return `?${params.toString()}`;
  };

  const levelSummary: Record<number, any> = {};
  if (data?.levelTotals) {
    data.levelTotals.forEach((lt: any) => { levelSummary[lt.level] = lt; });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Commission Report</h1>
        <p className="text-sm text-zinc-500">Full history of your referral earnings</p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">Level 1 Earnings</div>
          <div className="mt-1 text-xl font-bold">{formatMoney((levelSummary[1]?.total || 0))}</div>
          <div className="text-xs text-zinc-500">{(levelSummary[1]?.count || 0)} commissions</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">Level 2 Earnings</div>
          <div className="mt-1 text-xl font-bold">{formatMoney((levelSummary[2]?.total || 0))}</div>
          <div className="text-xs text-zinc-500">{(levelSummary[2]?.count || 0)} commissions</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">Total Commissions</div>
          <div className="mt-1 text-xl font-bold">{data?.total || 0}</div>
          <div className="text-xs text-zinc-500">All time</div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Level</label>
            <select name="level" value={level} onChange={e => router.push(`/commissions?level=${e.target.value}`)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900">
              <option value="">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">From</label>
            <input type="date" name="date_from" value={dateFrom} onChange={e => router.push(`/commissions?date_from=${e.target.value}&date_to=${dateTo}&level=${level}`)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">To</label>
            <input type="date" name="date_to" value={dateTo} onChange={e => router.push(`/commissions?date_to=${e.target.value}&date_from=${dateFrom}&level=${level}`)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => router.push('/commissions')}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800">
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {loading ? (
          <div className="p-8 text-center text-sm text-zinc-500">Loading...</div>
        ) : !data?.commissions?.length ? (
          <div className="p-8 text-center text-sm text-zinc-500">No commissions found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase text-zinc-500 dark:border-zinc-800">
                    <th className="px-5 py-3">Level</th>
                    <th className="px-5 py-3">From</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.commissions.map((c: any) => (
                    <tr key={c.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                      <td className="px-5 py-3"><span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">Level {c.level}</span></td>
                      <td className="px-5 py-3 font-medium">{c.from_username}</td>
                      <td className="px-5 py-3">{formatMoney(c.amount)}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          c.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                          'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'
                        }`}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span>
                      </td>
                      <td className="px-5 py-3 text-zinc-500">{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(p => (
                  <a key={p} href={`/commissions${filterParams(p)}`}
                    className={`rounded-md px-3 py-1 text-sm ${p === data.page ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'border border-zinc-300 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800'}`}>
                    {p}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
