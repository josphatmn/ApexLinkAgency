'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from './Toast';

interface SasapayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency: string;
  onSuccess: () => void;
}

type Step = 'phone' | 'waiting' | 'processing' | 'done';

export default function SasapayModal({ isOpen, onClose, amount, currency, onSuccess }: SasapayModalProps) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [checkoutId, setCheckoutId] = useState('');
  const [simulated, setSimulated] = useState(false);
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const startPolling = (cid: string) => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/sasapay/status?checkoutId=${cid}`);
        const data = await res.json();
        if (data.success && data.paid) {
          stopPolling();
          setStep('processing');
          await doVerify(cid);
        }
      } catch {
        // silent — retry on next tick
      }
    }, 3000);
  };

  const doVerify = async (cid: string) => {
    try {
      const res = await fetch('/api/sasapay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutId: cid, simulated }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('done');
        toast.success(data.message);
        setTimeout(() => onSuccess(), 1500);
      } else {
        toast.error(data.error || 'Activation failed');
        setStep('waiting');
      }
    } catch {
      toast.error('Network error. Please try again.');
      setStep('waiting');
    }
  };

  const handleInitiate = async () => {
    if (!phone || phone.length < 9) {
      toast.error('Enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/sasapay/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setCheckoutId(data.checkoutId);
        setSimulated(data.simulated);
        if (data.simulated) {
          toast.success(data.message || 'DEV: Simulating...');
          setStep('processing');
          await doVerify(data.checkoutId);
        } else {
          setStep('waiting');
          toast.success('STK push sent! Check your phone and enter M-Pesa PIN.');
          startPolling(data.checkoutId);
        }
      } else {
        toast.error(data.error || 'Failed to initiate payment');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheck = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sasapay/status?checkoutId=${checkoutId}`);
      const data = await res.json();
      if (data.success && data.paid) {
        stopPolling();
        setStep('processing');
        await doVerify(checkoutId);
      } else {
        toast.error('Payment not yet confirmed. Make sure you entered your M-Pesa PIN.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    stopPolling();
    setStep('phone');
    setPhone('');
    setCheckoutId('');
    setSimulated(false);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        {step === 'done' ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg className="h-7 w-7 text-green-600 dark:text-green-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3 className="text-lg font-bold">Payment Successful!</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">M-Pesa Payment</h3>
              {step === 'phone' && (
                <button onClick={() => { reset(); onClose(); }} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">&times;</button>
              )}
            </div>

            <div className="mb-5 text-center">
              <span className="text-2xl font-bold tracking-tight">
                {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}
              </span>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Account Activation Fee</p>
            </div>

            {step === 'phone' && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Phone Number (M-Pesa)</label>
                  <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-600">
                    <span className="flex items-center rounded-l-lg bg-zinc-100 px-3 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">+254</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="712345678"
                      maxLength={9}
                      className="w-full rounded-r-lg px-3 py-2.5 text-sm outline-none dark:bg-zinc-800"
                      autoFocus
                    />
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">You'll receive an STK push on this number</p>
                </div>
                <button
                  onClick={handleInitiate}
                  disabled={loading}
                  className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Sending...
                    </span>
                  ) : (
                    'Pay Now'
                  )}
                </button>
              </div>
            )}

            {step === 'waiting' && (
              <div className="space-y-4 text-center">
                <svg className="mx-auto mb-2 h-10 w-10 animate-spin text-green-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                <p className="text-sm font-medium">STK Push Sent!</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Check your phone and enter your M-Pesa PIN to complete payment. We're waiting for confirmation...
                </p>
                <button
                  onClick={handleManualCheck}
                  disabled={loading}
                  className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Checking...' : "I've Completed Payment"}
                </button>
                <button
                  onClick={() => { reset(); }}
                  className="w-full text-sm text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  Start over
                </button>
              </div>
            )}

            {step === 'processing' && (
              <div className="py-8 text-center">
                <svg className="mx-auto mb-3 h-8 w-8 animate-spin text-green-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Activating your account...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
