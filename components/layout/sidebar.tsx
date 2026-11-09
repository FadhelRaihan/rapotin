'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  BarChart3,
  Printer,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.close();
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) dialog.current?.close(); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, [pathname]);

  const menuItems = [
    {
      section: 'MENU UTAMA',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Data Siswa', href: '/siswa', icon: Users },
        { label: 'Mata Pelajaran', href: '/mapel', icon: BookOpen },
      ],
    },
    {
      section: 'PENILAIAN & REKAP',
      items: [
        { label: 'Nilai Tugas', href: '/nilai/tugas', icon: FileText },
        { label: 'Ulangan Harian', href: '/nilai/ulangan-harian', icon: FileText },
        { label: 'Nilai STS', href: '/nilai/sts', icon: FileText },
        { label: 'Nilai SAS', href: '/nilai/sas', icon: FileText },
        { label: 'Rekapitulasi Nilai', href: '/rekap', icon: BarChart3 },
        { label: 'Cetak Rapor', href: '/rapor', icon: Printer },
      ],
    },
  ];

  const navigation = (
    <>
      <div className="flex flex-col gap-5">
        {menuItems.map((group, gIdx) => (
          <div key={gIdx} className="flex flex-col gap-1.5">
            <div className="px-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
              {group.section}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => dialog.current?.close()}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm transition-all duration-150',
                    isActive
                      ? 'bg-[#7C3AED] text-white font-semibold shadow-sm'
                      : 'text-slate-700 hover:bg-[#F3E8FF] hover:text-[#7C3AED] font-medium'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-[#7C3AED]')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-[#E5E7EB]">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Keluar Aplikasi
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      <button type="button" aria-label="Buka menu navigasi" aria-haspopup="dialog" aria-controls="mobile-navigation"
        onClick={() => dialog.current?.showModal()}
        className="fixed top-2 left-2 z-[60] flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#7C3AED] focus-visible:outline focus-visible:outline-2 lg:hidden print:hidden">
        <Menu className="h-6 w-6" />
      </button>
      <aside aria-label="Navigasi utama" className="hidden lg:flex w-64 fixed top-16 bottom-0 left-0 bg-white border-r border-[#E5E7EB] flex-col justify-between p-4 z-30 overflow-y-auto">
        {navigation}
      </aside>
      <dialog ref={dialog} id="mobile-navigation" aria-label="Menu navigasi" className="mobile-navigation"
        onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <nav className="flex min-h-full flex-col justify-between gap-6 p-4" aria-label="Navigasi utama">
          <div className="flex items-center justify-between font-bold text-[#7C3AED]">
            Menu Rapotin
            <button type="button" aria-label="Tutup menu navigasi" onClick={() => dialog.current?.close()} className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-purple-50"><X /></button>
          </div>
          {navigation}
        </nav>
      </dialog>
    </>
  );
}
