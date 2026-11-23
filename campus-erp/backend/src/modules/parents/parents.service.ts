import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ParentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ParentWhereInput;
    orderBy?: Prisma.ParentOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    const [data, total] = await Promise.all([
      this.prisma.parent.findMany({
        skip, take, where, orderBy,
        include: {
          user: { select: { email: true, phone: true, isActive: true } },
          _count: { select: { children: true } },
        },
      }),
      this.prisma.parent.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, phone: true, isActive: true, role: true } },
        children: {
          include: {
            user: { select: { email: true } },
            department: true,
            enrollments: { include: { course: true } },
          },
        },
      },
    });
    if (!parent) throw new NotFoundException('Parent not found');
    return parent;
  }

  async findByUserId(userId: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
      include: {
        children: {
          include: {
            user: { select: { email: true } },
            department: true,
          },
        },
      },
    });
    if (!parent) throw new NotFoundException('Parent profile not found');
    return parent;
  }

  async create(data: Prisma.ParentCreateInput) {
    return this.prisma.parent.create({
      data,
      include: { user: { select: { email: true } } },
    });
  }

  async update(id: string, data: Prisma.ParentUpdateInput) {
    const parent = await this.prisma.parent.findUnique({ where: { id } });
    if (!parent) throw new NotFoundException('Parent not found');

    return this.prisma.parent.update({
      where: { id },
      data,
      include: { user: { select: { email: true } } },
    });
  }

  async remove(id: string) {
    const parent = await this.prisma.parent.findUnique({ where: { id } });
    if (!parent) throw new NotFoundException('Parent not found');

    await this.prisma.parent.delete({ where: { id } });
    return { message: 'Parent deleted successfully' };
  }

  async linkToStudent(parentId: string, studentId: string) {
    const parent = await this.prisma.parent.findUnique({ where: { id: parentId } });
    if (!parent) throw new NotFoundException('Parent not found');

    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    if (student.parentId) {
      throw new ConflictException('Student already has a linked parent');
    }

    return this.prisma.student.update({
      where: { id: studentId },
      data: { parentId },
      include: {
        parent: true,
        user: { select: { email: true } },
      },
    });
  }

  async getChildren(parentId: string) {
    const parent = await this.prisma.parent.findUnique({ where: { id: parentId } });
    if (!parent) throw new NotFoundException('Parent not found');

    return this.prisma.student.findMany({
      where: { parentId },
      include: {
        user: { select: { email: true, phone: true } },
        department: true,
        enrollments: {
          include: { course: { select: { id: true, name: true, code: true } } },
        },
      },
    });
  }

  async getChildProgress(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { email: true } },
        department: true,
        enrollments: { include: { course: true } },
      },
    });
    if (!student) throw new NotFoundException('Student not found');

    const [attendance, examResults, marks] = await Promise.all([
      this.prisma.attendance.findMany({ where: { studentId } }),
      this.prisma.examResult.findMany({
        where: { studentId },
        include: { exam: { select: { title: true, totalMarks: true, type: true } } },
      }),
      this.prisma.mark.findMany({ where: { studentId } }),
    ]);

    const totalClasses = attendance.length;
    const presentClasses = attendance.filter(a => a.status === 'PRESENT').length;
    const attendancePercent = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

    const totalMarks = marks.reduce((s, m) => s + m.marks, 0);
    const maxMarks = marks.reduce((s, m) => s + m.totalMarks, 0);
    const academicPercent = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;

    return {
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        enrollmentNo: student.enrollmentNo,
        department: student.department,
        currentSemester: student.currentSemester,
      },
      attendance: {
        total: totalClasses,
        present: presentClasses,
        percentage: attendancePercent.toFixed(2),
      },
      academics: {
        averageMarks: academicPercent.toFixed(2),
        examsTaken: examResults.length,
        recentResults: examResults.slice(0, 5).map(r => ({
          exam: r.exam.title,
          type: r.exam.type,
          marks: r.marksObtained,
          total: r.exam.totalMarks,
          grade: r.grade,
        })),
      },
    };
  }
}
