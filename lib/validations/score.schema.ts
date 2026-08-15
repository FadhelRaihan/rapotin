import { z } from 'zod';

export const assignmentScoreSchema = z.object({
  student_id: z.string().min(1, 'Siswa wajib dipilih'),
  subject_id: z.string().min(1, 'Mata pelajaran wajib dipilih'),
  semester: z.enum(['I', 'II'], {
    errorMap: () => ({ message: 'Semester harus I atau II' }),
  }),
  label: z.string().min(1, 'Nama/Label tugas wajib diisi').max(100, 'Label terlalu panjang'),
  score: z.number().min(0, 'Nilai minimal 0').max(100, 'Nilai maksimal 100'),
  recorded_at: z.string().min(1, 'Tanggal wajib diisi'),
});

export const dailyTestScoreSchema = z.object({
  student_id: z.string().min(1, 'Siswa wajib dipilih'),
  subject_id: z.string().min(1, 'Mata pelajaran wajib dipilih'),
  semester: z.enum(['I', 'II'], {
    errorMap: () => ({ message: 'Semester harus I atau II' }),
  }),
  label: z.string().min(1, 'Nama/Label ulangan harian wajib diisi').max(100, 'Label terlalu panjang'),
  score: z.number().min(0, 'Nilai minimal 0').max(100, 'Nilai maksimal 100'),
  multiple_choice_count: z.number().min(0).optional().nullable(),
  essay_count: z.number().min(0).optional().nullable(),
  recorded_at: z.string().min(1, 'Tanggal wajib diisi'),
});

export type AssignmentScoreInput = z.infer<typeof assignmentScoreSchema>;
export type DailyTestScoreInput = z.infer<typeof dailyTestScoreSchema>;
