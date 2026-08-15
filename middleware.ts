import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'rapotin_session';
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'rapotin-secret-key-change-this-in-production-12345'
);

interface SessionPayload {
  teacherId: string;
  schoolId: string;
  classroomId?: string | null;
  name: string;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let isValidSession = false;
  let sessionPayload: SessionPayload | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      sessionPayload = payload as unknown as SessionPayload;
      isValidSession = true;
    } catch {
      isValidSession = false;
    }
  }

  // Redirect logged-in users away from /login to /kelas
  if (pathname === '/login') {
    if (isValidSession) {
      return NextResponse.redirect(new URL('/kelas', request.url));
    }
    return NextResponse.next();
  }

  // Allow access to /kelas if session is valid
  if (pathname === '/kelas') {
    if (!isValidSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Protected dashboard routes requiring selected classroom
  const isDashboardRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/siswa') ||
    pathname.startsWith('/mapel') ||
    pathname.startsWith('/nilai') ||
    pathname.startsWith('/rekap');

  if (isDashboardRoute) {
    if (!isValidSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (!sessionPayload?.classroomId) {
      return NextResponse.redirect(new URL('/kelas', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/kelas', '/dashboard/:path*', '/siswa/:path*', '/mapel/:path*', '/nilai/:path*', '/rekap/:path*'],
};
