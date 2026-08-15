export interface Student {
  id: string;
  classroom_id: string;
  nis: string;
  nisn: string | null;
  full_name: string;
  gender: string | null;
  created_at: string | Date;
}

export interface Subject {
  id: string;
  classroom_id: string;
  name: string;
  created_at: string | Date;
}

export interface AssignmentScore {
  id: string;
  student_id: string;
  subject_id: string;
  semester: 'I' | 'II' | string;
  label: string;
  score: number;
  recorded_at: string | Date;
  created_at: string | Date;
  student?: Student;
  subject?: Subject;
}

export interface DailyTestScore {
  id: string;
  student_id: string;
  subject_id: string;
  semester: 'I' | 'II' | string;
  label: string;
  score: number;
  multiple_choice_count?: number | null;
  essay_count?: number | null;
  recorded_at: string | Date;
  created_at: string | Date;
  student?: Student;
  subject?: Subject;
}
