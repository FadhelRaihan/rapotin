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
      })
    );

    const subjects = await withDbRetry(() =>
      db.subject.findMany({
        where: { classroom_id: classroomId },
      })
    );

    const assignmentScores = await withDbRetry(() =>
      db.assignmentScore.findMany({
        where: {
          student: { classroom_id: classroomId },
          semester,
        },
        include: { student: true, subject: true },
        orderBy: { recorded_at: 'desc' },
      })
    );

    const dailyTestScores = await withDbRetry(() =>
      db.dailyTestScore.findMany({
        where: {
          student: { classroom_id: classroomId },
          semester,
        },
        include: { student: true, subject: true },
        orderBy: { recorded_at: 'desc' },
      })
    );

    // 1. Overall Metrics
    const totalStudents = students.length;
    const totalSubjects = subjects.length;
    const validAssignments = assignmentScores.filter((a) => !a.is_pending && a.score !== null);
    const validDailyTests = dailyTestScores.filter((d) => !d.is_pending && d.score !== null);

    const totalScoresRecorded = validAssignments.length + validDailyTests.length;

    const allScoresNum = [
      ...validAssignments.map((a) => Number(a.score)),
      ...validDailyTests.map((d) => Number(d.score)),
    ];

    const classAverage =
      allScoresNum.length > 0
        ? allScoresNum.reduce((acc, curr) => acc + curr, 0) / allScoresNum.length
        : 0;

    // 2. Subject Progress Stats
    const subjectProgress = subjects.map((subject) => {
      const subAssignments = validAssignments.filter((a) => a.subject_id === subject.id);
      const subDailyTests = validDailyTests.filter((d) => d.subject_id === subject.id);

      const assignmentAvg =
        subAssignments.length > 0
          ? subAssignments.reduce((acc, c) => acc + Number(c.score), 0) / subAssignments.length
          : 0;

      const dailyTestAvg =
        subDailyTests.length > 0
          ? subDailyTests.reduce((acc, c) => acc + Number(c.score), 0) / subDailyTests.length
          : 0;

      let overallAvg = 0;
      if (assignmentAvg > 0 && dailyTestAvg > 0) overallAvg = (assignmentAvg + dailyTestAvg) / 2;
      else if (assignmentAvg > 0) overallAvg = assignmentAvg;
      else if (dailyTestAvg > 0) overallAvg = dailyTestAvg;

      return {
        subjectName: subject.name,
        assignmentAvg: Math.round(assignmentAvg * 10) / 10,
        dailyTestAvg: Math.round(dailyTestAvg * 10) / 10,
        overallAvg: Math.round(overallAvg * 10) / 10,
      };
    });

    // 3. Student Grade Distribution & Top Performing Students
    const studentAverages = students.map((student) => {
      const stValidAsg = validAssignments.filter((a) => a.student_id === student.id);
      const stValidUh = validDailyTests.filter((d) => d.student_id === student.id);

      // Pending makeup items
      const stPendingAsg = assignmentScores.filter((a) => a.student_id === student.id && a.is_pending);
      const stPendingUh = dailyTestScores.filter((d) => d.student_id === student.id && d.is_pending);

      const pendingItems = [
        ...stPendingAsg.map((a) => ({
          type: 'Tugas',
          subjectName: a.subject.name,
          label: a.label,
        })),
        ...stPendingUh.map((d) => ({
          type: 'UH',
          subjectName: d.subject.name,
          label: d.label,
        })),
      ];

      const stScores = [
        ...stValidAsg.map((a) => Number(a.score)),
        ...stValidUh.map((d) => Number(d.score)),
      ];

      const avg =
        stScores.length > 0
          ? stScores.reduce((acc, curr) => acc + curr, 0) / stScores.length
          : 0;

      return {
        studentId: student.id,
        fullName: student.full_name,
        nis: student.nis,
        recordedCount: stScores.length,
        missingCount: pendingItems.length,
        pendingItems,
        averageScore: Math.round(avg * 10) / 10,
      };
    });

    // Grade Distribution Categories:
    let sangatBaik = 0;
    let baik = 0;
    let cukup = 0;
    let perluBimbingan = 0;

    studentAverages.forEach((st) => {
      if (st.averageScore >= 85) sangatBaik++;
      else if (st.averageScore >= 75) baik++;
      else if (st.averageScore >= 65) cukup++;
      else perluBimbingan++;
    });

    const gradeDistribution = [
      { name: 'Sangat Baik (≥85)', count: sangatBaik, color: '#16A34A' },
      { name: 'Baik (75-84)', count: baik, color: '#7C3AED' },
      { name: 'Cukup (65-74)', count: cukup, color: '#D97706' },
      { name: 'Perlu Bimbingan (<65)', count: perluBimbingan, color: '#DC2626' },
    ];

    // Top 5 Performing Students
    const topStudents = [...studentAverages]
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);

    // Students Needing Attention: ONLY students with missingCount > 0 (highest missingCount first)
    const studentsNeedingAttention = studentAverages
      .filter((st) => st.missingCount > 0)
      .sort((a, b) => {
        if (b.missingCount !== a.missingCount) {
          return b.missingCount - a.missingCount;
        }
        return a.averageScore - b.averageScore;
      })
      .slice(0, 5);

    // 4. Recent Activities (Last 5 records with valid scores)
    const recentActivities = [
      ...validAssignments.map((a) => ({
        id: a.id,
        type: 'Tugas',
        label: a.label,
        studentName: a.student.full_name,
        subjectName: a.subject.name,
        score: Number(a.score),
        date: a.recorded_at,
      })),
      ...validDailyTests.map((d) => ({
        id: d.id,
        type: 'Ulangan Harian',
        label: d.label,
        studentName: d.student.full_name,
        subjectName: d.subject.name,
        score: Number(d.score),
        date: d.recorded_at,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return NextResponse.json({
      summary: {
        totalStudents,
        totalSubjects,
        classAverage: Math.round(classAverage * 10) / 10,
        totalScoresRecorded,
      },
      subjectProgress,
      gradeDistribution,
      topStudents,
      studentsNeedingAttention,
      recentActivities,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Gagal memuat statistik dashboard' }, { status: 500 });
  }
}
