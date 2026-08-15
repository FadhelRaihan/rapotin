import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { AssignmentScoreForm } from '@/components/scores/assignment-score-form';

export default async function AssignmentScoresPage() {
  const session = await getSession();
  if (!session || !session.classroomId) return null;

  const students = await db.student.findMany({
    where: { classroom_id: session.classroomId },
    orderBy: { full_name: 'asc' },
  });

  const subjects = await db.subject.findMany({
    where: { classroom_id: session.classroomId },
    orderBy: { name: 'asc' },
  });

  const scores = await db.assignmentScore.findMany({
    where: {
      student: { classroom_id: session.classroomId },
    },
    include: {
      student: true,
      subject: true,
    },
    orderBy: { recorded_at: 'desc' },
  });

  const formattedScores = scores.map((s) => ({
    ...s,
    score: Number(s.score),
    recorded_at: s.recorded_at.toISOString(),
  }));

  return (
    <AssignmentScoreForm
      students={students}
      subjects={subjects}
      initialScores={formattedScores}
    />
  );
}
