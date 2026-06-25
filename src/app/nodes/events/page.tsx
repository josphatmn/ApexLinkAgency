'use client';

import { useState } from 'react';

const filters = ['All', 'Online', 'Offline', 'Workshop', 'Webinar', 'Networking'];

const events = [
  { title: 'AI & Machine Learning Summit', date: 'Jul 10, 2026', type: 'Online', tags: ['Technology', 'AI'], location: 'Zoom', attendees: 1200, color: '#ec4899' },
  { title: 'Entrepreneurship Bootcamp', date: 'Jul 15, 2026', type: 'Offline', tags: ['Business', 'Workshop'], location: 'Nairobi, KE', attendees: 300, color: '#db2777' },
  { title: 'Digital Marketing Webinar', date: 'Jul 18, 2026', type: 'Webinar', tags: ['Marketing', 'Digital'], location: 'Google Meet', attendees: 500, color: '#ec4899' },
  { title: 'Creative Arts Festival', date: 'Jul 22, 2026', type: 'Offline', tags: ['Arts', 'Culture'], location: 'Mombasa, KE', attendees: 2000, color: '#db2777' },
  { title: 'Blockchain & Finance Workshop', date: 'Jul 25, 2026', type: 'Workshop', tags: ['Blockchain', 'Finance'], location: 'Kigali, RW', attendees: 150, color: '#be185d' },
  { title: 'Tech Networking Mixer', date: 'Aug 1, 2026', type: 'Networking', tags: ['Networking', 'Tech'], location: 'Nairobi, KE', attendees: 200, color: '#ec4899' },
  { title: 'Freelancing Masterclass', date: 'Aug 5, 2026', type: 'Webinar', tags: ['Freelancing', 'Career'], location: 'YouTube Live', attendees: 800, color: '#db2777' },
  { title: 'Photography Walk & Shoot', date: 'Aug 8, 2026', type: 'Offline', tags: ['Photography', 'Outdoor'], location: 'Nairobi, KE', attendees: 50, color: '#be185d' },
  { title: 'Startup Pitch Day', date: 'Aug 12, 2026', type: 'Offline', tags: ['Startups', 'Investing'], location: 'Nairobi, KE', attendees: 400, color: '#ec4899' },
];

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All' ? events : events.filter(e => e.type === activeFilter || e.tags.includes(activeFilter));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <span className="mb-3 inline-block rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-pink-700 dark:bg-pink-900 dark:text-pink-300">Attend & Network</span>
        <h1 className="text-3xl font-extrabold tracking-tight">Events & Meetups</h1>
        <p className="mt-2 text-zinc-500">Upcoming events, webinars, workshops, and networking</p>
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeFilter === f
                ? 'bg-pink-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute bottom-0 left-[19px] top-0 w-px bg-zinc-200 dark:bg-zinc-700" />

        <div className="space-y-6">
          {filtered.map((e, idx) => (
            <div key={e.title} className="relative flex gap-5">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-pink-100 dark:border-zinc-900 dark:bg-pink-900/50">
                <span className="text-sm font-bold text-pink-700 dark:text-pink-300">{idx + 1}</span>
              </div>

              <div className="flex-1 rounded-xl border border-zinc-200 bg-white p-5 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-base font-bold">{e.title}</h3>
                  <span className="shrink-0 rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-medium text-pink-700 dark:bg-pink-900/50 dark:text-pink-300">{e.type}</span>
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {e.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {e.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    {e.attendees.toLocaleString()} attending
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {e.tags.map(t => (
                    <span key={t} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-zinc-500">No events found matching your filter.</p>
      )}
    </div>
  );
}
