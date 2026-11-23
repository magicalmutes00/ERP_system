import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { skip?: number; take?: number; where?: Prisma.StudentWhereInput }) {
    const { skip, take, where } = params;
    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        skip, take, where: { ...where, isActive: true },
        include: { department: true, user: { select: { email: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count({ where: { ...where, isActive: true } }),
    ]);
    return { data, total };
  }

  async enrollStudent(data: { studentId: string; courseId: string; semester: number }) {
    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId_semester: { studentId: data.studentId, courseId: data.courseId, semester: data.semester } },
    });
    if (existing) throw new ConflictException('Already enrolled in this course');

    return this.prisma.enrollment.create({
      data: { studentId: data.studentId, courseId: data.courseId, semester: data.semester },
      include: { student: true, course: true },
    });
  }

  async bulkEnroll(enrollments: Array<{ studentId: string; courseId: string; semester: number }>) {
    const results: any[] = [];
    for (const e of enrollments) {
      try {
        results.push(await this.enrollStudent(e));
      } catch (error) {
        results.push({ error: (error as Error).message, data: e });
      }
    }
    return results;
  }

  async getEnrollmentStats() {
    const total = await this.prisma.enrollment.count();
    const active = await this.prisma.enrollment.count({ where: { status: 'ACTIVE' } });
    return { total, active, completionRate: total > 0 ? ((total - active) / total * 100).toFixed(1) : '0' };
  }
}
