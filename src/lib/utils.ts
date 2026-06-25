import { config, countries } from './config';

export function generateReferralCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getCountryPrefix(country: string): string {
  const c = countries.find((c) => c.name === country);
  return c?.prefix || '+254';
}

export function getCurrency(country: string): string {
  const c = countries.find((c) => c.name === country);
  return c?.currency || process.env.CURRENCY_SYMBOL || 'KES';
}

export function formatMoney(amount: number, currency?: string): string {
  const sym = currency || process.env.CURRENCY_SYMBOL || 'KES';
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${sym}`;
}

export function formatTokens(amount: number): string {
  const name = process.env.TOKEN_NAME || config.tokenName || 'tokens';
  return `${Math.round(amount).toLocaleString()} ${name}`;
}

export function getAvatarColor(username: string): string {
  const colors = [
    '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function randomHex(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, length * 2);
}

export function sanitizeInput(input: string): string {
  return input.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
}
