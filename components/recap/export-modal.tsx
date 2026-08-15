'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import {
  Download,
  X,
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Subject {
  id: string;
  name: string;
}

export interface RawAssignmentScore {
  subject_id: string;
  semester: string;
  label: string;
}

export interface RawDailyTestScore {
  subject_id: string;
  semester: string;
  label: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  semester: string;
  subjects: Subject[];
  assignments: RawAssignmentScore[];
  dailyTests: RawDailyTestScore[];
}

export function ExportModal({
  isOpen,
  onClose,
  semester,
  subjects,
  assignments,
  dailyTests,
}: ExportModalProps) {
  const [step, setStep] = useState<'CONFIG' | 'CONFIRMATION'>('CONFIG');
  const [selectedSemester, setSelectedSemester] = useState<string>(semester);
  const [exportMode, setExportMode] = useState<'1' | '2' | '3' | '4'>('1');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [scoreType, setScoreType] = useState<'ASSIGNMENT' | 'DAILY_TEST'>('ASSIGNMENT');
  const [selectedLabel, setSelectedLabel] = useState<string>('');

  const [downloading, setDownloading] = useState<boolean>(false);

  if (!isOpen) return null;

  // Selected Subject Object
  const selectedSubjectObj = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Extract available unique labels for Mode 4
  const availableLabels = Array.from(
    new Set(
      scoreType === 'ASSIGNMENT'
        ? assignments
            .filter((a) => a.subject_id === selectedSubjectId && a.semester === selectedSemester)
            .map((a) => a.label)
        : dailyTests
            .filter((d) => d.subject_id === selectedSubjectId && d.semester === selectedSemester)
            .map((d) => d.label)
    )
  );

  const handleDownload = () => {
    setDownloading(true);

    const params = new URLSearchParams();
    params.set('mode', exportMode);
    params.set('semester', selectedSemester);

    if (exportMode !== '1') {
      params.set('subjectId', selectedSubjectId || subjects[0]?.id || '');
    }

    if (exportMode === '3' || exportMode === '4') {
      params.set('scoreType', scoreType);
    }

    if (exportMode === '4') {
      params.set('label', selectedLabel || availableLabels[0] || '');
    }

    const downloadUrl = `/api/recap/export?${params.toString()}`;
    window.open(downloadUrl, '_blank');

    setTimeout(() => {
      setDownloading(false);
      setStep('CONFIG');
      onClose();
    }, 1200);
  };

  // Helper to get human-readable data description for Step 2 Confirmation
  const getExportSummaryText = () => {
    if (exportMode === '1') {
      return `Seluruh Data Rekapitulasi Nilai 1 Semester (${subjects.length} Mata Pelajaran) - Semester ${selectedSemester}`;
    }
    if (exportMode === '2') {
      return `Rekapitulasi Nilai Mata Pelajaran "${selectedSubjectObj?.name || 'Mata Pelajaran'}" - Semester ${selectedSemester}`;
    }
    if (exportMode === '3') {
      return `Daftar Nilai ${
        scoreType === 'ASSIGNMENT' ? 'Seluruh Tugas' : 'Seluruh Ulangan Harian (UH)'
      } Mata Pelajaran "${selectedSubjectObj?.name || ''}" - Semester ${selectedSemester} (Sheet Per Judul)`;
    }
    if (exportMode === '4') {
      const activeLabel = selectedLabel || availableLabels[0] || 'Tugas / UH';
      return `Nilai ${
        scoreType === 'ASSIGNMENT' ? 'Tugas' : 'Ulangan Harian'
      } "${activeLabel}" - Mata Pelajaran "${selectedSubjectObj?.name || ''}" (Semester ${selectedSemester})`;
    }
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 w-full max-w-xl shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111827]">
                {step === 'CONFIG' ? 'Pengaturan Export Rekapitulasi Excel' : 'Konfirmasi Unduh File Excel'}
              </h2>
              <p className="text-xs text-[#6B7280]">
                {step === 'CONFIG'
                  ? 'Langkah 1 dari 2: Pilih skenario & parameter data yang ingin di-export'
                  : 'Langkah 2 dari 2: Periksa kembali ringkasan data sebelum mengunduh'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setStep('CONFIG');
              onClose();
            }}
            className="p-1.5 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CONFIGURATION */}
        {step === 'CONFIG' && (
          <>
            {/* Semester Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Pilih Semester
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSemester('I')}
                  className={cn(
                    'py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                    selectedSemester === 'I'
                      ? 'border-[#7C3AED] bg-[#F3E8FF] text-[#7C3AED]'
                      : 'border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F8FAFC]'
                  )}
                >
                  Semester I
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSemester('II')}
                  className={cn(
                    'py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                    selectedSemester === 'II'
                      ? 'border-[#7C3AED] bg-[#F3E8FF] text-[#7C3AED]'
                      : 'border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F8FAFC]'
                  )}
                >
                  Semester II
                </button>
              </div>
            </div>

            {/* Export Mode Options */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Pilih Skenario Export
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {/* Opsi 1 */}
                <div
                  onClick={() => setExportMode('1')}
                  className={cn(
                    'p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all',
                    exportMode === '1'
                      ? 'border-[#7C3AED] bg-[#F3E8FF]/30 shadow-xs'
                      : 'border-[#E5E7EB] bg-white hover:border-purple-200'
                  )}
                >
                  <input
                    type="radio"
                    name="exportMode"
                    checked={exportMode === '1'}
                    onChange={() => setExportMode('1')}
                    className="mt-0.5 text-[#7C3AED]"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#111827]">
                      1. Export Keseluruhan 1 Semester (Multiple Sheet per Mapel)
                    </span>
                    <span className="text-[11px] text-[#6B7280]">
                      Menghasilkan 1 file Excel berisi sheet terpisah untuk setiap mata pelajaran beserta rerata
                    </span>
                  </div>
                </div>

                {/* Opsi 2 */}
                <div
                  onClick={() => setExportMode('2')}
                  className={cn(
                    'p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all',
                    exportMode === '2'
                      ? 'border-[#7C3AED] bg-[#F3E8FF]/30 shadow-xs'
                      : 'border-[#E5E7EB] bg-white hover:border-purple-200'
                  )}
                >
                  <input
                    type="radio"
                    name="exportMode"
                    checked={exportMode === '2'}
                    onChange={() => setExportMode('2')}
                    className="mt-0.5 text-[#7C3AED]"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#111827]">
                      2. Export Berdasarkan Semester & Mapel Spesifik
                    </span>
                    <span className="text-[11px] text-[#6B7280]">
                      Menghasilkan 1 sheet khusus untuk 1 mata pelajaran pilihan
                    </span>
                  </div>
                </div>

                {/* Opsi 3 */}
                <div
                  onClick={() => setExportMode('3')}
                  className={cn(
                    'p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all',
                    exportMode === '3'
                      ? 'border-[#7C3AED] bg-[#F3E8FF]/30 shadow-xs'
                      : 'border-[#E5E7EB] bg-white hover:border-purple-200'
                  )}
                >
                  <input
                    type="radio"
                    name="exportMode"
                    checked={exportMode === '3'}
                    onChange={() => setExportMode('3')}
                    className="mt-0.5 text-[#7C3AED]"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#111827]">
                      3. Export Berdasarkan Mapel & Jenis Nilai (Sheet per Tugas/UH)
                    </span>
                    <span className="text-[11px] text-[#6B7280]">
                      Menghasilkan sheet terpisah untuk setiap Judul Tugas atau UH di mapel tersebut
                    </span>
                  </div>
                </div>

                {/* Opsi 4 */}
                <div
                  onClick={() => setExportMode('4')}
                  className={cn(
                    'p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all',
                    exportMode === '4'
                      ? 'border-[#7C3AED] bg-[#F3E8FF]/30 shadow-xs'
                      : 'border-[#E5E7EB] bg-white hover:border-purple-200'
                  )}
                >
                  <input
                    type="radio"
                    name="exportMode"
                    checked={exportMode === '4'}
                    onChange={() => setExportMode('4')}
                    className="mt-0.5 text-[#7C3AED]"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#111827]">
                      4. Export Khusus 1 Judul Tugas / UH Spesifik
                    </span>
                    <span className="text-[11px] text-[#6B7280]">
                      Menghasilkan 1 sheet khusus untuk 1 judul Tugas / UH tertentu
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Parameter Options */}
            {exportMode !== '1' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E5E7EB]">
                <Select
                  label="Pilih Mata Pelajaran *"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  options={subjects.map((sub) => ({
                    value: sub.id,
                    label: sub.name,
                  }))}
                />

                {(exportMode === '3' || exportMode === '4') && (
                  <Select
                    label="Pilih Jenis Nilai *"
                    value={scoreType}
                    onChange={(e) => setScoreType(e.target.value as 'ASSIGNMENT' | 'DAILY_TEST')}
                    options={[
                      { value: 'ASSIGNMENT', label: 'Nilai Tugas (T)' },
                      { value: 'DAILY_TEST', label: 'Ulangan Harian (UH)' },
                    ]}
                  />
                )}

                {exportMode === '4' && (
                  <div className="col-span-1 sm:col-span-2">
                    <Select
                      label="Pilih Judul Spesifik *"
                      value={selectedLabel}
                      onChange={(e) => setSelectedLabel(e.target.value)}
                      options={
                        availableLabels.length > 0
                          ? availableLabels.map((lbl) => ({ value: lbl, label: lbl }))
                          : [{ value: '', label: 'Belum ada data nilai' }]
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="button" onClick={() => setStep('CONFIRMATION')}>
                <span>Lanjutkan (Cek Ringkasan)</span>
              </Button>
            </div>
          </>
        )}

        {/* STEP 2: CONFIRMATION MODAL FOR SENIOR TEACHERS */}
        {step === 'CONFIRMATION' && (
          <div className="flex flex-col gap-5">
            {/* Advice Box for Teachers */}
            <div className="p-4 bg-[#F3E8FF]/50 border border-purple-200 rounded-xl flex items-start gap-3 text-xs">
              <Sparkles className="w-5 h-5 text-[#7C3AED] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 text-[#111827]">
                <strong className="text-[#7C3AED] font-bold">
                  Pemberitahuan Sebelum Mengunduh:
                </strong>
                <p className="text-slate-700 leading-relaxed">
                  Bapak/Ibu Guru, mohon periksa ringkasan di bawah ini untuk memastikan file Excel yang akan di-download sudah sesuai dengan apa yang Anda pilih.
                </p>
              </div>
            </div>

            {/* Structured Summary Card */}
            <Card className="p-4 border-[#E5E7EB] bg-white rounded-xl flex flex-col gap-4 text-xs">
              {/* Item 1: Scope */}
              <div className="flex flex-col gap-1 pb-3 border-b border-[#E5E7EB]">
                <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  1. Data Yang Akan Di-Export:
                </span>
                <span className="font-bold text-[#111827] text-sm bg-purple-50 p-2.5 rounded-lg border border-purple-100 text-[#7C3AED]">
                  {getExportSummaryText()}
                </span>
              </div>

              {/* Item 2: Sorting Notice */}
              <div className="flex flex-col gap-1 pb-3 border-b border-[#E5E7EB]">
                <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  2. Urutan Peringkat Siswa (Sorting):
                </span>
                <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Siswa otomatis di-sort dari Nilai / Rata-Rata TERTINGGI ke Terendah (Rank 1, Rank 2, ...)</span>
                </div>
              </div>

              {/* Item 3: Header Fixed Notice */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  3. Format Excel & Header Fixed:
                </span>
                <span className="text-slate-700 font-medium">
                  Informasi Sekolah, Wali Kelas, dan Header Kolom bersifat <strong>Fixed (Freeze Panes)</strong> — tidak akan ikut tergulung saat Excel di-scroll ke bawah.
                </span>
              </div>
            </Card>

            {/* Final Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('CONFIG')}
                className="flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ubah Pengaturan</span>
              </Button>

              <Button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                size="md"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Menyiapkan File...' : 'Ya, Unduh File Excel (.xlsx)'}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
