import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async markAttendance(data: {
    studentId: string;
    courseId: string;
    facultyId: string;
    status: AttendanceStatus;
    date?: Date;
    latitude?: number;
    longitude?: number;
    method?: string;
  }) {
    const existing = await this.prisma.attendance.findUnique({
      where: {
        studentId_courseId_date: {
          studentId: data.studentId,
          courseId: data.courseId,
          date: data.date ? new Date(data.date.setHours(0, 0, 0, 0)) : new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    if (existing) {
      return this.prisma.attendance.update({
        where: { id: existing.id },
        data: { status: data.status, method: data.method || 'MANUAL' },
      });
    }

    return this.prisma.attendance.create({
      data: {
        studentId: data.studentId,
        courseId: data.courseId,
        facultyId: data.facultyId,
        status: data.status,
        date: data.date || new Date(),
        method: data.method || 'MANUAL',
        latitude: data.latitude,
        longitude: data.longitude,
      },
      include: {
        student: { include: { user: { select: { email: true } } } },
        course: true,
      },
    });
  }

  async markBulkAttendance(records: Array<{
    studentId: string;
    courseId: string;
    facultyId: string;
    status: AttendanceStatus;
  }>) {
    const results: any[] = [];
    for (const record of records) {
      results.push(await this.markAttendance(record));
    }
    return results;
  }

  async findByCourseAndDate(courseId: string, date: string) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.prisma.attendance.findMany({
      where: {
        courseId,
        date: { gte: startDate, lte: endDate },
      },
      include: {
        student: {
          include: { user: { select: { email: true, phone: true } } },
        },
      },
      orderBy: { student: { firstName: 'asc' } },
    });
  }

  async findMyAttendance(studentId: string, params: { courseId?: string; from?: string; to?: string }) {
    const where: any = { studentId };
    if (params.courseId) where.courseId = params.courseId;
    if (params.from || params.to) {
      where.date = {};
      if (params.from) where.date.gte = new Date(params.from);
      if (params.to) where.date.lte = new Date(params.to);
    }

    return this.prisma.attendance.findMany({
      where,
      include: { course: { select: { id: true, name: true, code: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async getAttendanceReport(studentId: string, courseId?: string) {
    const where: any = { studentId };
    if (courseId) where.courseId = courseId;

    const records = await this.prisma.attendance.findMany({ where });
    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const late = records.filter(r => r.status === 'LATE').length;
    const leave = records.filter(r => r.status === 'LEAVE').length;

    return {
      total,
      present,
      absent,
      late,
      leave,
      percentage: total > 0 ? ((present + late) / total * 100).toFixed(2) : '0',
    };
  }

  async getQRCodeData(courseId: string, facultyId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const timestamp = Date.now();
    const sessionId = `${courseId}-${facultyId}-${timestamp}`;
    return {
      sessionId,
      courseId,
      facultyId,
      timestamp,
      expiresAt: timestamp + 300000, // 5 min expiry
    };
  }

  async markByQR(qrData: { sessionId: string; studentId: string; facultyId: string }) {
    const parts = qrData.sessionId.split('-');
    const courseId = parts[0];
    const timestamp = parseInt(parts[2]);
    const now = Date.now();

    if (now - timestamp > 300000) {
      throw new BadRequestException('QR code expired');
    }

    return this.markAttendance({
      studentId: qrData.studentId,
      courseId,
      facultyId: qrData.facultyId,
      status: 'PRESENT',
      method: 'QR',
    });
  }
}
