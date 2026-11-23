import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DepartmentWhereInput;
    orderBy?: Prisma.DepartmentOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        skip, take, where, orderBy,
        include: {
          _count: { select: { students: true, faculty: true, courses: true } },
          hod: {
            include: { user: { select: { email: true } } },
          },
        },
      }),
      this.prisma.department.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        hod: { include: { user: { select: { email: true, phone: true } } } },
        _count: { select: { students: true, faculty: true, courses: true } },
        courses: {
          take: 20,
          orderBy: { name: 'asc' },
          select: { id: true, name: true, code: true, credits: true, isActive: true },
        },
      },
    });
    if (!department) throw new NotFoundException('Department not found');
    return department;
  }

  async create(data: Prisma.DepartmentCreateInput) {
    return this.prisma.department.create({
      data,
      include: {
        hod: { include: { user: { select: { email: true } } } },
      },
    });
  }

  async update(id: string, data: Prisma.DepartmentUpdateInput) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) throw new NotFoundException('Department not found');

    return this.prisma.department.update({
      where: { id },
      data,
      include: {
        hod: { include: { user: { select: { email: true } } } },
      },
    });
  }

  async remove(id: string) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) throw new NotFoundException('Department not found');

    await this.prisma.department.delete({ where: { id } });
    return { message: 'Department deleted successfully' };
  }

  async getDepartmentStats(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        hod: { include: { user: { select: { email: true } } } },
      },
    });
    if (!department) throw new NotFoundException('Department not found');

    const [studentCount, facultyCount, courseCount, attendanceData] = await Promise.all([
      this.prisma.student.count({ where: { departmentId: id, isActive: true } }),
      this.prisma.faculty.count({ where: { departmentId: id, isActive: true } }),
      this.prisma.course.count({ where: { departmentId: id, isActive: true } }),
      this.prisma.attendance.findMany({
        where: {
          student: { departmentId: id },
        },
        select: { status: true },
      }),
    ]);

    const totalAttendance = attendanceData.length;
    const present = attendanceData.filter(a => a.status === 'PRESENT').length;
    const attendancePercent = totalAttendance > 0
      ? ((present / totalAttendance) * 100).toFixed(2)
      : '0';

    return {
      id: department.id,
      name: department.name,
      code: department.code,
      hod: department.hod
        ? {
            id: department.hod.id,
            name: `${department.hod.firstName} ${department.hod.lastName}`,
            email: department.hod.user.email,
          }
        : null,
      stats: {
        totalStudents: studentCount,
        totalFaculty: facultyCount,
        totalCourses: courseCount,
        attendancePercentage: `${attendancePercent}%`,
      },
    };
  }
}
