# Dokumentasi Perhitungan Nilai Rapor
**SDN SegaraMakmur 01 — Kelas VI — Tahun Pelajaran 2025/2026**

---

## Daftar Isi
1. [Gambaran Umum Dua File](#1-gambaran-umum-dua-file)
2. [File 1 — Rapor IKM (Kurikulum Merdeka)](#2-file-1--rapor-ikm-kurikulum-merdeka)
   - [Struktur Sheet](#21-struktur-sheet)
   - [Alur Perhitungan per Mata Pelajaran](#22-alur-perhitungan-per-mata-pelajaran)
   - [Formula Lengkap Nilai Rapor](#23-formula-lengkap-nilai-rapor)
   - [Rekap Nilai & Peringkat](#24-rekap-nilai--peringkat)
   - [Sistem Deskripsi Otomatis](#25-sistem-deskripsi-otomatis)
3. [File 2 — Analisis Kurmer (K13/Transisi)](#3-file-2--analisis-kurmer-k13transisi)
   - [Struktur Sheet](#31-struktur-sheet)
   - [Analisis Ulangan Harian per Mapel](#32-analisis-ulangan-harian-per-mapel)
   - [Analisis PTS / STS](#33-analisis-pts--sts)
   - [Rekap Nilai UH & PTS](#34-rekap-nilai-uh--pts)
   - [Formula Nilai Rapor Semester I](#35-formula-nilai-rapor-semester-i)
4. [Perbandingan Dua Sistem](#4-perbandingan-dua-sistem)

---

## 1. Gambaran Umum Dua File

| Aspek | File 1 (RAPOR_IKM) | File 2 (Analisis_kurmer) |
|---|---|---|
| **Format** | `.xlsb` (Excel Binary) | `.xlsx` (Excel Open XML) |
| **Kurikulum** | Kurikulum Merdeka (IKM) | K-13 / Transisi ke IKM |
| **Terminologi asesmen** | TP, LM, STS, SAS | UH, PTS/STS, PAS/SAS |
| **Skor dasar** | Skala 0–100 (per TP/LM) | Item-based (bobot per soal) |
| **Jumlah siswa** | 31 siswa (Kelas VI) | 31 siswa (Kelas VI) |
| **Output akhir** | Nilai Rapor + Deskripsi | Nilai Rapor + Peringkat |

---

## 2. File 1 — Rapor IKM (Kurikulum Merdeka)

### 2.1 Struktur Sheet

```
DASHBOARD          → Info sekolah, guru, kelas, semester
Data Siswa         → Nama, NIS/NISN siswa
Mapel              → Daftar mata pelajaran
Absen              → Data ketidakhadiran
Tujuan Pembelajaran→ Daftar TP per mata pelajaran
Ekstrakurikuler    → Kegiatan ekstrakurikuler
Input Nilai        → Halaman input nilai utama (manual)

FOR & SUM [MAPEL]  → Formula & rekapitulasi per mapel (13 sheet):
  ├── FOR & SUM AGM      (Agama)
  ├── FOR & SUM PKN      (PPKn)
  ├── FOR & SUM BI       (Bahasa Indonesia)
  ├── FOR & SUM MTK      (Matematika)
  ├── FOR & SUM IPAS     (IPAS)
  ├── FOR & SUM BING     (Bahasa Inggris)
  ├── FOR & SUM SENI MUSIK
  ├── FOR & SUM SENI TARI
  ├── FOR & SUM SENI RUPA
  ├── FOR & SUM SENI TEATER
  ├── FOR & SUM PJOK
  ├── FOR & SUM MULOK 1/2/3

KKA               → Kokurikuler / Co-curricular activities
REKAP NILAI       → Rekap semua nilai akhir per siswa
RAPOR (1)         → Cetak rapor Semester Ganjil
RAPOR II (Genap)  → Cetak rapor Semester Genap
```

---

### 2.2 Alur Perhitungan per Mata Pelajaran

Setiap sheet `FOR & SUM [MAPEL]` memiliki **2 jenis asesmen** yang digabung:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ASESMEN FORMATIF                             │
│  TP 1, TP 2, TP 3, ... TP 20  →  Rata-rata Formatif           │
│  (nilai per Tujuan Pembelajaran)                                │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                    ASESMEN SUMATIF                              │
│                                                                 │
│  ┌──────────────────┐   ┌────────────┐   ┌────────────────┐    │
│  │  Sumatif per LM  │   │    STS     │   │      SAS       │    │
│  │  LM1, LM2, ...   │   │ (Tengah    │   │  (Akhir        │    │
│  │  → Rata-rata LM  │   │  Semester) │   │   Semester)    │    │
│  └────────┬─────────┘   └─────┬──────┘   └──────┬─────────┘    │
│           └─────────────────┬─┘                 │              │
│                             ▼                   │              │
│          Nilai Sumatif = (Rata-rata LM + STS + SAS) / 3       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
              NILAI RAPOR = (Rata-rata Formatif + Nilai Sumatif) / 2
```

---

### 2.3 Formula Lengkap Nilai Rapor

#### Step 1 — Rata-rata Formatif (Asesmen Formatif per TP)

Setiap siswa dinilai per **Tujuan Pembelajaran (TP)**. Satu mata pelajaran bisa memiliki hingga 20 TP.

```
Rata-rata Formatif = AVERAGE(TP1, TP2, TP3, ..., TPn)
```

> **Contoh:** KHANZA (Agama) → TP: 90, 92, 94, 90, 87
> Rata-rata Formatif = (90+92+94+90+87) / 5 = **90.6**

---

#### Step 2 — Rata-rata Sumatif per Lingkup Materi (LM)

Setiap **Lingkup Materi (LM)** merupakan satu topik/bab besar yang diujikan secara sumatif. Satu mapel bisa memiliki hingga 9 LM.

```
Rata-rata LM = AVERAGE(LM1, LM2, LM3, ..., LMn)
```

> **Contoh:** KHANZA (Agama) → LM: 90, 87, 90, 92, 94
> Rata-rata LM = (90+87+90+92+94) / 5 = **90.6**

---

#### Step 3 — Nilai Sumatif Akhir (Gabungan LM + STS + SAS)

```
Nilai Sumatif = (Rata-rata LM + STS + SAS) / 3
```

| Komponen | Keterangan |
|---|---|
| **Rata-rata LM** | Rata-rata nilai sumatif per Lingkup Materi |
| **STS** | Sumatif Tengah Semester (setara UTS/PTS lama) |
| **SAS** | Sumatif Akhir Semester (setara UAS/PAS lama) |

> **Contoh:** KHANZA (Agama)
> STS = 78, SAS = 91, Rata-rata LM = 90.6
> Nilai Sumatif = (90.6 + 78 + 91) / 3 = **86.53**

**Verifikasi dengan siswa lain:**

| Siswa | Rata-rata LM | STS | SAS | Nilai Sumatif |
|---|---|---|---|---|
| KHANZA | 90.6 | 78 | 91 | (90.6+78+91)/3 = **86.53** |
| DIMAS | 82.6 | 78 | 80 | (82.6+78+80)/3 = **80.20** |
| M.ERLAN | 93.6 | 87 | 94 | (93.6+87+94)/3 = **91.53** |

---

#### Step 4 — Nilai Rapor Final

```
Nilai Rapor = (Rata-rata Formatif + Nilai Sumatif) / 2
```

> **Contoh:** KHANZA (Agama)
> = (90.6 + 86.53) / 2 = **88.57**

**Verifikasi:**

| Siswa | Rata-rata Formatif | Nilai Sumatif | Nilai Rapor |
|---|---|---|---|
| KHANZA | 90.6 | 86.53 | (90.6+86.53)/2 = **88.57** |
| DIMAS | 82.6 | 80.20 | (82.6+80.20)/2 = **81.40** |
| M.ERLAN | 95.2 | 91.53 | (95.2+91.53)/2 = **93.37** |

> ✅ Nilai-nilai ini sesuai persis dengan sheet `REKAP NILAI`.

---

### 2.4 Rekap Nilai & Peringkat

Sheet **REKAP NILAI** mengumpulkan Nilai Rapor dari semua sheet `FOR & SUM`:

```
Kolom per siswa:
  Pend. Agama | PPKn | B. Indonesia | Matematika | IPAS |
  Seni (Musik/Tari/Rupa/Teater) | PJOK | B. Inggris |
  Koading & KA | Mulok 1 | Mulok 2 | Mulok 3

JML         = SUM(semua nilai mapel yang terisi)
CAPAIAN KELAS = RANK siswa berdasarkan JML (peringkat kelas)
Rata-Rata   = JML / jumlah mapel yang terisi
```

---

### 2.5 Sistem Deskripsi Otomatis

Setiap siswa pada sheet `FOR & SUM [MAPEL]` mendapat **deskripsi naratif otomatis** yang terdiri dari 4 komponen:

| # | Deskripsi | Sumber Data | Template Kalimat |
|---|---|---|---|
| 1 | TP tertinggi (Formatif) | MAX(TP1..TP20) | `[Nama] menunjukkan penguasaan dalam [TP MAX]` |
| 2 | TP terendah (Formatif) | MIN(TP1..TP20) | `[Nama] membutuhkan penguatan dalam [TP MIN]` |
| 3 | LM terbaik (Sumatif) | MAX(LM1..LM9) | `[Nama] sangat menguasai dalam [LM MAX]` |
| 4 | LM perlu bimbingan | MIN(LM1..LM9) | `[Nama] perlu bimbingan dalam [LM MIN]` |

> **Contoh output untuk KHANZA (Agama):**
> - TP Max (94): *"KHANZA AFIQAH DINATA menunjukkan penguasaan dalam menyampaikan pesan pokok surah ad-Duha dengan percaya diri"*
> - TP Min (87): *"KHANZA AFIQAH DINATA membutuhkan penguatan dalam memahami pengertian asmaulhusna al-Afuw dengan tepat"*
> - LM Max (94 — Jasa Khulafaurrasyidin): *"KHANZA AFIQAH DINATA sangat menguasai dalam Jasa Khulafaurrasyidin"*
> - LM Min (78 — Tes): *"KHANZA AFIQAH DINATA perlu bimbingan dalam Tes"*

Deskripsi ini otomatis muncul di cetak rapor sheet `RAPOR (1)` menggunakan `VLOOKUP` atau referensi langsung ke sheet `FOR & SUM`.

---

## 3. File 2 — Analisis Kurmer (K13/Transisi)

### 3.1 Struktur Sheet

```
HOME              → Navigasi antar sheet
DATA              → Master data siswa + data sekolah

Per Mapel (UH/Ulangan Harian):
  ├── mtk         → Analisis soal UH Matematika
  ├── pkn         → Analisis soal UH PPKn
  ├── b.indo      → Analisis soal UH Bahasa Indonesia
  ├── ipas        → Analisis soal UH IPAS
  ├── B.sunda     → Analisis soal UH Bahasa Sunda
  ├── Seni        → Analisis soal UH Seni (SBDP)
  └── b.inggris   → Analisis soal UH Bahasa Inggris

ANALISIS PTS      → Analisis soal Penilaian Tengah Semester (multi-mapel)
REKAP U.H         → Rekap nilai rata-rata UH per mapel per siswa
REKAP NILAI PTS   → Rekap nilai PTS per mapel per siswa
RAPOT STS         → Cetak rapor tengah semester (per siswa)
ANALISIS PAS      → Analisis soal Penilaian Akhir Semester
REKAP NILAI PAS   → Rekap nilai PAS per mapel per siswa
RAPOT SEMESTER I  → Kalkulasi & cetak rapor semester penuh
```

---

### 3.2 Analisis Ulangan Harian per Mapel

Setiap sheet per mapel (contoh: `mtk`) menyimpan data **item-by-item** per ulangan:

#### Struktur Input
```
Kolom A   : No. Urut siswa
Kolom B   : NIS/NISN (referensi ke sheet DATA)
Kolom C   : Nama siswa (referensi ke sheet DATA)
Kolom D–W : Jawaban per nomor soal (20 soal)
             0 = salah, 1 = benar (PG)
             0–4 = skor isian/uraian
Kolom X   : NILAI
```

#### Formula Nilai UH
```
NILAI = SUM(D:W) / Skor_Maksimum × 100
```

**Contoh pada sheet `mtk` (Ulangan 1):**
- 20 soal (D-W)
- Bobot soal bervariasi: PG (bobot 1), isian (bobot 2-4)
- Skor Maksimum = **35**
- Formula: `=SUM(D7:W7) / 35 × 100`

**Contoh perhitungan siswa 4 (MATTHEW):**
```
Jawaban: 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,4
SUM     = 15 × 1 + 5 × 4 = 35
NILAI   = 35 / 35 × 100 = 100
```

> Setiap **ulangan** disimpan sebagai satu blok baris per siswa. Jika ada 7 UH dalam satu semester, terdapat 7 blok.

---

### 3.3 Analisis PTS / STS

Sheet **ANALISIS PTS** berisi analisis item untuk Penilaian Tengah Semester (PTS), yang dalam IKM disebut **STS (Sumatif Tengah Semester)**.

#### Komposisi Soal PTS
```
35 soal total, dibagi 3 kelompok bobot:

Soal No. 1–20  → Bobot 1 (Pilihan Ganda)
Soal No. 21–30 → Bobot 2 (Isian Singkat)
Soal No. 31–35 → Bobot 4 (Uraian / Essay)

Skor Maksimum = (20 × 1) + (10 × 2) + (5 × 4)
              = 20 + 20 + 20
              = 60
```

#### Formula Nilai PTS
```
NILAI_PTS = SUM(semua jawaban × bobotnya) / 60 × 100
```

Excel formula yang digunakan:
```excel
=SUM(D7:AL7) / 60 * 100
```

> Kolom D sampai AL = 35 kolom jawaban. Karena item sudah diinput sebagai nilai (bukan 0/1 murni), jawaban isian/uraian langsung diisi skor (mis. 0, 1, 2, 3, atau 4).

**Contoh siswa 4 (MATTHEW) pada PTS PKn:**
```
PG (soal 1-20):  1+1+1+1+1+1+1+1+1+0+1+0+0+1+1+1+0+0+1+1 = 15 × 1 = 15
Isian (soal 21-30): 2+2+2+2+1+2+2+2+2+0 = 17 × (nilai masing-masing)
Uraian (soal 31-35): 4+4+4+4+4 = 20

Total SUM = 15 + bobotnya + 20 → SUM/60*100
```

---

### 3.4 Rekap Nilai UH & PTS

#### Sheet: REKAP U.H
Mengumpulkan **rata-rata nilai UH** dari setiap sheet per mapel.

```
Kolom:
  D = PKn (rata-rata semua UH PKn dari sheet pkn)
  E = B.Ind
  F = MTK
  G = IPAS
  H = Seni Rupa (SBDP)
  I = B.Sunda
  J = B.Inggris

JUMLAH    = SUM(D:J)          ← total nilai 7 mapel
RATA-RATA = JUMLAH / 700 × 100  ← karena max per mapel = 100, max total = 700
```

> Nilai per mapel di REKAP U.H diambil menggunakan **ArrayFormula** yang meng-average semua baris UH di sheet mapel yang bersangkutan.

#### Sheet: REKAP NILAI PTS
Mengumpulkan nilai PTS semua mapel dari sheet ANALISIS PTS.

```
Kolom:
  D = PAI
  E = PKn
  F = B. Indonesia
  G = MTK
  H = IPAS
  I = Seni (SBDP)
  J = B.Sunda
  K = B.Inggris
  L = PJOK

JUMLAH    = SUM(D:L)          ← total 9 mapel
RATA-RATA = AVERAGE(D:L)      ← rata-rata 9 mapel (maks. 100 per mapel)
PERINGKAT = RANK(JUMLAH, range_seluruh_siswa)
```

---

### 3.5 Formula Nilai Rapor Semester I

Sheet **`RAPOT SEMESTER I`** menggabungkan **3 komponen** untuk menghasilkan Nilai Rapor:

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Ulangan Harian  │   │  Nilai STS/PTS  │   │  Nilai SAS/PAS  │
│   (Rata-rata UH) │   │  (Tengah Smt)   │   │  (Akhir Smt)    │
│   maks: 100      │   │   maks: 100     │   │   maks: 100     │
└────────┬─────────┘   └────────┬────────┘   └────────┬────────┘
         └──────────────────────┼────────────────────┘
                                ▼
             NILAI RAPOR = (UH + STS + SAS) / 300 × 100
```

#### Formula Excel yang digunakan:
```excel
Nilai Rapor PKn   = (D_UH + M_STS + V_SAS) / 300 * 100
Nilai Rapor B.Ind = (E_UH + N_STS + W_SAS) / 300 * 100
Nilai Rapor MTK   = (F_UH + O_STS + X_SAS) / 300 * 100
... dan seterusnya per mapel
```

Di mana:
- `D_UH` = kolom nilai UH untuk mapel tersebut
- `M_STS` = kolom nilai STS/PTS untuk mapel tersebut
- `V_SAS` = kolom nilai SAS/PAS untuk mapel tersebut
- **300** = total maksimum (3 komponen × maks 100 masing-masing)

#### Rekap Total Nilai Rapor
```excel
JUMLAH    = SUM(AE:AM)       ← total 9 Nilai Rapor mapel
RATA-RATA = JUMLAH / 900 * 100
            ← 900 = 9 mapel × maks 100
```

#### Sheet RAPOT STS (Rapor Tengah Semester)
Menggunakan `VLOOKUP` untuk mengambil data per nomor siswa:

```excel
Nama siswa = VLOOKUP(NoSiswa, 'REKAP NILAI PTS'!$A:$N, 3, 0)
NIS/NISN   = VLOOKUP(NoSiswa, 'REKAP NILAI PTS'!$A:$N, 2, 0)
Nilai PAI  = VLOOKUP(NoSiswa, 'REKAP NILAI PTS'!$A:$N, 4, 0)
Nilai PKn  = VLOOKUP(NoSiswa, 'REKAP NILAI PTS'!$A:$N, 5, 0)
... dst.
Rata-rata  = VLOOKUP(NoSiswa, 'REKAP NILAI PTS'!$A:$N, 14, 0)
```

Setiap mata pelajaran juga dibandingkan dengan **KKM (Kriteria Ketuntasan Minimal)**:

| Mapel | KKM |
|---|---|
| PAI | 75 |
| B. Indonesia | 75 |
| IPAS | 75 |
| Seni Rupa | 75 |
| PJOK | 75 |
| PPKn | 70 |
| Matematika | 70 |
| B. Sunda | 70 |
| B. Inggris | 70 |

---

## 4. Perbandingan Dua Sistem

| Aspek | File 1 (IKM) | File 2 (K13/Transisi) |
|---|---|---|
| **Unit penilaian terkecil** | Tujuan Pembelajaran (TP) | Nomor soal (item) |
| **Sumatif per topik** | Lingkup Materi (LM) | Ulangan Harian (UH) |
| **Ujian tengah semester** | STS (Sumatif Tengah Semester) | PTS (Penilaian Tengah Semester) |
| **Ujian akhir semester** | SAS (Sumatif Akhir Semester) | PAS (Penilaian Akhir Semester) |
| **Formula Nilai Rapor** | `(Formatif + Sumatif) / 2` | `(UH + PTS + PAS) / 300 × 100` |
| **Bobot formatif** | 50% | ~33% (1/3 dari 3 komponen) |
| **Bobot sumatif** | 50% (dibagi 3 komponen) | ~33% per komponen |
| **Deskripsi kualitatif** | ✅ Otomatis (per TP & LM) | ❌ Tidak ada |
| **KKM** | ❌ Tidak digunakan (IKM) | ✅ Ada per mapel |
| **Peringkat kelas** | ✅ CAPAIAN KELAS | ✅ PERINGKAT |
| **Analisis item soal** | ❌ (hanya nilai akhir) | ✅ Per nomor soal |

---

### Diagram Alur Lengkap — File 1 (IKM)

```
GURU INPUT (per siswa per mapel):
├── Nilai TP 1, TP 2, ... TP n (Formatif)
├── Nilai LM 1, LM 2, ... LM n (Sumatif per bab)
├── Nilai STS (ujian tengah semester)
└── Nilai SAS (ujian akhir semester)
         │
         ▼
FOR & SUM [MAPEL]:
├── Rata-rata Formatif = AVERAGE(TP1..TPn)
├── Rata-rata LM       = AVERAGE(LM1..LMn)
├── Nilai Sumatif      = (Rata-rata LM + STS + SAS) / 3
├── Nilai Rapor        = (Rata-rata Formatif + Nilai Sumatif) / 2
└── Deskripsi Auto     = lookup TP MAX/MIN dan LM MAX/MIN
         │
         ▼
REKAP NILAI:
├── Semua Nilai Rapor per mapel per siswa
├── JML = SUM semua mapel
└── CAPAIAN KELAS = RANK
         │
         ▼
RAPOR CETAK (RAPOR 1 / RAPOR II)
```

### Diagram Alur Lengkap — File 2 (K13/Transisi)

```
GURU INPUT:
├── Per UH: item jawaban 0/1 atau 0-4 per soal (sheet mtk, pkn, dll.)
├── Per PTS: item jawaban dengan bobot 1/2/4 (sheet ANALISIS PTS)
└── Per PAS: item jawaban (sheet ANALISIS PAS)
         │
         ▼
Perhitungan Nilai per Komponen:
├── Nilai UH   = SUM(jawaban × bobot) / max_score × 100  (per ulangan)
├── Nilai PTS  = SUM(jawaban × bobot) / 60 × 100
└── Nilai PAS  = SUM(jawaban × bobot) / max_score × 100
         │
         ▼
REKAP U.H  → Rata-rata semua UH per mapel per siswa
REKAP NILAI PTS → Nilai PTS per mapel per siswa
REKAP NILAI PAS → Nilai PAS per mapel per siswa
         │
         ▼
RAPOT SEMESTER I:
├── Nilai Rapor per mapel = (UH + PTS + PAS) / 300 × 100
├── JUMLAH = SUM semua Nilai Rapor
└── RATA-RATA = JUMLAH / 900 × 100
         │
         ▼
RAPOT STS (cetak per siswa via VLOOKUP dari REKAP NILAI PTS)
RAPOT SEMESTER I (cetak lengkap)
```

---

*Dokumen ini dibuat berdasarkan hasil analisis otomatis terhadap kedua file Excel.*
*SDN SegaraMakmur 01 — Kelas VI — TP 2025/2026 — Semester Ganjil*
