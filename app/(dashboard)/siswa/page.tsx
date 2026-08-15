import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { StudentTable } from '@/components/students/student-table';

export default async function SiswaPage() {
  const session = await getSession();
  if (!session || !session.classroomId) return null;

  const students = await db.student.findMany({
    where: { classroom_id: session.classroomId },
    orderBy: { full_name: 'asc' },
  });

  return <StudentTable initialStudents={students} />;
}
