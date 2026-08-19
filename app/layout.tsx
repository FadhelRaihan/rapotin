import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import React, { Suspense } from 'react';
import { NavigationProgress } from '@/components/ui/navigation-progress';
import { Toaster } from '@/components/ui/sonner';
import { PWAInstaller } from '@/components/pwa/pwa-installer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#7C3AED',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Rapotin — Tapi ga ngerepotin',
  description: 'Aplikasi pencatatan dan rekapitulasi nilai siswa SD yang cepat, simpel, dan efisien.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/icon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Rapotin',
  },
  formatDetection: {
    telephone: false,
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
        <PWAInstaller />
        <Toaster />
      </body>
    </html>
  );
}

