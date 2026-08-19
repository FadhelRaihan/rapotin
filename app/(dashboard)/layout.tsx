import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { Sidebar } from '@/components/layout/sidebar';
import { GraduationCap, Bell, ArrowLeft, Calendar } from 'lucide-react';
import { db, withDbRetry } from '@/lib/db';
import { InstallDesktopButton } from '@/components/pwa/pwa-installer';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || !session.classroomId) {
    redirect('/kelas');
  }

  // Fetch classroom & teacher details with auto-retry for Neon DB pool wakeups
  const classroom = await withDbRetry(() =>
    db.classroom.findUnique({
      where: { id: session.classroomId! },
      include: { school: true, teacher: true },
    })
  );

  if (!classroom) {
    redirect('/kelas');
  }

  const teacherName = classroom?.teacher?.name || session.name || 'Guru Kelas';
  const classroomName = classroom?.name || 'Kelas VI';
  const academicYear = classroom?.academic_year || '2025/2026';
  const schoolName = classroom?.school?.name || 'SD Negeri Segara Makmur 01';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] font-sans antialiased flex flex-col">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E5E7EB] z-50 px-6 flex items-center justify-between shadow-xs">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-[#7C3AED]">
                Rapotin
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3E8FF] text-[#7C3AED]">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] hidden sm:block">{schoolName}</p>
          </div>
        </div>

        {/* Header Right Actions (Classroom Badge, Install App, Ganti Kelas Button, Bell, Teacher Profile) */}
        <div className="flex items-center gap-3">
          {/* Desktop PWA Install Button */}
          <InstallDesktopButton />

          {/* Active Classroom Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#F3E8FF] rounded-full text-xs font-semibold text-[#7C3AED] border border-purple-200">
            <Calendar className="w-3.5 h-3.5" />
            <span>{classroomName} • {academicYear}</span>
          </div>

          {/* Ganti Kelas / Kembali Button on Right Side */}
          <Link href="/kelas">
            <button
              className="flex items-center gap-2 px-3 py-1.5 bg-[#F8FAFC] hover:bg-[#F3E8FF] border border-[#E5E7EB] hover:border-purple-200 rounded-lg text-xs font-semibold text-[#111827] hover:text-[#7C3AED] transition-colors cursor-pointer"
              title="Kembali ke Pemilihan Kelas"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Ganti Kelas</span>
            </button>
          </Link>


          <button className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAFC] rounded-full transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-[#E5E7EB]">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#111827]">{teacherName}</p>
              <p className="text-[11px] text-[#6B7280]">{classroomName}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {teacherName.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex pt-16 min-h-screen">
        {/* Left Fixed SideNavBar */}
        <Sidebar />

        {/* Main Workstation */}
        <main className="flex-1 ml-64 p-6 md:p-8 max-w-[1440px] min-h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
