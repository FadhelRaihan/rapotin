import { NextResponse } from 'next/server';
import { db, withDbRetry } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !session.classroomId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const classroomId = session.classroomId;
  const { searchParams } = new URL(request.url);
  const semester = searchParams.get('semester') || 'I';

  try {
    const students = await withDbRetry(() =>
      db.student.findMany({
        where: { classroom_id: classroomId },
        orderBy: { full_name: 'asc' },
      })
    );

    const subjects = await withDbRetry(() =>
      db.subject.findMany({
        where: { classroom_id: classroomId },
        orderBy: { name: 'asc' },
      })
    );

    const assignmentScores = await withDbRetry(() =>
      db.assignmentScore.findMany({
        where: {
          student: { classroom_id: classroomId },
          semester,
        },
        orderBy: { recorded_at: 'asc' },
      })
    );

    const dailyTestScores = await withDbRetry(() =>
      db.dailyTestScore.findMany({
        where: {
          student: { classroom_id: classroomId },
          semester,
        },
        orderBy: { recorded_at: 'asc' },
      })
    );

    const recapData = students.map((student) => {
      const studentSubjectScores: Record<
        string,
        { assignmentAvg: number; dailyTestAvg: number; finalScore: number }
      > = {};

      let totalFinalScores = 0;
      let subjectCountWithScores = 0;

      subjects.forEach((subject) => {
        const studentAssignments = assignmentScores.filter(
          (a) => a.student_id === student.id && a.subject_id === subject.id
        );
        const studentDailyTests = dailyTestScores.filter(
          (d) => d.student_id === student.id && d.subject_id === subject.id
        );

        const assignmentAvg =
          studentAssignments.length > 0
            ? studentAssignments.reduce((acc, curr) => acc + Number(curr.score), 0) /
              studentAssignments.length
            : 0;

        const dailyTestAvg =
          studentDailyTests.length > 0
            ? studentDailyTests.reduce((acc, curr) => acc + Number(curr.score), 0) /
              studentDailyTests.length
            : 0;

        let finalScore = 0;
        if (assignmentAvg > 0 && dailyTestAvg > 0) {
          finalScore = (assignmentAvg + dailyTestAvg) / 2;
        } else if (assignmentAvg > 0) {
          finalScore = assignmentAvg;
        } else if (dailyTestAvg > 0) {
          finalScore = dailyTestAvg;
        }

        if (finalScore > 0) {
          totalFinalScores += finalScore;
          subjectCountWithScores++;
        }

        studentSubjectScores[subject.id] = {
          assignmentAvg: Math.round(assignmentAvg * 10) / 10,
          dailyTestAvg: Math.round(dailyTestAvg * 10) / 10,
          finalScore: Math.round(finalScore * 10) / 10,
        };
      });

      const overallAverage =
        subjectCountWithScores > 0 ? totalFinalScores / subjectCountWithScores : 0;

      return {
        student,
        subjectScores: studentSubjectScores,
        overallAverage: Math.round(overallAverage * 10) / 10,
      };
    });

    return NextResponse.json({
      semester,
      subjects,
      assignments: assignmentScores,
      dailyTests: dailyTestScores,
      recap: recapData,
    });
  } catch (error) {
    console.error('Error calculating recap:', error);
    return NextResponse.json({ error: 'Gagal memproses rekapitulasi nilai' }, { status: 500 });
  }
}
