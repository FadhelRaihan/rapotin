'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ExcelStudentImport, ExtractedStudent } from '@/components/students/excel-student-import';
import { FileSpreadsheet, ListPlus, Plus, Trash2, Save, X } from 'lucide-react';
import { validateNis, validateNisn, validateStudentName } from '@/lib/validators';
import { toast } from 'sonner';

interface StudentRow {
  nis: string;
  nisn: string;
  full_name: string;
  gender: 'L' | 'P';
}

interface BulkStudentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BulkStudentForm({ onSuccess, onCancel }: BulkStudentFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'excel' | 'form'>('excel');

  const [rows, setRows] = useState<StudentRow[]>([
    { nis: '', nisn: '', full_name: '', gender: 'L' },
    { nis: '', nisn: '', full_name: '', gender: 'L' },
    { nis: '', nisn: '', full_name: '', gender: 'L' },
    { nis: '', nisn: '', full_name: '', gender: 'L' },
    { nis: '', nisn: '', full_name: '', gender: 'L' },
  ]);

  // Real-time cell errors: index -> { nis?: string, nisn?: string, full_name?: string }
  const [cellErrors, setCellErrors] = useState<Record<number, { nis?: string | null; nisn?: string | null; full_name?: string | null }>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExcelExtracted = (extracted: ExtractedStudent[]) => {
    setRows(extracted);
    setActiveTab('form');
  };

  const handleRowChange = (index: number, field: keyof StudentRow, value: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);

    // Instant real-time field validation
    if (field === 'nis' && value.trim() !== '') {
      const err = validateNis(value);
      setCellErrors((prev) => ({ ...prev, [index]: { ...prev[index], nis: err } }));
    } else if (field === 'nis' && value.trim() === '') {
      setCellErrors((prev) => ({ ...prev, [index]: { ...prev[index], nis: null } }));
    }

    if (field === 'nisn' && value.trim() !== '') {
      const err = validateNisn(value);
      setCellErrors((prev) => ({ ...prev, [index]: { ...prev[index], nisn: err } }));
    } else if (field === 'nisn' && value.trim() === '') {
      setCellErrors((prev) => ({ ...prev, [index]: { ...prev[index], nisn: null } }));
    }

    if (field === 'full_name' && value.trim() !== '') {
      const err = validateStudentName(value);
      setCellErrors((prev) => ({ ...prev, [index]: { ...prev[index], full_name: err } }));
    } else if (field === 'full_name' && value.trim() === '') {
      setCellErrors((prev) => ({ ...prev, [index]: { ...prev[index], full_name: null } }));
    }
  };

  const addRow = () => {
    setRows([...rows, { nis: '', nisn: '', full_name: '', gender: 'L' }]);
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
    setCellErrors((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if any cell has error
    const hasErrors = Object.values(cellErrors).some(
      (errs) => errs && (errs.nis || errs.full_name || errs.nisn)
    );

    if (hasErrors) {
      const msg = 'Harap perbaiki data siswa yang tidak valid sebelum menyimpan.';
      setError(msg);
      toast.error(msg);
      return;
    }

    // Filter valid rows (where full_name and nis are filled)
    const validRows = rows.filter((r) => r.nis.trim() !== '' && r.full_name.trim() !== '');

    if (validRows.length === 0) {
      const msg = 'Harap isi setidaknya satu data siswa lengkap (NIS dan Nama Lengkap).';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: validRows }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan data siswa');
      }

      toast.success(`Berhasil menyimpan ${validRows.length} data siswa!`);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/siswa');
        router.refresh();
      }
    } catch (err: any) {
      const msg = err.message || 'Terjadi kesalahan saat menyimpan data siswa.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Modal Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-300">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Tambah Massal Data Siswa
          </h2>
          <p className="text-sm font-medium text-slate-700 mt-0.5">
            Unggah file Excel sekolah Anda atau isi form tabel untuk pendaftaran massal siswa
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('excel')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'excel'
              ? 'bg-[#7C3AED] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Upload File Excel (.xlsx)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('form')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'form'
              ? 'bg-[#7C3AED] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <ListPlus className="w-4 h-4" />
          Tabel Form ({rows.filter((r) => r.full_name || r.nis).length} Data Siswa)
        </button>
      </div>

      {error && (
        <div className="p-4 text-sm bg-rose-50 border border-rose-300 text-rose-700 rounded-xl font-bold">
          {error}
        </div>
      )}

      {/* Tab 1: Dynamic Excel Import */}
      {activeTab === 'excel' && (
        <ExcelStudentImport onImport={handleExcelExtracted} />
      )}

      {/* Tab 2: Manual / Populated Form Table */}
      {activeTab === 'form' && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">
              Periksa dan edit data siswa sebelum disimpan ke database:
            </span>
            <Button type="button" variant="secondary" onClick={addRow} size="sm">
              <Plus className="w-4 h-4" /> Tambah Baris
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white max-h-96">
            <table className="w-full text-left text-sm border-collapse min-w-[750px]">
              <thead className="bg-slate-100 text-slate-800 text-sm font-bold border-b border-slate-300 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2.5 w-12 text-center">No</th>
                  <th className="px-3 py-2.5 w-44">NIS *</th>
                  <th className="px-3 py-2.5 w-44">NISN</th>
                  <th className="px-3 py-2.5 min-w-[200px]">Nama Lengkap *</th>
                  <th className="px-3 py-2.5 w-48 min-w-[170px]">Jenis Kelamin</th>
                  <th className="px-3 py-2.5 w-14 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((row, index) => {
                  const nisErr = cellErrors[index]?.nis;
                  const nameErr = cellErrors[index]?.full_name;

                  return (
                    <tr key={index} className="table-row-hover transition-colors">
                      <td className="px-3 py-2 text-center text-sm font-bold text-slate-700">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          placeholder="NIS"
                          value={row.nis}
                          onChange={(e) => handleRowChange(index, 'nis', e.target.value)}
                          error={nisErr || undefined}
                          className="py-1 text-sm font-mono"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          placeholder="NISN (Opsional)"
                          value={row.nisn}
                          onChange={(e) => handleRowChange(index, 'nisn', e.target.value)}
                          className="py-1 text-sm font-mono"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          placeholder="Nama lengkap siswa"
                          value={row.full_name}
                          onChange={(e) => handleRowChange(index, 'full_name', e.target.value)}
                          error={nameErr || undefined}
                          className="py-1 text-sm font-bold"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Select
                          value={row.gender}
                          onChange={(e) => handleRowChange(index, 'gender', e.target.value as 'L' | 'P')}
                          options={[
                            { value: 'L', label: 'Laki-Laki (L)' },
                            { value: 'P', label: 'Perempuan (P)' },
                          ]}
                          className="py-1 text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          className="text-slate-600 hover:text-rose-700 transition-colors p-2 rounded-lg hover:bg-rose-50 cursor-pointer"
                          title="Hapus Baris"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Batal
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => router.push('/siswa')}>
                Batal
              </Button>
            )}
            <Button type="submit" disabled={loading} size="lg">
              <Save className="w-5 h-5" /> {loading ? 'Menyimpan...' : `Simpan ${rows.filter((r) => r.full_name || r.nis).length} Data Siswa`}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
