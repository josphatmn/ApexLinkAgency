'use client';

import { useState } from 'react';

const businesses = [
  { name: 'TechVault Solutions', category: 'Software', rating: 4.8, reviews: 124, location: 'Nairobi, KE', desc: 'Custom software development & cloud solutions.', color: '#2563eb' },
  { name: 'GreenLeaf Agency', category: 'Marketing', rating: 4.6, reviews: 89, location: 'Mombasa, KE', desc: 'Digital marketing, branding & SEO services.', color: '#3b82f6' },
  { name: 'Prime Realty', category: 'Real Estate', rating: 4.7, reviews: 203, location: 'Nairobi, KE', desc: 'Property sales, rentals, and management.', color: '#1d4ed8' },
  { name: 'AfroTech Innovations', category: 'Software', rating: 4.9, reviews: 67, location: 'Kigali, RW', desc: 'AI solutions and enterprise software.', color: '#2563eb' },
  { name: 'Heritage Photographers', category: 'Photography', rating: 4.5, reviews: 156, location: 'Kampala, UG', desc: 'Event photography and videography.', color: '#3b82f6' },
  { name: 'BuildRight Contractors', category: 'Construction', rating: 4.4, reviews: 92, location: 'Nairobi, KE', desc: 'Residential & commercial construction.', color: '#1d4ed8' },
  { name: 'FreshBite Catering', category: 'Catering', rating: 4.7, reviews: 178, location: 'Dar es Salaam, TZ', desc: 'Event catering and meal delivery services.', color: '#2563eb' },
  { name: 'SafeRoute Logistics', category: 'Logistics', rating: 4.3, reviews: 45, location: 'Nairobi, KE', desc: 'Courier and logistics solutions.', color: '#3b82f6' },
  { name: 'BrightPath Academy', category: 'Education', rating: 4.8, reviews: 211, location: 'Mombasa, KE', desc: 'Tutoring and professional certification.', color: '#1d4ed8' },
];

export default function BusinessPage() {
  const [search, setSearch] = useState('');

  const filtered = businesses.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase()) ||
    b.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <span className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:bg-blue-900 dark:text-blue-300">Discover & Connect</span>
        <h1 className="text-3xl font-extrabold tracking-tight">Business Directory</h1>
        <p className="mt-2 text-zinc-500">Verified businesses and service providers</p>
      </div>

      <div className="relative mx-auto mb-8 max-w-xl">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search businesses, categories, locations..."
          className="w-full rounded-xl border border-zinc-300 bg-white py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-900"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(b => (
          <div key={b.name} className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${b.color}20` }}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={b.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <svg className="h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                <span className="font-semibold">{b.rating}</span>
                <span className="text-zinc-400">({b.reviews})</span>
              </div>
            </div>
            <h3 className="mb-1 text-base font-bold">{b.name}</h3>
            <p className="mb-2 text-sm leading-relaxed text-zinc-500">{b.desc}</p>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">{b.category}</span>
              <span className="flex items-center gap-1">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {b.location}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-zinc-500">No businesses found matching your search.</p>
      )}
    </div>
  );
}
