import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { bulkStudentSchema } from '@/lib/validations/student.schema';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.classroomId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const classroomId = session.classroomId;

  try {
    const body = await request.json();
    const validation = bulkStudentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { students } = validation.data;

    // Filter out rows with empty NIS or full_name
    const validStudents = students.filter((s) => s.nis.trim() && s.full_name.trim());

    if (validStudents.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data siswa valid untuk disimpan' }, { status: 400 });
    }

    const created = await db.student.createMany({
      data: validStudents.map((s) => ({
        classroom_id: classroomId,
        nis: s.nis.trim(),
        nisn: s.nisn?.trim() || null,
        full_name: s.full_name.trim(),
        gender: s.gender || null,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      { message: `Berhasil menambahkan ${created.count} data siswa.`, count: created.count },
      { status: 201 }
    );
  } catch (error) {
    console.error('Bulk student error:', error);
    return NextResponse.json({ error: 'Gagal menambahkan data siswa secara masal' }, { status: 500 });
  }
}
