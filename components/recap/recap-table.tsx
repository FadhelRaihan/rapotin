'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { RefreshCw, Download, Search, ChevronRight, Filter } from 'lucide-react';
import { formatScore, cn } from '@/lib/utils';
import { ExportModal } from '@/components/recap/export-modal';

export interface Student {
  id: string;
  nis: string;
  nisn: string | null;
  full_name: string;
  gender: string | null;
}

export interface Subject {
  id: string;
  name: string;
}

export interface RawAssignmentScore {
  student_id: string;
  subject_id: string;
  semester: string;
  label: string;
  score: number;
}

export interface RawDailyTestScore {
  student_id: string;
  subject_id: string;
  semester: string;
  label: string;
  score: number;
}

export interface RecapMatrix {
  [studentId: string]: {
    [subjectId: string]: {
      assignmentAvg: number | null;
      dailyTestAvg: number | null;
      overallAvg: number | null;
    };
  };
}

export function RecapTable() {
  const [semester, setSemester] = useState<string>('I');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [scoreType, setScoreType] = useState<string>('DEFAULT'); // 'DEFAULT' | 'ASSIGNMENT' | 'DAILY_TEST'

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rawAssignments, setRawAssignments] = useState<RawAssignmentScore[]>([]);
  const [rawDailyTests, setRawDailyTests] = useState<RawDailyTestScore[]>([]);
  const [matrix, setMatrix] = useState<RecapMatrix>({});

  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  const fetchRecap = async (selectedSemester: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/recap?semester=${selectedSemester}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengambil rekap data');

      const studentList: Student[] = (data.recap || []).map((item: any) => item.student);
      const subjectList: Subject[] = data.subjects || [];
      const assignmentsList: RawAssignmentScore[] = data.assignments || [];
      const dailyTestsList: RawDailyTestScore[] = data.dailyTests || [];

      const matrixMap: RecapMatrix = {};
      (data.recap || []).forEach((item: any) => {
        matrixMap[item.student.id] = {};
        subjectList.forEach((sub: Subject) => {
          const scores = item.subjectScores?.[sub.id];
          matrixMap[item.student.id][sub.id] = {
            assignmentAvg: scores?.assignmentAvg && scores.assignmentAvg > 0 ? scores.assignmentAvg : null,
            dailyTestAvg: scores?.dailyTestAvg && scores.dailyTestAvg > 0 ? scores.dailyTestAvg : null,
            overallAvg: scores?.finalScore && scores.finalScore > 0 ? scores.finalScore : null,
          };
        });
      });

      setStudents(studentList);
      setSubjects(subjectList);
      setRawAssignments(assignmentsList);
      setRawDailyTests(dailyTestsList);
      setMatrix(matrixMap);
    } catch (err: any) {
      setError(err.message);
      setStudents([]);
      setSubjects([]);
      setRawAssignments([]);
      setRawDailyTests([]);
      setMatrix({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecap(semester);
  }, [semester]);

  const filteredStudents = (students || []).filter(
    (s) =>
      s &&
      s.full_name &&
      (s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.nis.includes(search) ||
        (s.nisn && s.nisn.includes(search)))
  );

  const displayedSubjects = (subjects || []).filter(
    (sub) => selectedSubjectId === 'ALL' || sub.id === selectedSubjectId
  );

  // Detailed mode logic when a single subject is selected AND a specific scoreType (ASSIGNMENT or DAILY_TEST) is chosen
  const isDetailMode = selectedSubjectId !== 'ALL' && (scoreType === 'ASSIGNMENT' || scoreType === 'DAILY_TEST');

  // Extract unique labels for detailed mode
  let detailLabels: { code: string; label: string }[] = [];
  if (isDetailMode) {
    if (scoreType === 'ASSIGNMENT') {
      const filteredAsg = rawAssignments.filter((a) => a.subject_id === selectedSubjectId);
      const uniqueNames = Array.from(new Set(filteredAsg.map((a) => a.label)));
      detailLabels = uniqueNames.map((name, index) => ({
        code: `T${index + 1}`,
        label: name,
      }));
    } else if (scoreType === 'DAILY_TEST') {
      const filteredUh = rawDailyTests.filter((d) => d.subject_id === selectedSubjectId);
      const uniqueNames = Array.from(new Set(filteredUh.map((d) => d.label)));
      detailLabels = uniqueNames.map((name, index) => ({
        code: `UH${index + 1}`,
        label: name,
      }));
    }
  }

  // Calculate table headers colSpan per subject
  const getColSpan = () => {
    if (isDetailMode) {
      return detailLabels.length + 1; // individual items + average column (RT / RUH)
    }
    if (scoreType === 'DEFAULT') return 2; // T (Rerata Tugas) and UH (Rerata UH)
    return 1; // Single column (T or UH)
  };

  const colSpanPerSubject = getColSpan();

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-1">
            <Link href="/dashboard" className="hover:text-[#7C3AED] transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#111827] font-medium">Rekapitulasi Nilai</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827] tracking-tight">
            Rekapitulasi Nilai Siswa
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Matriks Rata-Rata Nilai Tugas (T) dan Ulangan Harian (UH) Per Mata Pelajaran
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => fetchRecap(semester)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 text-[#7C3AED] ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>

          <Button variant="primary" size="md" onClick={() => setIsExportModalOpen(true)}>
            <Download className="w-4 h-4" /> Export Rekap
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm bg-rose-50 border border-rose-200 text-rose-600 rounded-xl">
          {error}
        </div>
      )}

      {/* Toolbar Filter Section */}
      <Card className="p-4 border-[#E5E7EB] bg-white rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#111827]">
          <Filter className="w-4 h-4 text-[#7C3AED]" />
          <span>Filter Rekapitulasi:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-3xl">
          <Select
            label="Semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            options={[
              { value: 'I', label: 'Semester I' },
              { value: 'II', label: 'Semester II' },
            ]}
          />

          <Select
            label="Mata Pelajaran"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            options={[
              { value: 'ALL', label: 'Semua Mata Pelajaran' },
              ...subjects.map((sub) => ({
                value: sub.id,
                label: sub.name,
              })),
            ]}
          />

          <Select
            label="Jenis Nilai"
            value={scoreType}
            onChange={(e) => setScoreType(e.target.value)}
            options={[
              { value: 'DEFAULT', label: 'Default (Rerata T & UH)' },
              { value: 'ASSIGNMENT', label: 'Nilai Tugas (T)' },
              { value: 'DAILY_TEST', label: 'Ulangan Harian (UH)' },
            ]}
          />
        </div>
      </Card>

      {/* Main Data Panel */}
      <Card className="p-0 overflow-hidden border border-[#E5E7EB] rounded-2xl bg-white shadow-sm">
        {/* Search & Legend Bar */}
        <div className="p-4 border-b border-[#E5E7EB] flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-[#F8FAFC]">
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Cari siswa atau NIS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-md text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-[#6B7280] font-medium">
            {(scoreType === 'DEFAULT' || scoreType === 'ASSIGNMENT') && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]"></span> T / RT = Rata-Rata Tugas (Hover kolom untuk info)
              </span>
            )}
            {(scoreType === 'DEFAULT' || scoreType === 'DAILY_TEST') && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> UH / RUH = Rata-Rata UH (Hover kolom untuk info)
              </span>
            )}
          </div>
        </div>

        {/* Matrix Table Container */}
        <div className="overflow-x-auto relative">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] font-semibold text-[#6B7280]">
                <th className="p-3 text-center border-r border-[#E5E7EB] w-10">No</th>
                <th className="p-3 border-r border-[#E5E7EB] w-28">NIS / NISN</th>
                <th className="p-3 border-r border-[#E5E7EB] min-w-[180px]">Nama Siswa</th>
                <th className="p-3 text-center border-r border-[#E5E7EB] w-12">L/P</th>
                {displayedSubjects.map((subject) => (
                  <th
                    key={subject.id}
                    colSpan={colSpanPerSubject}
                    className="p-3 text-center border-r border-[#E5E7EB] min-w-[120px]"
                  >
                    {subject.name}
                  </th>
                ))}
              </tr>

              <tr className="bg-slate-100/60 text-[#6B7280] text-[11px] border-b border-[#E5E7EB]">
                <th className="p-1 border-r border-[#E5E7EB]"></th>
                <th className="p-1 border-r border-[#E5E7EB]"></th>
                <th className="p-1 border-r border-[#E5E7EB]"></th>
                <th className="p-1 border-r border-[#E5E7EB]"></th>
                {displayedSubjects.map((subject, subIdx) => {
                  const isRightEdge = subIdx === displayedSubjects.length - 1;

                  return (
                    <React.Fragment key={`sub-${subject.id}`}>
                      {/* Default Mode: Shows T (Rerata Tugas) and UH (Rerata UH) */}
                      {scoreType === 'DEFAULT' && (
                        <>
                          <th
                            title="T: Rata-Rata Nilai Tugas Per Mapel"
                            className="relative p-1.5 text-center border-r border-[#E5E7EB] text-[#7C3AED] group cursor-help hover:bg-[#F3E8FF]/50 transition-colors"
                          >
                            <span>T</span>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                              <div className="w-2 h-2 bg-[#111827] rotate-45 -mb-1"></div>
                              <div className="bg-[#111827] text-white text-[10px] font-medium font-sans px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap">
                                T: Rata-Rata Nilai Tugas
                              </div>
                            </div>
                          </th>

                          <th
                            title="UH: Rata-Rata Nilai Ulangan Harian Per Mapel"
                            className="relative p-1.5 text-center border-r border-[#E5E7EB] text-emerald-700 group cursor-help hover:bg-emerald-50 transition-colors"
                          >
                            <span>UH</span>
                            <div
                              className={cn(
                                'absolute top-full mt-1 hidden group-hover:flex flex-col z-50 pointer-events-none',
                                isRightEdge
                                  ? 'right-0 items-end'
                                  : 'left-1/2 -translate-x-1/2 items-center'
                              )}
                            >
                              <div
                                className={cn(
                                  'w-2 h-2 bg-[#111827] rotate-45 -mb-1',
                                  isRightEdge ? 'mr-3' : ''
                                )}
                              ></div>
                              <div className="bg-[#111827] text-white text-[10px] font-medium font-sans px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap">
                                UH: Rata-Rata Ulangan Harian
                              </div>
                            </div>
                          </th>
                        </>
                      )}

                      {/* All Subjects - Assignment Only: Shows T */}
                      {scoreType === 'ASSIGNMENT' && !isDetailMode && (
                        <th
                          title="T: Rata-Rata Nilai Tugas Per Mapel"
                          className="relative p-1.5 text-center border-r border-[#E5E7EB] text-[#7C3AED] group cursor-help hover:bg-[#F3E8FF]/50 transition-colors"
                        >
                          <span>T (Rerata Tugas)</span>
                          <div
                            className={cn(
                              'absolute top-full mt-1 hidden group-hover:flex flex-col z-50 pointer-events-none',
                              isRightEdge
                                ? 'right-0 items-end'
                                : 'left-1/2 -translate-x-1/2 items-center'
                            )}
                          >
                            <div
                              className={cn(
                                'w-2 h-2 bg-[#111827] rotate-45 -mb-1',
                                isRightEdge ? 'mr-4' : ''
                              )}
                            ></div>
                            <div className="bg-[#111827] text-white text-[10px] font-medium font-sans px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap">
                              T: Rata-Rata Nilai Tugas
                            </div>
                          </div>
                        </th>
                      )}

                      {/* All Subjects - Daily Test Only: Shows UH */}
                      {scoreType === 'DAILY_TEST' && !isDetailMode && (
                        <th
                          title="UH: Rata-Rata Nilai Ulangan Harian Per Mapel"
                          className="relative p-1.5 text-center border-r border-[#E5E7EB] text-emerald-700 group cursor-help hover:bg-emerald-50 transition-colors"
                        >
                          <span>UH (Rerata UH)</span>
                          <div
                            className={cn(
                              'absolute top-full mt-1 hidden group-hover:flex flex-col z-50 pointer-events-none',
                              isRightEdge
                                ? 'right-0 items-end'
                                : 'left-1/2 -translate-x-1/2 items-center'
                            )}
                          >
                            <div
                              className={cn(
                                'w-2 h-2 bg-[#111827] rotate-45 -mb-1',
                                isRightEdge ? 'mr-4' : ''
                              )}
                            ></div>
                            <div className="bg-[#111827] text-white text-[10px] font-medium font-sans px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap">
                              UH: Rata-Rata Ulangan Harian
                            </div>
                          </div>
                        </th>
                      )}

                      {/* Detail Mode for specific subject: Shows T1, T2, T3... RT OR UH1, UH2, UH3... RUH */}
                      {isDetailMode && (
                        <>
                          {detailLabels.map((item, itemIdx) => {
                            const isLastLabel = itemIdx === detailLabels.length - 1;
                            return (
                              <th
                                key={item.code}
                                title={`${item.code}: ${item.label}`}
                                className="relative p-1.5 text-center border-r border-[#E5E7EB] text-slate-700 font-mono group cursor-help hover:bg-[#F3E8FF]/60 transition-colors"
                              >
                                <span>{item.code}</span>
                                <div
                                  className={cn(
                                    'absolute top-full mt-1 hidden group-hover:flex flex-col z-50 pointer-events-none',
                                    isLastLabel
                                      ? 'right-0 items-end'
                                      : 'left-1/2 -translate-x-1/2 items-center'
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'w-2 h-2 bg-[#111827] rotate-45 -mb-1',
                                      isLastLabel ? 'mr-3' : ''
                                    )}
                                  ></div>
                                  <div className="bg-[#111827] text-white text-[10px] font-medium font-sans px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap">
                                    <strong className="text-purple-300 font-mono">
                                      {item.code}:
                                    </strong>{' '}
                                    {item.label}
                                  </div>
                                </div>
                              </th>
                            );
                          })}

                          <th
                            title={
                              scoreType === 'ASSIGNMENT'
                                ? 'RT: Rata-Rata Tugas'
                                : 'RUH: Rata-Rata Ulangan Harian'
                            }
                            className="relative p-1.5 text-center border-r border-[#E5E7EB] text-[#7C3AED] font-bold bg-[#F3E8FF]/40 group cursor-help transition-colors"
                          >
                            <span>{scoreType === 'ASSIGNMENT' ? 'RT' : 'RUH'}</span>
                            <div className="absolute top-full right-0 mt-1 hidden group-hover:flex flex-col items-end z-50 pointer-events-none">
                              <div className="w-2 h-2 bg-[#111827] rotate-45 mr-3 -mb-1"></div>
                              <div className="bg-[#111827] text-white text-[10px] font-medium font-sans px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap">
                                {scoreType === 'ASSIGNMENT'
                                  ? 'RT: Rata-Rata Tugas'
                                  : 'RUH: Rata-Rata Ulangan Harian'}
                              </div>
                            </div>
                          </th>
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                <tr>
                  <td
                    colSpan={4 + displayedSubjects.length * colSpanPerSubject}
                    className="p-8 text-center text-[#6B7280]"
                  >
                    Memuat data rekapitulasi nilai...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={4 + displayedSubjects.length * colSpanPerSubject}
                    className="p-8 text-center text-[#6B7280]"
                  >
                    Belum ada data siswa terdaftar.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="table-row-hover transition-colors h-12">
                    <td className="p-3 text-center border-r border-[#E5E7EB] text-[#6B7280] font-semibold">
                      {idx + 1}
                    </td>
                    <td className="p-3 border-r border-[#E5E7EB] font-mono tabular-nums text-slate-600">
                      {student.nisn || student.nis}
                    </td>
                    <td className="p-3 border-r border-[#E5E7EB] font-semibold text-[#111827]">
                      {student.full_name}
                    </td>
                    <td className="p-3 text-center border-r border-[#E5E7EB] text-[#6B7280]">
                      {student.gender || '-'}
                    </td>
                    {displayedSubjects.map((subject) => {
                      const scoreData = matrix[student.id]?.[subject.id] || {
                        assignmentAvg: null,
                        dailyTestAvg: null,
                        overallAvg: null,
                      };

                      return (
                        <React.Fragment key={`score-${student.id}-${subject.id}`}>
                          {/* Default Mode: Render T (Assignment Avg) and UH (Daily Test Avg) */}
                          {scoreType === 'DEFAULT' && (
                            <>
                              <td className="p-2 text-center border-r border-[#E5E7EB] font-mono tabular-nums font-semibold text-[#7C3AED]">
                                {formatScore(scoreData.assignmentAvg)}
                              </td>
                              <td className="p-2 text-center border-r border-[#E5E7EB] font-mono tabular-nums font-semibold text-emerald-700">
                                {formatScore(scoreData.dailyTestAvg)}
                              </td>
                            </>
                          )}

                          {/* All Subjects Assignment Only */}
                          {scoreType === 'ASSIGNMENT' && !isDetailMode && (
                            <td className="p-2 text-center border-r border-[#E5E7EB] font-mono tabular-nums font-semibold text-[#7C3AED]">
                              {formatScore(scoreData.assignmentAvg)}
                            </td>
                          )}

                          {/* All Subjects Daily Test Only */}
                          {scoreType === 'DAILY_TEST' && !isDetailMode && (
                            <td className="p-2 text-center border-r border-[#E5E7EB] font-mono tabular-nums font-semibold text-emerald-700">
                              {formatScore(scoreData.dailyTestAvg)}
                            </td>
                          )}

                          {/* Detailed Mode: Render T1, T2, T3... RT OR UH1, UH2, UH3... RUH */}
                          {isDetailMode && (
                            <>
                              {detailLabels.map((item) => {
                                let scoreVal: number | null = null;

                                if (scoreType === 'ASSIGNMENT') {
                                  const found = rawAssignments.find(
                                    (a) =>
                                      a.student_id === student.id &&
                                      a.subject_id === subject.id &&
                                      a.label === item.label
                                  );
                                  scoreVal = found ? Number(found.score) : null;
                                } else if (scoreType === 'DAILY_TEST') {
                                  const found = rawDailyTests.find(
                                    (d) =>
                                      d.student_id === student.id &&
                                      d.subject_id === subject.id &&
                                      d.label === item.label
                                  );
                                  scoreVal = found ? Number(found.score) : null;
                                }

                                return (
                                  <td
                                    key={`detail-${student.id}-${item.code}`}
                                    className="p-2 text-center border-r border-[#E5E7EB] font-mono tabular-nums text-[#111827]"
                                  >
                                    {formatScore(scoreVal)}
                                  </td>
                                );
                              })}

                              <td className="p-2 text-center border-r border-[#E5E7EB] font-mono tabular-nums font-bold text-[#7C3AED] bg-[#F3E8FF]/30">
                                {formatScore(
                                  scoreType === 'ASSIGNMENT'
                                    ? scoreData.assignmentAvg
                                    : scoreData.dailyTestAvg
                                )}
                              </td>
                            </>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        semester={semester}
        subjects={subjects}
        assignments={rawAssignments}
        dailyTests={rawDailyTests}
      />
    </div>
  );
}
