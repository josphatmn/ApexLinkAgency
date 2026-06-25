'use client';

import { useState } from 'react';

const categories = ['All', 'E-Books', 'Video Courses', 'Templates', 'Guides'];

const resources = [
  { title: 'Digital Marketing 101', category: 'E-Books', desc: 'Complete guide to digital marketing strategies.', pages: 180, cost: '15 tokens', color: '#d97706' },
  { title: 'Advanced SEO Playbook', category: 'E-Books', desc: 'Master search engine optimization techniques.', pages: 240, cost: '20 tokens', color: '#b45309' },
  { title: 'Video Editing Masterclass', category: 'Video Courses', desc: 'Learn professional video editing from scratch.', lessons: 24, cost: '45 tokens', color: '#f59e0b' },
  { title: 'Mobile App Development', category: 'Video Courses', desc: 'Build iOS & Android apps with React Native.', lessons: 36, cost: '60 tokens', color: '#d97706' },
  { title: 'Business Plan Template', category: 'Templates', desc: 'Professional business plan with financial projections.', format: 'DOCX', cost: '8 tokens', color: '#b45309' },
  { title: 'Social Media Calendar', category: 'Templates', desc: 'Plan and schedule your social media content.', format: 'XLSX', cost: '5 tokens', color: '#f59e0b' },
  { title: 'Startup Funding Guide', category: 'Guides', desc: 'Step-by-step guide to raising capital.', steps: 12, cost: '10 tokens', color: '#d97706' },
  { title: 'Freelancing Success Kit', category: 'Guides', desc: 'Everything you need to start freelancing.', steps: 8, cost: '12 tokens', color: '#b45309' },
  { title: 'Python for Data Science', category: 'E-Books', desc: 'Learn Python with real-world data projects.', pages: 320, cost: '25 tokens', color: '#f59e0b' },
  { title: 'UX Design Course', category: 'Video Courses', desc: 'Design intuitive user experiences from scratch.', lessons: 18, cost: '35 tokens', color: '#d97706' },
  { title: 'Email Marketing Templates', category: 'Templates', desc: 'Ready-to-use email campaign templates.', format: 'HTML', cost: '6 tokens', color: '#b45309' },
  { title: 'Remote Work Playbook', category: 'Guides', desc: 'Best practices for productive remote work.', steps: 10, cost: '7 tokens', color: '#f59e0b' },
];

export default function ResourcesPage() {
  const [activeCat, setActiveCat] = useState('All');

  const filtered = activeCat === 'All' ? resources : resources.filter(r => r.category === activeCat);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <span className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:bg-amber-900 dark:text-amber-300">Learning & Growth</span>
        <h1 className="text-3xl font-extrabold tracking-tight">Resource Library</h1>
        <p className="mt-2 text-zinc-500">Curated e-books, courses, templates, and guides</p>
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeCat === cat
                ? 'bg-amber-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(r => (
          <div key={r.title} className="group rounded-xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${r.color}20` }}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={r.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h3 className="mb-1 text-base font-bold">{r.title}</h3>
            <p className="mb-2 text-sm leading-relaxed text-zinc-500">{r.desc}</p>
            {'pages' in r && <p className="text-xs text-zinc-400">{r.pages} pages</p>}
            {'lessons' in r && <p className="text-xs text-zinc-400">{r.lessons} lessons</p>}
            {'format' in r && <p className="text-xs text-zinc-400">{r.format} format</p>}
            {'steps' in r && <p className="text-xs text-zinc-400">{r.steps} steps</p>}
            <div className="mt-3 flex items-center justify-between">
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">{r.category}</span>
              <span className="text-sm font-bold" style={{ color: r.color }}>{r.cost}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
