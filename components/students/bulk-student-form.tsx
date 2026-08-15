'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { validateNis, validateStudentName } from '@/lib/validators';

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
  const [rows, setRows] = useState<StudentRow[]>([
    { nis: '', nisn: '', full_name: '', gender: 'L' },
    { nis: '', nisn: '', full_name: '', gender: 'L' },
    { nis: '', nisn: '', full_name: '', gender: 'L' },
    { nis: '', nisn: '', full_name: '', gender: 'L' },
    { nis: '', nisn: '', full_name: '', gender: 'L' },
  ]);

  // Real-time cell errors: index -> { nis?: string, full_name?: string }
  const [cellErrors, setCellErrors] = useState<Record<number, { nis?: string | null; full_name?: string | null }>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      (errs) => errs && (errs.nis || errs.full_name)
    );

    if (hasErrors) {
      setError('Harap perbaiki data siswa yang tidak valid sebelum menyimpan.');
      return;
    }

    // Filter valid rows (where full_name and nis are filled)
    const validRows = rows.filter((r) => r.nis.trim() !== '' && r.full_name.trim() !== '');

    if (validRows.length === 0) {
      setError('Harap isi setidaknya satu data siswa lengkap (NIS dan Nama Lengkap).');
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

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/siswa');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">
            Input Massal Data Siswa (Bulk Add)
          </h2>
          <p className="text-xs text-[#6B7280]">
            Isi data siswa dalam bentuk tabel sekaligus untuk pendaftaran di awal semester
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" onClick={addRow} size="sm">
            <Plus className="w-4 h-4" /> Tambah Baris
          </Button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 text-[#6B7280] hover:text-[#111827] rounded-md hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-600 rounded-md">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm border-collapse min-w-[750px]">
          <thead className="bg-[#F8FAFC] text-[#6B7280] text-xs font-semibold border-b border-[#E5E7EB]">
            <tr>
              <th className="px-3 py-2.5 w-10 text-center">No</th>
              <th className="px-3 py-2.5 w-40">NIS *</th>
              <th className="px-3 py-2.5 w-40">NISN</th>
              <th className="px-3 py-2.5 min-w-[200px]">Nama Lengkap *</th>
              <th className="px-3 py-2.5 w-44 min-w-[170px] whitespace-nowrap">Jenis Kelamin</th>
              <th className="px-3 py-2.5 w-12 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {rows.map((row, index) => {
              const nisErr = cellErrors[index]?.nis;
              const nameErr = cellErrors[index]?.full_name;

              return (
                <tr key={index} className="table-row-hover transition-colors">
                  <td className="px-3 py-2 text-center text-xs font-semibold text-[#6B7280]">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      placeholder="NIS"
                      value={row.nis}
                      onChange={(e) => handleRowChange(index, 'nis', e.target.value)}
                      error={nisErr || undefined}
                      className="py-1 text-xs"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      placeholder="NISN (Opsional)"
                      value={row.nisn}
                      onChange={(e) => handleRowChange(index, 'nisn', e.target.value)}
                      className="py-1 text-xs"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      placeholder="Nama lengkap"
                      value={row.full_name}
                      onChange={(e) => handleRowChange(index, 'full_name', e.target.value)}
                      error={nameErr || undefined}
                      className="py-1 text-xs"
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
                      className="py-1 text-xs"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="text-[#6B7280] hover:text-rose-600 transition-colors p-1 cursor-pointer"
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

      <div className="flex justify-end gap-3 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={() => router.push('/siswa')}>
            Batal
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4" /> {loading ? 'Menyimpan...' : 'Simpan Semua Data Siswa'}
        </Button>
      </div>
    </form>
  );
}
