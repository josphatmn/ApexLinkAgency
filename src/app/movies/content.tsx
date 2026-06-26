'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { discover, getGenres, searchMulti, getImageUrl } from '@/lib/tmdb';

const MEDIA_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Movies', value: 'movie' },
  { label: 'TV Shows', value: 'tv' },
];

const YEAR_RANGE = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

export default function MoviesContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [library, setLibrary] = useState<any[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  const openLibrary = async () => {
    setLibraryOpen(true);
    setLibraryLoading(true);
    try {
      const res = await fetch('/api/media/library');
      const d = await res.json();
      if (d.success) setLibrary(d.items);
    } catch {}
    setLibraryLoading(false);
  };

  const query = sp.get('q') || '';
  const mediaType = sp.get('type') || 'all';
  const genre = sp.get('genre') || '';
  const year = sp.get('year') || '';

  const setParam = useCallback((key: string, val: string) => {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(key, val);
    else p.delete(key);
    if (key !== 'q' && key !== 'type') p.set('p', '1');
    p.delete('p');
    router.push(`/movies?${p.toString()}`);
  }, [sp, router]);

  useEffect(() => {
    const p = parseInt(sp.get('p') || '1');
    setPage(p);
  }, [sp]);

  useEffect(() => {
    getGenres('movie').then((d: any) => {
      getGenres('tv').then((d2: any) => {
        const merged = new Map<number, string>();
        [...(d.genres || []), ...(d2.genres || [])].forEach((g: any) => merged.set(g.id, g.name));
        setGenres(Array.from(merged.entries()).map(([id, name]) => ({ id, name })));
      });
    });
  }, []);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setTotalPages(1);
  }, [query, mediaType, genre, year]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let data: any;
        if (query) {
          data = await searchMulti(query, page);
        } else if (mediaType === 'all' || !mediaType) {
          const movieData = await discover('movie', page, genre);
          const tvData = await discover('tv', page, genre);
          data = {
            results: [...(movieData.results || []), ...(tvData.results || [])]
              .sort((a: any, b: any) => b.popularity - a.popularity),
            total_pages: Math.max(movieData.total_pages || 0, tvData.total_pages || 0),
          };
        } else {
          data = await discover(mediaType as 'movie' | 'tv', page, genre);
        }
        if (cancelled) return;
        setItems(prev => page === 1 ? (data.results || []) : [...prev, ...(data.results || [])]);
        setTotalPages(data.total_pages || 1);
      } catch { /* ignore */ }
      setLoading(false);
      setInitialLoading(false);
    })();
    return () => { cancelled = true; };
  }, [query, mediaType, genre, year, page]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !loading && page < totalPages) setPage(p => p + 1); },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, page, totalPages]);

  const placeholder = (i: number) => (
    <div key={`skel-${i}`} className="animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800">
      <div className="aspect-[2/3]" />
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Movies & TV Shows</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Browse popular movies and TV shows</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={query} onChange={e => setParam('q', e.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-900 dark:focus:border-zinc-400 dark:focus:ring-zinc-800"
          />
        </div>

        {MEDIA_TABS.map(tab => (
          <button key={tab.value} onClick={() => setParam('type', tab.value === 'all' ? '' : tab.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${(mediaType || 'all') === tab.value ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'border border-zinc-300 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800'}`}>
            {tab.label}
          </button>
        ))}

        <select value={genre} onChange={e => setParam('genre', e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900">
          <option value="">Genre</option>
          {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>

        <select value={year} onChange={e => setParam('year', e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900">
          <option value="">Year</option>
          {YEAR_RANGE.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <button onClick={openLibrary}
          className="group relative flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:shadow-xl hover:shadow-purple-500/30 active:scale-95">
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition group-hover:translate-x-full duration-700" />
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          My Library
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {initialLoading && Array.from({ length: 12 }).map((_, i) => placeholder(i))}
        {items.map((item, i) => {
          const title = item.title || item.name || 'Untitled';
          const date = item.release_date || item.first_air_date || '';
          const year2 = date ? date.split('-')[0] : '';
          const mediaT = item.media_type || mediaType;
          const poster = getImageUrl(item.poster_path, 'w342');
          const href = `/movies/${item.id}?type=${mediaT === 'all' ? 'movie' : mediaT}`;
          return (
            <Link key={`${item.id}-${i}`} href={href} className="group rounded-xl border border-zinc-200 bg-white transition hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="relative aspect-[2/3] overflow-hidden rounded-t-xl bg-zinc-100 dark:bg-zinc-800">
                {poster ? (
                  <img src={poster} alt={title} className="size-full object-cover transition group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="flex size-full items-center justify-center text-zinc-400">
                    <svg className="size-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                )}
                <div className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                  {item.vote_average?.toFixed(1) || '?'}
                </div>
                <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase text-white">
                  {mediaT === 'tv' ? 'TV' : 'Movie'}
                </div>
              </div>
              <div className="p-3">
                <h3 className="truncate text-sm font-semibold">{title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{year2}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {loading && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => placeholder(i + 1000))}
        </div>
      )}

      {!loading && items.length === 0 && !initialLoading && (
        <div className="py-16 text-center text-sm text-zinc-500">No results found. Try a different search.</div>
      )}

      <div ref={sentinelRef} className="h-4" />

      {libraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setLibraryOpen(false)}>
          <div className="mx-4 flex h-[80vh] w-full max-w-3xl flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">My Library</h2>
              <button onClick={() => setLibraryOpen(false)} className="text-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {libraryLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white" />
                </div>
              ) : library.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <svg className="size-12 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-sm text-zinc-500">No purchased content yet.</p>
                  <p className="text-xs text-zinc-400">Browse movies and TV shows, then pay with tokens to add them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {library.map((item: any) => {
                    const poster = item.poster_path
                      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                      : null;
                    return (
                      <Link key={item.id} href={`/play/${item.media_id}?type=${item.media_type}`}
                        className="group rounded-xl border border-zinc-200 bg-white transition hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800/50"
                        onClick={() => setLibraryOpen(false)}>
                        <div className="relative aspect-[2/3] overflow-hidden rounded-t-xl bg-zinc-100 dark:bg-zinc-800">
                          {poster ? (
                            <img src={poster} alt={item.title} className="size-full object-cover transition group-hover:scale-105" loading="lazy" />
                          ) : (
                            <div className="flex size-full items-center justify-center text-zinc-400">
                              <svg className="size-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                              </svg>
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase text-white">
                            {item.media_type === 'tv' ? 'TV' : 'Movie'}
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{item.title}</h3>
                          <p className="text-xs text-zinc-500">{new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
