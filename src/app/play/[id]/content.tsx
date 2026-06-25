'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDetails } from '@/lib/tmdb';

export default function PlayContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [access, setAccess] = useState<{ checked: boolean; granted: boolean }>({ checked: false, granted: false });
  const [loading, setLoading] = useState(true);

  const id = Number(params.id);
  const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const accessRes = await fetch(`/api/media/access?media_id=${id}&media_type=${type}`);
      const accessData = await accessRes.json();
      if (cancelled) return;

      if (!accessData.success || !accessData.hasAccess) {
        router.replace(`/movies/${id}?type=${type}`);
        return;
      }

      setAccess({ checked: true, granted: true });

      const details = await getDetails(type, id);
      if (!cancelled) setData(details);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, type, router]);

  if (loading || !access.checked) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-black">
        <div className="text-sm text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  const title = data.title || data.name || 'Untitled';
  const year = (data.release_date || data.first_air_date || '').split('-')[0];

  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-black">
      <div className="flex aspect-video w-full items-center justify-center bg-zinc-900">
        <div className="text-center">
          <svg className="mx-auto mb-4 size-16 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-zinc-500">Player will appear here</p>
        </div>
      </div>

      <Link href={`/movies/${id}?type=${type}`}
        className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-xl bg-black/50 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/70">
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="absolute bottom-6 left-6 z-10">
        <h1 className="text-xl font-bold text-white drop-shadow-lg md:text-2xl">{title}</h1>
        {year && <p className="text-sm text-zinc-300 drop-shadow">{year}</p>}
      </div>
    </div>
  );
}
