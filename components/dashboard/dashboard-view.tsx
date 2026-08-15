'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Users,
  BookOpen,
  Award,
  FileText,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Trophy,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatScore } from '@/lib/utils';

interface PendingItem {
  type: string;
  subjectName: string;
  label: string;
}

interface StudentAttention {
  studentId: string;
  fullName: string;
  nis: string;
  recordedCount: number;
  missingCount: number;
  pendingItems?: PendingItem[];
  averageScore: number;
}

interface DashboardStats {
  summary: {
    totalStudents: number;
    totalSubjects: number;
    classAverage: number;
    totalScoresRecorded: number;
  };
  subjectProgress: {
    subjectName: string;
    assignmentAvg: number;
    dailyTestAvg: number;
    overallAvg: number;
  }[];
  gradeDistribution: {
    name: string;
    count: number;
    color: string;
  }[];
  topStudents: {
    studentId: string;
    fullName: string;
    nis: string;
    averageScore: number;
  }[];
  studentsNeedingAttention: StudentAttention[];
  recentActivities: {
    id: string;
    type: string;
    label: string;
    studentName: string;
    subjectName: string;
    score: number;
    date: string;
  }[];
}

export function DashboardView() {
  const [semester, setSemester] = useState('I');
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async (selectedSemester: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/dashboard/stats?semester=${selectedSemester}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal memuat statistik');
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(semester);
  }, [semester]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-1">
            <span className="text-[#111827] font-medium">Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827] tracking-tight">
            Dashboard Performa & Progres Siswa
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Ringkasan statistik capaian akademik siswa dan perbandingan per mata pelajaran
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            options={[
              { value: 'I', label: 'Semester I' },
              { value: 'II', label: 'Semester II' },
            ]}
            className="py-2 text-xs font-semibold w-36"
          />

          <Button
            variant="outline"
            size="md"
            onClick={() => fetchStats(semester)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 text-[#7C3AED] ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm bg-rose-50 border border-rose-200 text-rose-600 rounded-xl">
          {error}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Siswa */}
        <Card className="p-5 border border-[#E5E7EB] bg-white rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Total Siswa
            </span>
            <span className="text-3xl font-bold text-[#111827] font-mono tabular-nums">
              {loading ? '-' : data?.summary.totalStudents || 0}
            </span>
            <span className="text-[11px] text-[#6B7280]">Terdaftar di Kelas</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 2: Total Mapel */}
        <Card className="p-5 border border-[#E5E7EB] bg-white rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Mata Pelajaran
            </span>
            <span className="text-3xl font-bold text-[#111827] font-mono tabular-nums">
              {loading ? '-' : data?.summary.totalSubjects || 0}
            </span>
            <span className="text-[11px] text-[#6B7280]">Mapel Aktif</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 3: Rata-Rata Kelas */}
        <Card className="p-5 border border-[#E5E7EB] bg-white rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Rata-Rata Kelas
            </span>
            <span className="text-3xl font-bold text-[#7C3AED] font-mono tabular-nums">
              {loading ? '-' : formatScore(data?.summary.classAverage)}
            </span>
            <span className="text-[11px] text-[#6B7280]">Skor Gabungan (0-100)</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 4: Total Nilai Dicatat */}
        <Card className="p-5 border border-[#E5E7EB] bg-white rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Entri Nilai
            </span>
            <span className="text-3xl font-bold text-[#111827] font-mono tabular-nums">
              {loading ? '-' : data?.summary.totalScoresRecorded || 0}
            </span>
            <span className="text-[11px] text-[#6B7280]">Tugas & UH Terekam</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Progres Rata-Rata Nilai per Mapel (2 Columns wide) */}
        <Card className="lg:col-span-2 p-6 border border-[#E5E7EB] bg-white rounded-xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7C3AED]" /> Progres Nilai per Mata Pelajaran
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Perbandingan Rata-Rata Nilai Tugas vs Ulangan Harian per Mapel (Semester {semester})
              </p>
            </div>
          </div>

          <div className="w-full h-72 pt-2">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-[#6B7280]">
                Memuat grafik progres...
              </div>
            ) : !data?.subjectProgress || data.subjectProgress.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#6B7280]">
                Belum ada data nilai untuk ditampilkan pada grafik.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.subjectProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="subjectName" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="assignmentAvg" name="Rata-Rata Tugas" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="dailyTestAvg" name="Rata-Rata UH" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Chart 2: Distribusi Predikat Capaian Siswa (1 Column wide) */}
        <Card className="p-6 border border-[#E5E7EB] bg-white rounded-xl shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" /> Distribusi Capaian Siswa
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Pengelompokan performa siswa berdasar skor rata-rata
            </p>
          </div>

          <div className="w-full h-52 relative flex items-center justify-center">
            {loading ? (
              <div className="text-xs text-[#6B7280]">Memuat distribusi...</div>
            ) : !data?.gradeDistribution ? (
              <div className="text-xs text-[#6B7280]">Tidak ada data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.gradeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {data.gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#E5E7EB]">
            {data?.gradeDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#6B7280] text-[11px] truncate">
                  {item.name}: <strong className="text-[#111827]">{item.count} Siswa</strong>
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Section: Top Performers & Students Needing Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Performers */}
        <Card className="p-6 border border-[#E5E7EB] bg-white rounded-xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Siswa Berprestasi (Top Performers)
            </h2>
            <span className="text-xs text-[#6B7280]">Semester {semester}</span>
          </div>

          <div className="flex flex-col divide-y divide-[#E5E7EB]">
            {loading ? (
              <div className="py-6 text-center text-xs text-[#6B7280]">Memuat data siswa...</div>
            ) : !data?.topStudents || data.topStudents.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#6B7280]">Belum ada data prestasi.</div>
            ) : (
              data.topStudents.map((st, idx) => (
                <div key={st.studentId} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-700'
                          : idx === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">{st.fullName}</p>
                      <p className="text-xs font-mono tabular-nums text-[#6B7280]">NIS: {st.nis}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-mono tabular-nums font-bold bg-[#F3E8FF] text-[#7C3AED]">
                      {formatScore(st.averageScore)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Card: Siswa Perlu Perhatian Khusus (HANYA Siswa Belum Susulan) */}
        <Card className="p-6 border border-rose-200/80 bg-white rounded-xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <h2 className="text-base font-bold text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> Siswa Perlu Perhatian Khusus
            </h2>
            <span className="text-xs text-rose-600 font-medium">Semester {semester}</span>
          </div>

          <div className="flex flex-col divide-y divide-slate-100">
            {loading ? (
              <div className="py-6 text-center text-xs text-[#6B7280]">Memuat data bimbingan...</div>
            ) : !data?.studentsNeedingAttention || data.studentsNeedingAttention.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-emerald-800">
                  Seluruh siswa telah memiliki kelengkapan nilai yang baik.
                </p>
                <p className="text-[11px] text-[#6B7280]">
                  Tidak ada siswa yang memiliki utang nilai susulan pada Semester {semester}.
                </p>
              </div>
            ) : (
              data.studentsNeedingAttention.map((st) => {
                const firstPending = st.pendingItems?.[0];

                return (
                  <div key={st.studentId} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {st.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{st.fullName}</p>
                        <p className="text-xs font-mono tabular-nums text-[#6B7280]">NIS: {st.nis}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      {/* Single Missing Item Badge */}
                      {st.missingCount === 1 && firstPending && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>
                            Kurang Nilai {firstPending.type} {firstPending.subjectName} ({firstPending.label})
                          </span>
                        </span>
                      )}

                      {/* Multiple Missing Items Badge with Hover Tooltip */}
                      {st.missingCount > 1 && (
                        <div className="relative group cursor-help">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{st.missingCount} Nilai Belum Ada (Hover rincian)</span>
                          </span>

                          {/* Floating Hover Tooltip */}
                          <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex flex-col items-end z-50 pointer-events-none">
                            <div className="w-2 h-2 bg-[#111827] rotate-45 mr-4 -mb-1"></div>
                            <div className="bg-[#111827] text-white text-[11px] font-medium px-3.5 py-2.5 rounded-xl shadow-xl whitespace-nowrap min-w-[220px] flex flex-col gap-1">
                              <strong className="text-rose-300 font-bold border-b border-slate-700 pb-1 text-left">
                                Daftar Nilai Belum Ada:
                              </strong>
                              {st.pendingItems?.map((item, pIdx) => (
                                <span key={pIdx} className="text-slate-200 text-left">
                                  • {item.type} {item.subjectName} ({item.label})
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-mono tabular-nums font-bold bg-slate-100 text-slate-700">
                        Rata-Rata: {formatScore(st.averageScore)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="p-6 border border-[#E5E7EB] bg-white rounded-xl shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#7C3AED]" /> Aktivitas Penilaian Terbaru
          </h2>
          <span className="text-xs text-[#6B7280]">5 Entri Terakhir</span>
        </div>

        <div className="flex flex-col divide-y divide-[#E5E7EB]">
          {loading ? (
            <div className="py-6 text-center text-xs text-[#6B7280]">Memuat aktivitas...</div>
          ) : !data?.recentActivities || data.recentActivities.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#6B7280]">Belum ada aktivitas penilaian.</div>
          ) : (
            data.recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        act.type === 'Tugas'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {act.type}
                    </span>
                    <span className="text-xs font-semibold text-[#111827]">{act.label}</span>
                  </div>
                  <p className="text-xs text-[#6B7280]">
                    {act.studentName} • <span className="text-[#111827]">{act.subjectName}</span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-mono tabular-nums font-bold text-[#111827]">
                    {formatScore(act.score)}
                  </p>
                  <p className="text-[10px] text-[#6B7280] font-mono">
                    {new Date(act.date).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
