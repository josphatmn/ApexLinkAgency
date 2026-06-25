'use client';

import { useState } from 'react';

const categories = ['All', 'Art & Design', 'Music', 'Writing', 'Photography', 'Education', 'Video'];

const stats = [
  { label: 'Total Creators', value: '1,247', color: '#14b8a6' },
  { label: 'Content Items', value: '8,930', color: '#0d9488' },
  { label: 'Tokens Earned', value: '245K', color: '#14b8a6' },
  { label: 'Active Today', value: '342', color: '#0f766e' },
];

const creators = [
  { name: 'ArtByZahara', category: 'Art & Design', desc: 'Digital art and illustration commissions.', items: 84, earned: '12.5K', avatar: 'AZ', color: '#14b8a6' },
  { name: 'BeatMasterK', category: 'Music', desc: 'Afrobeat and hip-hop instrumentals.', items: 156, earned: '18.3K', avatar: 'BM', color: '#0d9488' },
  { name: 'WordsByGrace', category: 'Writing', desc: 'Ghostwriting, copywriting, and editing.', items: 203, earned: '9.8K', avatar: 'WG', color: '#14b8a6' },
  { name: 'LensAfrica', category: 'Photography', desc: 'Stock photography and event shoots.', items: 412, earned: '22.1K', avatar: 'LA', color: '#0f766e' },
  { name: 'EduProKenya', category: 'Education', desc: 'Online courses and tutorial videos.', items: 38, earned: '31.5K', avatar: 'EP', color: '#14b8a6' },
  { name: 'CineWave', category: 'Video', desc: 'Short films, animations, and editing.', items: 67, earned: '15.7K', avatar: 'CW', color: '#0d9488' },
  { name: 'PixelPerfect', category: 'Art & Design', desc: 'UI/UX design and brand identity packages.', items: 91, earned: '27.4K', avatar: 'PP', color: '#14b8a6' },
  { name: 'SoulStrings', category: 'Music', desc: 'Acoustic covers and original compositions.', items: 45, earned: '6.2K', avatar: 'SS', color: '#0f766e' },
  { name: 'StoryCraft', category: 'Writing', desc: 'Short stories, poetry, and novels.', items: 128, earned: '8.1K', avatar: 'SC', color: '#14b8a6' },
];

export default function CreatorsPage() {
  const [activeCat, setActiveCat] = useState('All');

  const filtered = activeCat === 'All' ? creators : creators.filter(c => c.category === activeCat);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <span className="mb-3 inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700 dark:bg-teal-900 dark:text-teal-300">Monetize Your Craft</span>
        <h1 className="text-3xl font-extrabold tracking-tight">Creator Marketplace</h1>
        <p className="mt-2 text-zinc-500">Discover and support talented creators</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeCat === cat
                ? 'bg-teal-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(c => (
          <div key={c.name} className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: c.color }}>
                {c.avatar}
              </div>
              <div>
                <h3 className="text-base font-bold">{c.name}</h3>
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">{c.category}</span>
              </div>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-zinc-500">{c.desc}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">{c.items} items</span>
              <span className="font-semibold text-teal-600 dark:text-teal-400">{c.earned} tokens earned</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
