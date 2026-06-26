'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import { formatMoney, formatTokens } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Props {
  balance: number;
  apexBalance: number;
  transactions: any[];
  conversionRate: number;
  tokenName: string;
}

export default function WalletClient({ balance, apexBalance, transactions, conversionRate, tokenName }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState<'convert' | 'deposit'>('convert');
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'KES';
  const tokenNameDisplay = process.env.NEXT_PUBLIC_TOKEN_NAME || tokenName;

  useEffect(() => {
    const stored = localStorage.getItem('return_to');
    if (stored) {
      setReturnUrl(stored);
      setModalOpen(true);
    }
  }, []);

  const dismissReturn = () => {
    localStorage.removeItem('return_to');
    setReturnUrl(null);
  };

  const afterSuccess = () => {
    if (returnUrl) {
      setModalOpen(false);
      setShowReturnModal(true);
    } else {
      setTimeout(() => window.location.reload(), 800);
    }
  };

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/wallet/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: form.get('amount') }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(data.message);
      afterSuccess();
    } else toast.error(data.error || 'Transfer failed');
  };

  const handleDeposit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/wallet/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: form.get('amount') }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(data.message);
      afterSuccess();
    } else toast.error(data.error || 'Deposit failed');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-sm text-zinc-500">1 {currency} = {conversionRate} {tokenNameDisplay}</p>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-purple-500/5 dark:bg-purple-500/10" />
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">{tokenNameDisplay} Wallet Balance</div>
            <div className="mt-1 text-3xl font-bold text-purple-600 dark:text-purple-400">{formatTokens(apexBalance)}</div>
            <div className="mt-1 text-sm text-zinc-500">&asymp; {currency} {(apexBalance / conversionRate).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="flex gap-6">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">{currency} Balance</div>
              <div className="text-sm font-bold">{formatMoney(balance)}</div>
            </div>
            <div className="w-px bg-zinc-200 dark:bg-zinc-700" />
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">Conversion Rate</div>
              <div className="text-sm font-bold">1 {currency} = {conversionRate} {tokenNameDisplay}</div>
            </div>
          </div>
        </div>
      </div>

      <button onClick={() => setModalOpen(true)}
        className="mb-6 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
        <svg className="mr-2 inline h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
        Add Wallet Tokens
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Tokens</h2>
              <button onClick={() => setModalOpen(false)} className="text-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white">&times;</button>
            </div>
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-800">
              <span>{currency} Balance: <strong>{formatMoney(balance)}</strong></span>
              <span className="h-4 w-px bg-zinc-300 dark:bg-zinc-600" />
              <span>Wallet: <strong className="text-purple-600 dark:text-purple-400">{formatTokens(apexBalance)}</strong></span>
            </div>

            <div className="mb-4 flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
              <button onClick={() => setTab('convert')} className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition ${tab === 'convert' ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                Convert Balance
              </button>
              <button onClick={() => setTab('deposit')} className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition ${tab === 'deposit' ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                Direct Deposit
              </button>
            </div>

            {tab === 'convert' ? (
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount in {currency}</label>
                  <div className="flex">
                    <span className="flex items-center rounded-l-lg border border-r-0 border-zinc-300 bg-zinc-50 px-3 text-sm font-semibold dark:border-zinc-600 dark:bg-zinc-800">{currency}</span>
                    <input type="number" name="amount" min="1" step="0.01" max={balance} required placeholder="0.00"
                      className="flex-1 border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900" />
                    <button type="button" onClick={() => { (document.querySelector('[name=amount]') as HTMLInputElement).value = String(balance); }}
                      className="rounded-r-lg border border-l-0 border-zinc-300 bg-zinc-50 px-3 text-xs font-bold uppercase hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800">Max</button>
                  </div>
                </div>
                <button type="submit" disabled={balance <= 0}
                  className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                  Convert to Tokens
                </button>
              </form>
            ) : (
              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount in {currency}</label>
                  <div className="flex">
                    <span className="flex items-center rounded-l-lg border border-r-0 border-zinc-300 bg-zinc-50 px-3 text-sm font-semibold dark:border-zinc-600 dark:bg-zinc-800">{currency}</span>
                    <input type="number" name="amount" min="1" step="0.01" required placeholder="0.00"
                      className="flex-1 rounded-r-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900" />
                  </div>
                </div>
                <button type="submit"
                  className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700">
                  Deposit Tokens
                </button>
                <p className="text-center text-xs text-zinc-500">Payment gateway coming soon — simulated deposit</p>
              </form>
            )}
          </div>
        </div>
      )}

      {showReturnModal && returnUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <svg className="h-7 w-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mb-2 text-center text-lg font-bold text-zinc-900 dark:text-white">Tokens Added Successfully</h3>
            <p className="mb-6 text-center text-sm text-zinc-600 dark:text-zinc-400">Return to the page you were viewing?</p>
            <div className="flex gap-3">
              <button onClick={() => { router.push(returnUrl); dismissReturn(); }}
                className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                Yes
              </button>
              <button onClick={() => { dismissReturn(); window.location.reload(); }}
                className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 p-5 pb-3 dark:border-zinc-800">
          <h2 className="text-base font-semibold">Wallet Activity</h2>
          <p className="text-xs text-zinc-500">Your recent token transactions</p>
        </div>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <svg className="h-8 w-8 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            <p className="text-sm text-zinc-500">No wallet activity yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase text-zinc-500 dark:border-zinc-800">
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Tokens</th>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t: any) => (
                  <tr key={t.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${t.type === 'deposit' ? 'text-green-600 dark:text-green-400' : 'text-purple-600 dark:text-purple-400'}`}>
                        {t.type === 'deposit' ? '+' : '\u21C4'} {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold">{formatMoney(t.amount)}</td>
                    <td className="px-5 py-3 font-semibold text-purple-600 dark:text-purple-400">+{Math.round(t.amount * conversionRate).toLocaleString()} {tokenName}</td>
                    <td className="px-5 py-3 font-mono text-xs text-zinc-500">{t.reference}</td>
                    <td className="px-5 py-3 text-zinc-500">{new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
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
