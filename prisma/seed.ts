import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { GRADE_6_OBJECTIVES } from '../lib/data/grade6-objectives';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Rapotin Database Seeding (Isolated "Data Testing" Classroom) ---');

  // 1. Seed Master Tujuan Pembelajaran Standar Pemerintah (83 TP Kelas 6)
  console.log('1. Verifikasi Master Learning Objectives (83 TP Standar BSKAP)...');
  let seededTpCount = 0;
  for (const subjectData of GRADE_6_OBJECTIVES) {
    const mainSubjectName = subjectData.subjectNameAliases[0];
    for (let idx = 0; idx < subjectData.objectives.length; idx++) {
      const obj = subjectData.objectives[idx];
      const topic = subjectData.topics[idx % subjectData.topics.length] || null;
      await (prisma as any).masterLearningObjective.upsert({
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
      });
      seededTpCount++;
    }
  }
  console.log(`   -> Total ${seededTpCount} Master TP siap di database.`);

  // 2. Load extracted Excel test data
  const devDataPath = path.join(__dirname, 'dev-test-data.json');
  if (!fs.existsSync(devDataPath)) {
    console.warn('   [WARN] dev-test-data.json tidak ditemukan. Jalankan "python scripts/extract_seed_data.py" terlebih dahulu.');
    return;
  }

  const devData = JSON.parse(fs.readFileSync(devDataPath, 'utf-8'));

  // 3. Find existing School & Teacher (TIDAK mengubah atau overwrite data lama)
  console.log('2. Menggunakan Akun Sekolah & Guru yang sudah ada...');
  const school = await prisma.school.findFirst();
  if (!school) {
    throw new Error('Sekolah belum ada di database. Silakan buat sekolah terlebih dahulu.');
  }
  console.log(`   -> Sekolah: ${school.name} (${school.id})`);

  const teacher = await prisma.teacher.findFirst();
  if (!teacher) {
    throw new Error('Guru belum ada di database. Silakan buat guru terlebih dahulu.');
  }
  console.log(`   -> Guru: ${teacher.name} (${teacher.id})`);

  // 4. Create/Get Dedicated Testing Classroom "Data Testing"
  console.log('3. Menyiapkan Kelas Terisolasi Bernama "Data Testing"...');
  const targetClassName = 'Data Testing';
  let testingClassroom = await prisma.classroom.findFirst({
    where: {
      teacher_id: teacher.id,
      name: targetClassName,
    },
  });

  if (!testingClassroom) {
    testingClassroom = await prisma.classroom.create({
      data: {
        school_id: school.id,
        teacher_id: teacher.id,
        name: targetClassName,
        academic_year: '2025/2026',
      },
    });
    console.log(`   -> Berhasil membuat kelas baru: "${testingClassroom.name}" (ID: ${testingClassroom.id})`);
  } else {
    console.log(`   -> Menggunakan kelas yang sudah ada: "${testingClassroom.name}" (ID: ${testingClassroom.id})`);
  }

  // 5. Classroom Report Config khusus untuk kelas "Data Testing"
  console.log('4. Menyiapkan Titimangsa Rapor untuk "Data Testing"...');
  await prisma.classroomReportConfig.upsert({
    where: {
      classroom_id_semester: {
        classroom_id: testingClassroom.id,
        semester: devData.report_config.semester,
      },
    },
    create: {
      classroom_id: testingClassroom.id,
      semester: devData.report_config.semester,
      report_date: devData.report_config.report_date,
      report_place: devData.report_config.report_place,
      headmaster_name: devData.report_config.headmaster_name,
      headmaster_nip: devData.report_config.headmaster_nip,
    },
    update: {
      report_date: devData.report_config.report_date,
      report_place: devData.report_config.report_place,
      headmaster_name: devData.report_config.headmaster_name,
      headmaster_nip: devData.report_config.headmaster_nip,
    },
  });
  console.log(`   -> Titimangsa: ${devData.report_config.report_place}, ${devData.report_config.report_date} (KS: ${devData.report_config.headmaster_name})`);

  // 6. Subjects (9 Mapel khusus di kelas "Data Testing")
  console.log('5. Menyiapkan 9 Mata Pelajaran di kelas "Data Testing"...');
  const existingSubjects = await prisma.subject.findMany({
    where: { classroom_id: testingClassroom.id },
  });
  const subjectMap = new Map<string, string>(); // name -> id

  for (const subName of devData.subjects as string[]) {
    let sub = existingSubjects.find((s) => s.name.toLowerCase() === subName.toLowerCase());
    if (!sub) {
      sub = await prisma.subject.create({
        data: {
          classroom_id: testingClassroom.id,
          name: subName,
        },
      });
    }
    subjectMap.set(subName, sub.id);
  }
  console.log(`   -> ${subjectMap.size} Mapel aktif di kelas "Data Testing".`);

  // 7. Students (31 Siswa dari Excel khusus di kelas "Data Testing")
  console.log('6. Menyiapkan 31 Siswa di kelas "Data Testing"...');
  const existingStudents = await prisma.student.findMany({
    where: { classroom_id: testingClassroom.id },
  });
  const studentMap = new Map<string, string>(); // nis -> id

  for (const stud of devData.students) {
    let s = existingStudents.find((x) => x.nis === stud.nis);
    if (!s) {
      s = await prisma.student.create({
        data: {
          classroom_id: testingClassroom.id,
          nis: stud.nis,
          nisn: stud.nisn || null,
          full_name: stud.full_name,
          gender: stud.gender || null,
        },
      });
    } else {
      s = await prisma.student.update({
        where: { id: s.id },
        data: {
          nisn: stud.nisn || null,
          full_name: stud.full_name,
          gender: stud.gender || null,
        },
      });
    }
    studentMap.set(stud.nis, s.id);
  }
  console.log(`   -> ${studentMap.size} Siswa aktif di kelas "Data Testing".`);

  const studentIdList = Array.from(studentMap.values());

  // 8. Presensi & Catatan Wali Kelas (Khusus Siswa "Data Testing")
  console.log('7. Mengisi Presensi & Catatan Wali Kelas...');
  const detailList = [];
  for (const [nis, att] of Object.entries(devData.attendance_and_notes as Record<string, any>)) {
    const studentId = studentMap.get(nis);
    if (!studentId) continue;
    detailList.push({
      student_id: studentId,
      semester: 'I',
      sickness_days: att.sickness_days || 0,
      permission_days: att.permission_days || 0,
      unexcused_days: att.unexcused_days || 0,
      teacher_note: att.teacher_note || null,
      p5_note: null,
      parent_response: null,
    });
  }

  await prisma.studentReportDetail.deleteMany({
    where: {
      student_id: { in: studentIdList },
      semester: 'I',
    },
  });
  if (detailList.length > 0) {
    await prisma.studentReportDetail.createMany({ data: detailList });
  }
  console.log(`   -> ${detailList.length} data presensi & catatan tersimpan.`);

  // 9. Ekstrakurikuler (Khusus Siswa "Data Testing")
  console.log('8. Mengisi Ekstrakurikuler Pramuka...');
  const extraList = [];
  for (const [nis, extras] of Object.entries(devData.extracurriculars as Record<string, any[]>)) {
    const studentId = studentMap.get(nis);
    if (!studentId) continue;
    for (const ex of extras) {
      extraList.push({
        student_id: studentId,
        semester: 'I',
        name: ex.name,
        score_description: ex.score_description,
      });
    }
  }

  await prisma.extracurricularScore.deleteMany({
    where: {
      student_id: { in: studentIdList },
      semester: 'I',
    },
  });
  if (extraList.length > 0) {
    await prisma.extracurricularScore.createMany({ data: extraList });
  }
  console.log(`   -> ${extraList.length} data ekstrakurikuler tersimpan.`);

  // 10. Nilai: Tugas/Formatif, UH/Sumatif LM, STS, SAS, Deskripsi Rapor (Khusus Siswa "Data Testing")
  console.log('9. Mengisi Nilai Lengkap (Formatif, Sumatif LM, STS, SAS, Deskripsi)...');
  const assignmentDataList: any[] = [];
  const dailyTestDataList: any[] = [];
  const midtermDataList: any[] = [];
  const finalDataList: any[] = [];
  const competencyDescList: any[] = [];

  for (const [subName, studScores] of Object.entries(devData.scores_by_subject as Record<string, any[]>)) {
    const subjectId = subjectMap.get(subName);
    if (!subjectId) continue;

    for (const item of studScores) {
      const studentId = studentMap.get(item.nis);
      if (!studentId) continue;

      // Assignments (Formatif TP)
      if (Array.isArray(item.assignments)) {
        for (const asg of item.assignments) {
          if (asg.score !== null) {
            assignmentDataList.push({
              student_id: studentId,
              subject_id: subjectId,
              semester: 'I',
              label: asg.label,
              score: asg.score,
              is_pending: false,
              recorded_at: new Date('2025-10-15'),
            });
          }
        }
      }

      // Daily Tests (Sumatif LM / UH)
      if (Array.isArray(item.daily_tests)) {
        for (const uh of item.daily_tests) {
          if (uh.score !== null) {
            dailyTestDataList.push({
              student_id: studentId,
              subject_id: subjectId,
              semester: 'I',
              label: uh.label,
              score: uh.score,
              is_pending: false,
              multiple_choice_count: 0,
              essay_count: 0,
              recorded_at: new Date('2025-11-10'),
            });
          }
        }
      }

      // Midterm (STS)
      if (item.midterm_score !== null && item.midterm_score !== undefined) {
        midtermDataList.push({
          student_id: studentId,
          subject_id: subjectId,
          semester: 'I',
          score: item.midterm_score,
          is_pending: false,
          multiple_choice_count: 0,
          short_answer_count: 0,
          essay_count: 0,
          recorded_at: new Date('2025-10-01'),
        });
      }

      // Final (SAS)
      if (item.final_score !== null && item.final_score !== undefined) {
        finalDataList.push({
          student_id: studentId,
          subject_id: subjectId,
          semester: 'I',
          score: item.final_score,
          is_pending: false,
          multiple_choice_count: 0,
          short_answer_count: 0,
          essay_count: 0,
          recorded_at: new Date('2025-12-15'),
        });
      }

      // Competency descriptions
      if (item.highest_desc || item.lowest_desc) {
        competencyDescList.push({
          student_id: studentId,
          subject_id: subjectId,
          semester: 'I',
          highest_desc: item.highest_desc || '',
          lowest_desc: item.lowest_desc || null,
          is_customized: false,
        });
      }
    }
  }

  // Clear existing scores HANYA untuk siswa di kelas "Data Testing"
  await prisma.assignmentScore.deleteMany({
    where: { student_id: { in: studentIdList }, semester: 'I' },
  });
  await prisma.dailyTestScore.deleteMany({
    where: { student_id: { in: studentIdList }, semester: 'I' },
  });
  await prisma.midtermScore.deleteMany({
    where: { student_id: { in: studentIdList }, semester: 'I' },
  });
  await prisma.finalScore.deleteMany({
    where: { student_id: { in: studentIdList }, semester: 'I' },
  });
  await prisma.competencyDescription.deleteMany({
    where: { student_id: { in: studentIdList }, semester: 'I' },
  });

  if (assignmentDataList.length > 0) {
    await prisma.assignmentScore.createMany({ data: assignmentDataList });
  }
  if (dailyTestDataList.length > 0) {
    await prisma.dailyTestScore.createMany({ data: dailyTestDataList });
  }
  if (midtermDataList.length > 0) {
    await prisma.midtermScore.createMany({ data: midtermDataList });
  }
  if (finalDataList.length > 0) {
    await prisma.finalScore.createMany({ data: finalDataList });
  }
  if (competencyDescList.length > 0) {
    await prisma.competencyDescription.createMany({ data: competencyDescList });
  }

  console.log(`   -> Berhasil memasukkan nilai ke kelas "Data Testing":`);
  console.log(`      * ${assignmentDataList.length} Nilai Tugas / Formatif`);
  console.log(`      * ${dailyTestDataList.length} Nilai Ulangan Harian (UH / Sumatif LM)`);
  console.log(`      * ${midtermDataList.length} Nilai Sumatif Tengah Semester (STS)`);
  console.log(`      * ${finalDataList.length} Nilai Sumatif Akhir Semester (SAS)`);
  console.log(`      * ${competencyDescList.length} Deskripsi Capaian Kompetensi`);

  console.log('\n--- Seeding "Data Testing" Berhasil Sempurna! Kelas lain tetap aman 100%. ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
