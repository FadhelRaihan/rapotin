import { NextResponse } from 'next/server';
import { updateSessionClassroom } from '@/lib/auth/session';
import { z } from 'zod';

const selectClassroomSchema = z.object({
  classroomId: z.string().min(1, 'ID Kelas wajib ada'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = selectClassroomSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const success = await updateSessionClassroom(validation.data.classroomId);
    if (!success) {
      return NextResponse.json({ error: 'Session tidak valid atau telah expired' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      redirectUrl: '/dashboard',
      message: 'Kelas berhasil dipilih',
    });
  } catch (error) {
    console.error('Error selecting classroom:', error);
    return NextResponse.json({ error: 'Gagal memilih kelas' }, { status: 500 });
  }
}
