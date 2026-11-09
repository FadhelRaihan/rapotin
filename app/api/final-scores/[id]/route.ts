import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { midtermFields } from '@/lib/validations/midterm.schema';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const session = await getSession();
  if (!session?.classroomId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = midtermFields.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { id } = await context.params;
  try {
    const result = await db.finalScore.updateMany({ where: { id, student: { classroom_id: session.classroomId } }, data: {
      ...parsed.data, recorded_at: new Date(parsed.data.recorded_at),
      score: parsed.data.is_pending ? null : parsed.data.score,
      is_pending: !!parsed.data.is_pending || parsed.data.score === null,
    } });
    return NextResponse.json(result.count ? { success: true } : { error: 'Nilai tidak ditemukan' }, { status: result.count ? 200 : 404 });
  } catch {
    return NextResponse.json({ error: 'Gagal memperbarui SAS' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const session = await getSession();
  if (!session?.classroomId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  try {
    const result = await db.finalScore.deleteMany({ where: { id, student: { classroom_id: session.classroomId } } });
    return NextResponse.json(result.count ? { success: true } : { error: 'Nilai tidak ditemukan' }, { status: result.count ? 200 : 404 });
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus SAS' }, { status: 500 });
  }
}
