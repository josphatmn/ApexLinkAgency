'use client';

import { useState } from 'react';

const categories = ['All', 'Electronics', 'Fashion', 'Home & Garden', 'Health & Beauty', 'Sports', 'Food & Drinks'];

const products = [
  { name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', price: '250 tokens', seller: 'TechVault', rating: 4.7, color: '#16a34a' },
  { name: 'Smart Watch Pro X2', category: 'Electronics', price: '180 tokens', seller: 'GadgetHub', rating: 4.5, color: '#22c55e' },
  { name: 'Premium Cotton T-Shirt', category: 'Fashion', price: '25 tokens', seller: 'StyleKenya', rating: 4.3, color: '#16a34a' },
  { name: 'Leather Crossbody Bag', category: 'Fashion', price: '65 tokens', seller: 'AfroChic', rating: 4.8, color: '#22c55e' },
  { name: 'Indoor Herb Garden Kit', category: 'Home & Garden', price: '40 tokens', seller: 'GreenThumb', rating: 4.6, color: '#15803d' },
  { name: 'Smart LED Light Strips', category: 'Home & Garden', price: '30 tokens', seller: 'HomeSmart', rating: 4.4, color: '#16a34a' },
  { name: 'Organic Shea Butter Set', category: 'Health & Beauty', price: '18 tokens', seller: 'NaturalsKE', rating: 4.9, color: '#22c55e' },
  { name: 'Essential Oil Diffuser', category: 'Health & Beauty', price: '35 tokens', seller: 'WellnessHub', rating: 4.5, color: '#15803d' },
  { name: 'Yoga Mat Premium', category: 'Sports', price: '28 tokens', seller: 'FitLife', rating: 4.6, color: '#16a34a' },
  { name: 'Resistance Bands Set', category: 'Sports', price: '15 tokens', seller: 'FitLife', rating: 4.4, color: '#22c55e' },
  { name: 'Artisan Coffee Beans 1kg', category: 'Food & Drinks', price: '22 tokens', seller: 'BrewHouse', rating: 4.7, color: '#15803d' },
  { name: 'Organic Honey Jar', category: 'Food & Drinks', price: '12 tokens', seller: 'FarmFresh', rating: 4.8, color: '#16a34a' },
  { name: 'Bluetooth Portable Speaker', category: 'Electronics', price: '55 tokens', seller: 'GadgetHub', rating: 4.3, color: '#22c55e' },
  { name: 'Denim Jacket', category: 'Fashion', price: '75 tokens', seller: 'StyleKenya', rating: 4.6, color: '#15803d' },
];

export default function CataloguePage() {
  const [activeCat, setActiveCat] = useState('All');

  const filtered = activeCat === 'All' ? products : products.filter(p => p.category === activeCat);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <span className="mb-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-green-700 dark:bg-green-900 dark:text-green-300">Shop & Sell</span>
        <h1 className="text-3xl font-extrabold tracking-tight">Sellers Catalogue</h1>
        <p className="mt-2 text-zinc-500">Browse products from verified sellers</p>
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeCat === cat
                ? 'bg-green-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(p => (
          <div key={p.name} className="group rounded-xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${p.color}20` }}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h3 className="mb-1 text-base font-bold">{p.name}</h3>
            <div className="mb-3 flex items-center gap-2 text-xs text-zinc-400">
              <span>{p.seller}</span>
              <span className="flex items-center gap-0.5">
                <svg className="h-3 w-3 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                {p.rating}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">{p.category}</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">{p.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
