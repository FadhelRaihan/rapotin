'use client';

import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  Trash2,
} from 'lucide-react';

export interface ExtractedStudent {
  nis: string;
  nisn: string;
  full_name: string;
  gender: 'L' | 'P';
}

interface ExcelStudentImportProps {
  onImport: (students: ExtractedStudent[]) => void;
}

interface ColumnOption {
  index: number; // 0-based
  label: string; // Header text or "Kolom A (Col 1)"
}

import { toast } from 'sonner';

export function ExcelStudentImport({ onImport }: ExcelStudentImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [workbook, setWorkbook] = useState<ExcelJS.Workbook | null>(null);

  // Raw rows extracted from active sheet
  const [rawGrid, setRawGrid] = useState<string[][]>([]);
  const [headerRowIdx, setHeaderRowIdx] = useState<number>(0);
  const [columns, setColumns] = useState<ColumnOption[]>([]);

  // Field column mappings (0-based column indices)
  const [nameCol, setNameCol] = useState<number | null>(null);
  const [nisCol, setNisCol] = useState<number | null>(null);
  const [nisnCol, setNisnCol] = useState<number | null>(null);
  const [genderCol, setGenderCol] = useState<number | null>(null);

  // Interactive Extracted List State (allows user deletion of specific rows)
  const [extractedList, setExtractedList] = useState<ExtractedStudent[]>([]);

  // Auto-detect helper
  const processSheet = (wb: ExcelJS.Workbook, sheetName: string) => {
    const sheet = wb.getWorksheet(sheetName);
    if (!sheet) return;

    const grid: string[][] = [];
    let maxCols = 0;

    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const rowVals: string[] = [];
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const val = cell.text || (cell.value != null ? String(cell.value) : '');
        rowVals[colNumber - 1] = val.trim();
      });
      if (rowVals.length > maxCols) maxCols = rowVals.length;
      grid[rowNumber - 1] = rowVals;
    });

    // Fill empty arrays for consistency
    const cleanGrid = grid.map((r) => {
      const row = r || [];
      while (row.length < maxCols) row.push('');
      return row;
    });

    setRawGrid(cleanGrid);

    // Auto detect header row (search first 25 rows for keywords: Nama, NIS, NIPD, NISN, JK)
    let detectedHeaderIdx = 0;
    let maxMatches = 0;

    cleanGrid.slice(0, 25).forEach((rowVals, rIdx) => {
      const line = rowVals.join(' ').toLowerCase();
      let matches = 0;
      if (line.includes('nama') || line.includes('siswa') || line.includes('peserta')) matches += 2;
      if (line.includes('nis') || line.includes('nipd') || line.includes('induk')) matches += 2;
      if (line.includes('nisn')) matches += 2;
      if (line.includes('jk') || line.includes('kelamin') || line.includes('sex')) matches += 1;

      if (matches > maxMatches) {
        maxMatches = matches;
        detectedHeaderIdx = rIdx;
      }
    });

    setHeaderRowIdx(detectedHeaderIdx);

    // Build column options based on detected header row
    const headerRow = cleanGrid[detectedHeaderIdx] || [];
    const colOptions: ColumnOption[] = [];

    const colCount = Math.max(headerRow.length, maxCols);
    for (let c = 0; c < colCount; c++) {
      const letter = String.fromCharCode(65 + (c % 26)); // A, B, C...
      const headerText = headerRow[c] || '';
      colOptions.push({
        index: c,
        label: headerText ? `Kolom ${letter}: ${headerText}` : `Kolom ${letter}`,
      });
    }

    setColumns(colOptions);

    // Auto-detect column mapping matching keywords
    let autoName: number | null = null;
    let autoNis: number | null = null;
    let autoNisn: number | null = null;
    let autoGender: number | null = null;

    headerRow.forEach((txt, colIdx) => {
      const t = txt.toLowerCase();
      if (!t) return;

      if ((t.includes('nama') || t.includes('siswa')) && autoName === null) {
        autoName = colIdx;
      }
      if (t === 'nisn' || (t.includes('nisn') && autoNisn === null)) {
        autoNisn = colIdx;
      } else if (
        (t === 'nis' || t === 'nipd' || t.includes('nis') || t.includes('nipd') || t.includes('induk')) &&
        autoNis === null
      ) {
        autoNis = colIdx;
      }
      if (
        (t === 'jk' || t.includes('kelamin') || t.includes('gender') || t.includes('l/p')) &&
        autoGender === null
      ) {
        autoGender = colIdx;
      }
    });

    setNameCol(autoName);
    setNisCol(autoNis);
    setNisnCol(autoNisn);
    setGenderCol(autoGender);

    // Extract student data
    if (autoName !== null || autoNis !== null) {
      const initialExtracted = parseRowsToStudents(cleanGrid, detectedHeaderIdx, autoName, autoNis, autoNisn, autoGender);
      setExtractedList(initialExtracted);
      toast.success(`Berhasil ekstraksi ${initialExtracted.length} data siswa dari Excel.`);
    }
  };

  const parseRowsToStudents = (
    grid: string[][],
    hIdx: number,
    nCol: number | null,
    niCol: number | null,
    nisnC: number | null,
    genCol: number | null
  ): ExtractedStudent[] => {
    const dataRows = grid.slice(hIdx + 1);
    const results: ExtractedStudent[] = [];

    const isHeaderWord = (str: string) => {
      const s = str.trim().toLowerCase();
      return (
        s === 'nama' ||
        s === 'nama siswa' ||
        s === 'nama lengkap' ||
        s === 'nama lengkap siswa' ||
        s === 'nipd' ||
        s === 'nis' ||
        s === 'nisn' ||
        s === 'jk' ||
        s === 'jenis kelamin' ||
        s === 'no' ||
        s === 'rombel' ||
        s === 'rombel saat ini' ||
        /^\d{1,2}$/.test(s)
      );
    };

    dataRows.forEach((row) => {
      const rawName = nCol !== null ? row[nCol] || '' : '';
      const rawNis = niCol !== null ? row[niCol] || '' : '';
      const rawNisn = nisnC !== null ? row[nisnC] || '' : '';
      const rawGender = genCol !== null ? row[genCol] || '' : '';

      if (!rawName && !rawNis) return;
      if (isHeaderWord(rawName) || isHeaderWord(rawNis)) return;
      if (rawName.toLowerCase().includes('total') || rawName.toLowerCase().includes('jumlah')) return;

      let gender: 'L' | 'P' = 'L';
      const gUpper = rawGender.toUpperCase();
      if (gUpper.includes('P') || gUpper.includes('PEREMPUAN') || gUpper.includes('WANITA')) {
        gender = 'P';
      } else {
        gender = 'L';
      }

      results.push({
        nis: rawNis.replace(/['"\s]/g, ''),
        nisn: rawNisn.replace(/['"\s]/g, ''),
        full_name: rawName,
        gender,
      });
    });

    return results;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setFile(uploaded);
    setLoading(true);
    setError('');

    try {
      const buffer = await uploaded.arrayBuffer();
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);

      setWorkbook(wb);
      const sheetNames = wb.worksheets.map((w) => w.name);
      setSheets(sheetNames);

      if (sheetNames.length > 0) {
        const firstSheet = sheetNames[0];
        setSelectedSheet(firstSheet);
        processSheet(wb, firstSheet);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = 'Gagal membaca file Excel. Pastikan format file berupa .xlsx atau .xls yang valid.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (workbook) {
      processSheet(workbook, sheetName);
    }
  };

  const handleDeleteRow = (index: number) => {
    setExtractedList((prev) => prev.filter((_, i) => i !== index));
    toast.info('Satu baris data dihapus dari pratinjau.');
  };

  const handleConfirmImport = () => {
    if (extractedList.length === 0) {
      setError('Tidak ada data siswa yang tersisa untuk diimpor.');
      toast.error('Tidak ada data siswa yang tersisa untuk diimpor.');
      return;
    }
    toast.success(`Mengimpor ${extractedList.length} data siswa ke tabel form...`);
    onImport(extractedList);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* File Upload Drop Area */}
      {!file ? (
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 hover:border-[#7C3AED] bg-slate-50 hover:bg-[#F3E8FF]/30 rounded-2xl cursor-pointer transition-all text-center group">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-[#7C3AED] mb-3 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <span className="text-base font-bold text-slate-900 mb-1">
            Klik atau Tarik File Excel ke Sini
          </span>
          <span className="text-sm text-slate-600 font-medium max-w-md">
            Mendukung format <strong className="text-slate-800">.xlsx</strong> dan <strong className="text-slate-800">.xls</strong> (Format Dapodik, M.16, atau Tabel Kustom)
          </span>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      ) : (
        <div className="flex items-center justify-between p-4 bg-[#F3E8FF]/60 border border-purple-300 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center font-bold shadow-sm">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{file.name}</h4>
              <p className="text-xs text-slate-600 font-medium">
                {(file.size / 1024).toFixed(1)} KB • {extractedList.length} Siswa Terdeteksi
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFile(null);
              setRawGrid([]);
              setExtractedList([]);
              setError('');
            }}
          >
            Ganti File
          </Button>
        </div>
      )}

      {error && (
        <div className="p-4 text-sm bg-rose-50 border border-rose-300 text-rose-700 rounded-xl font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Auto Extracted Live Preview */}
      {file && rawGrid.length > 0 && (
        <Card className="p-5 border border-slate-300 rounded-2xl bg-white shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#7C3AED]" />
              <h3 className="text-base font-bold text-slate-900">
                Pratinjau Hasil Ekstraksi Data Siswa
              </h3>
            </div>

            {sheets.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Sheet:</span>
                <select
                  value={selectedSheet}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className="h-9 px-3 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-900"
                >
                  {sheets.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Live Preview Table */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#7C3AED]" />
                Hasil Deteksi Otomatis ({extractedList.length} Siswa Ditemukan)
              </span>
              <span className="text-xs text-slate-600 font-medium">
                Header Terdeteksi di Baris Ke-{headerRowIdx + 1}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-300 max-h-80 overflow-y-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 w-12 text-center">No</th>
                    <th className="p-3 w-36">NIS</th>
                    <th className="p-3 w-40">NISN</th>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3 text-center w-32">Jenis Kelamin</th>
                    <th className="p-3 text-center w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {extractedList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-600 font-medium text-sm">
                        Tidak ada data siswa yang terdeteksi dari file Excel ini.
                      </td>
                    </tr>
                  ) : (
                    extractedList.map((st, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-center font-bold text-slate-700">{idx + 1}</td>
                        <td className="p-3 font-mono text-slate-800 font-semibold">{st.nis || '-'}</td>
                        <td className="p-3 font-mono text-slate-800 font-semibold">{st.nisn || '-'}</td>
                        <td className="p-3 font-bold text-slate-900">{st.full_name}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              st.gender === 'L'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : 'bg-pink-100 text-pink-900 border border-pink-300'
                            }`}
                          >
                            {st.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(idx)}
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                            title="Hapus baris ini dari impor"
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
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2 border-t border-slate-200">
            <Button
              type="button"
              onClick={handleConfirmImport}
              disabled={extractedList.length === 0}
              size="lg"
              className="w-full md:w-auto"
            >
              <CheckCircle2 className="w-5 h-5" /> Impor {extractedList.length} Siswa ke Tabel Form
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
