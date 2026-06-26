import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import ConditionalHeader from '@/components/ConditionalHeader';
import { ToastContainer } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'APEXLINK Agency',
  description: 'Multi-Level Marketing Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <ConditionalHeader />
          <main>{children}</main>
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
