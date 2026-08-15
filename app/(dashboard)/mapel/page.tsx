'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Edit2, Trash2, BookOpen, Search, ChevronRight, X, Layers } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  created_at: string;
}

export default function MapelPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subjects');
      const data = await res.json();
      if (res.ok) setSubjects(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setName('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setName(sub.name);
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) return;

    try {
      const res = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubjects((prev) => prev.filter((s) => s.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error('Error deleting subject:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nama mata pelajaran wajib diisi');
      return;
    }

    try {
      const url = editingSubject ? `/api/subjects/${editingSubject.id}` : '/api/subjects';
      const method = editingSubject ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan data');

      if (editingSubject) {
        setSubjects((prev) => prev.map((s) => (s.id === editingSubject.id ? data.data : s)));
      } else {
        setSubjects((prev) => [...prev, data.data]);
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-1">
            <Link href="/dashboard" className="hover:text-[#7C3AED] transition-colors">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#111827] font-medium">Mata Pelajaran</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827] tracking-tight">
            Manajemen Mata Pelajaran
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Tambah dan kelola daftar mata pelajaran (termasuk muatan lokal custom) untuk kelas Anda
          </p>
        </div>

        <Button onClick={handleOpenAddModal} size="md">
          <Plus className="w-4 h-4" /> Tambah Mapel
        </Button>
      </div>

      {/* Main Data Table Panel */}
      <Card className="p-0 overflow-hidden border border-[#E5E7EB] rounded-xl bg-white shadow-sm">
        {/* Filter Bar */}
        <div className="p-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#F8FAFC]">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Cari mata pelajaran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-md text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all"
            />
          </div>
          <div className="text-xs text-[#6B7280] font-medium">
            Tersedia {filteredSubjects.length} mata pelajaran
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-xs font-semibold text-[#6B7280]">
                <th className="p-4 w-12 text-center">No</th>
                <th className="p-4">Nama Mata Pelajaran</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-[#6B7280] text-xs">
                    Memuat daftar mata pelajaran...
                  </td>
                </tr>
              ) : filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-[#6B7280] text-xs">
                    {search ? 'Tidak ada mata pelajaran yang cocok.' : 'Belum ada mata pelajaran. Klik Tambah Mapel.'}
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject, idx) => (
                  <tr key={subject.id} className="table-row-hover transition-colors h-14">
                    <td className="p-4 text-center text-xs font-semibold text-[#6B7280]">
                      {idx + 1}
                    </td>
                    <td className="p-4 font-semibold text-[#111827]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center font-bold text-xs">
                          <Layers className="w-4 h-4" />
                        </div>
                        <span>{subject.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(subject)}
                          className="p-1.5 text-[#6B7280] hover:text-[#7C3AED] transition-colors rounded-md hover:bg-slate-100 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="p-1.5 text-[#6B7280] hover:text-rose-600 transition-colors rounded-md hover:bg-rose-50 cursor-pointer"
                          title="Hapus"
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

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#111827]">
                {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#6B7280] hover:text-[#111827] rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 mb-4 text-xs bg-rose-50 border border-rose-200 text-rose-600 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Nama Mata Pelajaran *"
                placeholder="Contoh: Matematika, IPAS, Bahasa Sunda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingSubject ? 'Simpan Perubahan' : 'Tambah Mapel'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
