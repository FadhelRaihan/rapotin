import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { ClassroomSelector } from '@/components/classrooms/classroom-selector';

export default async function KelasPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const teacher = await db.teacher.findUnique({
    where: { id: session.teacherId },
    include: { school: true },
  });

  const teacherName = teacher?.name || session.name || 'Guru Kelas';
  const schoolName = teacher?.school?.name || 'SD Negeri Segara Makmur 01';

  return <ClassroomSelector teacherName={teacherName} schoolName={schoolName} />;
}
