import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPin } from '@/lib/auth/pin';
import { createSession } from '@/lib/auth/session';
import { pinLoginSchema } from '@/lib/validators';

// In-memory rate limiting map: ip -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

async function findTeacherWithRetry(retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await db.teacher.findFirst({
        include: {
          school: true,
        },
      });
    } catch (err: any) {
      if (i === retries) throw err;
      console.warn(`[Neon DB Retry ${i + 1}/${retries}] Retrying connection...`);
      await new Promise((res) => setTimeout(res, 500));
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const limitData = rateLimitMap.get(ip);

    if (limitData && limitData.resetAt > now) {
      if (limitData.count >= 5) {
        const remainingSeconds = Math.ceil((limitData.resetAt - now) / 1000);
        return NextResponse.json(
          { error: `Terlalu banyak percobaan PIN gagal. Silakan coba lagi dalam ${remainingSeconds} detik.` },
          { status: 429 }
        );
      }
    } else {
      rateLimitMap.set(ip, { count: 0, resetAt: now + 60 * 1000 });
    }

    const body = await request.json();
    const validation = pinLoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { pin } = validation.data;

    // Find teacher with auto-retry for Neon Serverless DB cold starts
    const teacher = await findTeacherWithRetry();

    if (!teacher) {
      return NextResponse.json(
        { error: 'Data guru belum di-seed di database. Silakan jalankan seed terlebih dahulu.' },
        { status: 404 }
      );
    }

    const isMatch = await verifyPin(pin, teacher.pin_hash);
    if (!isMatch) {
      const currentLimit = rateLimitMap.get(ip);
      if (currentLimit) {
        currentLimit.count += 1;
      }
      return NextResponse.json({ error: 'PIN yang Anda masukkan salah.' }, { status: 401 });
    }

    // Reset rate limit on success
    rateLimitMap.delete(ip);

    await createSession({
      teacherId: teacher.id,
      schoolId: teacher.school_id,
      classroomId: null,
      name: teacher.name,
    });

    return NextResponse.json({ success: true, redirectUrl: '/kelas', message: 'Berhasil masuk' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan koneksi database. Silakan coba klik Masuk sekali lagi.' }, { status: 500 });
  }
}
