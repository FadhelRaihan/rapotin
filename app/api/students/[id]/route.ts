import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { studentSchema } from '@/lib/validations/student.schema';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !session.classroomId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const validation = studentSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const updated = await db.student.update({
      where: {
        id,
        classroom_id: session.classroomId,
      },
      data: validation.data,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Gagal memperbarui data siswa' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !session.classroomId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await db.student.delete({
      where: {
        id,
        classroom_id: session.classroomId,
      },
    });

    return NextResponse.json({ message: 'Siswa berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Gagal menghapus data siswa' }, { status: 500 });
  }
}
