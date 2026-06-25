'use client';

import { Suspense } from 'react';
import MoviesContent from './content';

export default function MoviesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><div className="p-8 text-center text-sm text-zinc-500">Loading...</div></div>}>
      <MoviesContent />
    </Suspense>
  );
}
