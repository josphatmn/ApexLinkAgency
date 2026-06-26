'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from './Toast';

interface PesapalModalProps {
  isOpen: boolean;
  amount: number;
  currency: string;
  onSuccess: () => void;
}

type Step = 'phone' | 'loading' | 'iframe' | 'done';

export default function PesapalModal({ isOpen, amount, currency, onSuccess }: PesapalModalProps) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [orderTrackingId, setOrderTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'PESAPAL_DONE' && e.data?.orderTrackingId) {
        setOrderTrackingId(e.data.orderTrackingId);
        setStep('loading');
        handleVerify(e.data.orderTrackingId);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = async (otid: string) => {
    try {
      const res = await fetch('/api/pesapal/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderTrackingId: otid }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('done');
        toast.success(data.message);
        setTimeout(() => onSuccess(), 1500);
      } else {
        toast.error(data.error || 'Activation failed');
        setStep('iframe');
      }
    } catch {
      toast.error('Network error');
      setStep('iframe');
    }
  };

  const handlePay = async () => {
    if (!phone || phone.length < 9) {
      toast.error('Enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/pesapal/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.simulated) {
          toast.success('DEV: Simulating...');
          const vres = await fetch('/api/pesapal/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderTrackingId: data.orderTrackingId, simulated: true }),
          });
          const vdata = await vres.json();
          if (vdata.success) {
            setStep('done');
            toast.success(vdata.message);
            setTimeout(() => onSuccess(), 1500);
          } else {
            toast.error(vdata.error || 'Activation failed');
          }
          setLoading(false);
          return;
        }
        setRedirectUrl(data.redirectUrl);
        setOrderTrackingId(data.orderTrackingId);
        setStep('iframe');
      } else {
        toast.error(data.error || 'Failed to initiate payment');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('phone');
    setPhone('');
    setRedirectUrl('');
    setOrderTrackingId('');
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
        {step === 'done' ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg className="h-7 w-7 text-green-600 dark:text-green-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3 className="text-lg font-bold">Payment Successful!</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Redirecting to dashboard...</p>
          </div>
        ) : step === 'iframe' ? (
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
              <span className="text-sm font-medium">
                {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}
              </span>
              <span className="text-xs text-zinc-400">Complete payment in the frame below</span>
            </div>
            <div className="h-[500px] w-full">
              <iframe
                ref={iframeRef}
                src={redirectUrl}
                className="h-full w-full border-0"
                title="PesaPal Payment"
                allow="payment *"
              />
            </div>
          </div>
        ) : step === 'loading' ? (
          <div className="px-6 py-16 text-center">
            <svg className="mx-auto mb-3 h-8 w-8 animate-spin text-green-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Verifying payment...</p>
          </div>
        ) : (
          <div className="px-6 py-8">
            <div className="mb-6 text-center">
              <h3 className="text-lg font-bold">Activate Your Account</h3>
              <div className="my-2 text-2xl font-bold tracking-tight">
                {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Activation Fee</p>
            </div>

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
              </div>
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
