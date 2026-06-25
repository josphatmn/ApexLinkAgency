'use client';

import { useState } from 'react';

const categories = ['Movies', 'Music', 'Games', 'Live Events'];

const featured = [
  { title: 'Dune: Part Three', type: 'Movie', badge: 'Premiering Soon', image: '🎬', color: '#e11d48' },
  { title: 'Global Music Festival', type: 'Live Event', badge: 'Tickets Available', image: '🎵', color: '#be123c' },
  { title: 'Cyberpunk Arena', type: 'Game', badge: 'Free to Play', image: '🎮', color: '#e11d48' },
];

const items = [
  { title: 'Inception Reloaded', type: 'Movies', desc: 'Sci-fi thriller with stunning visuals.', duration: '2h 28m', cost: '8 tokens', color: '#f43f5e' },
  { title: 'The Last Kingdom S4', type: 'Movies', desc: 'Epic historical drama series.', episodes: 10, cost: '12 tokens', color: '#e11d48' },
  { title: 'Chill Vibes Vol. 3', type: 'Music', desc: 'Curated lo-fi beats for relaxation.', tracks: 15, cost: '5 tokens', color: '#be123c' },
  { title: 'Afro Beats 2026', type: 'Music', desc: 'Top afrobeat hits and exclusives.', tracks: 20, cost: '6 tokens', color: '#f43f5e' },
  { title: 'Shadow Strike Online', type: 'Games', desc: 'Multiplayer tactical shooter.', players: '4v4', cost: '3 tokens/hr', color: '#e11d48' },
  { title: 'Puzzle Quest', type: 'Games', desc: 'Brain-teasing puzzle adventure.', levels: 150, cost: '2 tokens/hr', color: '#be123c' },
  { title: 'Comedy Night Live', type: 'Live Events', desc: 'Stand-up comedy with top comedians.', date: 'Jul 15', cost: '20 tokens', color: '#f43f5e' },
  { title: 'Tech Conference 2026', type: 'Live Events', desc: 'Innovation and technology summit.', date: 'Aug 5', cost: '30 tokens', color: '#e11d48' },
  { title: 'Anime Marathon', type: 'Movies', desc: '24-hour anime streaming event.', episodes: 48, cost: '15 tokens', color: '#be123c' },
];

export default function EntertainmentPage() {
  const [activeCat, setActiveCat] = useState('All');

  const filtered = activeCat === 'All' ? items : items.filter(i => i.type === activeCat);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <span className="mb-3 inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700 dark:bg-rose-900 dark:text-rose-300">Stream & Play</span>
        <h1 className="text-3xl font-extrabold tracking-tight">Entertainment Hub</h1>
        <p className="mt-2 text-zinc-500">Movies, music, games, and live events — all in one place</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {featured.map(f => (
          <div key={f.title} className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 text-4xl">{f.image}</div>
            <h3 className="text-lg font-bold">{f.title}</h3>
            <p className="text-sm text-zinc-500">{f.type}</p>
            <span className="mt-2 inline-block rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900 dark:text-rose-300">{f.badge}</span>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {['All', ...categories].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeCat === cat
                ? 'bg-rose-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(item => (
          <div key={item.title} className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${item.color}20` }}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <h3 className="mb-1 text-base font-bold">{item.title}</h3>
            <p className="mb-2 text-sm leading-relaxed text-zinc-500">{item.desc}</p>
            {'duration' in item && <p className="text-xs text-zinc-400">{item.duration}</p>}
            {'episodes' in item && <p className="text-xs text-zinc-400">{item.episodes} episodes</p>}
            {'tracks' in item && <p className="text-xs text-zinc-400">{item.tracks} tracks</p>}
            {'players' in item && <p className="text-xs text-zinc-400">{item.players}</p>}
            {'levels' in item && <p className="text-xs text-zinc-400">{item.levels} levels</p>}
            {'date' in item && <p className="text-xs text-zinc-400">{item.date}</p>}
            <div className="mt-3 flex items-center justify-between">
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">{item.type}</span>
              <span className="text-sm font-bold" style={{ color: item.color }}>{item.cost}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
