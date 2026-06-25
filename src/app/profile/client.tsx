'use client';

import { FormEvent, useState } from 'react';
import { toast } from '@/components/Toast';

export default function ProfileClient({ user }: { user: any }) {
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [fullname, setFullname] = useState(user.fullname || '');
  const [email, setEmail] = useState(user.email || '');
  const [bio, setBio] = useState(user.bio || '');

  const avatarColor = ['#ef4444','#f59e0b','#22c55e','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16'][
    Math.abs(user.username.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0)) % 10
  ];

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname, email, bio }),
    });
    const data = await res.json();
    if (data.success) toast.success(data.message);
    else toast.error(data.error || 'Failed to update');
    setSaving(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      toast.success(data.message);
      window.location.reload();
    } else toast.error(data.error || 'Upload failed');
  };

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setChangingPassword(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/profile/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(data.message);
      (e.target as HTMLFormElement).reset();
    } else toast.error(data.error || 'Failed to change password');
    setChangingPassword(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-zinc-500">Manage your account details</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-1 text-base font-semibold">Profile Details</h2>
          <p className="mb-4 text-xs text-zinc-500">Update your personal information</p>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img src={`/uploads/avatars/${user.avatar}`} alt="" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white" style={{ backgroundColor: avatarColor }}>
                  {user.username[0].toUpperCase()}
                </div>
              )}
              <div>
                <label className="cursor-pointer rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800">
                  Change Photo
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
                <p className="mt-1 text-xs text-zinc-500">JPG, PNG, GIF, WebP. Max 2MB.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input type="text" value={user.username} disabled className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800" />
            </div>
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium mb-1">Full Name</label>
              <input id="fullname" type="text" value={fullname} onChange={e => setFullname(e.target.value)} placeholder="Enter your full name"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-900 dark:focus:border-zinc-400 dark:focus:ring-zinc-800" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-900 dark:focus:border-zinc-400 dark:focus:ring-zinc-800" />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-1">Bio</label>
              <textarea id="bio" rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-900 dark:focus:border-zinc-400 dark:focus:ring-zinc-800" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="text" value={user.phone} disabled className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input type="text" value={user.country} disabled className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800" />
            </div>
            <button type="submit" disabled={saving}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-1 text-base font-semibold">Change Password</h2>
          <p className="mb-4 text-xs text-zinc-500">Update your account password</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="current_password" className="block text-sm font-medium mb-1">Current Password</label>
              <input id="current_password" name="current_password" type="password" required
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-900 dark:focus:border-zinc-400 dark:focus:ring-zinc-800" />
            </div>
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium mb-1">New Password</label>
              <input id="new_password" name="new_password" type="password" required minLength={6}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-900 dark:focus:border-zinc-400 dark:focus:ring-zinc-800" />
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input id="confirm_password" name="confirm_password" type="password" required minLength={6}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-900 dark:focus:border-zinc-400 dark:focus:ring-zinc-800" />
            </div>
            <button type="submit" disabled={changingPassword}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
              {changingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
