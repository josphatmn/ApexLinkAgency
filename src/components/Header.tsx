'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { useState, useEffect } from 'react';
import { toast } from './Toast';

interface UserData {
  id: number;
  username: string;
  avatar: string | null;
  activated: boolean;
  balance: number;
  apex_balance: number;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [user, setUser] = useState<UserData | null>(null);
  const [megaOpen, setMegaOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pathname]);

  const isAdmin = pathname.startsWith('/admin');
  if (isAdmin) return null;

  const handleLogout = async () => {
    await fetch('/api/auth/logout');
    window.location.href = '/login';
  };

  const avatarColor = user
    ? ['#ef4444','#f59e0b','#22c55e','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16'][
        Math.abs(user.username.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 10
      ]
    : '#8b5cf6';

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {process.env.NEXT_PUBLIC_SITE_NAME || 'APEXLINK Agency'}
        </Link>

        <nav className="flex items-center gap-1">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
          ) : user ? (
            <>
              <div className="relative">
                <button
                  onClick={() => setMegaOpen(!megaOpen)}
                  className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  Premium Access
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
                </button>
                {megaOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMegaOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-2 w-[640px] rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { href: '/nodes/tools', label: 'AI & Digital Tools', desc: 'AI Writing, Image Gen, Data Analytics', color: '#8b5cf6' },
                          { href: '/nodes/resources', label: 'Resource Library', desc: 'E-Books, Video Courses, Templates', color: '#f59e0b' },
                          { href: '/nodes/entertainment', label: 'Entertainment Hub', desc: 'Movies, Music, Games, Events', color: '#ef4444' },
                          { href: '/nodes/business', label: 'Business Directory', desc: 'Verified Listings, Reviews', color: '#3b82f6' },
                          { href: '/nodes/catalogue', label: 'Sellers Catalogue', desc: 'Product Listings, Seller Profiles', color: '#22c55e' },
                          { href: '/nodes/creators', label: 'Creator Marketplace', desc: 'Sell Digital Content', color: '#14b8a6' },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMegaOpen(false)}
                            className="group flex items-start gap-3 rounded-lg p-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          >
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                              style={{ backgroundColor: `${item.color}15`, color: item.color }}
                            >
                              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-zinc-900 dark:text-white">{item.label}</div>
                              <div className="text-xs text-zinc-500">{item.desc}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-3 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30">
                        <Link href="/nodes/promotion" onClick={() => setMegaOpen(false)} className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300">
                          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-800 dark:text-amber-200">LIVE</span>
                          APEX Promotion — Bet tokens, win big!
                          <span>&rarr;</span>
                        </Link>
                      </div>
                      <Link href="/nodes" onClick={() => setMegaOpen(false)} className="mt-3 block text-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                        Explore All Nodes &rarr;
                      </Link>
                    </div>
                  </>
                )}
              </div>

              <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white">
                Earn
              </Link>
              <Link href="/wallet" className="rounded-md px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white">
                Wallet
              </Link>
              <Link href="/movies" className="rounded-md px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white">
                Movies
              </Link>
              <Link href="/nodes/promotion" className="rounded-md px-3 py-2 text-sm font-bold text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30">
                &#9889; Promo
              </Link>

              {user.activated && (
                <div className="relative">
                  <button
                    onClick={() => setBalanceOpen(!balanceOpen)}
                    className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                  >
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                    {user.apex_balance.toFixed(2)}
                  </button>
                  {balanceOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setBalanceOpen(false)} />
                      <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs text-zinc-500">{process.env.NEXT_PUBLIC_TOKEN_NAME || 'Tokens'}</div>
                            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                              {user.apex_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-zinc-400">
                              = {(user.apex_balance * parseFloat(process.env.NEXT_PUBLIC_TOKEN_EXCHANGE_RATE || '1')).toLocaleString('en-US', { minimumFractionDigits: 2 })} {process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'KES'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-zinc-500">Account Balance</div>
                            <div className="text-lg font-bold text-zinc-900 dark:text-white">
                              {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'KES'}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link href="/wallet" onClick={() => setBalanceOpen(false)}
                              className="flex-1 rounded-lg bg-zinc-900 py-2 text-center text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                              Deposit
                            </Link>
                            {user.balance >= parseFloat(process.env.NEXT_PUBLIC_WITHDRAWAL_THRESHOLD || '200') && (
                              <Link href="/withdraw" onClick={() => setBalanceOpen(false)}
                                className="flex-1 rounded-lg bg-green-600 py-2 text-center text-xs font-semibold text-white hover:bg-green-700">
                                Withdraw
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {user.avatar ? (
                    <img src={`/uploads/avatars/${user.avatar}`} alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: avatarColor }}>
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden text-sm font-medium sm:block">{user.username}</span>
                </button>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                      <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        Profile
                      </Link>
                      <Link href="/wallet" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                        Wallet
                      </Link>
                      <Link href="/commissions" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
                        Commissions
                      </Link>
                      <Link href="/withdraw" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        Withdrawals
                      </Link>
                      <hr className="my-1 border-zinc-200 dark:border-zinc-700" />
                      <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white">
                Login
              </Link>
              <Link href="/register" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                Get Started
              </Link>
            </>
          )}
          <button
            onClick={toggle}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <span className="text-lg">&#9788;</span> : <span className="text-lg">&#9790;</span>}
          </button>
        </nav>
      </div>
    </header>
  );
}
