import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TimetableService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TimetableCreateInput) {
    await this.checkForConflicts({
      classroomId: data.classroom.connect?.id || (data.classroom as any).id,
      dayOfWeek: data.dayOfWeek as number,
      startTime: data.startTime as string,
      endTime: data.endTime as string,
    });

    return this.prisma.timetable.create({
      data,
      include: {
        course: { select: { id: true, name: true, code: true } },
        classroom: { include: { building: true } },
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TimetableWhereInput;
    orderBy?: Prisma.TimetableOrderByWithRelationInput | Prisma.TimetableOrderByWithRelationInput[];
  }) {
    const { skip, take, where, orderBy } = params;
    const [data, total] = await Promise.all([
      this.prisma.timetable.findMany({
        skip, take, where, orderBy,
        include: {
          course: { select: { id: true, name: true, code: true } },
          classroom: { include: { building: true } },
        },
      }),
      this.prisma.timetable.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    const entry = await this.prisma.timetable.findUnique({
      where: { id },
      include: {
        course: true,
        classroom: { include: { building: true } },
      },
    });
    if (!entry) throw new NotFoundException('Timetable entry not found');
    return entry;
  }

  async update(id: string, data: Prisma.TimetableUpdateInput) {
    await this.findById(id);
    return this.prisma.timetable.update({
      where: { id },
      data,
      include: {
        course: { select: { id: true, name: true, code: true } },
        classroom: { include: { building: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.timetable.delete({ where: { id } });
    return { message: 'Timetable entry deleted successfully' };
  }

  async findByDay(dayOfWeek: number) {
    return this.prisma.timetable.findMany({
      where: { dayOfWeek },
      include: {
        course: { select: { id: true, name: true, code: true } },
        classroom: { include: { building: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findByFaculty(facultyId: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id: facultyId },
      include: {
        courseFaculty: { select: { courseId: true } },
      },
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

  async checkForConflicts(data: {
    classroomId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    excludeId?: string;
  }) {
    const { classroomId, dayOfWeek, startTime, endTime, excludeId } = data;

    const overlapping = await this.prisma.timetable.findMany({
      where: {
        classroomId,
        dayOfWeek,
        id: excludeId ? { not: excludeId } : undefined,
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
      include: {
        course: { select: { name: true, code: true } },
      },
    });

    if (overlapping.length > 0) {
      throw new ConflictException({
        message: 'Time slot conflict detected',
        conflicts: overlapping.map(o => ({
          id: o.id,
          course: o.course,
          startTime: o.startTime,
          endTime: o.endTime,
        })),
      });
    }

    return { available: true };
  }

  async generateWeeklyTimetable(courseId?: string) {
    const where: any = { isRecurring: true };
    if (courseId) where.courseId = courseId;

    return this.prisma.timetable.findMany({
      where,
      include: {
        course: { select: { id: true, name: true, code: true } },
        classroom: { include: { building: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }
}
