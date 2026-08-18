'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PinInput } from '@/components/auth/pin-input';
import { Card } from '@/components/ui/card';
import {
  GraduationCap,
  Lock,
  ShieldCheck,
  Zap,
  BarChart3,
  Layers,
  Sparkles,
  School,
  ArrowRight,
  Info,
  KeyRound,
} from 'lucide-react';

import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompletePin = async (pin: string) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || 'PIN yang Anda masukkan salah.';
        toast.error(errMsg);
        throw new Error(errMsg);
      }

      toast.success('Login berhasil! Mengalihkan ke halaman kelas...');
      router.push('/kelas');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan pada koneksi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] text-[#111827] flex items-center justify-center p-4 md:p-8 font-sans antialiased">
      {/* Main Container Card */}
      <div className="w-full max-w-4xl bg-white border border-slate-300 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Hero Brand Showcase */}
        <div className="bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
            <School className="w-96 h-96 text-white" />
          </div>

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tight text-white">Rapotin</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-md">
                  v1.0
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-purple-200 border border-white/15 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Pencatatan Nilai SD Serba Cepat</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-white">
                Kelola Nilai & Rapot Siswa Tanpa Repot.
              </h1>
              <p className="text-xs md:text-sm text-purple-100 leading-relaxed">
                Platform khusus Guru Sekolah Dasar untuk penginputan nilai tugas, ulangan harian, dan rekapitulasi otomatis.
              </p>
            </div>
          </div>

          {/* Value Props List */}
          <div className="relative z-10 flex flex-col gap-3 mt-8 pt-6 border-t border-white/15 text-xs text-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
                <Zap className="w-4 h-4" />
              </div>
              <span>Input Massal Multi-Baris Siswa Instan</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-emerald-300">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span>Matriks Rekapitulasi & Grafik Analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-purple-300">
                <Layers className="w-4 h-4" />
              </div>
              <span>Manajemen Multi-Kelas & Tahun Ajaran</span>
            </div>
          </div>
        </div>

        {/* Right Side: PIN Verification Form */}
        <div className="p-8 md:p-12 flex flex-col justify-between gap-6 bg-white">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center font-bold mb-1">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Masuk Akun Guru
              </h2>
              <p className="text-sm font-medium text-slate-700">
                Masukkan 6-digit PIN akses untuk melanjutkan ke portal kelas Anda
              </p>
            </div>

            {/* High Visibility PIN Instruction Banner */}
            <div className="p-3.5 bg-[#F3E8FF]/70 border border-purple-300 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-[#5B21B6] uppercase tracking-wider">
                  Petunjuk Pengisian PIN
                </span>
                <span className="text-xs font-bold text-slate-900">
                  Ketikkan 6 digit angka PIN Anda pada 6 kotak di bawah ini:
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm bg-rose-50 border border-rose-300 text-rose-700 rounded-xl font-bold">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <PinInput
                label="Masukkan 6-Digit PIN Akses Anda"

                length={6}
                onComplete={handleCompletePin}
                disabled={loading}
              />

              {loading && (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#7C3AED] animate-pulse">
                  <div className="w-4 h-4 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
                  <span>Memverifikasi PIN Guru...</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4 border-t border-[#E5E7EB]">
            <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Session Aman & Terenkripsi</span>
              </div>
              <span>© {new Date().getFullYear()} Rapotin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
