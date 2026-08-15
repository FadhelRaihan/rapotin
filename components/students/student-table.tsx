'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { BulkStudentForm } from '@/components/students/bulk-student-form';
import { Plus, Edit2, Trash2, Search, UserPlus, ChevronRight, X } from 'lucide-react';
import { validateNis, validateStudentName } from '@/lib/validators';

export interface Student {
  id: string;
  nis: string;
  nisn: string | null;
  full_name: string;
  gender: string | null;
}

interface StudentTableProps {
  initialStudents: Student[];
}

export function StudentTable({ initialStudents }: StudentTableProps) {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState('');
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    full_name: '',
    gender: 'L',
  });

  // Real-time Field Errors for Modal
  const [fieldErrors, setFieldErrors] = useState<{ nis?: string | null; full_name?: string | null }>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search) ||
      (s.nisn && s.nisn.includes(search))
  );

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({ nis: '', nisn: '', full_name: '', gender: 'L' });
    setFieldErrors({});
    setError('');
    setIsSingleModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nis: student.nis,
      nisn: student.nisn || '',
      full_name: student.full_name,
      gender: student.gender === 'P' ? 'P' : 'L',
    });
    setFieldErrors({});
    setError('');
    setIsSingleModalOpen(true);
  };

  const handleNisChange = (val: string) => {
    setFormData({ ...formData, nis: val });
    if (val.trim() !== '') {
      const err = validateNis(val);
      setFieldErrors((prev) => ({ ...prev, nis: err }));
    } else {
      setFieldErrors((prev) => ({ ...prev, nis: null }));
    }
  };

  const handleNameChange = (val: string) => {
    setFormData({ ...formData, full_name: val });
    if (val.trim() !== '') {
      const err = validateStudentName(val);
      setFieldErrors((prev) => ({ ...prev, full_name: err }));
    } else {
      setFieldErrors((prev) => ({ ...prev, full_name: null }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus siswa ini?')) return;

    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nisErr = validateNis(formData.nis);
    const nameErr = validateStudentName(formData.full_name);

    if (nisErr || nameErr) {
      setFieldErrors({ nis: nisErr, full_name: nameErr });
      setError('Harap perbaiki data siswa yang tidak valid.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
      const method = editingStudent ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan data');

      if (editingStudent) {
        setStudents((prev) => prev.map((s) => (s.id === editingStudent.id ? data.data : s)));
      } else {
        setStudents((prev) => [...prev, data.data]);
      }

      setIsSingleModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSuccess = async () => {
    setIsBulkModalOpen(false);
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (res.ok) {
        setStudents(data.data);
      }
    } catch (err) {
      console.error(err);
    }
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-1">
            <Link href="/dashboard" className="hover:text-[#7C3AED] transition-colors">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#111827] font-medium">Data Siswa</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827] tracking-tight">
            Manajemen Data Siswa
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Kelola daftar siswa di kelas aktif (NIS, NISN, Nama Lengkap, dan Jenis Kelamin)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={() => setIsBulkModalOpen(true)}>
            <UserPlus className="w-4 h-4" /> Input Massal (Bulk)
          </Button>
          <Button size="md" onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4" /> Tambah Siswa
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="p-0 overflow-hidden border border-[#E5E7EB] bg-white rounded-2xl shadow-xs">
        {/* Search Toolbar */}
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, NIS, atau NISN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-[#E5E7EB] bg-white text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
          </div>
          <div className="text-xs text-[#6B7280]">
            Total: <strong className="text-[#111827]">{filteredStudents.length} Siswa</strong>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-xs font-semibold text-[#6B7280]">
                <th className="p-4 w-12 text-center">No</th>
                <th className="p-4 w-32">NIS</th>
                <th className="p-4 w-36">NISN</th>
                <th className="p-4">Nama Lengkap Siswa</th>
                <th className="p-4 text-center w-36">Jenis Kelamin</th>
                <th className="p-4 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#6B7280] text-xs">
                    {search ? 'Tidak ada siswa yang sesuai dengan pencarian.' : 'Belum ada data siswa. Klik "+ Tambah Siswa" untuk memulai.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => (
                  <tr key={st.id} className="table-row-hover transition-colors h-14">
                    <td className="p-4 text-center text-xs font-semibold text-[#6B7280]">
                      {idx + 1}
                    </td>
                    <td className="p-4 text-xs font-mono tabular-nums text-[#6B7280]">
                      {st.nis}
                    </td>
                    <td className="p-4 text-xs font-mono tabular-nums text-[#6B7280]">
                      {st.nisn || '-'}
                    </td>
                    <td className="p-4 font-bold text-[#111827]">
                      {st.full_name}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          st.gender === 'L'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : st.gender === 'P'
                            ? 'bg-pink-50 text-pink-700 border border-pink-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {st.gender === 'L' ? 'Laki-Laki' : st.gender === 'P' ? 'Perempuan' : '-'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(st)}
                          className="p-1.5 text-[#6B7280] hover:text-[#7C3AED] transition-colors rounded-md hover:bg-[#F3E8FF] cursor-pointer"
                          title="Edit Siswa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(st.id)}
                          className="p-1.5 text-[#6B7280] hover:text-rose-600 transition-colors rounded-md hover:bg-rose-50 cursor-pointer"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Single Add / Edit */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-bold text-[#111827]">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h2>
              <button
                onClick={() => setIsSingleModalOpen(false)}
                className="p-1 text-[#6B7280] hover:text-[#111827] rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 mb-4 text-xs bg-rose-50 border border-rose-200 text-rose-600 rounded-md font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSingleSubmit} className="flex flex-col gap-4">
              <Input
                label="NIS *"
                placeholder="Nomor Induk Siswa (misal: 10293)"
                value={formData.nis}
                onChange={(e) => handleNisChange(e.target.value)}
                onBlur={(e) => setFieldErrors((prev) => ({ ...prev, nis: validateNis(e.target.value) }))}
                error={fieldErrors.nis || undefined}
                required
              />
              <Input
                label="NISN"
                placeholder="Nomor Induk Siswa Nasional (Opsional)"
                value={formData.nisn}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
              />
              <Input
                label="Nama Lengkap *"
                placeholder="Nama lengkap siswa"
                value={formData.full_name}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={(e) => setFieldErrors((prev) => ({ ...prev, full_name: validateStudentName(e.target.value) }))}
                error={fieldErrors.full_name || undefined}
                required
              />
              <Select
                label="Jenis Kelamin *"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                options={[
                  { value: 'L', label: 'Laki-Laki (L)' },
                  { value: 'P', label: 'Perempuan (P)' },
                ]}
              />

              <div className="flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsSingleModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading || Boolean(fieldErrors.nis) || Boolean(fieldErrors.full_name)}>
                  {loading ? 'Memproses...' : editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Bulk Add */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <BulkStudentForm
              onSuccess={handleBulkSuccess}
              onCancel={() => setIsBulkModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
