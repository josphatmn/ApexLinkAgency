import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import ConditionalHeader from '@/components/ConditionalHeader';
import { ToastContainer } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'APEXLINK Agency',
  description: 'Join APEXLINK and earn real income from your network. Free access to movies, TV shows, AI tools & digital resources. Now serving Kenya, Uganda, Tanzania & Rwanda.',
  keywords: 'MLM, network marketing, earn money online, Kenya, Uganda, Tanzania, Rwanda, affiliate marketing, digital tools, movies, commissions',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'APEXLINK Agency - Earn, Stream & Access Premium Tools',
    description: 'Turn your network into real earnings. Free movies, AI tools, and more. Join thousands in East Africa.',
    type: 'website',
  },
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
