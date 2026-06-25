'use client';

import { Suspense } from 'react';
import DetailContent from './content';

export default function MovieDetailPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><div className="p-8 text-center text-sm text-zinc-500">Loading...</div></div>}>
      <DetailContent />
    </Suspense>
  );
}
