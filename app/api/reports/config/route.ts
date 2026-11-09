import { NextResponse } from 'next/server';
import { db, withDbRetry } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !session.classroomId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const semester = searchParams.get('semester') || 'I';

  try {
    const config = await withDbRetry(() =>
      db.classroomReportConfig.findUnique({
        where: {
          classroom_id_semester: {
            classroom_id: session.classroomId!,
            semester,
          },
        },
      })
    );

    if (!config) {
      // Default config template for SDN Segara Makmur 01
      return NextResponse.json({
        data: {
          classroom_id: session.classroomId,
          semester,
          report_date: semester === 'I' ? '22 Desember 2025' : '20 Juni 2026',
          report_place: 'Tarumajaya',
          headmaster_name: 'H. SUHANDA, S.Pd',
          headmaster_nip: '19721202199603002',
          is_default: true,
        },
      });
    }

    return NextResponse.json({ data: config });
  } catch (error) {
    console.error('Error fetching report config:', error);
    return NextResponse.json({ error: 'Gagal memuat konfigurasi rapor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.classroomId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { semester = 'I', report_date, report_place, headmaster_name, headmaster_nip } = body;

    const config = await withDbRetry(() =>
      db.classroomReportConfig.upsert({
        where: {
          classroom_id_semester: {
            classroom_id: session.classroomId!,
            semester,
          },
        },
        create: {
          classroom_id: session.classroomId!,
          semester,
          report_date: report_date || '22 Desember 2025',
          report_place: report_place || 'Tarumajaya',
          headmaster_name: headmaster_name || 'H. SUHANDA, S.Pd',
          headmaster_nip: headmaster_nip || '19721202199603002',
        },
        update: {
          report_date,
          report_place,
          headmaster_name,
          headmaster_nip,
        },
      })
    );

    return NextResponse.json({ data: config });
  } catch (error) {
    console.error('Error saving report config:', error);
    return NextResponse.json({ error: 'Gagal menyimpan konfigurasi rapor' }, { status: 500 });
  }
}

