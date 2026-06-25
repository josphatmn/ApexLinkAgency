'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from '@/components/Toast';
import { formatTokens } from '@/lib/utils';

interface Round {
  id: number;
  winner_id: number | null;
  total_pot: number;
  winner_amount: number;
  platform_amount: number;
  status: string;
  started_at: string;
  ended_at: string | null;
  username?: string;
}

interface Bet {
  id: number;
  user_id: number;
  round_id: number;
  amount: number;
  created_at: string;
  username?: string;
}

export default function AdminPromotionPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotionsEnabled, setPromotionsEnabled] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [countdowns, setCountdowns] = useState<Record<number, string>>({});
  const [intervalMin, setIntervalMin] = useState(30);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/promotion').then(r => r.json()),
      fetch('/api/admin/settings').then(r => r.json()),
    ]).then(([promo, settings]) => {
      if (promo.success) {
        setRounds(promo.rounds || []);
        setBets(promo.bets || []);
      }
      if (settings.success) {
        const enabled = settings.settings?.PROMOTIONS_ENABLED;
        setPromotionsEnabled(enabled === '1' || enabled === 'true' || enabled === undefined);
        setIntervalMin(parseInt(settings.settings?.PROMOTION_INTERVAL_MINUTES || '30'));
      }
    }).catch(() => toast.error('Failed to load promotion data'))
    .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const newCountdowns: Record<number, string> = {};
      for (const r of rounds) {
        if (r.status !== 'open') continue;
        const start = new Date(r.started_at).getTime();
        const end = start + intervalMin * 60 * 1000;
        const remaining = Math.max(0, end - now);
        if (remaining <= 0) {
          newCountdowns[r.id] = 'Draw ready';
        } else {
          const h = Math.floor(remaining / 3600000);
          const m = Math.floor((remaining % 3600000) / 60000);
          const s = Math.floor((remaining % 60000) / 1000);
          newCountdowns[r.id] =
            `${h > 0 ? h + 'h ' : ''}${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
        }
      }
      setCountdowns(newCountdowns);
    }, 1000);
    return () => clearInterval(timer);
  }, [rounds, intervalMin]);

  const handleToggle = async () => {
    setToggling(true);
    const newVal = promotionsEnabled ? '0' : '1';
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ PROMOTIONS_ENABLED: newVal }),
    });
    const d = await res.json();
    if (d.success) {
      setPromotionsEnabled(!promotionsEnabled);
      toast.success(`Promotions ${promotionsEnabled ? 'disabled' : 'enabled'}`);
    } else {
      toast.error(d.error || 'Failed to update');
    }
    setToggling(false);
  };

  const handleDraw = async (roundId: number) => {
    const res = await fetch('/api/admin/promotion/draw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ round_id: roundId }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success('Winner drawn!');
      fetchData();
    } else {
      toast.error(d.error || 'Draw failed');
    }
  };

  const activeRounds = rounds.filter(r => r.status === 'open');
  const completedRounds = rounds.filter(r => r.status === 'completed');
  const displayRounds = activeTab === 'active' ? activeRounds : completedRounds;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Promotion Management</h1>
          <p className="text-sm text-zinc-400">Manage promotion rounds and bets</p>
        </div>
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            promotionsEnabled
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
          }`}
        >
          <div className={`h-4 w-8 rounded-full transition-colors ${promotionsEnabled ? 'bg-green-400' : 'bg-zinc-600'}`}>
            <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${promotionsEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
          {promotionsEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        {[
          { key: 'active', label: 'Active Rounds' },
          { key: 'completed', label: 'Completed Rounds' },
          { key: 'bets', label: 'All Bets' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? 'bg-white text-zinc-900'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'bets' ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs font-medium uppercase text-zinc-500">
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3 text-right">Round</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-zinc-500">Loading...</td></tr>
                ) : bets.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-zinc-500">No bets placed.</td></tr>
                ) : (
                  bets.map(b => (
                    <tr key={b.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50">
                      <td className="px-5 py-3 text-zinc-400">{b.id}</td>
                      <td className="px-5 py-3 font-medium text-white">{b.username || `User #${b.user_id}`}</td>
                      <td className="px-5 py-3 text-right text-zinc-300">#{b.round_id}</td>
                      <td className="px-5 py-3 text-right font-semibold text-amber-400">{formatTokens(b.amount)}</td>
                      <td className="px-5 py-3 text-zinc-400">{new Date(b.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center text-zinc-500">Loading...</div>
          ) : displayRounds.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center text-zinc-500">
              No {activeTab} rounds found.
            </div>
          ) : (
            displayRounds.map(r => (
              <div key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Round #{r.id}</h3>
                    <p className="text-xs text-zinc-500">Started: {new Date(r.started_at).toLocaleString()}</p>
                    {r.ended_at && <p className="text-xs text-zinc-500">Ended: {new Date(r.ended_at).toLocaleString()}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {r.status === 'open' && countdowns[r.id] && (
                      <span className="rounded-lg bg-zinc-800 px-3 py-1.5 font-mono text-sm font-bold text-amber-400">
                        {countdowns[r.id]}
                      </span>
                    )}
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      r.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-400'
                    }`}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                    {r.status === 'open' && (
                      <button
                        onClick={() => handleDraw(r.id)}
                        className="rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
                      >
                        Draw Winner
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">Total Pot</div>
                    <div className="text-lg font-bold text-amber-400">{formatTokens(r.total_pot)}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">Winner Gets</div>
                    <div className="text-lg font-bold text-green-400">{formatTokens(r.winner_amount)}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">Platform</div>
                    <div className="text-lg font-bold text-zinc-300">{formatTokens(r.platform_amount)}</div>
                  </div>
                </div>

                {r.winner_id && (
                  <div className="mt-3 rounded-lg bg-amber-500/10 px-4 py-2 text-sm">
                    <span className="font-medium text-amber-400">Winner: </span>
                    <span className="text-white">{r.username || `User #${r.winner_id}`}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
