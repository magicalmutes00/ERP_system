import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FacultyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.FacultyWhereInput;
    orderBy?: Prisma.FacultyOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    const [data, total] = await Promise.all([
      this.prisma.faculty.findMany({
        skip, take, where, orderBy,
        include: {
          user: { select: { email: true, phone: true, isActive: true } },
          department: true,
          _count: { select: { courseFaculty: true } },
        },
      }),
      this.prisma.faculty.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, phone: true, isActive: true, role: true } },
        department: true,
        courseFaculty: {
          include: { course: { select: { id: true, name: true, code: true, credits: true } } },
        },
      },
    });
    if (!faculty) throw new NotFoundException('Faculty not found');
    return faculty;
  }

  async findByUserId(userId: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { userId },
      include: {
        department: true,
        courseFaculty: {
          include: { course: { select: { id: true, name: true, code: true, credits: true } } },
        },
      },
    });
    if (!faculty) throw new NotFoundException('Faculty profile not found');
    return faculty;
  }

  async create(data: Prisma.FacultyCreateInput) {
    return this.prisma.faculty.create({
      data,
      include: {
        user: { select: { email: true } },
        department: true,
      },
    });
  }

  async update(id: string, data: Prisma.FacultyUpdateInput) {
    const faculty = await this.prisma.faculty.findUnique({ where: { id } });
    if (!faculty) throw new NotFoundException('Faculty not found');

    return this.prisma.faculty.update({
      where: { id },
      data,
      include: {
        user: { select: { email: true } },
        department: true,
      },
    });
  }

  async remove(id: string) {
    const faculty = await this.prisma.faculty.findUnique({ where: { id } });
    if (!faculty) throw new NotFoundException('Faculty not found');

    await this.prisma.faculty.delete({ where: { id } });
    return { message: 'Faculty deleted successfully' };
  }

  async getMyCourses(facultyId: string) {
    const faculty = await this.prisma.faculty.findUnique({ where: { id: facultyId } });
    if (!faculty) throw new NotFoundException('Faculty not found');

    return this.prisma.courseFaculty.findMany({
      where: { facultyId },
      include: {
        course: {
          include: {
            _count: { select: { enrollments: true } },
          },
        },
      },
    });
  }

  async getMySchedule(facultyId: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id: facultyId },
      include: { courseFaculty: { select: { courseId: true } } },
    });
    if (!faculty) throw new NotFoundException('Faculty not found');

    const courseIds = faculty.courseFaculty.map(cf => cf.courseId);

    return this.prisma.timetable.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        course: { select: { id: true, name: true, code: true } },
        classroom: { include: { building: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }
}
