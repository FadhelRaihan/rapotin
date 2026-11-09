'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Save, Edit3, Sparkles, BookOpen, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface SubjectDesc {
  id: string;
  name: string;
  highestDesc: string;
  lowestDesc: string;
}

interface ReportEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    full_name: string;
  };
  semester: string;
  initialDetails: {
    sickness_days: number;
    permission_days: number;
    unexcused_days: number;
    teacher_note?: string | null;
    p5_note?: string | null;
  };
  initialExtracurriculars: {
    name: string;
    score_description: string;
  }[];
  subjects: SubjectDesc[];
  onSaveSuccess: () => void;
}

export function ReportEditModal({
  isOpen,
  onClose,
  student,
  semester,
  initialDetails,
  initialExtracurriculars,
  subjects,
  onSaveSuccess,
}: ReportEditModalProps) {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'DESCRIPTIONS'>('DETAILS');

  // Details State
  const [sicknessDays, setSicknessDays] = useState<number>(initialDetails.sickness_days || 0);
  const [permissionDays, setPermissionDays] = useState<number>(initialDetails.permission_days || 0);
  const [unexcusedDays, setUnexcusedDays] = useState<number>(initialDetails.unexcused_days || 0);
  const [teacherNote, setTeacherNote] = useState<string>(initialDetails.teacher_note || '');
  const [p5Note, setP5Note] = useState<string>(initialDetails.p5_note || '');

  // Ekstrakurikuler State (2 slot)
  const [ekskulList, setEkskulList] = useState<{ name: string; score_description: string }[]>([
    {
      name: initialExtracurriculars[0]?.name || 'Pramuka',
      score_description: initialExtracurriculars[0]?.score_description || 'Sangat Baik, aktif dan mandiri dalam kegiatan',
    },
    {
      name: initialExtracurriculars[1]?.name || '',
      score_description: initialExtracurriculars[1]?.score_description || '',
    },
  ]);

  // Subject Descriptions State: subjectId -> { highestDesc, lowestDesc }
  const [descMap, setDescMap] = useState<Record<string, { highestDesc: string; lowestDesc: string }>>(() => {
    const map: Record<string, { highestDesc: string; lowestDesc: string }> = {};
    subjects.forEach((s) => {
      map[s.id] = {
        highestDesc: s.highestDesc || '',
        lowestDesc: s.lowestDesc || '',
      };
    });
    return map;
  });

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleApplyPresetNote = (noteText: string) => {
    setTeacherNote(noteText);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // 1. Save Details & Extracurriculars
      const detailsPayload = {
        semester,
        details: [
          {
            student_id: student.id,
            sickness_days: Number(sicknessDays),
            permission_days: Number(permissionDays),
            unexcused_days: Number(unexcusedDays),
            teacher_note: teacherNote,
            p5_note: p5Note,
          },
        ],
        extracurriculars: ekskulList
          .filter((e) => e.name.trim() !== '')
          .map((e) => ({
            student_id: student.id,
            name: e.name,
            score_description: e.score_description,
          })),
      };

      const resDetails = await fetch('/api/reports/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(detailsPayload),
      });

      if (!resDetails.ok) throw new Error('Gagal menyimpan data pelengkap rapor');

      // 2. Save Customized Descriptions per subject
      const descPromises = subjects.map((sub) => {
        const item = descMap[sub.id];
        if (item) {
          return fetch('/api/reports/descriptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_id: student.id,
              subject_id: sub.id,
              semester,
              highest_desc: item.highestDesc,
              lowest_desc: item.lowestDesc,
            }),
          });
        }
        return Promise.resolve();
      });

      await Promise.all(descPromises);

      toast.success(`Data rapor untuk ${student.full_name} berhasil diperbarui!`);
      onSaveSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#7C3AED]" />
              Sesuaikan Data Rapor: <span className="text-[#7C3AED] uppercase">{student.full_name}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Semester {semester === 'I' ? '1 (Ganjil)' : '2 (Genap)'} — Kurikulum Merdeka
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'DETAILS'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Presensi, Catatan & Ekskul
          </button>
          <button
            onClick={() => setActiveTab('DESCRIPTIONS')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'DESCRIPTIONS'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Narasi Capaian Mata Pelajaran ({subjects.length})
          </button>
        </div>

        {/* Modal Content Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'DETAILS' ? (
            <>
              {/* Presensi */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  1. Presensi / Ketidakhadiran (Hari)
                </h4>
                <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Sakit (Hari)</label>
                    <Input
                      type="number"
                      min={0}
                      value={sicknessDays}
                      onChange={(e) => setSicknessDays(Math.max(0, parseInt(e.target.value) || 0))}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Izin (Hari)</label>
                    <Input
                      type="number"
                      min={0}
                      value={permissionDays}
                      onChange={(e) => setPermissionDays(Math.max(0, parseInt(e.target.value) || 0))}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Tanpa Keterangan / Alpa</label>
                    <Input
                      type="number"
                      min={0}
                      value={unexcusedDays}
                      onChange={(e) => setUnexcusedDays(Math.max(0, parseInt(e.target.value) || 0))}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Ekstrakurikuler */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  2. Kegiatan Ekstrakurikuler
                </h4>
                <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {ekskulList.map((ekskul, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-4">
                        <Input
                          placeholder={`Nama Ekskul ${idx + 1} (mis. Pramuka)`}
                          value={ekskul.name}
                          onChange={(e) => {
                            const updated = [...ekskulList];
                            updated[idx].name = e.target.value;
                            setEkskulList(updated);
                          }}
                          className="bg-white"
                        />
                      </div>
                      <div className="col-span-8">
                        <Input
                          placeholder="Predikat & Keterangan kegiatan"
                          value={ekskul.score_description}
                          onChange={(e) => {
                            const updated = [...ekskulList];
                            updated[idx].score_description = e.target.value;
                            setEkskulList(updated);
                          }}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Catatan Wali Kelas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    3. Catatan Wali Kelas
                  </h4>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPresetNote(
                          'Pertahankan prestasimu yang luar biasa. Teruslah belajar dengan tekun dan rendah hati.'
                        )
                      }
                      className="text-[10px] text-[#7C3AED] hover:underline"
                    >
                      + Preset Sangat Baik
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPresetNote(
                          'Tingkatkan terus semangat belajarmu, lebih teliti dan aktif dalam bertanya di kelas.'
                        )
                      }
                      className="text-[10px] text-[#7C3AED] hover:underline"
                    >
                      + Preset Motivasi
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={teacherNote}
                  onChange={(e) => setTeacherNote(e.target.value)}
                  placeholder="Tuliskan apresiasi, motivasi, atau pesan khusus wali kelas untuk anak..."
                  className="w-full p-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                />
              </div>

              {/* Catatan Kokurikuler P5 */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  4. Catatan Kokurikuler (Projek P5)
                </h4>
                <textarea
                  rows={2}
                  value={p5Note}
                  onChange={(e) => setP5Note(e.target.value)}
                  placeholder="Catatan perkembangan karakter dimensi profil pelajar Pancasila (opsional)..."
                  className="w-full p-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                />
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <p className="text-slate-500 italic">
                Anda dapat mengoreksi kalimat narasi hasil kalkulasi otomatis di bawah ini. Kalimat yang diedit akan
                disimpan khusus untuk siswa ini.
              </p>

              {subjects.map((sub) => {
                const current = descMap[sub.id] || { highestDesc: '', lowestDesc: '' };
                return (
                  <div key={sub.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                    <div className="font-bold text-slate-900 text-[13px] flex items-center justify-between">
                      <span>{sub.name}</span>
                      <span className="text-[10px] font-normal text-slate-500 uppercase tracking-wider">
                        Capaian Kompetensi
                      </span>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                        1. Penguasaan Kompetensi Tertinggi (Kekuatan)
                      </label>
                      <textarea
                        rows={2}
                        value={current.highestDesc}
                        onChange={(e) => {
                          setDescMap({
                            ...descMap,
                            [sub.id]: {
                              ...current,
                              highestDesc: e.target.value,
                            },
                          });
                        }}
                        className="w-full p-2.5 rounded border border-slate-200 text-xs focus:ring-2 focus:ring-[#7C3AED] focus:outline-none bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                        2. Kompetensi yang Membutuhkan Penguatan / Bimbingan
                      </label>
                      <textarea
                        rows={2}
                        value={current.lowestDesc}
                        onChange={(e) => {
                          setDescMap({
                            ...descMap,
                            [sub.id]: {
                              ...current,
                              lowestDesc: e.target.value,
                            },
                          });
                        }}
                        className="w-full p-2.5 rounded border border-slate-200 text-xs focus:ring-2 focus:ring-[#7C3AED] focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Perubahan akan otomatis tercermin di lembar cetak rapor fisik.
          </p>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Menyimpan...' : 'Simpan Data Rapor'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

