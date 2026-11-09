import { NextResponse } from 'next/server';
import { db, withDbRetry } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { generateCompetencyDescription, ObjectiveScoreItem } from '@/lib/description-generator';
import { overallScore } from '@/lib/scores';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !session.classroomId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const classroomId = session.classroomId!;
  const { searchParams } = new URL(request.url);
  const semester = searchParams.get('semester') || 'I';

  try {
    const [students, subjects, savedDescriptions, masterObjectives, assignments, dailyTests, midterms, finals] =
      await Promise.all([
        withDbRetry(() => db.student.findMany({ where: { classroom_id: classroomId }, orderBy: { full_name: 'asc' } })),
        withDbRetry(() => db.subject.findMany({ where: { classroom_id: classroomId }, orderBy: { name: 'asc' } })),
        withDbRetry(() =>
          db.competencyDescription.findMany({
            where: {
              student: { classroom_id: classroomId },
              semester,
            },
          })
        ),
        withDbRetry(() =>
          db.masterLearningObjective.findMany({
            where: { grade_level: 6, semester },
            orderBy: { order_index: 'asc' },
          })
        ),
        withDbRetry(() =>
          db.assignmentScore.findMany({
            where: { student: { classroom_id: classroomId }, semester },
          })
        ),
        withDbRetry(() =>
          db.dailyTestScore.findMany({
            where: { student: { classroom_id: classroomId }, semester },
          })
        ),
        withDbRetry(() =>
          db.midtermScore.findMany({
            where: { student: { classroom_id: classroomId }, semester },
          })
        ),
        withDbRetry(() =>
          db.finalScore.findMany({
            where: { student: { classroom_id: classroomId }, semester },
          })
        ),
      ]);

    // Build descriptions dictionary: studentId -> subjectId -> { highestDesc, lowestDesc, isCustomized }
    const results: Record<
      string,
      Record<
        string,
        {
          highestDesc: string;
          lowestDesc: string;
          fullDesc: string;
          isCustomized: boolean;
        }
      >
    > = {};

    students.forEach((student) => {
      results[student.id] = {};

      subjects.forEach((subject) => {
        // Check if there is already a saved/customized description
        const saved = savedDescriptions.find(
          (d) => d.student_id === student.id && d.subject_id === subject.id
        );

        if (saved && saved.is_customized) {
          results[student.id][subject.id] = {
            highestDesc: saved.highest_desc,
            lowestDesc: saved.lowest_desc || '',
            fullDesc: saved.lowest_desc ? `${saved.highest_desc}\n\n${saved.lowest_desc}` : saved.highest_desc,
            isCustomized: true,
          };
          return;
        }

        // Calculate student's scores for this subject
        const studAsgs = assignments.filter(
          (a) => a.student_id === student.id && a.subject_id === subject.id && !a.is_pending && a.score !== null
        );
        const studUhs = dailyTests.filter(
          (d) => d.student_id === student.id && d.subject_id === subject.id && !d.is_pending && d.score !== null
        );
        const studMidterm = midterms.find(
          (m) => m.student_id === student.id && m.subject_id === subject.id && !m.is_pending && m.score !== null
        );
        const studFinal = finals.find(
          (f) => f.student_id === student.id && f.subject_id === subject.id && !f.is_pending && f.score !== null
        );

        const asgAvg = studAsgs.length > 0 ? studAsgs.reduce((a, b) => a + Number(b.score), 0) / studAsgs.length : 0;
        const uhAvg = studUhs.length > 0 ? studUhs.reduce((a, b) => a + Number(b.score), 0) / studUhs.length : 0;
        const midScore = studMidterm ? Number(studMidterm.score) : 0;
        const finScore = studFinal ? Number(studFinal.score) : 0;

        const finalOverall = overallScore(asgAvg, uhAvg, midScore, finScore);

        // Helper to match subject names considering abbreviations and aliases
        const isSubjectMatch = (nameA: string, nameB: string): boolean => {
          const a = nameA.trim().toLowerCase();
          const b = nameB.trim().toLowerCase();
          if (a === b || a.includes(b) || b.includes(a)) return true;

          const aliases: string[][] = [
            ['pjok', 'pendidikan jasmani dan olahraga', 'penjas', 'penjaskes', 'jasmani'],
            ['pai', 'pendidikan agama', 'pendidikan agama islam', 'pabp', 'agama'],
            ['pancasila', 'ppkn', 'pendidikan pancasila', 'pkn'],
            ['indonesia', 'b. indonesia', 'bahasa indonesia', 'bi'],
            ['matematika', 'mtk', 'math'],
            ['ipas', 'ilmu pengetahuan alam dan sosial', 'ipa', 'ips'],
            ['seni rupa', 'sbdp', 'seni'],
            ['bahasa inggris', 'bahasa inggris *', 'english', 'b.inggris', 'inggris'],
            ['bahasa sunda', 'b.sunda', 'mulok', 'sunda'],
          ];

          return aliases.some(
            (group) => group.some((g) => a.includes(g)) && group.some((g) => b.includes(g))
          );
        };

        // Find standard objectives for this subject from master_learning_objectives
        let subjectObjectives: { code: string; description: string }[] = [];

        if (masterObjectives && masterObjectives.length > 0) {
          const matchedMaster = masterObjectives.filter((m) =>
            isSubjectMatch(subject.name, m.subject_name)
          );

          if (matchedMaster.length > 0) {
            subjectObjectives = matchedMaster.map((m) => ({
              code: m.code,
              description: m.description,
            }));
          }
        }

        // Map scores to objectives sequentially (daily tests and assignments)
        const objectivesWithScores: ObjectiveScoreItem[] = [];

        if (subjectObjectives.length > 0 && (studUhs.length > 0 || studAsgs.length > 0)) {
          // Combine scores: UH (evaluasi formatif/sumatif TP) prioritized, followed by assignments
          const rawScores = [...studUhs.map((u) => Number(u.score)), ...studAsgs.map((a) => Number(a.score))];
          subjectObjectives.forEach((obj, idx) => {
            const score = rawScores[idx % rawScores.length];
            objectivesWithScores.push({
              code: obj.code,
              description: obj.description,
              score,
            });
          });
        }

        // Generate narrative description (returns empty strings if objectives or scores are empty)
        const generated = generateCompetencyDescription(student.full_name, objectivesWithScores, finalOverall);

        results[student.id][subject.id] = {
          highestDesc: generated.highestDesc,
          lowestDesc: generated.lowestDesc,
          fullDesc: generated.fullDesc,
          isCustomized: false,
        };
      });
    });

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error('Error in descriptions endpoint:', error);
    return NextResponse.json({ error: 'Gagal memproses deskripsi capaian pembelajaran' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.classroomId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { student_id, subject_id, semester = 'I', highest_desc, lowest_desc } = body;

    if (!student_id || !subject_id) {
      return NextResponse.json({ error: 'Siswa dan mata pelajaran wajib dipilih' }, { status: 400 });
    }

    const saved = await withDbRetry(() =>
      db.competencyDescription.upsert({
        where: {
          student_id_subject_id_semester: {
            student_id,
            subject_id,
            semester,
          },
        },
        create: {
          student_id,
          subject_id,
          semester,
          highest_desc: highest_desc || '',
          lowest_desc: lowest_desc || null,
          is_customized: true,
        },
        update: {
          highest_desc: highest_desc || '',
          lowest_desc: lowest_desc || null,
          is_customized: true,
        },
      })
    );

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error saving competency description:', error);
    return NextResponse.json({ error: 'Gagal menyimpan deskripsi rapor' }, { status: 500 });
  }
}

