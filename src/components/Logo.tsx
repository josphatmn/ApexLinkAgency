import Link from 'next/link';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-sm font-black text-zinc-900 shadow-sm">
        A
      </span>
      <span className="text-base font-bold tracking-tight">APEXLINK</span>
    </Link>
  );
}
