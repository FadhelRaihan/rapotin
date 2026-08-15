import { z } from 'zod';
import { studentInputSchema, bulkStudentInputSchema } from '@/lib/validators';

export const studentSchema = studentInputSchema;
export const bulkStudentSchema = bulkStudentInputSchema;

export type StudentInput = z.infer<typeof studentSchema>;
export type BulkStudentInput = z.infer<typeof bulkStudentSchema>;
