'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/components/Toast';

interface EnvEntry {
  key: string;
  value: string;
  label: string;
}

const envFields: EnvEntry[] = [
  { key: 'SITE_NAME', label: 'Site Name', value: '' },
  { key: 'TOKEN_NAME', label: 'Token Name', value: '' },
  { key: 'ACTIVATION_FEE', label: 'Activation Fee', value: '' },
  { key: 'WITHDRAWAL_THRESHOLD', label: 'Withdrawal Threshold', value: '' },
  { key: 'WITHDRAWAL_FEE_PERCENTAGE', label: 'Withdrawal Fee %', value: '' },
  { key: 'LEVEL1_COMMISSION_RATE', label: 'Level 1 Commission Rate', value: '' },
  { key: 'LEVEL2_COMMISSION_RATE', label: 'Level 2 Commission Rate', value: '' },
  { key: 'APEX_CONVERSION_RATE', label: 'Apex Conversion Rate', value: '' },
  { key: 'PROMOTION_WINNER_PERCENTAGE', label: 'Promotion Winner %', value: '' },
  { key: 'PROMOTION_INTERVAL_MINUTES', label: 'Promotion Interval (min)', value: '' },
  { key: 'MEDIA_ACCESS_COST', label: 'Media Access Cost (tokens)', value: '' },
  { key: 'INCOME_PER_PAGE', label: 'Income Per Page', value: '' },
  { key: 'SITE_URL', label: 'Site URL', value: '' },
];

export default function AdminSettingsPage() {
  const [fields, setFields] = useState<EnvEntry[]>(envFields);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.settings) {
          setFields(prev => prev.map(f => ({
            ...f,
            value: d.settings[f.key] ?? f.value,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const settings: Record<string, string> = {};
    fields.forEach(f => { settings[f.key] = f.value; });

    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const d = await res.json();
    if (d.success) {
      toast.success('Settings saved successfully');
    } else {
      toast.error(d.error || 'Failed to save settings');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-400">Manage platform configuration</p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="space-y-5">
            {fields.map(f => (
              <div key={f.key}>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">{f.label}</label>
                <input
                  type="text"
                  value={f.value}
                  onChange={e => setFields(prev => prev.map(p => p.key === f.key ? { ...p, value: e.target.value } : p))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
