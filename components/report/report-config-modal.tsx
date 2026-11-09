'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Save, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReportConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  semester: string;
  initialConfig: {
    report_date: string;
    report_place: string;
    headmaster_name: string;
    headmaster_nip?: string | null;
  };
  onSaveSuccess: (updated: any) => void;
}

export function ReportConfigModal({
  isOpen,
  onClose,
  semester,
  initialConfig,
  onSaveSuccess,
}: ReportConfigModalProps) {
  const [formData, setFormData] = useState({
    report_date: initialConfig.report_date || (semester === 'I' ? '22 Desember 2025' : '20 Juni 2026'),
    report_place: initialConfig.report_place || 'Tarumajaya',
    headmaster_name: initialConfig.headmaster_name || 'H. SUHANDA, S.Pd',
    headmaster_nip: initialConfig.headmaster_nip || '19721202199603002',
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/reports/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semester,
          ...formData,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan pengaturan rapor');

      toast.success('Pengaturan pengesahan rapor berhasil diperbarui!');
      onSaveSuccess(json.data);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Settings2 className="w-5 h-5 text-[#7C3AED]" />
            <h3 className="font-bold text-slate-800 text-base">Pengaturan Pengesahan Rapor</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tempat Pembagian Rapor
              </label>
              <Input
                value={formData.report_place}
                onChange={(e) => setFormData({ ...formData, report_place: e.target.value })}
                placeholder="Contoh: Tarumajaya"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Pembagian Rapor
              </label>
              <Input
                value={formData.report_date}
                onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
                placeholder="Contoh: 22 Desember 2025"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Kepala Sekolah Lengkap & Gelar
            </label>
            <Input
              value={formData.headmaster_name}
              onChange={(e) => setFormData({ ...formData, headmaster_name: e.target.value })}
              placeholder="Contoh: H. SUHANDA, S.Pd"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NIP Kepala Sekolah
            </label>
            <Input
              value={formData.headmaster_nip}
              onChange={(e) => setFormData({ ...formData, headmaster_nip: e.target.value })}
              placeholder="Contoh: 19721202199603002 (Kosongkan jika bukan PNS)"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

