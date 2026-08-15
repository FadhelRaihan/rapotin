import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { assignmentScoreSchema } from '@/lib/validations/score.schema';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('student_id');
  const subjectId = searchParams.get('subject_id');
  const semester = searchParams.get('semester');

  const where: any = {
    student: {
      classroom_id: session.classroomId,
    },
  };

  if (studentId) where.student_id = studentId;
  if (subjectId) where.subject_id = subjectId;
  if (semester) where.semester = semester;

  const scores = await db.assignmentScore.findMany({
    where,
    include: {
      student: true,
      subject: true,
    },
    orderBy: { recorded_at: 'desc' },
  });

  return NextResponse.json({ data: scores });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = assignmentScoreSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { student_id, subject_id, semester, label, score, recorded_at } = validation.data;

    const newScore = await db.assignmentScore.create({
      data: {
        student_id,
        subject_id,
        semester,
        label,
        score,
        recorded_at: new Date(recorded_at),
      },
      include: {
        student: true,
        subject: true,
      },
    });

    return NextResponse.json({ data: newScore }, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment score:', error);
    return NextResponse.json({ error: 'Gagal mencatat nilai tugas' }, { status: 500 });
  }
}
