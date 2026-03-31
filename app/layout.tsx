import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Üzenőfal',
  description: 'Egyszerű üzenőfal Next.js + Supabase alapon'
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
