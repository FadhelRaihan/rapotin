import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { ReportView } from '@/components/report/report-view';
import { overallScore } from '@/lib/scores';

export default async function RaporPage() {
  const session = await getSession();
  if (!session || !session.classroomId) {
    redirect('/kelas');
  }

  const classroomId = session.classroomId;

  const [classroom, students, subjects, assignments, dailyTests, midterms, finals] =
    await Promise.all([
      db.classroom.findUnique({
        where: { id: classroomId },
        include: { school: true, teacher: true },
      }),
      db.student.findMany({
        where: { classroom_id: classroomId },
        orderBy: { full_name: 'asc' },
      }),
      db.subject.findMany({
        where: { classroom_id: classroomId },
        orderBy: { name: 'asc' },
      }),
      db.assignmentScore.findMany({
        where: { student: { classroom_id: classroomId }, semester: 'I' },
      }),
      db.dailyTestScore.findMany({
        where: { student: { classroom_id: classroomId }, semester: 'I' },
      }),
      db.midtermScore.findMany({
        where: { student: { classroom_id: classroomId }, semester: 'I' },
      }),
      db.finalScore.findMany({
        where: { student: { classroom_id: classroomId }, semester: 'I' },
      }),
    ]);

  if (!classroom) {
    redirect('/kelas');
  }

  // Pre-calculate recap finalScore & midtermScore for Semester I
  const initialRecapScores = students.map((student) => {
    const studentScores: Record<string, { finalScore: number; midtermScore: number | null }> = {};

    subjects.forEach((subject) => {
      const studAsgs = assignments.filter(
        (a) => a.student_id === student.id && a.subject_id === subject.id && !a.is_pending && a.score !== null
      );
      const studUhs = dailyTests.filter(
        (d) => d.student_id === student.id && d.subject_id === subject.id && !d.is_pending && d.score !== null
      );
      const studMidterm = midterms.find(
        (m) => m.student_id === student.id && m.subject_id === subject.id && !m.is_pending && m.score !== null
      );
      const studFinal = finals.find(
        (f) => f.student_id === student.id && f.subject_id === subject.id && !f.is_pending && f.score !== null
      );

      const hasAnyScore =
        studAsgs.length > 0 || studUhs.length > 0 || Boolean(studMidterm) || Boolean(studFinal);

      const asgAvg = studAsgs.length > 0 ? studAsgs.reduce((a, b) => a + Number(b.score), 0) / studAsgs.length : 0;
      const uhAvg = studUhs.length > 0 ? studUhs.reduce((a, b) => a + Number(b.score), 0) / studUhs.length : 0;
      const midScore = studMidterm ? Number(studMidterm.score) : 0;
      const finScore = studFinal ? Number(studFinal.score) : 0;

      const finalScore = hasAnyScore ? overallScore(asgAvg, uhAvg, midScore, finScore) : 0;

      studentScores[subject.id] = {
        finalScore: Math.round(finalScore * 10) / 10,
        midtermScore: studMidterm ? Number(studMidterm.score) : null,
      };
    });

    return {
      studentId: student.id,
      subjectScores: studentScores,
    };
  });

  return (
    <ReportView
      students={students}
      subjects={subjects}
      classroom={{
        id: classroom.id,
        name: classroom.name,
        academic_year: classroom.academic_year,
      }}
      school={{
        name: classroom.school?.name || 'SD Negeri Segara Makmur 01',
        address: classroom.school?.address,
        npsn: classroom.school?.npsn,
      }}
      teacher={{
        name: classroom.teacher?.name || session.name || 'Guru Kelas',
        nip: classroom.teacher?.nip,
      }}
      initialRecapScores={initialRecapScores}
    />
  );
}

