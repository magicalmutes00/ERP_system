import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AiTimetableService {
  private readonly logger = new Logger(AiTimetableService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generate(departmentId: string, semester: number): Promise<any> {
    const courses = await this.prisma.course.findMany({
      where: { departmentId, isActive: true },
      include: {
        courseFaculty: {
          include: { faculty: true },
        },
        enrollments: {
          where: { semester, status: 'ACTIVE' },
        },
      },
    });

    const classrooms = await this.prisma.classroom.findMany({
      include: { building: true },
    });

    if (courses.length === 0 || classrooms.length === 0) {
      return { message: 'Insufficient data to generate timetable', courses: courses.length, classrooms: classrooms.length };
    }

    const timetable: any[] = [];
    const usedSlots = new Set<string>();

    for (const course of courses) {
      const faculty = course.courseFaculty[0]?.faculty;
      if (!faculty) continue;

      const lecturesPerWeek = course.credits || 3;
      let scheduled = 0;
      let attempts = 0;

      while (scheduled < Math.min(lecturesPerWeek, 5) && attempts < 50) {
        attempts++;
        const dayOfWeek = Math.floor(Math.random() * 5) + 1;
        const startHour = 8 + Math.floor(Math.random() * 8);
        const startTime = `${startHour.toString().padStart(2, '0')}:00`;
        const endTime = `${(startHour + 1).toString().padStart(2, '0')}:00`;

        const slot = `${dayOfWeek}-${startTime}-${course.id}`;
        if (usedSlots.has(slot)) continue;

        const classroom = this.findAvailableClassroom(classrooms, dayOfWeek, startTime, endTime, usedSlots);
        if (!classroom) continue;

        usedSlots.add(slot);
        timetable.push({
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          facultyId: faculty.id,
          facultyName: `${faculty.firstName} ${faculty.lastName}`,
          classroomId: classroom.id,
          classroomName: classroom.name,
          buildingName: classroom.building.name,
          dayOfWeek,
          dayName: this.getDayName(dayOfWeek),
          startTime,
          endTime,
          studentCount: course.enrollments.length,
        });
        scheduled++;
      }
    }

    const stats = this.generateStats(timetable);

    return {
      timetable,
      stats,
      summary: {
        totalSlots: timetable.length,
        coursesScheduled: new Set(timetable.map(t => t.courseId)).size,
        daysCovered: new Set(timetable.map(t => t.dayOfWeek)).size,
        classroomsUsed: new Set(timetable.map(t => t.classroomId)).size,
      },
    };
  }

  private findAvailableClassroom(
    classrooms: any[],
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    usedSlots: Set<string>,
  ): any | null {
    const shuffled = [...classrooms].sort(() => Math.random() - 0.5);
    for (const classroom of shuffled) {
      const slot = `${dayOfWeek}-${startTime}-${classroom.id}`;
      if (!usedSlots.has(slot)) {
        usedSlots.add(slot);
        return classroom;
      }
    }
    return null;
  }

  private generateStats(timetable: any[]): any {
    const dayDistribution: Record<string, number> = {};
    timetable.forEach(t => {
      dayDistribution[t.dayName] = (dayDistribution[t.dayName] || 0) + 1;
    });

    return {
      dayDistribution,
      peakHours: this.getPeakHours(timetable),
    };
  }

  private getPeakHours(timetable: any[]): Array<{ hour: string; count: number }> {
    const hourCounts: Record<string, number> = {};
    timetable.forEach(t => {
      hourCounts[t.startTime] = (hourCounts[t.startTime] || 0) + 1;
    });
    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count);
  }

  private getDayName(day: number): string {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[day - 1] || 'Unknown';
  }
}
