'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import {
  Printer,
  ChevronLeft,
  ChevronRight,
  Edit,
  Settings,
  Sparkles,
  Download,
  BookOpen,
  FileText,
  Layers,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { FinalReportSheet, SubjectScoreRow } from './final-report-sheet';
import { MidtermReportSheet } from './midterm-report-sheet';
import { CoverReportSheet } from './cover-report-sheet';
import { ReportEditModal } from './report-edit-modal';
import { ReportConfigModal } from './report-config-modal';
import { toast } from 'sonner';

export interface StudentItem {
  id: string;
  nis: string;
  nisn: string | null;
  full_name: string;
  gender: string | null;
}

export interface SubjectItem {
  id: string;
  name: string;
}

export interface ReportViewProps {
  students: StudentItem[];
  subjects: SubjectItem[];
  classroom: {
    id: string;
    name: string;
    academic_year: string;
  };
  school: {
    name: string;
    address?: string | null;
    npsn?: string | null;
  };
  teacher: {
    name: string;
    nip?: string | null;
  };
  initialRecapScores: {
    studentId: string;
    subjectScores: Record<string, { finalScore: number; midtermScore: number | null }>;
  }[];
}

export function ReportView({
  students,
  subjects,
  classroom,
  school,
  teacher,
  initialRecapScores,
}: ReportViewProps) {
  const [semester, setSemester] = useState<'I' | 'II'>('I');
  const [docType, setDocType] = useState<'FINAL' | 'MIDTERM' | 'COVER'>('FINAL');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Bulk print mode state
  const [isBulkPrintMode, setIsBulkPrintMode] = useState<boolean>(false);

  // Config & Details State
  const [config, setConfig] = useState<{
    report_date: string;
    report_place: string;
    headmaster_name: string;
    headmaster_nip?: string | null;
  }>({
    report_date: '22 Desember 2025',
    report_place: 'Tarumajaya',
    headmaster_name: 'H. SUHANDA, S.Pd',
    headmaster_nip: '19721202199603002',
  });

  const [descriptions, setDescriptions] = useState<
    Record<string, Record<string, { highestDesc: string; lowestDesc: string; fullDesc: string }>>
  >({});

  // Dynamic recap scores state based on active semester
  const [recapScores, setRecapScores] = useState(initialRecapScores);

  const [studentDetails, setStudentDetails] = useState<
    Record<
      string,
      {
        sickness_days: number;
        permission_days: number;
        unexcused_days: number;
        teacher_note?: string | null;
        p5_note?: string | null;
        extracurriculars: { name: string; score_description: string }[];
      }
    >
  >({});

  const [loading, setLoading] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);

  // Fetch report data on mount or semester change
  const loadReportData = async () => {
    setLoading(true);
    try {
      const [resConfig, resDesc, resDetails, resRecap] = await Promise.all([
        fetch(`/api/reports/config?semester=${semester}`),
        fetch(`/api/reports/descriptions?semester=${semester}`),
        fetch(`/api/reports/details?semester=${semester}`),
        fetch(`/api/recap?semester=${semester}`),
      ]);

      const [jsonConfig, jsonDesc, jsonDetails, jsonRecap] = await Promise.all([
        resConfig.json(),
        resDesc.json(),
        resDetails.json(),
        resRecap.json(),
      ]);

      if (jsonConfig?.data) {
        setConfig(jsonConfig.data);
      }
      if (jsonDesc?.data) {
        setDescriptions(jsonDesc.data);
      }
      if (jsonDetails?.data) {
        const detailsMap: Record<string, any> = {};
        jsonDetails.data.forEach((item: any) => {
          detailsMap[item.student_id] = {
            ...item.report_detail,
            extracurriculars: item.extracurriculars || [],
          };
        });
        setStudentDetails(detailsMap);
      }
      if (jsonRecap?.recap) {
        const formatted = jsonRecap.recap.map((item: any) => {
          const studentScores: Record<string, { finalScore: number; midtermScore: number | null }> = {};
          subjects.forEach((sub) => {
            const subData = item.subjectScores?.[sub.id];
            const hasAnyScore =
              subData &&
              (subData.assignmentAvg > 0 ||
                subData.dailyTestAvg > 0 ||
                subData.midtermScore !== null ||
                subData.finalExamScore !== null);

            studentScores[sub.id] = {
              finalScore: hasAnyScore ? subData.finalScore : 0,
              midtermScore: subData?.midtermScore ?? null,
            };
          });
          return {
            studentId: item.student.id,
            subjectScores: studentScores,
          };
        });
        setRecapScores(formatted);
      }
    } catch (err) {
      console.error('Error loading report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [semester]);

  const currentStudent = students[selectedIndex] || students[0];

  const handlePrint = (bulk: boolean = false) => {
    if (bulk) {
      setIsBulkPrintMode(true);
      setTimeout(() => {
        window.print();
        setTimeout(() => setIsBulkPrintMode(false), 500);
      }, 300);
    } else {
      setIsBulkPrintMode(false);
      setTimeout(() => window.print(), 100);
    }
  };

  // Helper to compile SubjectScoreRows for a given student
  const getSubjectScoreRows = (studentId: string): SubjectScoreRow[] => {
    const studentScoreRecap = recapScores.find((r) => r.studentId === studentId);
    return subjects.map((sub) => {
      const scoreObj = studentScoreRecap?.subjectScores?.[sub.id];
      const descObj = descriptions[studentId]?.[sub.id];
      return {
        id: sub.id,
        name: sub.name,
        finalScore: scoreObj?.finalScore || 0,
        highestDesc: descObj?.highestDesc || '',
        lowestDesc: descObj?.lowestDesc || '',
        fullDesc: descObj?.fullDesc || '',
      };
    });
  };

  // Helper for Midterm scores for a student
  const getMidtermSubjectScores = (studentId: string) => {
    const studentScoreRecap = recapScores.find((r) => r.studentId === studentId);
    return subjects.map((sub) => {
      const isPaiOrBiOrIpasOrSeni = ['agama', 'pai', 'indonesia', 'ipas', 'seni', 'pjok'].some((k) =>
        sub.name.toLowerCase().includes(k)
      );
      const kkm = isPaiOrBiOrIpasOrSeni ? 75 : 70;
      const scoreObj = studentScoreRecap?.subjectScores?.[sub.id];
      return {
        id: sub.id,
        name: sub.name,
        kkm,
        score: scoreObj?.midtermScore !== null && scoreObj?.midtermScore !== undefined ? scoreObj.midtermScore : null,
      };
    });
  };

  if (!currentStudent) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500 font-medium">Belum ada siswa yang terdaftar di kelas ini.</p>
      </div>
    );
  }

  const currentDetails = studentDetails[currentStudent.id] || {
    sickness_days: 0,
    permission_days: 0,
    unexcused_days: 0,
    teacher_note: '',
    p5_note: '',
    extracurriculars: [],
  };

  const subjectRows = getSubjectScoreRows(currentStudent.id);
  const midtermScores = getMidtermSubjectScores(currentStudent.id);

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* TOOLBAR KONTROL GURU (DISEMBUNYIKAN SAAT PRINT)          */}
      {/* ======================================================== */}
      <div className="print:hidden bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        {/* Baris Atas: Info Kelas & Navigasi Siswa */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-100 text-[#7C3AED]">
                Cetak Rapor Resmi
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {classroom.name} — {classroom.academic_year}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Pratinjau & Cetak Lembar Rapor
            </h2>
          </div>

          {/* Selector Siswa */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={selectedIndex <= 0}
              onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
              className="h-9 px-2.5"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="w-64 sm:w-80">
              <Select
                value={selectedIndex.toString()}
                onValueChange={(val) => setSelectedIndex(parseInt(val, 10))}
                options={students.map((s, idx) => ({
                  value: idx.toString(),
                  label: `${idx + 1}. ${s.full_name} (${s.nisn || s.nis})`,
                }))}
                className="h-9 text-xs font-semibold bg-slate-50 border-slate-200"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={selectedIndex >= students.length - 1}
              onClick={() => setSelectedIndex((prev) => Math.min(students.length - 1, prev + 1))}
              className="h-9 px-2.5"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Baris Bawah: Pilihan Dokumen, Semester & Tombol Aksi */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tipe Dokumen */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setDocType('FINAL')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                docType === 'FINAL'
                  ? 'bg-white text-[#7C3AED] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rapor Akhir (IKM)
            </button>
            <button
              onClick={() => setDocType('MIDTERM')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                docType === 'MIDTERM'
                  ? 'bg-white text-[#7C3AED] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laporan STS (Tengah Smt)
            </button>
            <button
              onClick={() => setDocType('COVER')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                docType === 'COVER'
                  ? 'bg-white text-[#7C3AED] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sampul Depan
            </button>
          </div>

          {/* Semester Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Semester:</span>
            <div className="w-44">
              <Select
                value={semester}
                onValueChange={(val) => setSemester(val as 'I' | 'II')}
                options={[
                  { value: 'I', label: 'Semester 1 (Ganjil)' },
                  { value: 'II', label: 'Semester 2 (Genap)' },
                ]}
                className="h-9 text-xs font-semibold bg-slate-50 border-slate-200"
              />
            </div>
          </div>

          {/* Tombol Aksi Utama */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfigModalOpen(true)}
              className="h-9 text-xs flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              Pengesahan
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="h-9 text-xs flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5 text-slate-600" />
              Edit Data Siswa
            </Button>

            <Button
              onClick={() => handlePrint(false)}
              className="h-9 text-xs bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Cetak Siswa Ini
            </Button>

            <Button
              onClick={() => handlePrint(true)}
              className="h-9 text-xs bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center gap-1.5 font-semibold"
            >
              <Printer className="w-4 h-4" />
              Cetak 1 Kelas ({students.length})
            </Button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* AREA DOKUMEN CETAK (PRINT CONTAINER)                     */}
      {/* ======================================================== */}
      <div className="report-canvas flex justify-center bg-slate-200/60 p-4 md:py-10 md:px-6 rounded-2xl border border-slate-300/80 overflow-x-auto print:block print:bg-white print:p-0 print:border-none print:m-0 print:overflow-visible">
        <div className="w-full flex justify-center print:block print:w-full print:max-w-none print:m-0 print:p-0">
          {/* Mode Single Student Print / View */}
          {!isBulkPrintMode ? (
            <>
              {docType === 'FINAL' && (
                <FinalReportSheet
                  student={currentStudent}
                  classroom={classroom}
                  school={school}
                  teacher={teacher}
                  config={config}
                  semester={semester}
                  subjects={subjectRows}
                  details={currentDetails}
                  extracurriculars={currentDetails.extracurriculars || []}
                />
              )}

              {docType === 'MIDTERM' && (
                <MidtermReportSheet
                  student={currentStudent}
                  classroom={classroom}
                  school={school}
                  teacher={teacher}
                  config={config}
                  semester={semester}
                  subjectScores={midtermScores}
                />
              )}

              {docType === 'COVER' && (
                <CoverReportSheet
                  student={currentStudent}
                  classroom={classroom}
                  school={school}
                />
              )}
            </>
          ) : (
            /* Mode Bulk Print: Render Seluruh Siswa Kelas VI */
            <div className="bulk-print-sequence">
              {students.map((stud) => {
                const sDetails = studentDetails[stud.id] || {
                  sickness_days: 0,
                  permission_days: 0,
                  unexcused_days: 0,
                  teacher_note: '',
                  p5_note: '',
                  extracurriculars: [],
                };
                const sSubjectRows = getSubjectScoreRows(stud.id);
                const sMidtermScores = getMidtermSubjectScores(stud.id);

                return (
                  <div key={stud.id} className="print:page-break-after-always">
                    {docType === 'FINAL' && (
                      <FinalReportSheet
                        student={stud}
                        classroom={classroom}
                        school={school}
                        teacher={teacher}
                        config={config}
                        semester={semester}
                        subjects={sSubjectRows}
                        details={sDetails}
                        extracurriculars={sDetails.extracurriculars || []}
                      />
                    )}
                    {docType === 'MIDTERM' && (
                      <MidtermReportSheet
                        student={stud}
                        classroom={classroom}
                        school={school}
                        teacher={teacher}
                        config={config}
                        semester={semester}
                        subjectScores={sMidtermScores}
                      />
                    )}
                    {docType === 'COVER' && (
                      <CoverReportSheet
                        student={stud}
                        classroom={classroom}
                        school={school}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit Detail Siswa */}
      {isEditModalOpen && (
        <ReportEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          student={currentStudent}
          semester={semester}
          initialDetails={currentDetails}
          initialExtracurriculars={currentDetails.extracurriculars || []}
          subjects={subjectRows}
          onSaveSuccess={loadReportData}
        />
      )}

      {/* Modal Pengaturan Pengesahan Rapor */}
      {isConfigModalOpen && (
        <ReportConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          semester={semester}
          initialConfig={config}
          onSaveSuccess={(updated) => setConfig(updated)}
        />
      )}
    </div>
  );
}

