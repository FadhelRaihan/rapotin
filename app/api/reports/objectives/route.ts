import { NextResponse } from 'next/server';
import { db, withDbRetry } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { GRADE_6_OBJECTIVES } from '@/lib/data/grade6-objectives';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !session.classroomId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const semester = searchParams.get('semester') || 'I';
  const gradeLevel = parseInt(searchParams.get('grade_level') || '6', 10);
  const subjectName = searchParams.get('subject_name');

  try {
    const where: any = {
      grade_level: gradeLevel,
      semester,
    };
    if (subjectName) {
      where.subject_name = {
        contains: subjectName,
        mode: 'insensitive',
      };
    }

    const masters = await withDbRetry(() =>
      db.masterLearningObjective.findMany({
        where,
        orderBy: [{ subject_name: 'asc' }, { order_index: 'asc' }],
      })
    );

    return NextResponse.json({ data: masters });
  } catch (error) {
    console.error('Error fetching master learning objectives:', error);
    return NextResponse.json({ error: 'Gagal memuat tujuan pembelajaran standar' }, { status: 500 });
  }
}

/**
 * POST /api/reports/objectives
 * Actions:
 * - action === 'SEED_MASTER_GRADE_6': Populates master_learning_objectives with Grade 6 national standard TP
 * - Single master objective creation / update
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.classroomId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'SEED_MASTER_GRADE_6') {
      let seededCount = 0;
      for (const subjectData of GRADE_6_OBJECTIVES) {
        const mainSubjectName = subjectData.subjectNameAliases[0];
        for (let idx = 0; idx < subjectData.objectives.length; idx++) {
          const obj = subjectData.objectives[idx];
          const topic = subjectData.topics[idx % subjectData.topics.length] || null;
          await withDbRetry(() =>
            db.masterLearningObjective.upsert({
              where: {
                subject_name_grade_level_semester_code: {
                  subject_name: mainSubjectName,
                  grade_level: 6,
                  semester: subjectData.semester,
                  code: obj.code,
                },
              },
              create: {
                subject_name: mainSubjectName,
                grade_level: 6,
                semester: subjectData.semester,
                code: obj.code,
                description: obj.description,
                topic,
                order_index: idx + 1,
              },
              update: {
                description: obj.description,
                topic,
                order_index: idx + 1,
              },
            })
          );
          seededCount++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Berhasil memperbarui ${seededCount} TP Standar Nasional Kelas 6 di database.`,
      });
    }

    // Single master objective creation/upsert
    const { subject_name, grade_level = 6, semester = 'I', code, description, topic, order_index = 0 } = body;
    if (!subject_name || !code || !description) {
      return NextResponse.json({ error: 'Data TP standar belum lengkap' }, { status: 400 });
    }

    const saved = await withDbRetry(() =>
      db.masterLearningObjective.upsert({
        where: {
          subject_name_grade_level_semester_code: {
            subject_name,
            grade_level: Number(grade_level),
            semester,
            code,
          },
        },
        create: {
          subject_name,
          grade_level: Number(grade_level),
          semester,
          code,
          description,
          topic: topic || null,
          order_index: Number(order_index) || 0,
        },
        update: {
          description,
          topic: topic || null,
          order_index: Number(order_index) || 0,
        },
      })
    );

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error('Error in master objectives endpoint:', error);
    return NextResponse.json({ error: 'Gagal memproses tujuan pembelajaran standar' }, { status: 500 });
  }
}

