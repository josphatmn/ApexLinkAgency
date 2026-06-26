'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  if (pathname.startsWith('/play/')) return null;
  return <Header />;
}
