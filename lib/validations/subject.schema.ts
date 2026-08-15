import { z } from 'zod';

export const subjectSchema = z.object({
  name: z.string().min(1, 'Nama mata pelajaran wajib diisi').max(100, 'Nama mata pelajaran terlalu panjang'),
});

export type SubjectInput = z.infer<typeof subjectSchema>;
