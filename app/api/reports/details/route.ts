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
    const students = await withDbRetry(() =>
      db.student.findMany({
        where: { classroom_id: session.classroomId! },
        orderBy: { full_name: 'asc' },
        include: {
          report_details: {
            where: { semester },
          },
          extracurricular_scores: {
            where: { semester },
          },
        },
      })
    );

    const formatted = students.map((s) => ({
      student_id: s.id,
      full_name: s.full_name,
      nis: s.nis,
      nisn: s.nisn,
      gender: s.gender,
      report_detail: s.report_details[0] || {
        sickness_days: 0,
        permission_days: 0,
        unexcused_days: 0,
        teacher_note: '',
        p5_note: '',
        parent_response: '',
      },
      extracurriculars: s.extracurricular_scores || [],
    }));

    return NextResponse.json({ data: formatted });
  } catch (error) {
    console.error('Error fetching report details:', error);
    return NextResponse.json({ error: 'Gagal memuat data pelengkap rapor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.classroomId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { semester = 'I', details, extracurriculars } = body;

    // details: array of { student_id, sickness_days, permission_days, unexcused_days, teacher_note, p5_note }
    if (Array.isArray(details)) {
      await withDbRetry(() =>
        db.$transaction(
          details.map((item) =>
            db.studentReportDetail.upsert({
              where: {
                student_id_semester: {
                  student_id: item.student_id,
                  semester,
                },
              },
              create: {
                student_id: item.student_id,
                semester,
                sickness_days: Number(item.sickness_days) || 0,
                permission_days: Number(item.permission_days) || 0,
                unexcused_days: Number(item.unexcused_days) || 0,
                teacher_note: item.teacher_note || null,
                p5_note: item.p5_note || null,
                parent_response: item.parent_response || null,
              },
              update: {
                sickness_days: Number(item.sickness_days) || 0,
                permission_days: Number(item.permission_days) || 0,
                unexcused_days: Number(item.unexcused_days) || 0,
                teacher_note: item.teacher_note || null,
                p5_note: item.p5_note || null,
                parent_response: item.parent_response || null,
              },
            })
          )
        )
      );
    }

    // extracurriculars: array of { student_id, name, score_description }
    if (Array.isArray(extracurriculars)) {
      // Delete existing extracurriculars for students in this payload for this semester
      const studentIds = Array.from(new Set(extracurriculars.map((e) => e.student_id)));
      if (studentIds.length > 0) {
        await withDbRetry(() =>
          db.$transaction([
            db.extracurricularScore.deleteMany({
              where: {
                student_id: { in: studentIds },
                semester,
              },
            }),
            db.extracurricularScore.createMany({
              data: extracurriculars
                .filter((e) => e.name && e.name.trim() !== '')
                .map((e) => ({
                  student_id: e.student_id,
                  semester,
                  name: e.name.trim(),
                  score_description: e.score_description?.trim() || 'Baik',
                })),
            }),
          ])
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Data pelengkap rapor berhasil disimpan' });
  } catch (error) {
    console.error('Error saving report details:', error);
    return NextResponse.json({ error: 'Gagal menyimpan data pelengkap rapor' }, { status: 500 });
  }
}

