const TMDB_BASE = 'https://api.themoviedb.org/3';

function getKey(): string {
  if (process.env.NEXT_PUBLIC_TMDB_API_KEY) {
    return process.env.NEXT_PUBLIC_TMDB_API_KEY;
  }
  throw new Error('TMDB_API_KEY not configured in .env.local');
}

async function tmdb(endpoint: string, params?: Record<string, string>) {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', getKey());
  url.searchParams.set('language', 'en-US');
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export async function searchMulti(query: string, page = 1) {
  return tmdb('/search/multi', { query, page: String(page) });
}

export async function discover(type: 'movie' | 'tv', page = 1, genre?: string) {
  const params: Record<string, string> = { page: String(page), sort_by: 'popularity.desc' };
  if (genre) params.with_genres = genre;
  return tmdb(`/discover/${type}`, params);
}

export async function getDetails(type: 'movie' | 'tv', id: number) {
  return tmdb(`/${type}/${id}`, { append_to_response: 'credits,videos' });
}

export async function getGenres(type: 'movie' | 'tv') {
  return tmdb(`/genre/${type}/list`);
}

export function getImageUrl(path: string | null, size = 'w500') {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getBackdropUrl(path: string | null) {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/original${path}`;
}
