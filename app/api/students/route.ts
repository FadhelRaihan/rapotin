import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { studentSchema } from '@/lib/validations/student.schema';

export async function GET() {
  const session = await getSession();
  if (!session || !session.classroomId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const students = await db.student.findMany({
    where: { classroom_id: session.classroomId },
    orderBy: { full_name: 'asc' },
  });

  return NextResponse.json({ data: students });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.classroomId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = studentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { nis, nisn, full_name, gender } = validation.data;

    const student = await db.student.create({
      data: {
        classroom_id: session.classroomId,
        nis,
        nisn: nisn || null,
        full_name,
        gender: gender || null,
      },
    });

    return NextResponse.json({ data: student }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Gagal menambahkan data siswa' }, { status: 500 });
  }
}
