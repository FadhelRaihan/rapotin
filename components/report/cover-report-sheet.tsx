'use client';

import React from 'react';

export interface CoverReportSheetProps {
  student: {
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
    npsn?: string | null;
  };
}

export function CoverReportSheet({ student, classroom, school }: CoverReportSheetProps) {
  return (
    <div className="report-print-container font-sans text-slate-900 text-center leading-relaxed">
      <div className="report-page bg-white p-12 md:p-16 mb-8 shadow-sm border border-slate-200 print:border-none print:shadow-none print:m-0 print:p-0 min-h-[1050px] flex flex-col justify-between items-center">
        {/* Bagian Atas: Lambang & Judul */}
        <div className="w-full flex flex-col items-center pt-8">
          {/* Logo Tut Wuri Handayani / Emblem Pendidikan */}
          <div className="w-28 h-28 mb-8 flex items-center justify-center border-4 border-slate-800 rounded-full p-2 bg-slate-50">
            <svg
              className="w-20 h-20 text-slate-800"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
              <path d="M6 14h6" />
              <circle cx="18" cy="18" r="3" />
            </svg>
          </div>

          <h1 className="text-2xl font-black tracking-widest uppercase mb-1 text-slate-900">
            R A P O R
          </h1>
          <h2 className="text-xl font-bold tracking-wider uppercase mb-1 text-slate-800">
            PESERTA DIDIK
          </h2>
          <h3 className="text-lg font-bold tracking-wider uppercase text-slate-700">
            SEKOLAH DASAR (SD)
          </h3>
        </div>

        {/* Bagian Tengah: Identitas Siswa */}
        <div className="w-full max-w-md my-12 flex flex-col items-center">
          <p className="text-sm font-medium text-slate-500 mb-2">Nama Peserta Didik :</p>
          <div className="w-full border-2 border-slate-800 py-3 px-6 rounded bg-slate-50/50 mb-6">
            <p className="text-lg font-bold uppercase tracking-wide text-slate-950">
              {student.full_name}
            </p>
          </div>

          <p className="text-sm font-medium text-slate-500 mb-2">NISN / NIS :</p>
          <div className="w-full border-2 border-slate-800 py-2.5 px-6 rounded bg-slate-50/50">
            <p className="text-base font-semibold tracking-wider text-slate-900 tabular-nums">
              {student.nisn || '-'} / {student.nis}
            </p>
          </div>
        </div>

        {/* Bagian Bawah: Identitas Sekolah & Kementerian */}
        <div className="w-full flex flex-col items-center pb-8 border-t border-slate-200 pt-8">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-1">
            KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
          </p>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-6">
            REPUBLIK INDONESIA
          </p>

          <h4 className="text-base font-bold uppercase tracking-wider text-slate-900 mb-1">
            {school.name}
          </h4>
          <p className="text-xs text-slate-600 max-w-sm mb-1">{school.address || 'Kecamatan Tarumajaya, Kabupaten Bekasi'}</p>
          {school.npsn && <p className="text-xs text-slate-500 tabular-nums">NPSN: {school.npsn}</p>}
        </div>
      </div>
    </div>
  );
}

