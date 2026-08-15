import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React, { Suspense } from 'react';
import { NavigationProgress } from '@/components/ui/navigation-progress';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rapotin — Tapi ga ngerepotin',
  description: 'Aplikasi pencatatan dan rekapitulasi nilai siswa SD yang cepat, simpel, dan efisien.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
