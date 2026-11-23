import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.StudentWhereInput;
    orderBy?: Prisma.StudentOrderByWithRelationInput;
    include?: Prisma.StudentInclude;
  }) {
    const { skip, take, where, orderBy, include } = params;
    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        skip,
        take,
        where,
        orderBy,
        include: include || {
          user: { select: { email: true, phone: true, isActive: true } },
          department: true,
        },
      }),
      this.prisma.student.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        department: true,
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async findByUserId(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        department: true,
        enrollments: { include: { course: true } },
      },
    });
    if (!student) throw new NotFoundException('Student profile not found');
    return student;
  }

  async create(data: Prisma.StudentCreateInput) {
    const existing = await this.prisma.student.findUnique({
      where: { enrollmentNo: data.enrollmentNo },
    });
    if (existing) throw new ConflictException('Enrollment number already exists');

    return this.prisma.student.create({
      data,
      include: {
        user: { select: { email: true } },
        department: true,
      },
    });
  }

  async update(id: string, data: Prisma.StudentUpdateInput) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.student.update({
      where: { id },
      data,
      include: {
        user: { select: { email: true } },
        department: true,
      },
    });
  }

  async remove(id: string) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException('Student not found');

    await this.prisma.student.delete({ where: { id } });
    return { message: 'Student deleted successfully' };
  }

  async getStudentAnalytics(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        attendance: true,
        examResults: { include: { exam: true } },
        marks: true,
      },
    });
    if (!student) throw new NotFoundException('Student not found');

    const totalClasses = student.attendance.length;
    const presentClasses = student.attendance.filter(a => a.status === 'PRESENT').length;
    const attendancePercent = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

    const totalMarks = student.marks.reduce((sum, m) => sum + m.marks, 0);
    const maxMarks = student.marks.reduce((sum, m) => sum + m.totalMarks, 0);
    const overallPercent = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;

    return {
      attendance: {
        total: totalClasses,
        present: presentClasses,
        absent: totalClasses - presentClasses,
        percentage: attendancePercent.toFixed(2),
      },
      academics: {
        totalMarks,
        maxMarks,
        percentage: overallPercent.toFixed(2),
        examsTaken: student.examResults.length,
      },
    };
  }
}
