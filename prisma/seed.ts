import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial database data...');

  const defaultPin = process.env.DEFAULT_TEACHER_PIN || '123456';
  const pinHash = await bcrypt.hash(defaultPin, 10);

  // 1. Create Default School
  let school = await prisma.school.findFirst();
  if (!school) {
    school = await prisma.school.create({
      data: {
        name: 'SD Negeri Segara Makmur 01',
        npsn: '20600001',
        address: 'Jl. Desa Segara Makmur, Kab. Bekasi, Jawa Barat',
      },
    });
    console.log('Created default school:', school.name);
  }

  // 2. Create Default Teacher
  let teacher = await prisma.teacher.findFirst();
  if (!teacher) {
    teacher = await prisma.teacher.create({
      data: {
        school_id: school.id,
        name: 'Yayah Kudsiyah',
        nip: '198501012010011001',
        pin_hash: pinHash,
      },
    });
    console.log('Created default teacher:', teacher.name);
  }

  // 3. Create Default Classroom
  let classroom = await prisma.classroom.findFirst();
  if (!classroom) {
    classroom = await prisma.classroom.create({
      data: {
        school_id: school.id,
        teacher_id: teacher.id,
        name: 'Kelas VI - A',
        academic_year: '2025/2026',
      },
    });
    console.log('Created default classroom:', classroom.name);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
