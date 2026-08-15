'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

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
        { label: 'Rekapitulasi Nilai', href: '/rekap', icon: BarChart3 },
      ],
    },
  ];

  return (
    <aside className="w-64 fixed top-16 bottom-0 left-0 bg-white border-r border-[#E5E7EB] flex flex-col justify-between p-4 z-30 overflow-y-auto no-scrollbar">
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
    </aside>
  );
}
