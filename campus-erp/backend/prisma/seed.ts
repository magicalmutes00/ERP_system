import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Institution
  const institution = await prisma.institution.upsert({
    where: { code: 'CAMPUS001' },
    update: {},
    create: {
      name: 'Demo University',
      code: 'CAMPUS001',
      address: '123 Education Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
      phone: '+912234567890',
      email: 'info@demouniversity.edu',
      website: 'https://demouniversity.edu',
    },
  });

  console.log(`Created institution: ${institution.name}`);

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@campus.edu' },
    update: {},
    create: {
      email: 'admin@campus.edu',
      password: adminPassword,
      role: UserRole.ADMIN,
      isVerified: true,
      institutionId: institution.id,
    },
  });

  await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  console.log(`Created admin: admin@campus.edu / admin123`);

  // Create Departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { code: 'CSE' },
      update: {},
      create: { institutionId: institution.id, name: 'Computer Science', code: 'CSE', description: 'Computer Science & Engineering' },
    }),
    prisma.department.upsert({
      where: { code: 'ECE' },
      update: {},
      create: { institutionId: institution.id, name: 'Electronics & Communication', code: 'ECE', description: 'Electronics Engineering' },
    }),
    prisma.department.upsert({
      where: { code: 'ME' },
      update: {},
      create: { institutionId: institution.id, name: 'Mechanical Engineering', code: 'ME', description: 'Mechanical Engineering' },
    }),
  ]);

  console.log(`Created ${departments.length} departments`);

  // Create Faculty Users
  const facultyPassword = await bcrypt.hash('faculty123', 12);
  const facultyData = [
    { email: 'sharma@campus.edu', firstName: 'Rajesh', lastName: 'Sharma', empId: 'FAC001', dept: 'CSE' },
    { email: 'verma@campus.edu', firstName: 'Priya', lastName: 'Verma', empId: 'FAC002', dept: 'CSE' },
    { email: 'patel@campus.edu', firstName: 'Amit', lastName: 'Patel', empId: 'FAC003', dept: 'ECE' },
  ];

  for (const f of facultyData) {
    const dept = departments.find(d => d.code === f.dept);
    const user = await prisma.user.upsert({
      where: { email: f.email },
      update: {},
      create: {
        email: f.email,
        password: facultyPassword,
        role: UserRole.FACULTY,
        isVerified: true,
        institutionId: institution.id,
      },
    });

    await prisma.faculty.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: f.firstName,
        lastName: f.lastName,
        employeeId: f.empId,
        departmentId: dept?.id,
        qualification: 'Ph.D.',
        specialization: f.dept === 'CSE' ? 'Computer Science' : 'Electronics',
      },
    });
  }

  console.log('Created faculty users');

  // Create Student Users
  const studentPassword = await bcrypt.hash('student123', 12);
  const studentData = [
    { email: 'rahul@campus.edu', first: 'Rahul', last: 'Sharma', enroll: 'STU001', dept: 'CSE', sem: 4 },
    { email: 'priya.s@campus.edu', first: 'Priya', last: 'Singh', enroll: 'STU002', dept: 'CSE', sem: 4 },
    { email: 'amit.k@campus.edu', first: 'Amit', last: 'Kumar', enroll: 'STU003', dept: 'ECE', sem: 3 },
    { email: 'sneha@campus.edu', first: 'Sneha', last: 'Patel', enroll: 'STU004', dept: 'ECE', sem: 3 },
    { email: 'vijay@campus.edu', first: 'Vijay', last: 'Reddy', enroll: 'STU005', dept: 'ME', sem: 5 },
  ];

  for (const s of studentData) {
    const dept = departments.find(d => d.code === s.dept);
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        password: studentPassword,
        role: UserRole.STUDENT,
        isVerified: true,
        institutionId: institution.id,
      },
    });

    await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: s.first,
        lastName: s.last,
        enrollmentNo: s.enroll,
        departmentId: dept?.id,
        currentSemester: s.sem,
      },
    });
  }

  console.log('Created student users');
  console.log('Sample login: student@campus.edu / student123');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
