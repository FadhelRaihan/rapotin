import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const createClassroomSchema = z.object({
  name: z.string().min(1, 'Nama kelas wajib diisi').max(50, 'Nama kelas terlalu panjang'),
  academic_year: z.string().min(1, 'Tahun ajaran wajib diisi').max(20, 'Tahun ajaran terlalu panjang'),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const classrooms = await db.classroom.findMany({
      where: { teacher_id: session.teacherId },
      include: {
        school: true,
        _count: {
          select: { students: true, subjects: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ data: classrooms });
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    return NextResponse.json({ error: 'Gagal mengambil data kelas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = createClassroomSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { name, academic_year } = validation.data;

    const newClassroom = await db.classroom.create({
      data: {
        school_id: session.schoolId,
        teacher_id: session.teacherId,
        name,
        academic_year,
      },
      include: {
        _count: {
          select: { students: true, subjects: true },
        },
      },
    });

    return NextResponse.json({ data: newClassroom }, { status: 201 });
  } catch (error) {
    console.error('Error creating classroom:', error);
    return NextResponse.json({ error: 'Gagal membuat kelas baru' }, { status: 500 });
  }
}
