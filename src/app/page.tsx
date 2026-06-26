import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getSession();
  if (session) {
    if (session.activated) redirect('/dashboard');
    redirect('/payment');
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1920&q=80"
            alt=""
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent dark:from-zinc-950/95 dark:via-zinc-950/80" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex animate-pulse items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-semibold text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Now serving Kenya, Uganda, Tanzania & Rwanda
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 md:text-6xl dark:text-white">
              Turn Your Network Into{' '}
              <span className="bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">Real Earnings</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-zinc-600 md:text-xl dark:text-zinc-400">
              Earn commissions from your referrals, access premium movies, TV shows, AI tools, and digital resources — all from one platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-xl bg-zinc-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Start Earning Today
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-zinc-300 bg-white px-8 py-3.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative border-t border-zinc-100 bg-zinc-50 py-24 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 md:text-4xl dark:text-white">
            Three Steps to Start Earning
          </h2>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Create Your Free Account',
                desc: 'Sign up in seconds. No upfront costs. Your earning journey starts the moment you join.',
                color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
              },
              {
                step: '02',
                title: 'Share Your Referral Link',
                desc: 'Invite friends, family, and colleagues. Earn commissions when they join and activate.',
                color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
              },
              {
                step: '03',
                title: 'Earn & Enjoy Premium Content',
                desc: 'Collect commissions from your network and unlock free access to movies, TV shows, AI tools, and more.',
                color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
              },
            ].map((item) => (
              <div key={item.step} className="group rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 transition hover:shadow-lg hover:ring-amber-200 dark:bg-zinc-800 dark:ring-zinc-700 dark:hover:ring-amber-700">
                <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-xl font-black ${item.color}`}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earning Avenues */}
      <section className="relative py-24">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80"
            alt=""
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-white/90 dark:bg-zinc-950/90" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              Earning Avenues
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 md:text-4xl dark:text-white">
              Multiple Ways to Earn
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Whether you refer one person or build a team, every connection grows your income.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Direct Commissions',
                desc: 'Earn a percentage every time someone you refer activates their account.',
                emoji: '\u{1F4B0}',
              },
              {
                title: 'Team Bonuses',
                desc: 'Earn from your second-level referrals too — your network works for you.',
                emoji: '\u{1F465}',
              },
              {
                title: 'Promotion Rewards',
                desc: 'Bet tokens in our APEX Promotion rounds and win a share of the pot.',
                emoji: '\u26A1',
              },
              {
                title: 'Residual Income',
                desc: 'Keep earning as your network grows. No cap on how much you can make.',
                emoji: '\u{1F4C8}',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
                <div className="mb-4 text-3xl">{item.emoji}</div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Access */}
      <section className="relative border-t border-zinc-100 bg-gradient-to-br from-amber-50 via-white to-amber-50 py-24 dark:border-zinc-800 dark:from-amber-950/20 dark:via-zinc-950 dark:to-amber-950/20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                Free Premium Access
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 md:text-4xl dark:text-white">
                Unlock Premium Content at No Extra Cost
              </h2>
              <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                Your activation unlocks more than earning — it gives you free access to thousands of movies, TV shows, AI writing tools, image generation, digital courses, and a growing library of premium resources.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Stream movies & TV shows on demand',
                  'AI writing, image generation & data tools',
                  'Digital courses, e-books & templates',
                  'Business directory & creator marketplace',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                      {'\u2713'}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80"
                alt=""
                className="rounded-2xl shadow-2xl ring-1 ring-black/10"
              />
              <div className="absolute -bottom-4 -left-4 rounded-xl bg-white px-5 py-3 shadow-lg ring-1 ring-black/5 dark:bg-zinc-800 dark:ring-white/10">
                <div className="text-xs font-medium text-zinc-500">Thousands of titles</div>
                <div className="text-lg font-bold text-zinc-900 dark:text-white">Available Free</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Countries */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Available in East Africa</h2>
          <p className="mt-2 text-sm text-zinc-500">Join a growing community of earners across the region</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
            {[
              { name: 'Kenya', flag: '\u{1F1F0}\u{1F1EA}', desc: 'Our primary market' },
              { name: 'Uganda', flag: '\u{1F1FA}\u{1F1EC}', desc: 'Fastest growing' },
              { name: 'Tanzania', flag: '\u{1F1F9}\u{1F1FF}', desc: 'Expanding' },
              { name: 'Rwanda', flag: '\u{1F1F7}\u{1F1FC}', desc: 'New market' },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-6 py-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                <span className="text-3xl">{c.flag}</span>
                <div className="text-left">
                  <div className="text-sm font-bold text-zinc-900 dark:text-white">{c.name}</div>
                  <div className="text-xs text-zinc-500">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-zinc-200 bg-zinc-900 py-20 dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Ready to Start Earning?
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            Join thousands of East Africans building real income with APEXLINK. Sign up free and start earning immediately.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-amber-500 px-8 py-3.5 text-sm font-bold text-zinc-900 shadow-lg transition hover:bg-amber-400 active:scale-95"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-zinc-700 px-8 py-3.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 active:scale-95"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME || 'APEXLINK Agency'}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export const dynamic = 'force-dynamic';
