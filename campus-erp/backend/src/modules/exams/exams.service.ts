import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { skip?: number; take?: number; where?: Prisma.ExamWhereInput }) {
    const { skip, take, where } = params;
    const [data, total] = await Promise.all([
      this.prisma.exam.findMany({
        skip, take, where,
        include: {
          course: { select: { id: true, name: true, code: true } },
          _count: { select: { results: true } },
        },
        orderBy: { scheduledAt: 'desc' },
      }),
      this.prisma.exam.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        course: true,
        results: {
          include: { student: { include: { user: { select: { email: true, phone: true } } } } },
        },
      },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async create(data: Prisma.ExamCreateInput) {
    return this.prisma.exam.create({ data, include: { course: true } });
  }

  async update(id: string, data: Prisma.ExamUpdateInput) {
    await this.findById(id);
    return this.prisma.exam.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.exam.delete({ where: { id } });
    return { message: 'Exam deleted successfully' };
  }

  async publishResults(examId: string) {
    return this.prisma.exam.update({
      where: { id: examId },
      data: { isPublished: true },
    });
  }

  async getStudentResults(studentId: string) {
    return this.prisma.examResult.findMany({
      where: { studentId },
      include: {
        exam: { include: { course: { select: { name: true, code: true } } } },
      },
      orderBy: { exam: { scheduledAt: 'desc' } },
    });
  }

  async calculateGrade(marksObtained: number, totalMarks: number): Promise<{ grade: string; points: number }> {
    const percentage = (marksObtained / totalMarks) * 100;
    if (percentage >= 90) return { grade: 'A+', points: 10 };
    if (percentage >= 80) return { grade: 'A', points: 9 };
    if (percentage >= 70) return { grade: 'B+', points: 8 };
    if (percentage >= 60) return { grade: 'B', points: 7 };
    if (percentage >= 50) return { grade: 'C+', points: 6 };
    if (percentage >= 45) return { grade: 'C', points: 5 };
    if (percentage >= 40) return { grade: 'D', points: 4 };
    return { grade: 'F', points: 0 };
  }

  async generateHallTicket(examId: string, studentId: string) {
    const exam = await this.findById(examId);
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const qrCode = `${examId}-${studentId}-${Date.now()}`;

    return this.prisma.hallTicket.upsert({
      where: { examId_studentId: { examId, studentId } },
      update: { issuedAt: new Date(), isValid: true, qrCode },
      create: { examId, studentId, qrCode },
    });
  }
}
