'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SubjectScoreRow {
  id: string;
  name: string;
  finalScore: number;
  highestDesc: string;
  lowestDesc: string;
  fullDesc: string;
}

export interface FinalReportSheetProps {
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
  subjects: SubjectScoreRow[];
  details: {
    sickness_days: number;
    permission_days: number;
    unexcused_days: number;
    teacher_note?: string | null;
    p5_note?: string | null;
    parent_response?: string | null;
  };
  extracurriculars: {
    name: string;
    score_description: string;
  }[];
}

// Standard Kurikulum Merdeka subject ordering
const SUBJECT_ORDER: Record<string, number> = {
  agama: 1,
  islam: 1,
  pai: 1,
  pancasila: 2,
  ppkn: 2,
  indonesia: 3,
  matematika: 4,
  mtk: 4,
  ipas: 5,
  alam: 5,
  sosial: 5,
  rupa: 6,
  seni: 6,
  jasmani: 7,
  olahraga: 7,
  pjok: 7,
  inggris: 8,
  english: 8,
  sunda: 9,
  mulok: 9,
};

function getSubjectSortWeight(name: string): number {
  const lower = name.toLowerCase();
  for (const [key, weight] of Object.entries(SUBJECT_ORDER)) {
    if (lower.includes(key)) return weight;
  }
  return 99;
}

function getOfficialSubjectName(name: string): string {
  const lower = name.toLowerCase().trim();
  if (lower.includes('pjok') || lower.includes('jasmani') || lower.includes('olahraga')) {
    return 'Pendidikan Jasmani dan Olahraga';
  }
  if (lower.includes('inggris')) {
    return 'Bahasa Inggris *';
  }
  if (lower.includes('sunda')) {
    return 'B.Sunda';
  }
  return name;
}

function formatCompetencyText(text: string, studentName: string): string {
  if (!text || text === '-' || text === '.') return '';
  const cleaned = text.trim();
  const upperName = studentName.trim().toUpperCase();

  // If text starts with "Ananda", keep it and ensure correct spacing
  if (cleaned.toLowerCase().startsWith('ananda')) {
    return cleaned;
  }

  // If text starts with student name, prepend "Ananda   "
  if (cleaned.toUpperCase().startsWith(upperName)) {
    return `Ananda   ${cleaned}`;
  }

  // Prepend "Ananda   [UPPERCASE_NAME] "
  return `Ananda   ${upperName} ${cleaned}`;
}

export function FinalReportSheet({
  student,
  classroom,
  school,
  teacher,
  config,
  semester,
  subjects,
  details,
  extracurriculars,
}: FinalReportSheetProps) {
  // Sort subjects into standard order
  const sortedSubjects = [...subjects].sort(
    (a, b) => getSubjectSortWeight(a.name) - getSubjectSortWeight(b.name)
  );

  const isMulok = (name: string) => {
    const n = name.toLowerCase();
    return n.includes('sunda') || n.includes('mulok') || n.includes('daerah');
  };

  const generalSubjects = sortedSubjects.filter((s) => !isMulok(s.name));
  const mulokSubjects = sortedSubjects.filter((s) => isMulok(s.name));

  // Semester text in all caps (GANJIL / GENAP)
  const semesterText =
    semester === 'II' || semester === '2' || semester.toLowerCase().includes('genap')
      ? 'GENAP'
      : 'GANJIL';

  // Academic year formatted with hyphen (e.g. 2025-2026)
  const academicYearText = classroom.academic_year.replace('/', '-');

  // Roman class name: default to 'VI' for Grade 6 report cards
  const classRomawi =
    classroom.name.toUpperCase().includes('VI') || classroom.name.includes('6') || classroom.name.toLowerCase().includes('data testing')
      ? 'VI'
      : classroom.name;

  return (
    <div
      className="single-student-report flex flex-col items-center gap-8 print:gap-0 print:block"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      {/* ======================================================== */}
      {/* LEMBAR 1: CAPAIAN HASIL BELAJAR (CANVAS HALAMAN 1)       */}
      {/* ======================================================== */}
      <div className="w-full flex flex-col items-center print:contents">
        {/* Banner Halaman (Hanya Tampil di Layar / Web Preview) */}
        <div className="flex items-center justify-between w-full max-w-[210mm] text-xs font-medium text-slate-500 mb-2 px-1 print:hidden">
          <span className="flex items-center gap-2 font-semibold text-slate-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7C3AED] text-[10px] font-bold text-white shadow-sm">
              1
            </span>
            Halaman 1: Capaian Hasil Belajar (Mata Pelajaran Umum)
          </span>
          <span className="text-[11px] bg-slate-200/90 text-slate-700 px-2.5 py-0.5 rounded-full font-mono font-medium">
            Format A4 (210 × 297 mm)
          </span>
        </div>

        {/* Canvas Fisik A4 Lembar 1 */}
        <div
          className="a4-sheet a4-sheet-1 text-black flex flex-col justify-start"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        >
          <div>
            {/* 1. Header Judul Rapor (Jarak ditambah) */}
            <div className="text-center mb-6">
              <h1 className="text-[13pt] font-bold tracking-normal uppercase leading-tight">
                LAPORAN HASIL BELAJAR
              </h1>
              <h2 className="text-[11.5pt] font-bold tracking-normal uppercase leading-tight mt-0.5">
                (RAPOR)
              </h2>
            </div>

            {/* 2. Identitas Siswa & Sekolah (Menjorok ke Dalam, Alamat Tidak di Truncate, Titik Dua Lurus) */}
            <div className="grid grid-cols-2 gap-x-8 mb-6 px-6 text-[10pt] leading-[1.6]">
              {/* Kolom Kiri */}
              <div className="space-y-0.5">
                <div className="flex items-start">
                  <span className="w-[90px] shrink-0 text-black">Nama Murid</span>
                  <span className="mr-2 shrink-0">:</span>
                  <span className="flex-1 uppercase font-normal">{student.full_name}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-[90px] shrink-0 text-black">NISN</span>
                  <span className="mr-2 shrink-0">:</span>
                  <span className="flex-1 tabular-nums">{student.nisn || student.nis}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-[90px] shrink-0 text-black">Sekolah</span>
                  <span className="mr-2 shrink-0">:</span>
                  <span className="flex-1">{school.name}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-[90px] shrink-0 text-black">Alamat</span>
                  <span className="mr-2 shrink-0">:</span>
                  <span className="flex-1 break-words">{school.address || 'JL.Marunda Makmur'}</span>
                </div>
              </div>

              {/* Kolom Kanan */}
              <div className="space-y-0.5">
                <div className="flex items-start">
                  <span className="w-[115px] shrink-0 text-black">Kelas</span>
                  <span className="mr-2 shrink-0">:</span>
                  <span className="flex-1">{classRomawi}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-[115px] shrink-0 text-black">Fase</span>
                  <span className="mr-2 shrink-0">:</span>
                  <span className="flex-1">C</span>
                </div>
                <div className="flex items-start">
                  <span className="w-[115px] shrink-0 text-black">Semester</span>
                  <span className="mr-2 shrink-0">:</span>
                  <span className="flex-1 uppercase">{semesterText}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-[115px] shrink-0 text-black">Tahun Pelajaran</span>
                  <span className="mr-2 shrink-0">:</span>
                  <span className="flex-1">{academicYearText}</span>
                </div>
              </div>
            </div>

            {/* 3. Tabel Mata Pelajaran Umum (No 1 s.d. 8) */}
            <div>
              <table className="w-full border-collapse border border-black text-[10pt]">
                <thead>
                  <tr className="bg-[#d9d9d9] text-black font-normal">
                    <th className="border border-black px-1 py-1 text-center w-[34px] align-middle font-normal">
                      No
                    </th>
                    <th className="border border-black px-2.5 py-1 text-center w-[190px] align-middle font-normal">
                      Mata Pelajaran
                    </th>
                    <th className="border border-black px-1 py-1 text-center w-[58px] align-middle leading-tight font-normal">
                      Nilai<br />Akhir
                    </th>
                    <th className="border border-black px-3 py-1 text-center align-middle font-normal">
                      Capaian Kompetensi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {generalSubjects.map((sub, idx) => {
                    const displayName = getOfficialSubjectName(sub.name);
                    const roundedScore = sub.finalScore > 0 ? Math.round(sub.finalScore) : '-';
                    const highestText = formatCompetencyText(sub.highestDesc, student.full_name);
                    const lowestText = formatCompetencyText(sub.lowestDesc, student.full_name);

                    return (
                      <tr key={sub.id} className="align-top">
                        <td className="border border-black px-1 py-0.5 text-center tabular-nums font-normal">
                          {idx + 1}
                        </td>
                        <td className="border border-black px-2.5 py-0.5 font-normal leading-snug">
                          {displayName}
                        </td>
                        <td className="border border-black px-1 py-0.5 text-center font-normal tabular-nums">
                          {roundedScore}
                        </td>
                        <td className="border border-black px-3 py-0.5 text-left font-normal text-[9pt] leading-[1.3]">
                          {highestText ? (
                            <div>
                              <p>{highestText}</p>
                              {lowestText && lowestText !== highestText && (
                                <p className="mt-1">{lowestText}</p>
                              )}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* LEMBAR 2: MUATAN LOKAL, KOKURIKULER & PENGESAHAN         */}
      {/* ======================================================== */}
      <div className="w-full flex flex-col items-center print:contents">
        {/* Banner Halaman (Hanya Tampil di Layar / Web Preview) */}
        <div className="flex items-center justify-between w-full max-w-[210mm] text-xs font-medium text-slate-500 mb-2 px-1 print:hidden">
          <span className="flex items-center gap-2 font-semibold text-slate-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7C3AED] text-[10px] font-bold text-white shadow-sm">
              2
            </span>
            Halaman 2: Muatan Lokal, Kokurikuler, Ekstrakurikuler & Pengesahan
          </span>
          <span className="text-[11px] bg-slate-200/90 text-slate-700 px-2.5 py-0.5 rounded-full font-mono font-medium">
            Format A4 (210 × 297 mm)
          </span>
        </div>

        {/* Canvas Fisik A4 Lembar 2 */}
        <div
          className="a4-sheet a4-sheet-2 text-black flex flex-col justify-start"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        >
          <div>
            {/* 4. Muatan Lokal (Tabel Terpadu dengan Header Pembuka) */}
            <div className="mb-2.5">
              <table className="w-full border-collapse border border-black text-[10pt]">
                <thead>
                  {/* Baris Judul Muatan Lokal Menyambung Tabel */}
                  <tr className="bg-[#d9d9d9] text-black">
                    <th
                      colSpan={4}
                      className="border border-black px-2.5 py-1 text-left font-bold text-[10pt] uppercase tracking-wide"
                    >
                      MUATAN LOKAL
                    </th>
                  </tr>
                  {/* Baris Header Kolom */}
                  <tr className="bg-[#d9d9d9] text-black font-normal">
                    <th className="border border-black px-1 py-1 text-center w-[34px] align-middle font-normal">
                      No
                    </th>
                    <th className="border border-black px-2.5 py-1 text-center w-[190px] align-middle font-normal">
                      Muatan Pelajaran
                    </th>
                    <th className="border border-black px-1 py-1 text-center w-[58px] align-middle leading-tight font-normal">
                      Nilai<br />Akhir
                    </th>
                    <th className="border border-black px-3 py-1 text-center align-middle font-normal">
                      Capaian Kompetensi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mulokSubjects.length > 0 ? (
                    mulokSubjects.map((sub, idx) => {
                      const displayName = getOfficialSubjectName(sub.name);
                      const roundedScore = sub.finalScore > 0 ? Math.round(sub.finalScore) : '-';
                      const highestText = formatCompetencyText(sub.highestDesc, student.full_name);
                      const lowestText = formatCompetencyText(sub.lowestDesc, student.full_name);

                      return (
                        <tr key={sub.id} className="align-top">
                          <td className="border border-black px-1 py-0.5 text-center tabular-nums font-normal">
                            {generalSubjects.length + idx + 1}
                          </td>
                          <td className="border border-black px-2.5 py-0.5 font-normal leading-snug">
                            {displayName}
                          </td>
                          <td className="border border-black px-1 py-0.5 text-center font-normal tabular-nums">
                            {roundedScore}
                          </td>
                          <td className="border border-black px-3 py-0.5 text-left font-normal text-[9pt] leading-[1.3]">
                            {highestText ? (
                              <div>
                                <p>{highestText}</p>
                                {lowestText && lowestText !== highestText && (
                                  <p className="mt-1">{lowestText}</p>
                                )}
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr className="align-top">
                      <td className="border border-black px-1 py-0.5 text-center tabular-nums font-normal">9</td>
                      <td className="border border-black px-2.5 py-0.5 font-normal">B.Sunda</td>
                      <td className="border border-black px-1 py-0.5 text-center font-normal tabular-nums">-</td>
                      <td className="border border-black px-3 py-0.5 text-left font-normal text-[9pt]"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 5. Kokurikuler (Isi Dibuat Rata Tengah) */}
            <div className="mb-2.5">
              <table className="w-full border-collapse border border-black text-[10pt]">
                <thead>
                  <tr className="bg-[#d9d9d9] text-black font-normal">
                    <th className="border border-black px-3 py-1 text-center font-normal">
                      Kokurikuler
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black px-4 py-2 leading-snug text-center text-[9pt]">
                      {details.p5_note ||
                        (semesterText === 'GANJIL'
                          ? `Ananda ${student.full_name.toUpperCase()} sudah baik dalam penerapan dimensi  Keimanan dan perlu berlatih dalam penerapan dimensi Keimanan dalam tema Aku cinta Indonesia`
                          : '')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 6. Ekstrakurikuler */}
            <div className="mb-2.5">
              <table className="w-full border-collapse border border-black text-[10pt]">
                <thead>
                  <tr className="bg-[#d9d9d9] text-black font-normal">
                    <th className="border border-black px-1 py-1 text-center w-[34px] font-normal">
                      No
                    </th>
                    <th className="border border-black px-2.5 py-1 text-center w-[190px] font-normal">
                      Ekstrakurikuler
                    </th>
                    <th className="border border-black px-3 py-1 text-center font-normal">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {extracurriculars.length > 0 ? (
                    extracurriculars.map((ekskul, idx) => (
                      <tr key={idx}>
                        <td className="border border-black px-1 py-0.5 text-center tabular-nums font-normal">
                          {idx + 1}
                        </td>
                        <td className="border border-black px-2.5 py-0.5 font-normal">
                          {ekskul.name}
                        </td>
                        <td className="border border-black px-3 py-0.5 text-left text-[9pt] leading-snug">
                          {ekskul.score_description}
                        </td>
                      </tr>
                    ))
                  ) : semesterText === 'GANJIL' ? (
                    <tr>
                      <td className="border border-black px-1 py-0.5 text-center tabular-nums font-normal">1</td>
                      <td className="border border-black px-2.5 py-0.5 font-normal">Pramuka</td>
                      <td className="border border-black px-3 py-0.5 text-left text-[9pt] leading-snug">
                        Sangat Baik,melaksanakan tugas-tugas pramuka secara mandiri
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td className="border border-black px-1 py-0.5 text-center tabular-nums font-normal">1</td>
                      <td className="border border-black px-2.5 py-0.5 font-normal"></td>
                      <td className="border border-black px-3 py-0.5 text-left text-[9pt]"></td>
                    </tr>
                  )}
                  <tr>
                    <td className="border border-black px-1 py-0.5 text-center tabular-nums font-normal">2</td>
                    <td className="border border-black px-2.5 py-0.5 font-normal"></td>
                    <td className="border border-black px-3 py-0.5 text-left text-gray-400 text-[9pt]">.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 7. Ketidakhadiran & Catatan Wali Kelas (Berdampingan) */}
            <div className="mb-2.5 grid grid-cols-12 gap-3 text-[10pt]">
              {/* Kotak Kiri: Ketidakhadiran */}
              <div className="col-span-5">
                <table className="w-full border-collapse border border-black">
                  <thead>
                    <tr className="bg-[#d9d9d9] text-black font-normal">
                      <th colSpan={2} className="border border-black px-2 py-1 text-center font-normal">
                        Ketidakhadiran
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black px-2.5 py-0.5 text-[9pt]">Sakit</td>
                      <td className="border border-black px-2.5 py-0.5 text-center w-20 tabular-nums text-[9pt]">
                        {details.sickness_days > 0 ? `${details.sickness_days} hari` : '0 hari'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black px-2.5 py-0.5 text-[9pt]">Izin</td>
                      <td className="border border-black px-2.5 py-0.5 text-center w-20 tabular-nums text-[9pt]">
                        {details.permission_days > 0 ? `${details.permission_days} hari` : '0 hari'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black px-2.5 py-0.5 text-[9pt]">Tanpa Keterangan</td>
                      <td className="border border-black px-2.5 py-0.5 text-center w-20 tabular-nums text-[9pt]">
                        {details.unexcused_days > 0 ? `${details.unexcused_days} hari` : '0 hari'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Kotak Kanan: Catatan Wali Kelas */}
              <div className="col-span-7 flex flex-col">
                <table className="w-full h-full border-collapse border border-black">
                  <thead>
                    <tr className="bg-[#d9d9d9] text-black font-normal">
                      <th className="border border-black px-2 py-1 text-center font-normal">
                        Catatan Wali Kelas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black px-3 py-1 text-[9pt] leading-snug align-top">
                        {details.teacher_note
                          ? details.teacher_note.startsWith('"')
                            ? details.teacher_note
                            : `"${details.teacher_note}"`
                          : semesterText === 'GANJIL'
                          ? `"Ayo belajar lebih giat agar prestasimu meningkat. Ibu percaya kamu bisa!"`
                          : ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 8. Tanggapan Orangtua / Wali Murid */}
            <div className="mb-4">
              <table className="w-full border-collapse border border-black text-[10pt]">
                <thead>
                  <tr className="bg-[#d9d9d9] text-black font-normal">
                    <th className="border border-black px-2 py-1 text-center font-normal">
                      Tanggapan Orangtua/Wali Murid
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black h-[45px] p-2 align-top text-gray-700 text-[9pt]">
                      {details.parent_response || ''}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 9. Pengesahan & Tanda Tangan (Nama Guru & Kepala Sekolah Tidak di Bold) */}
          <div className="text-[10pt] text-black">
            <div className="flex justify-between items-start px-8">
              {/* Kiri: Orang Tua */}
              <div className="text-center w-52">
                <p>Orang Tua,</p>
                <div className="h-14" />
                <p className="tracking-wider">________________________</p>
              </div>

              {/* Kanan: Titimangsa & Wali Kelas */}
              <div className="text-center w-60">
                <p>
                  {config.report_place},{config.report_date}
                </p>
                <p>Wali Kelas VI</p>
                <div className="h-14" />
                <p className="font-normal uppercase">{teacher.name}</p>
                <p className="tabular-nums">NIP.{teacher.nip || '-'}</p>
              </div>
            </div>

            {/* Tengah Bawah: Kepala Sekolah */}
            <div className="text-center mt-3 w-full flex flex-col items-center">
              <p>Mengetahui,</p>
              <p>Kepala Sekolah</p>
              <div className="h-14" />
              <p className="font-normal uppercase">{config.headmaster_name}</p>
              <p className="tabular-nums">NIP. {config.headmaster_nip || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
