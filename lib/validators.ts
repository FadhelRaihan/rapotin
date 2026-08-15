import { z } from 'zod';

/**
 * Regex Karakter Valid
 */
const LABEL_REGEX = /^[a-zA-Z0-9\s\-\_\.\,\(\)\:\/]+$/;
const NAME_REGEX = /^[a-zA-Z0-9\s\.\,\'\`\-]+$/;
const NIS_REGEX = /^[a-zA-Z0-9\-\/]+$/;
const ALPHANUM_REGEX = /^[a-zA-Z0-9]+$/;

/**
 * 1. Validator Sesi Login & PIN Akses Guru
 */
export const pinLoginSchema = z.object({
  pin: z
    .string()
    .min(1, 'PIN tidak boleh kosong')
    .length(6, 'PIN harus berupa 6 digit angka')
    .regex(/^\d+$/, 'PIN hanya boleh berisi angka'),
});

/**
 * 2. Validator Data Siswa (Single & Bulk)
 */
export const studentInputSchema = z.object({
  nis: z
    .string()
    .trim()
    .min(3, 'NIS minimal 3 karakter')
    .max(30, 'NIS maksimal 30 karakter')
    .regex(NIS_REGEX, 'NIS hanya boleh berisi huruf, angka, minus (-), atau garis miring (/)'),
  nisn: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (val) => !val || (val.length >= 8 && val.length <= 20 && ALPHANUM_REGEX.test(val)),
      { message: 'NISN harus berupa 8-20 karakter alfanumerik jika diisi' }
    ),
  full_name: z
    .string()
    .trim()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter')
    .regex(NAME_REGEX, 'Nama mengandung simbol tidak valid'),
  gender: z.enum(['L', 'P'], {
    errorMap: () => ({ message: 'Jenis kelamin harus L (Laki-Laki) atau P (Perempuan)' }),
  }),
});

export const bulkStudentInputSchema = z.object({
  students: z
    .array(studentInputSchema)
    .min(1, 'Harap isi setidaknya satu data siswa yang lengkap'),
});

/**
 * 3. Validator Mata Pelajaran (Subject)
 */
export const subjectInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama mata pelajaran minimal 2 karakter')
    .max(100, 'Nama mata pelajaran maksimal 100 karakter'),
});

/**
 * 4. Validator Nilai Tugas (Assignment Batch & Single)
 */
export const batchAssignmentScoreSchema = z.object({
  subject_id: z.string().min(1, 'Harap pilih mata pelajaran'),
  semester: z.enum(['I', 'II'], {
    errorMap: () => ({ message: 'Semester harus I atau II' }),
  }),
  label: z
    .string()
    .trim()
    .min(2, 'Nama / Label tugas minimal 2 karakter')
    .max(100, 'Nama / Label tugas maksimal 100 karakter')
    .regex(LABEL_REGEX, 'Label tidak boleh berisi karakter khusus tak valid (seperti ";", "[", "]")'),
  recorded_at: z.string().optional(),
  scores: z
    .array(
      z.object({
        student_id: z.string().min(1, 'ID siswa tidak valid'),
        score: z
          .number({ invalid_type_error: 'Nilai harus berupa angka' })
          .min(0, 'Nilai minimal adalah 0')
          .max(100, 'Nilai maksimal adalah 100')
          .nullable()
          .optional(),
        is_pending: z.boolean().optional(),
      })
    )
    .min(1, 'Harap sertakan data siswa'),
});

/**
 * 5. Validator Nilai Ulangan Harian (Daily Test Batch)
 */
export const batchDailyTestScoreSchema = z.object({
  subject_id: z.string().min(1, 'Harap pilih mata pelajaran'),
  semester: z.enum(['I', 'II'], {
    errorMap: () => ({ message: 'Semester harus I atau II' }),
  }),
  label: z
    .string()
    .trim()
    .min(2, 'Nama / Label UH minimal 2 karakter')
    .max(100, 'Nama / Label UH maksimal 100 karakter')
    .regex(LABEL_REGEX, 'Label tidak boleh berisi karakter khusus tak valid (seperti ";", "[", "]")'),
  multiple_choice_count: z
    .number({ invalid_type_error: 'Jumlah PG harus angka' })
    .min(0, 'Jumlah soal tidak boleh negatif')
    .max(200, 'Maksimal 200 soal PG')
    .nullable()
    .optional(),
  essay_count: z
    .number({ invalid_type_error: 'Jumlah Essay harus angka' })
    .min(0, 'Jumlah soal tidak boleh negatif')
    .max(100, 'Maksimal 100 soal Essay')
    .nullable()
    .optional(),
  recorded_at: z.string().optional(),
  scores: z
    .array(
      z.object({
        student_id: z.string().min(1, 'ID siswa tidak valid'),
        score: z
          .number({ invalid_type_error: 'Nilai harus berupa angka' })
          .min(0, 'Nilai minimal adalah 0')
          .max(100, 'Nilai maksimal adalah 100')
          .nullable()
          .optional(),
        is_pending: z.boolean().optional(),
      })
    )
    .min(1, 'Harap sertakan data siswa'),
});

/**
 * 6. Validator Update Single Score (Nilai Susulan)
 */
export const updateSingleScoreSchema = z.object({
  score: z
    .number({ invalid_type_error: 'Nilai harus berupa angka' })
    .min(0, 'Nilai minimal adalah 0')
    .max(100, 'Nilai maksimal adalah 100'),
});

/**
 * 7. Real-Time Field Validator Functions (Untuk Frontend Instant Error)
 */
export function validateTaskLabel(val: string): string | null {
  const trimmed = val.trim();
  if (!trimmed) return 'Nama / Label tidak boleh kosong';
  if (trimmed.length < 2) return 'Nama / Label minimal 2 karakter';
  if (trimmed.length > 100) return 'Nama / Label maksimal 100 karakter';
  if (!LABEL_REGEX.test(trimmed)) return 'Tidak boleh mengandung simbol tak valid (seperti ";", "[", "]")';
  return null;
}

export function validateScoreValue(val: string): string | null {
  if (val.trim() === '') return null; // Kosong diizinkan (untuk status susulan)
  const num = Number(val);
  if (isNaN(num)) return 'Harus berupa angka 0 - 100';
  if (num < 0) return 'Nilai minimal adalah 0';
  if (num > 100) return 'Nilai maksimal adalah 100';
  return null;
}

export function validateStudentName(val: string): string | null {
  const trimmed = val.trim();
  if (!trimmed) return 'Nama tidak boleh kosong';
  if (trimmed.length < 2) return 'Nama minimal 2 karakter';
  if (trimmed.length > 100) return 'Nama maksimal 100 karakter';
  if (!NAME_REGEX.test(trimmed)) return 'Nama mengandung karakter simbol tidak valid';
  return null;
}

export function validateNis(val: string): string | null {
  const trimmed = val.trim();
  if (!trimmed) return 'NIS tidak boleh kosong';
  if (trimmed.length < 3) return 'NIS minimal 3 karakter';
  if (trimmed.length > 30) return 'NIS maksimal 30 karakter';
  if (!NIS_REGEX.test(trimmed)) return 'NIS hanya boleh berisi huruf, angka, (-), atau (/)';
  return null;
}
