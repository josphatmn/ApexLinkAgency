'use client';

import Link from 'next/link';

const nodes = [
  { id: 'tools', title: 'AI & Digital Tools', tagline: 'Unlimited Access', desc: 'Harness cutting-edge AI tools for content creation, image generation, data analysis, and more.', color: '#8b5cf6', features: ['AI Writing & Copywriting', 'Image & Video Generation', 'Data Analytics', 'Process Automation'] },
  { id: 'resources', title: 'Resource Library', tagline: 'Learn & Grow', desc: 'Access a curated collection of ebooks, video courses, templates, and guides.', color: '#f59e0b', features: ['E-Books & PDFs', 'Video Courses', 'Business Templates', 'Step-by-Step Guides'] },
  { id: 'entertainment', title: 'Entertainment Hub', tagline: 'Stream & Play', desc: 'Premium entertainment — online games, movies, TV series, and music streaming.', color: '#ef4444', features: ['Movie & TV Streaming', 'Music Streaming', 'Online Games', 'Live Events'] },
  { id: 'business', title: 'Business Directory', tagline: 'Discover & Connect', desc: 'Verified directory of businesses and service providers.', color: '#3b82f6', features: ['Verified Listings', 'Reviews & Ratings', 'Contact Details', 'Location Maps'] },
  { id: 'catalogue', title: 'Sellers Catalogue', tagline: 'Shop & Sell', desc: 'Browse products from verified sellers across multiple categories.', color: '#22c55e', features: ['Product Listings', 'Seller Profiles', 'Category Browsing', 'Direct Messaging'] },
  { id: 'events', title: 'Events & Meetups', tagline: 'Attend & Network', desc: 'Stay updated with upcoming events, webinars, workshops, and networking.', color: '#ec4899', features: ['Event Calendar', 'Online & Offline', 'Ticket Booking', 'Networking'] },
  { id: 'creators', title: 'Creator Marketplace', tagline: 'Monetize Your Craft', desc: 'Sell your digital content — art, music, writing, courses, and more.', color: '#14b8a6', features: ['Content Selling', 'Pay-Per-Download', 'Subscription Options', 'Analytics Dashboard'] },
];

export default function NodesPage() {
  return (
    <div className="pb-16">
      <section className="relative overflow-hidden px-4 pb-12 pt-16 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-purple-500/10 blur-[80px]" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-amber-500/10 blur-[80px]" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/10 blur-[80px]" />
        </div>
        <div className="relative z-10">
          <span className="mb-4 inline-block rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider dark:bg-zinc-800">Explore</span>
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl">APEXLINK Premium Access</h1>
          <p className="mx-auto max-w-2xl text-zinc-500 dark:text-zinc-400">Your gateway to a universe of tools, content, and opportunities. Each node unlocks a new dimension of value.</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {nodes.map(node => (
          <Link key={node.id} href={`/nodes/${node.id}`}
            className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="absolute inset-x-0 top-0 h-1 opacity-60" style={{ backgroundColor: node.color }} />
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${node.color}15` }}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={node.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </div>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:bg-zinc-800">Explore</span>
            </div>
            <h3 className="mb-1 text-lg font-bold">{node.title}</h3>
            <p className="mb-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{node.desc}</p>
            <ul className="mb-4 space-y-1">
              {node.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke={node.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <span className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition group-hover:bg-zinc-900 group-hover:text-white dark:border-zinc-600 dark:group-hover:bg-white dark:group-hover:text-zinc-900">
              Enter Node
            </span>
          </Link>
        ))}
      </div>

      {/* Promotion callout */}
      <div className="mx-auto mt-8 max-w-7xl px-4">
        <Link href="/nodes/promotion"
          className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-sm font-medium text-amber-800 transition hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-950/50">
          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-900 dark:bg-amber-800 dark:text-amber-100">&#9889; LIVE</span>
          <span className="flex-1">APEX Promotion — Bet tokens and win big every round!</span>
          <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
