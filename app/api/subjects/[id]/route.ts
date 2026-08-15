import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { subjectInputSchema } from '@/lib/validators';

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
    const validation = subjectInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const updated = await db.subject.update({
      where: {
        id,
        classroom_id: session.classroomId,
      },
      data: { name: validation.data.name },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Gagal memperbarui mata pelajaran' }, { status: 500 });
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
    await db.subject.delete({
      where: {
        id,
        classroom_id: session.classroomId,
      },
    });

    return NextResponse.json({ message: 'Mata pelajaran berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: 'Gagal menghapus mata pelajaran' }, { status: 500 });
  }
}
