'use client';

import React from 'react';

export interface MidtermReportSheetProps {
  student: {
    id: string;
    full_name: string;
    nis: string;
    nisn: string | null;
  };
  classroom: {
    name: string;
    academic_year: string;
  };
  school: {
    name: string;
    address?: string | null;
  };
  teacher: {
    name: string;
    nip?: string | null;
  };
  config: {
    report_date: string;
    report_place: string;
    headmaster_name: string;
    headmaster_nip?: string | null;
  };
  semester: string;
  subjectScores: {
    id: string;
    name: string;
    kkm: number;
    score: number | null;
  }[];
}

export function MidtermReportSheet({
  student,
  classroom,
  school,
  teacher,
  config,
  semester,
  subjectScores,
}: MidtermReportSheetProps) {
  const validScores = subjectScores.filter((s) => s.score !== null && s.score !== undefined);
  const totalScore = validScores.reduce((sum, s) => sum + Number(s.score), 0);
  const averageScore = validScores.length > 0 ? totalScore / validScores.length : 0;

  // Separate regular and mulok subjects
  const generalSubjects = subjectScores.filter(
    (s) => !s.name.toLowerCase().includes('sunda') && !s.name.toLowerCase().includes('mulok')
  );
  const mulokSubjects = subjectScores.filter(
    (s) => s.name.toLowerCase().includes('sunda') || s.name.toLowerCase().includes('mulok')
  );

  return (
    <div className="report-print-container font-sans text-slate-900 text-[12px] leading-relaxed">
      <div className="report-page bg-white p-8 md:p-12 mb-8 shadow-sm border border-slate-200 print:border-none print:shadow-none print:m-0 print:p-0 min-h-[1050px] flex flex-col justify-between">
        <div>
          {/* KOP SURAT RESMI */}
          <div className="text-center pb-4 mb-4 border-b-2 border-double border-slate-900">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-800">
              PEMERINTAH KABUPATEN BEKASI
            </h2>
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-800">
              DINAS PENDIDIKAN KECAMATAN TARUMAJAYA
            </h2>
            <h1 className="text-base font-bold uppercase tracking-widest text-slate-950 mt-0.5">
              {school.name.toUpperCase()}
            </h1>
            <p className="text-[10px] text-slate-600 mt-1 italic">
              Alamat: {school.address || 'Jl. Marunda Makmur Kebon Kelapa Ds. Segara Makmur, Kec. Tarumajaya, Kab. Bekasi'}
            </p>
          </div>

          {/* Judul Laporan */}
          <div className="text-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider underline">
              LAPORAN PENILAIAN TENGAH SEMESTER {semester === 'I' ? 'I' : 'II'}
            </h3>
            <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
              TAHUN PELAJARAN {classroom.academic_year}
            </p>
          </div>

          {/* Identitas Siswa */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 mb-6 text-[12px] bg-slate-50 p-3.5 border border-slate-200 rounded">
            <div className="flex">
              <span className="w-36 font-medium text-slate-600">Nama Peserta Didik</span>
              <span className="mr-2">:</span>
              <span className="font-bold uppercase tracking-tight">{student.full_name}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-medium text-slate-600">Kelas</span>
              <span className="mr-2">:</span>
              <span className="font-semibold">{classroom.name}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-medium text-slate-600">NISN / NIS</span>
              <span className="mr-2">:</span>
              <span className="tabular-nums font-medium">{student.nisn || student.nis}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-medium text-slate-600">Semester</span>
              <span className="mr-2">:</span>
              <span className="font-semibold">{semester === 'I' ? 'I (Satu)' : 'II (Dua)'}</span>
            </div>
          </div>

          {/* Tabel Nilai STS */}
          <table className="w-full border-collapse border border-slate-400 text-left text-[11px] mb-8">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="border border-slate-400 px-3 py-2 text-center w-12">No</th>
                <th className="border border-slate-400 px-4 py-2">Mata Pelajaran</th>
                <th className="border border-slate-400 px-4 py-2 text-center w-28">KKM / KKTP</th>
                <th className="border border-slate-400 px-4 py-2 text-center w-32">Nilai Perolehan</th>
              </tr>
            </thead>
            <tbody>
              {generalSubjects.map((sub, idx) => (
                <tr key={sub.id} className="hover:bg-slate-50/50">
                  <td className="border border-slate-400 px-3 py-2 text-center tabular-nums">{idx + 1}</td>
                  <td className="border border-slate-400 px-4 py-2 font-medium">{sub.name}</td>
                  <td className="border border-slate-400 px-4 py-2 text-center tabular-nums text-slate-600">
                    {sub.kkm}
                  </td>
                  <td className="border border-slate-400 px-4 py-2 text-center font-bold tabular-nums">
                    {sub.score !== null && sub.score !== undefined ? sub.score.toFixed(1) : '-'}
                  </td>
                </tr>
              ))}

              {/* Sub-header Muatan Lokal */}
              {mulokSubjects.length > 0 && (
                <>
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={4} className="border border-slate-400 px-4 py-1.5 uppercase text-slate-700">
                      Muatan Lokal :
                    </td>
                  </tr>
                  {mulokSubjects.map((sub, idx) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50">
                      <td className="border border-slate-400 px-3 py-2 text-center tabular-nums">
                        {generalSubjects.length + idx + 1}
                      </td>
                      <td className="border border-slate-400 px-4 py-2 font-medium">{sub.name}</td>
                      <td className="border border-slate-400 px-4 py-2 text-center tabular-nums text-slate-600">
                        {sub.kkm}
                      </td>
                      <td className="border border-slate-400 px-4 py-2 text-center font-bold tabular-nums">
                        {sub.score !== null && sub.score !== undefined ? sub.score.toFixed(1) : '-'}
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {/* Total & Rata-rata */}
              <tr className="bg-slate-100 font-bold">
                <td colSpan={3} className="border border-slate-400 px-4 py-2 text-right uppercase">
                  Jumlah Nilai
                </td>
                <td className="border border-slate-400 px-4 py-2 text-center tabular-nums text-slate-900">
                  {totalScore.toFixed(1)}
                </td>
              </tr>
              <tr className="bg-slate-100 font-bold">
                <td colSpan={3} className="border border-slate-400 px-4 py-2 text-right uppercase">
                  Rata-rata Nilai
                </td>
                <td className="border border-slate-400 px-4 py-2 text-center tabular-nums text-slate-900">
                  {averageScore.toFixed(1)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan 3 Pihak */}
        <div className="mt-8 text-[11px]">
          <div className="text-right mb-6 text-slate-700">
            {config.report_place}, {config.report_date}
          </div>

          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="mb-2">Mengetahui,</p>
              <p className="font-semibold">Kepala Sekolah</p>
              <div className="h-20" />
              <p className="font-bold underline">{config.headmaster_name}</p>
              <p className="text-slate-600 tabular-nums">NIP. {config.headmaster_nip || '-'}</p>
            </div>

            <div>
              <p className="mb-2">Mengetahui,</p>
              <p className="font-semibold">Orang Tua / Wali Murid</p>
              <div className="h-20" />
              <p className="border-b border-slate-700 w-36 mx-auto" />
            </div>

            <div>
              <p className="mb-2">Wali Kelas,</p>
              <p className="font-semibold">{classroom.name}</p>
              <div className="h-20" />
              <p className="font-bold underline">{teacher.name}</p>
              <p className="text-slate-600 tabular-nums">NIP. {teacher.nip || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

