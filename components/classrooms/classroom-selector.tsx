'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  GraduationCap,
  Plus,
  Users,
  BookOpen,
  Calendar,
  ArrowRight,
  LogOut,
  X,
  Sparkles,
  School,
  Search,
  CheckCircle2,
} from 'lucide-react';

interface ClassroomItem {
  id: string;
  name: string;
  academic_year: string;
  created_at: string;
  school?: {
    name: string;
  };
  _count?: {
    students: number;
    subjects: number;
  };
}

interface ClassroomSelectorProps {
  teacherName: string;
  schoolName: string;
}

export function ClassroomSelector({ teacherName, schoolName }: ClassroomSelectorProps) {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<ClassroomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState('ALL');
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    academic_year: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/classrooms');
      const data = await res.json();
      if (res.ok) {
        setClassrooms(data.data);
      }
    } catch (err) {
      console.error('Error fetching classrooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  // Extract unique academic years for filtering
  const academicYears = Array.from(new Set(classrooms.map((c) => c.academic_year)));

  const filteredClassrooms = classrooms.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(search.toLowerCase()) ||
      cls.academic_year.includes(search);
    const matchesYear =
      selectedYearFilter === 'ALL' || cls.academic_year === selectedYearFilter;
    return matchesSearch && matchesYear;
  });

  const handleSelectClassroom = async (classroomId: string) => {
    setSelectingId(classroomId);
    try {
      const res = await fetch('/api/classrooms/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classroomId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memilih kelas');

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat memilih kelas');
      setSelectingId(null);
    }
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat kelas');

      setClassrooms((prev) => [data.data, ...prev]);
      setIsModalOpen(false);
      setFormData({
        name: '',
        academic_year: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] text-[#111827] flex flex-col font-sans antialiased">
      {/* Top Header Bar - Exact Match with Dashboard Header */}
      <header className="h-16 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
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

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#111827]">{teacherName}</p>
              <p className="text-[11px] text-[#6B7280]">Pilih Kelas untuk Melanjutkan</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {teacherName.charAt(0)}
            </div>
          </div>

          <div className="h-6 w-px bg-[#E5E7EB]" />

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-rose-100"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </form>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 md:py-12 flex flex-col gap-8">
        {/* Premium Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] text-white p-8 md:p-10 shadow-xl shadow-purple-900/10">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
            <School className="w-80 h-80 text-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/15 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Portal Manajemen Ruang Kelas</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
                Selamat Datang, {teacherName}!
              </h1>
              <p className="text-sm md:text-base text-purple-100 leading-relaxed mt-1">
                Silakan pilih kelas yang ingin Anda kelola nilainya hari ini, atau buat ruang kelas baru untuk membuka tahun ajaran baru.
              </p>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="bg-white text-[#7C3AED] hover:bg-purple-50 font-bold shadow-lg hover:shadow-xl transition-all border border-white/20 whitespace-nowrap self-start md:self-center"
            >
              <Plus className="w-5 h-5 text-[#7C3AED]" /> Buat Kelas Baru
            </Button>
          </div>

          {/* Quick Stats Pills */}
          <div className="relative z-10 flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-white/15 text-xs text-purple-100">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <BookOpen className="w-4 h-4 text-purple-300" />
              <span>Total Kelas: <strong className="text-white">{classrooms.length} Ruang Kelas</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <School className="w-4 h-4 text-purple-300" />
              <span>Unit Sekolah: <strong className="text-white">{schoolName}</strong></span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
          {/* Year Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedYearFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedYearFilter === 'ALL'
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-[#6B7280] hover:bg-[#F3E8FF] hover:text-[#7C3AED]'
              }`}
            >
              Semua Tahun Ajaran ({classrooms.length})
            </button>
            {academicYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYearFilter(year)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedYearFilter === year
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'bg-[#F8FAFC] text-[#6B7280] hover:bg-[#F3E8FF] hover:text-[#7C3AED]'
                }`}
              >
                T.A. {year}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Cari nama kelas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Classroom Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-[#6B7280] flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
            <span>Memuat daftar kelas...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Registered Classroom Cards */}
            {filteredClassrooms.map((cls, idx) => {
              const isLatestYear = idx === 0;

              return (
                <Card
                  key={cls.id}
                  className="relative overflow-hidden border border-[#E5E7EB] bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#7C3AED]/50 transition-all duration-200 flex flex-col justify-between gap-6 group"
                >
                  {/* Top Primary Color Accent Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7C3AED] to-[#9333EA]" />

                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center font-bold shadow-inner group-hover:scale-105 transition-transform">
                          <School className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#111827] group-hover:text-[#7C3AED] transition-colors tracking-tight">
                            {cls.name}
                          </h3>
                          <p className="text-xs text-[#6B7280]">{cls.school?.name || schoolName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3E8FF] text-[#7C3AED] border border-purple-200">
                        <Calendar className="w-3.5 h-3.5" /> T.A. {cls.academic_year}
                      </span>

                      {isLatestYear && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aktif
                        </span>
                      )}
                    </div>

                    {/* Stats Box */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#6B7280] font-medium">Siswa Terdaftar</span>
                          <span className="font-bold text-[#111827] font-mono tabular-nums text-sm">
                            {cls._count?.students || 0} Siswa
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#7C3AED] flex items-center justify-center font-bold">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#6B7280] font-medium">Mata Pelajaran</span>
                          <span className="font-bold text-[#111827] font-mono tabular-nums text-sm">
                            {cls._count?.subjects || 0} Mapel
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSelectClassroom(cls.id)}
                    disabled={selectingId === cls.id}
                    size="md"
                    className="w-full flex items-center justify-center gap-2 font-bold group-hover:bg-[#6D28D9] transition-colors"
                  >
                    {selectingId === cls.id ? (
                      'Mengaktifkan Kelas...'
                    ) : (
                      <>
                        <span>Pilih Kelas Ini</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </Card>
              );
            })}

            {/* Dash Card Prompter: Add New Class */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="border-2 border-dashed border-purple-200 hover:border-[#7C3AED] bg-purple-50/40 hover:bg-[#F3E8FF]/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 transition-all duration-200 group cursor-pointer min-h-[260px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-purple-200 text-[#7C3AED] flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-[#7C3AED] transition-all">
                <Plus className="w-7 h-7 text-[#7C3AED]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827] group-hover:text-[#7C3AED] transition-colors">
                  + Buat Kelas Tahun Ajaran Baru
                </h3>
                <p className="text-xs text-[#6B7280] max-w-xs mt-1">
                  Tambahkan ruang kelas baru untuk semester atau tahun ajaran mendatang
                </p>
              </div>
            </button>
          </div>
        )}
      </main>

      {/* Modal Card Create Classroom */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center font-bold">
                  <School className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-[#111827]">Tambah Kelas Baru</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#6B7280] hover:text-[#111827] rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 mb-4 text-xs bg-rose-50 border border-rose-200 text-rose-600 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateClassroom} className="flex flex-col gap-4">
              <Input
                label="Nama Kelas *"
                placeholder="Contoh: Kelas VI - A atau Kelas V - B"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="Tahun Ajaran *"
                placeholder="Contoh: 2025/2026 atau 2026/2027"
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                required
              />

              <div className="flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Memproses...' : 'Simpan Kelas Baru'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
