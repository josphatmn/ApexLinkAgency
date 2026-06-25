'use client';

import { Suspense } from 'react';
import RegisterForm from './form';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="text-sm text-zinc-500">Loading...</div></div>}>
      <RegisterForm />
    </Suspense>
  );
}
