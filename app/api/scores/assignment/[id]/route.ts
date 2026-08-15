import { NextResponse } from 'next/server';
import { db, withDbRetry } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { updateSingleScoreSchema } from '@/lib/validators';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.classroomId) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateSingleScoreSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const updated = await withDbRetry(() =>
      db.assignmentScore.update({
        where: { id },
        data: {
          score: validation.data.score,
          is_pending: false,
        },
        include: {
          student: true,
          subject: true,
        },
      })
    );

    return NextResponse.json({
      success: true,
      message: 'Nilai susulan berhasil disimpan.',
      score: updated,
    });
  } catch (error: any) {
    console.error('Error updating assignment score:', error);
    return NextResponse.json({ error: 'Gagal memperbarui nilai tugas.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.classroomId) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
    }

    const { id } = await params;
    await withDbRetry(() => db.assignmentScore.delete({ where: { id } }));

    return NextResponse.json({ success: true, message: 'Nilai berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting assignment score:', error);
    return NextResponse.json({ error: 'Gagal menghapus nilai tugas' }, { status: 500 });
  }
}
