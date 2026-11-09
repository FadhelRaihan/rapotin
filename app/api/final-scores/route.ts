import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { midtermBatchSchema } from '@/lib/validations/midterm.schema';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.classroomId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const params = new URL(request.url).searchParams;
  try {
    const data = await db.finalScore.findMany({
      where: { student: { classroom_id: session.classroomId }, subject_id: params.get('subject_id') || undefined, semester: params.get('semester') || undefined },
      orderBy: { recorded_at: 'desc' },
    });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Gagal memuat nilai SAS' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.classroomId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const parsed = midtermBatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { scores, ...header } = parsed.data;
  try {
    const [subject, count] = await Promise.all([
      db.subject.findFirst({ where: { id: header.subject_id, classroom_id: session.classroomId } }),
      db.student.count({ where: { id: { in: scores.map(item => item.student_id) }, classroom_id: session.classroomId } }),
    ]);
    if (!subject || count !== scores.length) return NextResponse.json({ error: 'Siswa atau mapel bukan bagian kelas aktif' }, { status: 400 });
    const data = await db.$transaction(scores.map(item => db.finalScore.create({ data: {
      ...header, ...item, recorded_at: new Date(header.recorded_at),
      score: item.is_pending ? null : item.score,
      is_pending: !!item.is_pending || item.score === null,
    } })));
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') return NextResponse.json({ error: 'Nilai SAS sudah tersedia. Muat ulang lalu gunakan Edit; seluruh batch dibatalkan.' }, { status: 409 });
    return NextResponse.json({ error: 'Gagal menyimpan nilai SAS' }, { status: 500 });
  }
}
