'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/components/Toast';
import { formatTokens } from '@/lib/utils';

export default function PromotionPage() {
  const [data, setData] = useState<any>(null);
  const [betAmount, setBetAmount] = useState('');
  const [betting, setBetting] = useState(false);
  const [timeLeft, setTimeLeft] = useState('00:00:00');
  const [expired, setExpired] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const fetchData = () => {
    Promise.all([
      fetch('/api/promotion').then(r => r.json()),
      fetch('/api/promotion/status').then(r => r.json()),
    ]).then(([promo, status]) => {
      setData(promo);
      if (status.success) setEnabled(status.enabled);
    }).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!data?.activeRound) return;
    const started = new Date(data.activeRound.started_at).getTime();
    const interval = (data.config?.intervalMinutes || 30) * 60 * 1000;
    const nextDraw = started + interval;

    const origTitle = 'APEX Promotion';

    const tick = () => {
      const diff = Math.max(0, Math.floor((nextDraw - Date.now()) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      const fmt = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      setTimeLeft(fmt);
      document.title = fmt + ' \u2014 ' + origTitle;
      const hEl = document.getElementById('cdHours');
      if (hEl) hEl.textContent = String(h).padStart(2, '0');
      const mEl = document.getElementById('cdMinutes');
      if (mEl) mEl.textContent = String(m).padStart(2, '0');
      const sEl = document.getElementById('cdSeconds');
      if (sEl) sEl.textContent = String(s).padStart(2, '0');
      if (diff <= 0) {
        setExpired(true);
        document.title = 'Draw in progress! \u2014 ' + origTitle;
        setTimeout(fetchData, 3000);
      }
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => {
      clearInterval(iv);
      document.title = origTitle;
    };
  }, [data?.activeRound]);

  const handleBet = async (e: React.FormEvent) => {
    e.preventDefault();
    setBetting(true);
    const res = await fetch('/api/promotion/bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(betAmount) }),
    });
    const result = await res.json();
    if (result.success) {
      toast.success(result.message);
      setTimeout(() => window.location.reload(), 1200);
    } else toast.error(result.error || 'Bet failed');
    setBetting(false);
  };

  const handleDraw = async () => {
    const res = await fetch('/api/admin/draw-promotion', { method: 'POST' });
    const result = await res.json();
    if (result.success) toast.success(result.message);
    else toast.error(result.error || 'Draw failed');
    setTimeout(fetchData, 1000);
  };

  const activeRound = data?.activeRound;
  const completed = data?.completed || [];
  const bets = data?.bets || [];

  if (!enabled) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <svg className="h-8 w-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Promotions Currently Disabled</h2>
          <p className="mt-2 text-sm text-zinc-500">The admin has disabled promotions. Check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <span className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-900 dark:text-amber-200">&#9889; Promotion</span>
        <h1 className="text-3xl font-extrabold tracking-tight">APEX Promotion</h1>
        <p className="mt-2 text-zinc-500">Bet your {data?.config?.tokenName || 'tokens'} and win big every round</p>
      </div>

      {/* Countdown Hero */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-50 via-white to-amber-50 p-8 text-center dark:from-amber-950/20 dark:via-zinc-900 dark:to-amber-950/20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.08),transparent_70%)]" />
        <div className="relative">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-amber-600 dark:text-amber-400">Next Draw In</div>
          <div className="mx-auto mb-6 flex items-center justify-center gap-1 font-mono">
            <div className="flex flex-col items-center rounded-xl bg-white/80 px-5 py-3 shadow-sm backdrop-blur dark:bg-zinc-800/80 min-w-[5.5rem]">
              <span id="cdHours" className="text-4xl font-black tabular-nums leading-none lg:text-5xl">{timeLeft.split(':')[0] || '00'}</span>
              <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-widest text-zinc-400">Hrs</span>
            </div>
            <span className="mb-6 text-3xl font-light text-amber-500 animate-cd-pulse lg:text-4xl">:</span>
            <div className="flex flex-col items-center rounded-xl bg-white/80 px-5 py-3 shadow-sm backdrop-blur dark:bg-zinc-800/80 min-w-[5.5rem]">
              <span id="cdMinutes" className="text-4xl font-black tabular-nums leading-none lg:text-5xl">{timeLeft.split(':')[1] || '00'}</span>
              <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-widest text-zinc-400">Min</span>
            </div>
            <span className="mb-6 text-3xl font-light text-amber-500 animate-cd-pulse lg:text-4xl">:</span>
            <div className="flex flex-col items-center rounded-xl bg-white/80 px-5 py-3 shadow-sm backdrop-blur dark:bg-zinc-800/80 min-w-[5.5rem]">
              <span id="cdSeconds" className="text-4xl font-black tabular-nums leading-none lg:text-5xl">{timeLeft.split(':')[2] || '00'}</span>
              <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-widest text-zinc-400">Sec</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-zinc-500">
            <span>&#8226; Round #{activeRound?.id || '--'}</span>
            <span>&#8226; Pool: {formatTokens(activeRound?.total_pot || 0)}</span>
            <span>&#8226; Winner gets {(data?.config?.winnerPercentage || 0.7) * 100}%</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Active Round</h2>
              <button onClick={handleDraw} className="rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                Draw Now
              </button>
            </div>
            {activeRound ? (
              <>
                <div className="mb-4 grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-zinc-50 p-4 text-center dark:bg-zinc-800">
                    <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">Round</div>
                    <div className="text-xl font-bold">#{activeRound.id}</div>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-4 text-center dark:bg-zinc-800">
                    <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">Total Pot</div>
                    <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{formatTokens(activeRound.total_pot)}</div>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-4 text-center dark:bg-zinc-800">
                    <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">Time Left</div>
                    <div className="font-mono text-lg font-bold text-amber-600 dark:text-amber-400">{timeLeft || '...'}</div>
                  </div>
                </div>

                {expired ? (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-center text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    This round has ended. Bets are closed until the draw is completed and a new round begins.
                  </div>
                ) : (
                  <form onSubmit={handleBet} className="flex gap-3">
                    <input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)} placeholder={`Amount in ${data?.config?.tokenName || 'tokens'}`} required min="1"
                      className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900" />
                    <button type="submit" disabled={betting}
                      className="rounded-lg bg-amber-600 px-6 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50">
                      {betting ? 'Placing...' : 'Place Bet'}
                    </button>
                  </form>
                )}

                {bets.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-2 text-sm font-semibold">Bets in Active Round</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase text-zinc-500 dark:border-zinc-800">
                            <th className="py-2 pr-4">User</th>
                            <th className="py-2 pr-4">Amount</th>
                            <th className="py-2">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bets.map((b: any) => (
                            <tr key={b.id} className="border-b border-zinc-100 dark:border-zinc-800">
                              <td className="py-2 pr-4 font-medium">{b.username}</td>
                              <td className="py-2 pr-4">{formatTokens(b.amount)}</td>
                              <td className="py-2 text-zinc-500">{new Date(b.created_at).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="py-8 text-center text-zinc-500">No active round. Place a bet to start one!</p>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-bold">Completed Rounds</h2>
            {completed.length === 0 ? (
              <p className="text-sm text-zinc-500">No rounds drawn yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase text-zinc-500 dark:border-zinc-800">
                      <th className="py-2 pr-4">#</th>
                      <th className="py-2 pr-4">Winner</th>
                      <th className="py-2 pr-4">Pot</th>
                      <th className="py-2 pr-4">Winner Gets</th>
                      <th className="py-2">Platform</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completed.map((r: any) => (
                      <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-2 pr-4">{r.id}</td>
                        <td className="py-2 pr-4 font-medium">{r.username || '--'}</td>
                        <td className="py-2 pr-4">{formatTokens(r.total_pot)}</td>
                        <td className="py-2 pr-4 text-green-600 dark:text-green-400">{formatTokens(r.winner_amount)}</td>
                        <td className="py-2 text-zinc-500">{formatTokens(r.platform_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-lg font-bold">How It Works</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">1</span>
                Bet your {data?.config?.tokenName || 'tokens'} tokens into the active round
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">2</span>
                Each round runs for {data?.config?.intervalMinutes || 30} minutes
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">3</span>
                Winner is randomly selected (weighted by bet amount)
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">4</span>
                Winner gets {((data?.config?.winnerPercentage || 0.7) * 100).toFixed(0)}% of the pot
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
