'use client';

import Link from 'next/link';
import { toast } from '@/components/Toast';
import { formatMoney, formatTokens } from '@/lib/utils';
import { config } from '@/lib/config';

interface DashboardProps {
  user: any;
  level1Count: number;
  level2Count: number;
  commissions: any[];
  totalPaidOut: number;
  progressPercent: number;
  canWithdraw: boolean;
  threshold: number;
}

export default function DashboardClient({
  user, level1Count, level2Count, commissions, totalPaidOut,
  progressPercent, canWithdraw, threshold,
}: DashboardProps) {
  const refLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/register?ref=${user.referral_code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(refLink).then(() => toast.success('Link copied!'));
  };

  const copyCode = () => {
    navigator.clipboard.writeText(user.referral_code).then(() => toast.success('Code copied!'));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Welcome back, {user.username}</p>
      </div>

      <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3">
          <h2 className="text-base font-semibold">Your Referral Link</h2>
          <p className="text-xs text-zinc-500">Earn {config.level1CommissionRate * 100}% from direct referrals and {config.level2CommissionRate * 100}% from second-level referrals</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input readOnly value={refLink} className="min-w-[200px] flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800" />
          <button onClick={copyLink} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800">Copy Link</button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">Balance</div>
          <div className="mt-1 text-2xl font-bold">{formatMoney(user.balance)}</div>
          <div className="text-xs text-zinc-500">Available for withdrawal</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">Level 1</div>
          <div className="mt-1 text-2xl font-bold">{level1Count}</div>
          <div className="text-xs text-zinc-500">{config.level1CommissionRate * 100}% commission each</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">Level 2</div>
          <div className="mt-1 text-2xl font-bold">{level2Count}</div>
          <div className="text-xs text-zinc-500">{config.level2CommissionRate * 100}% commission each</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">Paid Out</div>
          <div className="mt-1 text-xl font-bold">{formatMoney(totalPaidOut)}</div>
          <div className="text-xs text-zinc-500">Lifetime withdrawals</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">Referral Code</div>
          <div className="mt-1 flex items-center gap-2">
            <code className="rounded bg-zinc-100 px-2 py-1 text-sm font-bold dark:bg-zinc-800">{user.referral_code}</code>
            <button onClick={copyCode} className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white" title="Copy code">&#128203;</button>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3">
          <h2 className="text-base font-semibold">Withdrawal Progress</h2>
          <p className="text-xs text-zinc-500">Earn {formatMoney(threshold)} to unlock withdrawals</p>
        </div>
        <div className="relative h-8 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
            {formatMoney(user.balance)} / {formatMoney(threshold)}
          </span>
        </div>
        {canWithdraw ? (
          <div className="mt-4">
            <Link href="/withdraw" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              Withdraw Now
            </Link>
          </div>
        ) : (
          <p className="mt-2 text-xs text-zinc-500">{formatMoney(threshold - user.balance)} more needed to withdraw</p>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 p-5 pb-3 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-semibold">Commission History</h2>
            <p className="text-xs text-zinc-500">Your earnings from referrals</p>
          </div>
          <Link href="/commissions" className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800">
            View Full Report
          </Link>
        </div>
        {commissions.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500">No commissions yet. Share your referral code to start earning!</p>
        ) : (
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
                {commissions.map((c: any) => (
                  <tr key={c.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">Level {c.level}</span>
                    </td>
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
        )}
      </div>
    </div>
  );
}
