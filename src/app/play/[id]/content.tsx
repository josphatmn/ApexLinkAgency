'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDetails, getSeasonEpisodes } from '@/lib/tmdb';

const SERVERS: Record<number, {
  name: string;
  movie: (id: number) => string;
  tv: (id: number, s: number, e: number) => string;
}> = {
  1: {
    name: 'Latte',
      movie: id => `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=true`,
    tv: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}?autoPlay=true`
  },
  2: {
    name: 'Cappuccino',
    movie: id => `https://moviesapi.club/movie/${id}`,
    tv: (id, s, e) => `https://moviesapi.club/tv/${id}-${s}-${e}`
  },
  3: {
    name: 'Macchiato',
    movie: id => `https://vidsrc.me/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
  },
  4: {
    name: 'Cortado',
    movie: id => `https://player.videasy.net/movie/${id}`,
    tv: (id, s, e) => `https://player.videasy.net/tv/${id}/${s}/${e}?nextEpisode=true&episodeSelector=true`
  },
  5: {
    name: 'Mocha',
    movie: id => `https://vidfast.pro/movie/${id}`,
    tv: (id, s, e) => `https://vidfast.pro/tv/${id}/${s}/${e}`
  },
  6: {
    name: 'Breve',
      movie: id => `https://vidlink.pro/movie/${id}?title=true&poster=true&autoplay=true`,
    tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}?title=true&poster=true&autoplay=true&nextbutton=true`
  }
};

export default function PlayContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [access, setAccess] = useState<{ checked: boolean; granted: boolean }>({ checked: false, granted: false });
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [epLoading, setEpLoading] = useState(false);
  const [serverKey, setServerKey] = useState(6);

  const id = Number(params.id);
  const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv';
  const seasonParam = searchParams.get('season');
  const episodeParam = searchParams.get('episode');
  const [currentSeason, setCurrentSeason] = useState(seasonParam ? parseInt(seasonParam) : 1);
  const [currentEpisode, setCurrentEpisode] = useState(episodeParam ? parseInt(episodeParam) : 1);

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
      if (!cancelled) {
        setData(details);
        if (type === 'tv') {
          const s = (details.seasons || []).filter((s: any) => s.season_number > 0);
          setSeasons(s);
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, type, router]);

  useEffect(() => {
    if (type !== 'tv' || !currentSeason) return;
    let cancelled = false;
    (async () => {
      setEpLoading(true);
      try {
        const epData = await getSeasonEpisodes(id, currentSeason);
        if (!cancelled) setEpisodes(epData.episodes || []);
      } catch {}
      setEpLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, type, currentSeason]);

  const changeEpisode = (season: number, episode: number) => {
    setCurrentSeason(season);
    setCurrentEpisode(episode);
    router.push(`/play/${id}?type=tv&season=${season}&episode=${episode}`, { scroll: false });
  };

  const iframeSrc = useMemo(() => {
    const server = SERVERS[serverKey];
    if (!server) return '';
    if (type === 'movie') return server.movie(id);
    return server.tv(id, currentSeason, currentEpisode);
  }, [serverKey, type, id, currentSeason, currentEpisode]);

  if (loading || !access.checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-sm text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  const title = data.title || data.name || 'Untitled';
  const currentEp = episodes.find((e: any) => e.episode_number === currentEpisode);
  const epTitle = currentEp?.name || '';
  const displayTitle = type === 'tv' && epTitle ? `${title} — ${epTitle}` : title;

  return (
    <div className="relative flex h-screen w-full flex-col bg-black">
      <div className="relative flex flex-1 items-center justify-center">
        <iframe
          src={iframeSrc}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          className="size-full"
        />

        <div className="absolute left-4 top-4 z-10 flex items-center gap-3">
          <Link href={`/movies/${id}?type=${type}`}
            className="flex items-center gap-1.5 rounded-xl bg-black/50 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/70">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="hidden truncate text-lg font-bold text-white drop-shadow-lg sm:block md:text-xl">{displayTitle}</h1>
          {type === 'tv' && (
            <>
              <select
                value={currentSeason}
                onChange={e => changeEpisode(parseInt(e.target.value), 1)}
                className="rounded-lg bg-black/60 px-3 py-2 text-sm text-white backdrop-blur-sm"
              >
                {seasons.map((s: any) => (
                  <option key={s.season_number} value={s.season_number} className="bg-zinc-900">{s.name}</option>
                ))}
              </select>
              <select
                value={currentEpisode}
                onChange={e => changeEpisode(currentSeason, parseInt(e.target.value))}
                className="rounded-lg bg-black/60 px-3 py-2 text-sm text-white backdrop-blur-sm"
                disabled={epLoading}
              >
                {episodes.map((ep: any) => (
                  <option key={ep.episode_number} value={ep.episode_number} className="bg-zinc-900">
                    E{ep.episode_number} — {ep.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          <span className="hidden text-sm font-medium text-zinc-400 sm:inline">Streaming Servers</span>
          <select
            value={serverKey}
            onChange={e => setServerKey(parseInt(e.target.value))}
            className="rounded-lg bg-black/60 px-3 py-2 text-sm text-white backdrop-blur-sm"
          >
            {Object.entries(SERVERS).map(([k, s]) => (
              <option key={k} value={k} className="bg-zinc-900">{s.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
