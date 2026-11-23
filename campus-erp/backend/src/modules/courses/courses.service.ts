import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CourseWhereInput;
    orderBy?: Prisma.CourseOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          department: true,
          courseFaculty: {
            include: { faculty: { include: { user: { select: { email: true } } } } },
          },
          _count: { select: { enrollments: true, modules: true } },
        },
      }),
      this.prisma.course.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        department: true,
        courseFaculty: {
          include: { faculty: { include: { user: { select: { email: true } } } } },
        },
        modules: { orderBy: { order: 'asc' } },
        enrollments: {
          include: { student: { include: { user: { select: { email: true } } } } },
          take: 50,
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async create(data: Prisma.CourseCreateInput) {
    return this.prisma.course.create({
      data,
      include: { department: true },
    });
  }

  async update(id: string, data: Prisma.CourseUpdateInput) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return this.prisma.course.update({ where: { id }, data, include: { department: true } });
  }

  async remove(id: string) {
    await this.prisma.course.delete({ where: { id } });
    return { message: 'Course deleted successfully' };
  }

  async getCourseProgress(courseId: string, studentId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            moduleProgress: { where: { studentId } },
          },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    const totalModules = course.modules.length;
    const completedModules = course.modules.filter(m =>
      m.moduleProgress.length > 0 && m.moduleProgress[0].completed
    ).length;

    return {
      courseId,
      totalModules,
      completedModules,
      progress: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
    };
  }

  async getEnrolledStudents(courseId: string) {
    return this.prisma.enrollment.findMany({
      where: { courseId, status: 'ACTIVE' },
      include: {
        student: {
          include: { user: { select: { email: true, phone: true } } },
        },
      },
    });
  }
}
