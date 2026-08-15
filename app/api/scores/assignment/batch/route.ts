import { NextResponse } from 'next/server';
import { db, withDbRetry } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { batchAssignmentScoreSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.classroomId) {
      return NextResponse.json({ error: 'Akses ditolak. Sesi kelas tidak ditemukan.' }, { status: 401 });
    }

    const body = await request.json();
    const validation = batchAssignmentScoreSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { subject_id, semester, label, recorded_at, scores } = validation.data;
    const dateObj = recorded_at ? new Date(recorded_at) : new Date();

    // Verify subject belongs to active classroom
    const subject = await withDbRetry(() =>
      db.subject.findFirst({
        where: { id: subject_id, classroom_id: session.classroomId! },
      })
    );

    if (!subject) {
      return NextResponse.json({ error: 'Mata pelajaran tidak ditemukan.' }, { status: 404 });
    }

    // Process batch insertion inside a transaction
    const results = await withDbRetry(() =>
      db.$transaction(
        scores.map((item) => {
          const isPending = item.is_pending || item.score === null || item.score === undefined;
          return db.assignmentScore.create({
            data: {
              student_id: item.student_id,
              subject_id,
              semester,
              label,
              score: isPending ? null : item.score,
              is_pending: isPending,
              recorded_at: dateObj,
            },
            include: {
              student: true,
              subject: true,
            },
          });
        })
      )
    );

    const filledCount = results.filter((r) => !r.is_pending).length;
    const pendingCount = results.filter((r) => r.is_pending).length;

    return NextResponse.json({
      success: true,
      message: `Berhasil menyimpan ${filledCount} nilai tugas.`,
      savedScores: results,
      count: results.length,
      filledCount,
      pendingCount,
    });
  } catch (error: any) {
    console.error('Error saving batch assignment scores:', error);
    return NextResponse.json({ error: error.message || 'Gagal menyimpan nilai tugas.' }, { status: 500 });
  }
}
