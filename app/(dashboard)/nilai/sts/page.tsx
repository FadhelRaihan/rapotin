import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { MidtermScoreForm } from '@/components/scores/midterm-score-form';

export default async function MidtermPage() {
  const session = await getSession();
  if (!session?.classroomId) return null;
  const [students, subjects, scores] = await Promise.all([
    db.student.findMany({ where: { classroom_id: session.classroomId }, orderBy: { full_name: 'asc' }, select: { id: true, full_name: true, nis: true } }),
    db.subject.findMany({ where: { classroom_id: session.classroomId }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.midtermScore.findMany({ where: { student: { classroom_id: session.classroomId } }, include: { student: true, subject: true }, orderBy: { recorded_at: 'desc' } }),
  ]);
  const initialScores = scores.map(score => ({ ...score, label: 'STS', score: score.score === null ? null : Number(score.score), recorded_at: score.recorded_at.toISOString() }));
  return <MidtermScoreForm students={students} subjects={subjects} initialScores={initialScores} />;
}
