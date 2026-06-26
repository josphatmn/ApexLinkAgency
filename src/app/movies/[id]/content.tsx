'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDetails, getImageUrl, getBackdropUrl, getSeasonEpisodes } from '@/lib/tmdb';
import { toast } from '@/components/Toast';

export default function DetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<boolean | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [insufficientError, setInsufficientError] = useState<string | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [seasonEpisodes, setSeasonEpisodes] = useState<any>(null);
  const [seasonLoading, setSeasonLoading] = useState(false);

  const id = Number(params.id);
  const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv';

  useEffect(() => {
    setLoading(true);
    getDetails(type, id)
      .then(d => setData(d))
      .catch(() => router.push('/movies'))
      .finally(() => setLoading(false));
  }, [id, type, router]);

  useEffect(() => {
    fetch(`/api/media/access?media_id=${id}&media_type=${type}`)
      .then(r => r.json())
      .then(d => setAccess(d.hasAccess || false))
      .catch(() => setAccess(false));
  }, [id, type]);

  const handlePurchase = useCallback(async () => {
    if (!data) return;
    setPurchasing(true);
    setInsufficientError(null);
    try {
      const title = data.title || data.name || '';
      const path = data.poster_path || null;
      const res = await fetch('/api/media/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_id: id, media_type: type, title, poster_path: path }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(d.message);
        setAccess(true);
      } else if (d.error?.toLowerCase().includes('insufficient') || d.error?.toLowerCase().includes('need')) {
        setInsufficientError(d.error);
      } else {
        toast.error(d.error || 'Purchase failed');
      }
    } catch {
      toast.error('Something went wrong');
    }
    setPurchasing(false);
  }, [id, type, data]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-[70vh] rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex gap-6">
            <div className="h-[350px] w-[230px] shrink-0 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex-1 space-y-4">
              <div className="h-10 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-5 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const title = data.title || data.name || 'Untitled';
  const releaseDate = data.release_date || data.first_air_date || '';
  const year = releaseDate ? releaseDate.split('-')[0] : '';
  const runtime = data.runtime
    ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m`
    : data.episode_run_time?.[0] ? `${Math.floor(data.episode_run_time[0] / 60)}h ${data.episode_run_time[0] % 60}m` : '';
  const seasons = data.number_of_seasons;
  const episodes = data.number_of_episodes;
  const backdrop = getBackdropUrl(data.backdrop_path);
  const poster = getImageUrl(data.poster_path, 'w500');
  const crew = data.credits?.crew || [];
  const cast = data.credits?.cast || [];
  const director = crew.find((c: any) => c.job === 'Director');
  const producers = crew.filter((c: any) => c.job === 'Producer' || c.job === 'Executive Producer');
  const writers = crew.filter((c: any) => c.job === 'Writer' || c.job === 'Screenplay');
  const trailer = data.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
  const tvSeasons = type === 'tv' ? (data.seasons || []).filter((s: any) => s.season_number > 0) : [];

  const toggleSeason = async (seasonNumber: number) => {
    if (expandedSeason === seasonNumber) {
      setExpandedSeason(null);
      setSeasonEpisodes(null);
      return;
    }
    setExpandedSeason(seasonNumber);
    setSeasonLoading(true);
    try {
      const data2 = await getSeasonEpisodes(id, seasonNumber);
      setSeasonEpisodes(data2);
    } catch {}
    setSeasonLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="relative">
        <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden md:h-[70vh]">
          {backdrop ? (
            <>
              <img src={backdrop} alt="" className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 dark:to-transparent" />
            </>
          ) : (
            <div className="size-full bg-zinc-200 dark:bg-zinc-800" />
          )}
        </div>

        <Link href={`/movies`} className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-xl bg-black/50 px-3.5 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-black/70 active:scale-95">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8">

          <div className="-mt-48 flex flex-col gap-8 md:-mt-64 md:flex-row md:items-end">
            <div className="mx-auto w-48 shrink-0 md:mx-0 md:w-56">
              {poster ? (
                <img src={poster} alt={title} className="w-full rounded-xl shadow-2xl ring-1 ring-black/10" />
              ) : (
                <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl bg-zinc-200 text-zinc-400 dark:bg-zinc-800">
                  <svg className="size-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold text-zinc-900 md:text-4xl dark:text-white">
                {title}
                {year && <span className="ml-2 text-2xl font-normal text-zinc-500 dark:text-zinc-400">({year})</span>}
              </h1>

              {data.tagline && <p className="mt-2 text-base italic text-zinc-600 dark:text-zinc-400">{data.tagline}</p>}

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                {data.vote_average > 0 && (
                  <span className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {data.vote_average.toFixed(1)}
                  </span>
                )}
                {runtime && <span className="font-medium text-zinc-700 dark:text-zinc-300">{runtime}</span>}
                {type === 'tv' && seasons && <span className="font-medium text-zinc-700 dark:text-zinc-300">{seasons} Season{seasons !== 1 ? 's' : ''}</span>}
                {type === 'tv' && episodes && <span className="font-medium text-zinc-700 dark:text-zinc-300">{episodes} Episodes</span>}
                {data.status && <span className="font-medium text-zinc-700 dark:text-zinc-300">{data.status}</span>}
              </div>

              {data.genres?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.genres.map((g: any) => (
                    <span key={g.id} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {trailer && (
                <div className="mt-5">
                  <button onClick={() => setTrailerOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700 active:scale-95">
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z" /></svg>
                    Watch Trailer
                  </button>
                </div>
              )}

              <div className="mt-5">
                {access === true ? (
                  <Link href={`/play/${id}?type=${type}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    Play
                  </Link>
                ) : access === false ? (
                  <button onClick={handlePurchase} disabled={purchasing}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50">
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {purchasing ? 'Processing...' : `Pay ${process.env.NEXT_PUBLIC_MEDIA_ACCESS_COST || '50'} ${process.env.NEXT_PUBLIC_TOKEN_NAME || 'Tokens'}`}
                  </button>
                ) : (
                  <div className="h-10 w-44 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12">
        <div className="grid gap-12 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_320px]">
          <div>
            {data.overview && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Overview</h2>
                <p className="mt-2 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">{data.overview}</p>
              </section>
            )}

            {type === 'tv' && tvSeasons.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-white">Seasons & Episodes</h2>
                <div className="space-y-2">
                  {tvSeasons.map((s: any) => {
                    const isOpen = expandedSeason === s.season_number;
                    return (
                      <div key={s.season_number} className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                        <button
                          onClick={() => toggleSeason(s.season_number)}
                          className="flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                          <div>
                            <span className="text-sm font-semibold text-zinc-900 dark:text-white">{s.name}</span>
                            <span className="ml-2 text-xs text-zinc-500">{s.episode_count} episodes</span>
                          </div>
                          <svg className={`size-4 text-zinc-400 transition ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isOpen && (
                          <div className="border-t border-zinc-200 dark:border-zinc-700">
                            {seasonLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white" />
                              </div>
                            ) : seasonEpisodes?.episodes?.length > 0 ? (
                              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {seasonEpisodes.episodes.map((ep: any) => (
                                  <div key={ep.episode_number} className="flex items-center gap-4 px-5 py-3">
                                    {ep.still_path ? (
                                      <img src={`https://image.tmdb.org/t/p/w185${ep.still_path}`} alt=""
                                        className="hidden w-28 shrink-0 rounded-lg sm:block" />
                                    ) : (
                                      <div className="hidden w-28 shrink-0 rounded-lg bg-zinc-200 sm:block aspect-video dark:bg-zinc-700" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-zinc-400">E{ep.episode_number}</span>
                                        {access === true ? (
                                          <Link href={`/play/${id}?type=tv&season=${s.season_number}&episode=${ep.episode_number}`}
                                            className="truncate text-sm font-semibold text-zinc-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                                            {ep.name}
                                          </Link>
                                        ) : (
                                          <span className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{ep.name}</span>
                                        )}
                                      </div>
                                      {ep.overview && (
                                        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{ep.overview}</p>
                                      )}
                                    </div>
                                    <div className="shrink-0 text-right">
                                      {access === true ? (
                                        <Link href={`/play/${id}?type=tv&season=${s.season_number}&episode=${ep.episode_number}`}
                                          className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                                          <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                          Play
                                        </Link>
                                      ) : (
                                        <span className="text-xs text-zinc-400">{ep.runtime ? `${ep.runtime}m` : ''}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="px-5 py-6 text-center text-sm text-zinc-500">No episode details available.</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {cast.length > 0 && (
              <section className="mt-10">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Cast</h2>
                  <span className="text-xs text-zinc-400">{cast.filter((c: any) => c.profile_path).length} actors</span>
                </div>
                <div className="flex flex-wrap gap-5">
                  {cast.filter((c: any) => c.profile_path).slice(0, 20).map((actor: any) => (
                    <div key={actor.id} className="w-28 shrink-0 text-center">
                      <div className="mx-auto mb-2 size-24 overflow-hidden rounded-full bg-zinc-100 ring-2 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700">
                        {actor.profile_path ? (
                          <img src={getImageUrl(actor.profile_path, 'w185')!} alt={actor.name}
                            className="size-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex size-full items-center justify-center text-zinc-400">
                            <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold leading-tight text-zinc-800 dark:text-zinc-200">{actor.name}</p>
                      <p className="text-[11px] leading-tight text-zinc-500 dark:text-zinc-400">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {crew.filter((c: any) => ['Director', 'Producer', 'Executive Producer', 'Writer', 'Screenplay'].includes(c.job)).length > 0 && (
              <section className="mt-10">
                <h2 className="mb-5 text-lg font-bold text-zinc-900 dark:text-white">Crew</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {crew.filter((c: any) => ['Director', 'Producer', 'Executive Producer', 'Writer', 'Screenplay'].includes(c.job))
                    .slice(0, 12).map((person: any) => (
                      <div key={`${person.id}-${person.job}`} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
                        <div className="mx-auto mb-3 size-16 overflow-hidden rounded-full bg-zinc-200 ring-2 ring-zinc-300 dark:bg-zinc-700 dark:ring-zinc-600">
                          {person.profile_path ? (
                            <img src={getImageUrl(person.profile_path, 'w185')!} alt={person.name}
                              className="size-full object-cover" loading="lazy" />
                          ) : (
                            <div className="flex size-full items-center justify-center text-zinc-400">
                              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{person.name}</p>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{person.job}</p>
                      </div>
                    ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            {director && (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Director</div>
                <div className="mt-1 text-sm font-bold text-zinc-800 dark:text-zinc-200">{director.name}</div>
              </div>
            )}

            {producers.length > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Producers</div>
                <div className="mt-1 text-sm font-bold text-zinc-800 dark:text-zinc-200">{producers.slice(0, 3).map((p: any) => p.name).join(', ')}</div>
              </div>
            )}

            {writers.length > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Writers</div>
                <div className="mt-1 text-sm font-bold text-zinc-800 dark:text-zinc-200">{writers.slice(0, 3).map((w: any) => w.name).join(', ')}</div>
              </div>
            )}

            {data.budget > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Budget</div>
                <div className="mt-1 text-sm font-bold text-zinc-800 dark:text-zinc-200">${data.budget.toLocaleString()}</div>
              </div>
            )}

            {data.revenue > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Revenue</div>
                <div className="mt-1 text-sm font-bold text-zinc-800 dark:text-zinc-200">${data.revenue.toLocaleString()}</div>
              </div>
            )}

            {data.homepage && (
              <a href={data.homepage} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Official Website
              </a>
            )}
          </aside>
        </div>

        <div className="mt-12 text-center">
          <Link href="/movies"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Browse More Movies & TV Shows
          </Link>
        </div>
      </div>

      {trailerOpen && trailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setTrailerOpen(false)}>
          <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setTrailerOpen(false)} className="absolute -top-10 right-0 text-sm text-zinc-400 hover:text-white">
              Close &times;
            </button>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                title="Trailer"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="size-full"
              />
            </div>
          </div>
        </div>
      )}

      {insufficientError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setInsufficientError(null)}>
          <div className="mx-4 w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl dark:border-red-900 dark:bg-zinc-900" onClick={e => e.stopPropagation()}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
              <svg className="h-7 w-7 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mb-2 text-center text-lg font-bold text-zinc-900 dark:text-white">Insufficient Tokens</h3>
            <p className="mb-6 text-center text-sm text-zinc-600 dark:text-zinc-400">{insufficientError}</p>
            <div className="flex gap-3">
              <Link href="/wallet" onClick={() => { localStorage.setItem('return_to', window.location.pathname + window.location.search); setInsufficientError(null); }}
                className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                Deposit Tokens
              </Link>
              <button onClick={() => setInsufficientError(null)}
                className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
