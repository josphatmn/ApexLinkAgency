'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from '@/components/Toast';
import PesapalModal from '@/components/PesapalModal';

export default function PaymentPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleSuccess = () => {
    setShowModal(false);
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <svg className="h-8 w-8 text-zinc-600 dark:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
        </div>
        <h2 className="text-xl font-bold">Activate Your Account</h2>
        <div className="my-4 text-3xl font-bold tracking-tight">
          {parseFloat(process.env.NEXT_PUBLIC_ACTIVATION_FEE || '500').toLocaleString('en-US', { minimumFractionDigits: 2 })} {process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'KES'}
        </div>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Pay the activation fee via M-Pesa, Airtel Money, or card to unlock your dashboard and start earning commissions.
        </p>

        <button
          onClick={() => setShowModal(true)}
          className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-700"
        >
          Pay with M-Pesa / Card
        </button>

        <div className="mt-6">
          <button
            onClick={async () => {
              await fetch('/api/auth/logout');
              toast.success('Logged out successfully');
              setTimeout(() => window.location.href = '/login', 500);
            }}
            className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Cancel and logout
          </button>
        </div>
      </div>

      <PesapalModal
        isOpen={showModal}
        amount={parseFloat(process.env.NEXT_PUBLIC_ACTIVATION_FEE || '500')}
        currency={process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'KES'}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
