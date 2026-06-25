'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from '@/components/Toast';
import { formatMoney } from '@/lib/utils';

interface Props {
  balance: number;
  apexBalance: number;
  withdrawals: any[];
  totalWithdrawn: number;
  threshold: number;
}

export default function WithdrawClient({ balance, apexBalance, withdrawals, totalWithdrawn, threshold }: Props) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenAmount, setTokenAmount] = useState('');
  const [tokenLoading, setTokenLoading] = useState(false);

  const canWithdraw = balance >= threshold;
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'KES';
  const feeRate = parseFloat(process.env.NEXT_PUBLIC_WITHDRAWAL_FEE_PERCENTAGE || '0.05');
  const exchangeRate = parseFloat(process.env.NEXT_PUBLIC_TOKEN_EXCHANGE_RATE || '1');
  const parsedAmount = parseFloat(amount) || 0;
  const fee = parsedAmount * feeRate;
  const netAmount = parsedAmount - fee;
  const parsedTokens = parseInt(tokenAmount) || 0;
  const tokenCashValue = parsedTokens * exchangeRate;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (amt < threshold) { toast.error(`Minimum withdrawal is ${formatMoney(threshold)}`); return; }
    if (amt > balance) { toast.error('Amount exceeds your balance'); return; }
    setLoading(true);
    const res = await fetch('/api/withdraw/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amt }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      toast.success(data.message);
      setTimeout(() => window.location.reload(), 1500);
    } else toast.error(data.error || 'Request failed');
  };

  const handleTokenWithdraw = async () => {
    const amt = parseInt(tokenAmount);
    if (!amt || amt <= 0) { toast.error('Enter a valid token amount'); return; }
    if (amt > apexBalance) { toast.error('Insufficient tokens'); return; }
    setTokenLoading(true);
    const res = await fetch('/api/wallet/withdraw-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amt }),
    });
    const data = await res.json();
    setTokenLoading(false);
    if (data.success) {
      toast.success(`${amt} tokens converted to ${formatMoney(data.balance)}`);
      setTimeout(() => window.location.reload(), 800);
    } else toast.error(data.error || 'Failed');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Withdraw Funds</h1>
        <p className="text-sm text-zinc-500">Request a withdrawal of your earnings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
          <h2 className="mb-1 text-base font-semibold">Available Balance</h2>
          <p className="mb-4 text-xs text-zinc-500">Minimum withdrawal: {formatMoney(threshold)}</p>
          <div className="text-3xl font-bold">{formatMoney(balance)}</div>

          {canWithdraw ? (
            <form onSubmit={handleWithdraw} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Amount to Withdraw</label>
                <div className="flex">
                  <span className="flex items-center rounded-l-lg border border-r-0 border-zinc-300 bg-zinc-50 px-3 text-sm font-semibold dark:border-zinc-600 dark:bg-zinc-800">{currency}</span>
                  <input
                    type="number" min={threshold} max={balance} step="0.01" value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required placeholder="0.00"
                    className="flex-1 border border-zinc-300 px-3 py-2.5 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900"
                  />
                  <button type="button" onClick={() => setAmount(String(balance))}
                    className="rounded-r-lg border border-l-0 border-zinc-300 bg-zinc-50 px-3 text-xs font-bold uppercase hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800">Max</button>
                </div>
              </div>

              {parsedAmount > 0 && (
                <div className="space-y-1 rounded-lg bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-800">
                  <div className="flex justify-between text-zinc-500">
                    <span>Management fee ({(feeRate * 100).toFixed(0)}%)</span>
                    <span>-{formatMoney(fee)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-zinc-900 dark:text-white">
                    <span>You receive</span>
                    <span>{formatMoney(netAmount)}</span>
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                {loading ? 'Processing...' : 'Request Withdrawal'}
              </button>
            </form>
          ) : (
            <>
              <div className="mt-6 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                You need {formatMoney(threshold - balance)} more to reach the minimum withdrawal threshold.
              </div>
              <Link href="/dashboard" className="mt-4 block w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                Back to Dashboard
              </Link>
            </>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-1 text-base font-semibold">Convert Tokens to {currency}</h2>
          <p className="mb-4 text-xs text-zinc-500">{process.env.NEXT_PUBLIC_TOKEN_NAME || 'Tokens'} balance: {apexBalance.toLocaleString()}</p>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Tokens to Convert</label>
              <div className="flex">
                <input
                  type="number" min={1} max={apexBalance} step="1" value={tokenAmount}
                  onChange={e => setTokenAmount(e.target.value)}
                  placeholder="0"
                  className="flex-1 rounded-l-lg border border-zinc-300 px-3 py-2.5 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900"
                />
                <button type="button" onClick={() => setTokenAmount(String(apexBalance))}
                  className="rounded-r-lg border border-l-0 border-zinc-300 bg-zinc-50 px-3 text-xs font-bold uppercase hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800">Max</button>
              </div>
            </div>

            {parsedTokens > 0 && (
              <div className="rounded-lg bg-purple-50 px-3 py-2 text-xs dark:bg-purple-950/30">
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>You receive</span>
                  <span className="font-semibold text-purple-700 dark:text-purple-300">{formatMoney(tokenCashValue)}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleTokenWithdraw} disabled={tokenLoading || !tokenAmount}
              className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {tokenLoading ? 'Converting...' : 'Convert to Balance'}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-3">
          <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <h2 className="text-base font-semibold">Withdrawal History</h2>
            <p className="text-xs text-zinc-500">Total withdrawn: <strong>{formatMoney(totalWithdrawn)}</strong></p>
          </div>
          {withdrawals.length === 0 ? (
            <p className="p-6 text-sm text-zinc-500">No withdrawal requests yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase text-zinc-500 dark:border-zinc-800">
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Reference</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w: any) => (
                    <tr key={w.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                      <td className="px-6 py-3 font-medium">{formatMoney(w.amount)}</td>
                      <td className="px-6 py-3 font-mono text-xs text-zinc-500">{w.reference}</td>
                      <td className="px-6 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          w.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          w.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                          'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'
                        }`}>{w.status.charAt(0).toUpperCase() + w.status.slice(1)}</span>
                      </td>
                      <td className="px-6 py-3 text-zinc-500">{new Date(w.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
