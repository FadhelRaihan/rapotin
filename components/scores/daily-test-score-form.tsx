'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Card } from '@/components/ui/card';
import {
  Trash2,
  ChevronRight,
  Save,
  CheckCircle2,
  ListFilter,
  Sparkles,
  Award,
  Filter,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { formatScore, cn } from '@/lib/utils';
import { validateTaskLabel, validateScoreValue } from '@/lib/validators';

export interface Student {
  id: string;
  full_name: string;
  nis: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface DailyTestScore {
  id: string;
  student_id: string;
  subject_id: string;
  semester: string;
  label: string;
  score: number | null;
  is_pending: boolean;
  multiple_choice_count?: number | null;
  essay_count?: number | null;
  recorded_at: string;
  student: Student;
  subject: Subject;
}

interface DailyTestScoreFormProps {
  students: Student[];
  subjects: Subject[];
  initialScores: DailyTestScore[];
}

export function DailyTestScoreForm({
  students,
  subjects,
  initialScores,
}: DailyTestScoreFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'batch' | 'history' | 'pending'>('batch');
  const [scores, setScores] = useState<DailyTestScore[]>(initialScores);

  // Batch Form Header State
  const [batchHeader, setBatchHeader] = useState({
    subject_id: subjects[0]?.id || '',
    semester: 'I',
    label: '',
    multiple_choice_count: '',
    essay_count: '',
    recorded_at: new Date().toISOString().split('T')[0],
  });

  // Real-time Field Errors
  const [labelError, setLabelError] = useState<string | null>(null);
  const [scoreErrors, setScoreErrors] = useState<Record<string, string | null>>({});

  // History Filter State
  const [historyFilter, setHistoryFilter] = useState({
    semester: 'ALL',
    subject_id: 'ALL',
    label: 'ALL',
  });

  // Batch Scores State: student_id -> score string
  const [scoreMap, setScoreMap] = useState<Record<string, string>>({});
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Pending Scores Edit State: score_id -> score string
  const [pendingInputMap, setPendingInputMap] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Label Change with Instant Real-Time Validation
  const handleLabelChange = (val: string) => {
    setBatchHeader({ ...batchHeader, label: val });
    if (val.trim() !== '') {
      const err = validateTaskLabel(val);
      setLabelError(err);
    } else {
      setLabelError(null);
    }
  };

  // Handle Score Input Change in Batch Mode with Instant Real-Time Validation
  const handleScoreChange = (studentId: string, val: string) => {
    setScoreMap((prev) => ({
      ...prev,
      [studentId]: val,
    }));

    const err = validateScoreValue(val);
    setScoreErrors((prev) => ({
      ...prev,
      [studentId]: err,
    }));
  };

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (index < students.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const filledCount = Object.values(scoreMap).filter((v) => v.trim() !== '').length;
  const hasScoreErrors = Object.values(scoreErrors).some((err) => err !== null);

  // Filtered lists
  const validHistoryScores = scores.filter((s) => !s.is_pending && s.score !== null);
  const pendingScores = scores.filter((s) => s.is_pending || s.score === null);

  // Available unique labels for history filter dropdown
  const availableLabels = Array.from(
    new Set(
      validHistoryScores
        .filter((s) => historyFilter.semester === 'ALL' || s.semester === historyFilter.semester)
        .filter((s) => historyFilter.subject_id === 'ALL' || s.subject_id === historyFilter.subject_id)
        .map((s) => s.label)
    )
  );

  // Filtered scores for History Tab
  const filteredHistoryScores = validHistoryScores.filter((score) => {
    if (historyFilter.semester !== 'ALL' && score.semester !== historyFilter.semester) return false;
    if (historyFilter.subject_id !== 'ALL' && score.subject_id !== historyFilter.subject_id) return false;
    if (historyFilter.label !== 'ALL' && score.label !== historyFilter.label) return false;
    return true;
  });

  // Submit Batch Entry
  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validate Label First
    const lErr = validateTaskLabel(batchHeader.label);
    if (lErr) {
      setLabelError(lErr);
      setError(`Kesalahan pada Nama / Label UH: ${lErr}`);
      return;
    }

    if (hasScoreErrors) {
      setError('Harap perbaiki nilai yang tidak valid sebelum menyimpan.');
      return;
    }

    const scoresPayload: { student_id: string; score: number | null; is_pending: boolean }[] = [];
    for (const student of students) {
      const val = scoreMap[student.id];
      if (val !== undefined && val.trim() !== '') {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0 || num > 100) {
          setError(`Nilai untuk ${student.full_name} harus berupa angka 0 - 100.`);
          return;
        }
        scoresPayload.push({ student_id: student.id, score: num, is_pending: false });
      } else {
        scoresPayload.push({ student_id: student.id, score: null, is_pending: true });
      }
    }

    setLoading(true);

    try {
      const res = await fetch('/api/scores/daily-test/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...batchHeader,
          multiple_choice_count: batchHeader.multiple_choice_count ? parseInt(batchHeader.multiple_choice_count) : null,
          essay_count: batchHeader.essay_count ? parseInt(batchHeader.essay_count) : null,
          scores: scoresPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan nilai UH');

      if (data.savedScores && data.savedScores.length > 0) {
        setScores((prev) => [...data.savedScores, ...prev]);
      }

      setSuccessMsg(`Berhasil menyimpan ${data.filledCount} nilai ulangan harian siswa!`);
      setScoreMap({});
      setScoreErrors({});
      setLabelError(null);

      // Set History filter to match the submitted UH
      setHistoryFilter({
        semester: batchHeader.semester,
        subject_id: batchHeader.subject_id,
        label: batchHeader.label,
      });

      setBatchHeader((prev) => ({ ...prev, label: '', multiple_choice_count: '', essay_count: '' }));
      setActiveTab('history');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  // Save Single Pending Score (Makeup Exam)
  const handleSavePendingScore = async (scoreId: string) => {
    const val = pendingInputMap[scoreId];
    const scoreErr = validateScoreValue(val || '');
    if (scoreErr) {
      alert(`Nilai susulan UH tidak valid: ${scoreErr}`);
      return;
    }

    const num = parseFloat(val);

    try {
      const res = await fetch(`/api/scores/daily-test/${scoreId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: num }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan nilai susulan UH');

      // Update local state
      setScores((prev) =>
        prev.map((s) => (s.id === scoreId ? { ...s, score: num, is_pending: false } : s))
      );

      setPendingInputMap((prev) => {
        const copy = { ...prev };
        delete copy[scoreId];
        return copy;
      });

      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui nilai susulan UH.');
    }
  };

  // Delete Record
  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus nilai UH ini?')) return;

    try {
      const res = await fetch(`/api/scores/daily-test/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setScores((prev) => prev.filter((s) => s.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error('Error deleting score:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-1">
            <Link href="/dashboard" className="hover:text-[#7C3AED] transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#111827] font-medium">Ulangan Harian</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827] tracking-tight">
            Input Nilai Ulangan Harian (UH)
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Mode cepat input nilai ulangan harian 1 kelas sekaligus atau lihat riwayat nilai
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeTab === 'batch'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            )}
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Input Nilai UH Baru (Batch)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeTab === 'history'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            )}
          >
            <ListFilter className="w-4 h-4" />
            <span>📋 Riwayat Nilai UH ({validHistoryScores.length})</span>
          </button>
          {pendingScores.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
                activeTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              )}
            >
              <Clock className="w-4 h-4" />
              <span>⌛ Nilai UH Susulan ({pendingScores.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: BATCH ENTRY MODE */}
      {activeTab === 'batch' && (
        <form onSubmit={handleBatchSubmit} className="flex flex-col gap-6">
          {/* Header Card Config */}
          <Card className="p-6 border-[#E5E7EB] bg-white rounded-2xl shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E5E7EB]">
              <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#111827]">
                  1. Informasi Ulangan Harian (UH) Yang Akan Dinilai
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Pilih mata pelajaran dan tentukan label UH 1x untuk seluruh kelas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Select
                label="Mata Pelajaran *"
                value={batchHeader.subject_id}
                onChange={(e) => setBatchHeader({ ...batchHeader, subject_id: e.target.value })}
                options={subjects.map((sub) => ({
                  value: sub.id,
                  label: sub.name,
                }))}
                required
              />

              <Select
                label="Semester *"
                value={batchHeader.semester}
                onChange={(e) => setBatchHeader({ ...batchHeader, semester: e.target.value })}
                options={[
                  { value: 'I', label: 'Semester I' },
                  { value: 'II', label: 'Semester II' },
                ]}
              />

              <DatePicker
                label="Tanggal *"
                value={batchHeader.recorded_at}
                onChange={(dateStr) => setBatchHeader({ ...batchHeader, recorded_at: dateStr })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <Input
                label="Nama / Label UH *"
                placeholder="Misal: Ulangan Harian 1 Bab Pecahan"
                value={batchHeader.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                onBlur={(e) => setLabelError(validateTaskLabel(e.target.value))}
                error={labelError || undefined}
                required
              />
              <Input
                label="Jumlah Soal PG (Opsional)"
                type="number"
                placeholder="Misal: 20"
                value={batchHeader.multiple_choice_count}
                onChange={(e) => setBatchHeader({ ...batchHeader, multiple_choice_count: e.target.value })}
              />
              <Input
                label="Jumlah Soal Essay (Opsional)"
                type="number"
                placeholder="Misal: 5"
                value={batchHeader.essay_count}
                onChange={(e) => setBatchHeader({ ...batchHeader, essay_count: e.target.value })}
              />
            </div>
          </Card>

          {/* Feedback Messages */}
          {error && (
            <div className="p-4 text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-600 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Batch Score Table Card */}
          <Card className="p-0 overflow-hidden border border-[#E5E7EB] rounded-2xl bg-white shadow-xs flex flex-col">
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">
                  2. Lembar Input Nilai UH Kelas ({students.length} Siswa)
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Gunakan tombol <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-mono">Enter</kbd> atau <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-mono">Panah Bawah</kbd> untuk pindah baris secara cepat
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-full bg-[#F3E8FF] text-[#7C3AED] text-xs font-bold border border-purple-200">
                {filledCount} / {students.length} Siswa Terisi
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-xs font-semibold text-[#6B7280]">
                    <th className="p-3.5 w-12 text-center">No</th>
                    <th className="p-3.5 w-36">NIS</th>
                    <th className="p-3.5">Nama Lengkap Siswa</th>
                    <th className="p-3.5 w-56">Input Nilai (0 - 100)</th>
                    <th className="p-3.5 w-32 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#6B7280] text-xs">
                        Belum ada siswa di kelas ini. Silakan tambah siswa di menu Data Siswa.
                      </td>
                    </tr>
                  ) : (
                    students.map((student, idx) => {
                      const scoreVal = scoreMap[student.id] || '';
                      const isFilled = scoreVal.trim() !== '';
                      const fieldErr = scoreErrors[student.id];

                      return (
                        <tr key={student.id} className="table-row-hover transition-colors h-16">
                          <td className="p-3.5 text-center text-xs font-semibold text-[#6B7280]">
                            {idx + 1}
                          </td>
                          <td className="p-3.5 text-xs font-mono tabular-nums text-[#6B7280]">
                            {student.nis}
                          </td>
                          <td className="p-3.5 font-bold text-[#111827]">
                            {student.full_name}
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-col gap-1">
                              <input
                                ref={(el) => {
                                  inputRefs.current[idx] = el;
                                }}
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                placeholder="0 - 100"
                                value={scoreVal}
                                onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, idx)}
                                className={cn(
                                  'h-9 w-full px-3 text-xs font-mono tabular-nums font-bold rounded-lg border border-[#E5E7EB] bg-white text-[#111827] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all',
                                  isFilled && !fieldErr && 'border-[#7C3AED] bg-[#F3E8FF]/30 text-[#7C3AED]',
                                  fieldErr && 'border-rose-500 bg-rose-50/50 text-rose-600 focus:ring-rose-500'
                                )}
                              />
                              {fieldErr && (
                                <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                  {fieldErr}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 text-center">
                            {fieldErr ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
                                Error
                              </span>
                            ) : isFilled ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terisi
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-[#6B7280] text-[11px] font-medium">
                                Kosong
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Submit Action */}
            <div className="p-4 bg-[#F8FAFC] border-t border-[#E5E7EB] flex justify-end">
              <Button type="submit" disabled={loading || filledCount === 0 || hasScoreErrors || Boolean(labelError)} size="md">
                <Save className="w-4 h-4" />
                <span>{loading ? 'Menyimpan Semua...' : `Simpan ${filledCount} Nilai UH (1 Klik)`}</span>
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* TAB 2: HISTORY LIST WITH FILTERS */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-4">
          {/* History Filter Toolbar */}
          <Card className="p-4 border-[#E5E7EB] bg-white rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#111827]">
              <Filter className="w-4 h-4 text-[#7C3AED]" />
              <span>Filter Riwayat Nilai UH:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-3xl">
              <Select
                value={historyFilter.semester}
                onChange={(e) => setHistoryFilter({ ...historyFilter, semester: e.target.value })}
                options={[
                  { value: 'ALL', label: 'Semua Semester' },
                  { value: 'I', label: 'Semester I' },
                  { value: 'II', label: 'Semester II' },
                ]}
              />

              <Select
                value={historyFilter.subject_id}
                onChange={(e) =>
                  setHistoryFilter({ ...historyFilter, subject_id: e.target.value, label: 'ALL' })
                }
                options={[
                  { value: 'ALL', label: 'Semua Mata Pelajaran' },
                  ...subjects.map((sub) => ({
                    value: sub.id,
                    label: sub.name,
                  })),
                ]}
              />

              <Select
                value={historyFilter.label}
                onChange={(e) => setHistoryFilter({ ...historyFilter, label: e.target.value })}
                options={[
                  { value: 'ALL', label: 'Semua Label UH' },
                  ...availableLabels.map((lbl) => ({
                    value: lbl,
                    label: lbl,
                  })),
                ]}
              />
            </div>
          </Card>

          {/* History Table */}
          <Card className="p-0 overflow-hidden border border-[#E5E7EB] rounded-2xl bg-white shadow-xs">
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="text-xs font-bold text-[#111827]">
                Menampilkan {filteredHistoryScores.length} Data Nilai UH Terisi
              </div>
              {filteredHistoryScores.length > 0 && (
                <div className="text-xs text-[#6B7280]">
                  Rata-Rata: <strong className="text-[#7C3AED] font-mono tabular-nums">
                    {formatScore(
                      filteredHistoryScores.reduce((acc, curr) => acc + Number(curr.score || 0), 0) /
                        filteredHistoryScores.length
                    )}
                  </strong>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[750px]">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-xs font-semibold text-[#6B7280]">
                    <th className="p-4 w-12 text-center">No</th>
                    <th className="p-4">Nama Siswa</th>
                    <th className="p-4">Mata Pelajaran</th>
                    <th className="p-4">Label UH</th>
                    <th className="p-4 text-center">Detail Soal</th>
                    <th className="p-4 text-center">Semester</th>
                    <th className="p-4 text-center">Nilai (0-100)</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredHistoryScores.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#6B7280] text-xs">
                        Tidak ada riwayat nilai UH yang sesuai dengan filter yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    filteredHistoryScores.map((score, idx) => (
                      <tr key={score.id} className="table-row-hover transition-colors h-14">
                        <td className="p-4 text-center text-xs font-semibold text-[#6B7280]">
                          {idx + 1}
                        </td>
                        <td className="p-4 font-semibold text-[#111827]">
                          {score.student?.full_name || '-'}
                        </td>
                        <td className="p-4 text-xs font-medium text-[#6B7280]">
                          <span className="inline-block px-2.5 py-1 rounded-md bg-[#F3E8FF] text-[#7C3AED] font-semibold">
                            {score.subject?.name || '-'}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-medium text-[#111827]">
                          {score.label}
                        </td>
                        <td className="p-4 text-center text-xs text-[#6B7280]">
                          {score.multiple_choice_count || score.essay_count ? (
                            <span className="font-mono text-[11px]">
                              {score.multiple_choice_count ? `${score.multiple_choice_count} PG` : ''}
                              {score.multiple_choice_count && score.essay_count ? ' • ' : ''}
                              {score.essay_count ? `${score.essay_count} Essay` : ''}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-4 text-center text-xs font-semibold text-[#6B7280]">
                          Sem {score.semester}
                        </td>
                        <td className="p-4 text-center font-mono tabular-nums font-bold text-sm text-[#7C3AED]">
                          {formatScore(score.score)}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDelete(score.id)}
                            className="p-1.5 text-[#6B7280] hover:text-rose-600 transition-colors rounded-md hover:bg-rose-50 cursor-pointer"
                            title="Hapus Nilai"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: PENDING MAKEUP LIST */}
      {activeTab === 'pending' && (
        <Card className="p-0 overflow-hidden border border-[#E5E7EB] rounded-2xl bg-white shadow-xs">
          <div className="p-4 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Daftar Nilai UH Belum Terisi ({pendingScores.length} Siswa)
              </h3>
              <p className="text-xs text-[#6B7280]">
                Siswa yang nilainya dikosongkan saat batch input. Masukkan nilai susulan jika siswa sudah mengikuti ujian susulan.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-xs font-semibold text-[#6B7280]">
                  <th className="p-4 w-12 text-center">No</th>
                  <th className="p-4">Nama Siswa</th>
                  <th className="p-4">Mata Pelajaran</th>
                  <th className="p-4">Label UH</th>
                  <th className="p-4 text-center">Semester</th>
                  <th className="p-4 w-52">Input Nilai Susulan</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {pendingScores.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#6B7280] text-xs">
                      🎉 Selamat! Seluruh nilai UH siswa telah terisi lengkap.
                    </td>
                  </tr>
                ) : (
                  pendingScores.map((score, idx) => (
                    <tr key={score.id} className="table-row-hover transition-colors h-16">
                      <td className="p-4 text-center text-xs font-semibold text-[#6B7280]">
                        {idx + 1}
                      </td>
                      <td className="p-4 font-semibold text-[#111827]">
                        {score.student?.full_name || '-'}
                      </td>
                      <td className="p-4 text-xs font-medium text-[#6B7280]">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-[#F3E8FF] text-[#7C3AED] font-semibold">
                          {score.subject?.name || '-'}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-medium text-[#111827]">
                        {score.label}
                      </td>
                      <td className="p-4 text-center text-xs font-semibold text-[#6B7280]">
                        Sem {score.semester}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="0 - 100"
                            value={pendingInputMap[score.id] || ''}
                            onChange={(e) =>
                              setPendingInputMap({ ...pendingInputMap, [score.id]: e.target.value })
                            }
                            className="h-9 w-24 px-2 text-xs font-mono tabular-nums font-bold rounded-lg border border-[#E5E7EB] bg-white text-[#111827] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSavePendingScore(score.id)}
                            disabled={!pendingInputMap[score.id]}
                          >
                            Simpan
                          </Button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(score.id)}
                          className="p-1.5 text-[#6B7280] hover:text-rose-600 transition-colors rounded-md hover:bg-rose-50 cursor-pointer"
                          title="Hapus Tagihan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
