'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from '@/components/Toast';

const countryPrefixes: Record<string, string> = {
  Kenya: '+254', Uganda: '+256', Tanzania: '+255', Rwanda: '+250',
};

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState('Kenya');
  const [prefix, setPrefix] = useState('+254');
  const [referrerName, setReferrerName] = useState('Platform');
  const [referralCode, setReferralCode] = useState('APEXLINK');

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref && ref !== 'APEXLINK') {
      fetch(`/api/auth/me?ref=${ref}`).then(r => r.json()).then(d => {
        if (d.success) {
          setReferralCode(ref);
          setReferrerName(d.username);
        }
      }).catch(() => {});
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = {
      username: form.get('username'),
      country: form.get('country'),
      phone: form.get('phone'),
      password: form.get('password'),
      referralCode,
      agree: form.get('agree') === 'on',
    };
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(data.message);
      router.push('/payment');
    } else {
      toast.error(data.error || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Join and start earning</p>
        </div>

        <div className="mb-4 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:bg-zinc-900">
          Invited by: <strong className="text-zinc-900 dark:text-white">{referrerName} ({referralCode})</strong>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
            <input id="username" name="username" type="text" required minLength={3} maxLength={20}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-900 dark:focus:border-zinc-400 dark:focus:ring-zinc-800" />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium mb-1">Country</label>
            <select id="country" name="country" value={country} onChange={(e) => { setCountry(e.target.value); setPrefix(countryPrefixes[e.target.value] || '+254'); }}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-900 dark:focus:border-zinc-400 dark:focus:ring-zinc-800">
              <option value="Kenya">Kenya (+254)</option>
              <option value="Uganda">Uganda (+256)</option>
              <option value="Tanzania">Tanzania (+255)</option>
              <option value="Rwanda">Rwanda (+250)</option>
            </select>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
            <div className="flex">
              <span className="flex items-center rounded-l-lg border border-r-0 border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800">{prefix}</span>
              <input id="phone" name="phone" type="tel" required
                className="w-full rounded-r-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-900 dark:focus:border-zinc-400 dark:focus:ring-zinc-800" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input id="password" name="password" type="password" required minLength={6}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-900 dark:focus:border-zinc-400 dark:focus:ring-zinc-800" />
          </div>

          <label className="flex items-start gap-2 text-sm text-zinc-500">
            <input type="checkbox" name="agree" required className="mt-0.5" />
            <span>I agree to the <a href="#" className="font-medium text-zinc-900 underline dark:text-white">Terms and Conditions</a></span>
          </label>

          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-zinc-900 underline dark:text-white">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
