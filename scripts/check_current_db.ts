import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Checking Current DB Data ---');
  
  const schools = await prisma.school.findMany();
  console.log('Schools count:', schools.length);
  for (const s of schools) {
    console.log(`- School [${s.id}]: ${s.name} (NPSN: ${s.npsn})`);
  }

  const teachers = await prisma.teacher.findMany();
  console.log('\nTeachers count:', teachers.length);
  for (const t of teachers) {
    console.log(`- Teacher [${t.id}]: ${t.name} (NIP: ${t.nip})`);
  }

  const classrooms = await prisma.classroom.findMany({
    include: {
      _count: {
        select: {
          students: true,
          subjects: true,
        },
      },
    },
  });
  console.log('\nClassrooms count:', classrooms.length);
  for (const c of classrooms) {
    console.log(`- Classroom [${c.id}]: "${c.name}" (Tahun: ${c.academic_year}), Students: ${c._count.students}, Subjects: ${c._count.subjects}`);
  }

  const totalStudents = await prisma.student.count();
  const totalSubjects = await prisma.subject.count();
  const totalAssignmentScores = await prisma.assignmentScore.count();
  const totalDailyTestScores = await prisma.dailyTestScore.count();
  const totalMidtermScores = await prisma.midtermScore.count();
  const totalFinalScores = await prisma.finalScore.count();
  const totalMasterTP = await (prisma as any).masterLearningObjective.count();

  console.log('\nSummary Counts:');
  console.log(`- Total Students: ${totalStudents}`);
  console.log(`- Total Subjects: ${totalSubjects}`);
  console.log(`- Total Assignment Scores: ${totalAssignmentScores}`);
  console.log(`- Total Daily Test Scores: ${totalDailyTestScores}`);
  console.log(`- Total Midterm Scores: ${totalMidtermScores}`);
  console.log(`- Total Final Scores: ${totalFinalScores}`);
  console.log(`- Total Master TP (BSKAP): ${totalMasterTP}`);
}

main()
  .catch((e) => {
    console.error('Error querying DB:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

