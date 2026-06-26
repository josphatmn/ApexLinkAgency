'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function CallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderTrackingId = searchParams.get('OrderTrackingId');
    if (orderTrackingId) {
      window.parent.postMessage({ type: 'PESAPAL_DONE', orderTrackingId }, '*');
    }
  }, []);

  return null;
}

function Fallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderTrackingId = params.get('OrderTrackingId');
    if (orderTrackingId) {
      window.parent.postMessage({ type: 'PESAPAL_DONE', orderTrackingId }, '*');
    }
  }, []);
  return null;
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <CallbackContent />
    </Suspense>
  );
}
