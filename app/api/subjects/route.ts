import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { subjectInputSchema } from '@/lib/validators';

export async function GET() {
  const session = await getSession();
  if (!session || !session.classroomId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subjects = await db.subject.findMany({
    where: { classroom_id: session.classroomId },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ data: subjects });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.classroomId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = subjectInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { name } = validation.data;

    const subject = await db.subject.create({
      data: {
        classroom_id: session.classroomId,
        name,
      },
    });

    return NextResponse.json({ data: subject }, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Gagal menambahkan mata pelajaran' }, { status: 500 });
  }
}
