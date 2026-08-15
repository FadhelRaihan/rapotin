import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { assignmentScoreSchema } from '@/lib/validations/score.schema';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const validation = assignmentScoreSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const dataToUpdate: any = { ...validation.data };
    if (dataToUpdate.recorded_at) {
      dataToUpdate.recorded_at = new Date(dataToUpdate.recorded_at);
    }

    const updated = await db.assignmentScore.update({
      where: { id },
      data: dataToUpdate,
      include: { student: true, subject: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error updating assignment score:', error);
    return NextResponse.json({ error: 'Gagal memperbarui nilai tugas' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await db.assignmentScore.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Nilai tugas berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting assignment score:', error);
    return NextResponse.json({ error: 'Gagal menghapus nilai tugas' }, { status: 500 });
  }
}
