'use client';

import { Suspense } from 'react';
import PlayContent from './content';

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="text-sm text-zinc-500">Loading...</div></div>}>
      <PlayContent />
    </Suspense>
  );
}
