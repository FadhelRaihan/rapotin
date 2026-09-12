import { z } from 'zod';

export const midtermFields = z.object({
  score: z.number().min(0).max(100).nullable(),
  is_pending: z.boolean().optional(),
  multiple_choice_count: z.number().int().min(0).max(200),
  short_answer_count: z.number().int().min(0).max(100).optional(),
  essay_count: z.number().int().min(0).max(100),
  recorded_at: z.string().date('Tanggal STS tidak valid'),
});

export const midtermBatchSchema = midtermFields.omit({ score: true, is_pending: true }).extend({
  short_answer_count: z.number().int().min(0).max(100).default(0),
  subject_id: z.string().uuid(),
  semester: z.enum(['I', 'II']),
  scores: z.array(midtermFields.pick({ score: true, is_pending: true }).extend({
    student_id: z.string().uuid(),
  })).min(1).max(200).refine(items => new Set(items.map(item => item.student_id)).size === items.length, 'Siswa duplikat dalam batch'),
});
