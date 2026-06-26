'use client';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from '@/components/Toast';

interface IncomeEntry {
  id: number;
  source: string;
  amount: number;
  reference: string | null;
  created_at: string;
}

const sourceLabels: Record<string, string> = {
  activation: 'Activation Fees',
  commission_margin: 'Commission Margin',
  withdrawal_fee: 'Withdrawal Fees',
  promotion: 'Promotion Platform Cut',
  media_movie: 'Movie Purchases',
  media_tv: 'TV Show Purchases',
};

export default function AdminIncomePage() {
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [sources, setSources] = useState<string[]>([]);
  const [perPage, setPerPage] = useState(20);

  const fetchIncome = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (sourceFilter !== 'All') params.set('source', sourceFilter);
    if (dateFrom) params.set('date_from', dateFrom.toISOString().slice(0, 10));
    if (dateTo) params.set('date_to', dateTo.toISOString().slice(0, 10));

    fetch(`/api/admin/income?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setEntries(d.entries);
          setTotalPages(d.totalPages || 1);
          setTotals(d.totals || {});
          if (d.sources) setSources(d.sources);
          if (d.perPage) setPerPage(d.perPage);
        } else {
          toast.error('Failed to load income data');
        }
      })
      .catch(() => toast.error('Failed to load income data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchIncome(); }, [page, sourceFilter]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchIncome();
  };

  const handleReset = () => {
    setSourceFilter('All');
    setDateFrom(undefined);
    setDateTo(undefined);
    setPage(1);
  };

  const totalAll = Object.values(totals).reduce((sum, v) => sum + v, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Platform Income</h1>
        <p className="text-sm text-zinc-400">Track all income sources</p>
      </div>

      <form onSubmit={handleFilter} className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Source</label>
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white focus:border-zinc-500 focus:outline-none"
          >
            {['All', ...sources].map(s => (
              <option key={s} value={s}>{sourceLabels[s] || s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">From</label>
          <DatePicker
            selected={dateFrom}
            onChange={(d: Date | null) => setDateFrom(d || undefined)}
            selectsStart
            startDate={dateFrom}
            endDate={dateTo}
            maxDate={dateTo || new Date()}
            placeholderText="From"
            dateFormat="yyyy-MM-dd"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white focus:border-zinc-500 focus:outline-none"
            wrapperClassName="w-full"
            popperClassName="dark"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">To</label>
          <DatePicker
            selected={dateTo}
            onChange={(d: Date | null) => setDateTo(d || undefined)}
            selectsEnd
            startDate={dateFrom}
            endDate={dateTo}
            minDate={dateFrom}
            maxDate={new Date()}
            placeholderText="To"
            dateFormat="yyyy-MM-dd"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white focus:border-zinc-500 focus:outline-none"
            wrapperClassName="w-full"
            popperClassName="dark"
          />
        </div>
        <button type="submit" className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200">
          Filter
        </button>
        <button type="button" onClick={handleReset} className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-800">
          Reset
        </button>
      </form>

      {/* Totals */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(totals).map(([source, total]) => (
          <div key={source} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">{sourceLabels[source] || source}</div>
            <div className="mt-1 text-lg font-bold text-white">
              {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        ))}
        {Object.keys(totals).length > 0 && (
          <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total</div>
            <div className="mt-1 text-lg font-bold text-white">
              {totalAll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-xs font-medium uppercase text-zinc-500">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3 text-right">Amount ({process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'KES'})</th>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-zinc-500">Loading...</td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-zinc-500">No income entries found.</td>
                </tr>
              ) : (
                entries.map(e => (
                  <tr key={e.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50">
                    <td className="px-5 py-3 text-zinc-400">{e.id}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                        {sourceLabels[e.source] || e.source}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-white">
                      {e.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 text-zinc-400 text-xs font-mono">{e.reference || '--'}</td>
                    <td className="px-5 py-3 text-zinc-400">{new Date(e.created_at).toLocaleString()}</td>
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
    </div>
  );
}
