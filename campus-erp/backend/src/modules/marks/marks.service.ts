import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MarksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { skip?: number; take?: number; where?: Prisma.MarkWhereInput }) {
    const { skip, take, where } = params;
    const [data, total] = await Promise.all([
      this.prisma.mark.findMany({
        skip, take, where,
        include: {
          student: { select: { id: true, firstName: true, lastName: true, enrollmentNo: true } },
          course: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mark.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    const mark = await this.prisma.mark.findUnique({
      where: { id },
      include: { student: true, course: true },
    });
    if (!mark) throw new NotFoundException('Mark not found');
    return mark;
  }

  async create(data: Prisma.MarkCreateInput) {
    return this.prisma.mark.create({
      data,
      include: { student: true, course: true },
    });
  }

  async update(id: string, data: Prisma.MarkUpdateInput) {
    await this.findById(id);
    return this.prisma.mark.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.mark.delete({ where: { id } });
    return { message: 'Mark deleted successfully' };
  }

  async getStudentMarks(studentId: string) {
    return this.prisma.mark.findMany({
      where: { studentId },
      include: { course: { select: { name: true, code: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCourseMarks(courseId: string) {
    return this.prisma.mark.findMany({
      where: { courseId },
      include: { student: { select: { firstName: true, lastName: true, enrollmentNo: true } } },
      orderBy: { student: { firstName: 'asc' } },
    });
  }
}
