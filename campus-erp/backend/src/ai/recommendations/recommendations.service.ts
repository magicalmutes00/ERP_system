import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async recommendCourses(userId: string): Promise<any[]> {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        enrollments: {
          include: { course: { include: { department: true } } },
        },
        marks: { include: { course: true } },
      },
    });

    if (!student) return [];

    const enrolledCourseIds = new Set(student.enrollments.map(e => e.courseId));
    const departmentIds = new Set(
      student.enrollments
        .map(e => e.course.departmentId)
        .filter((id): id is string => id !== null,
      ),
    );

    const strongSubjects = student.marks
      .filter(m => (m.marks / m.totalMarks) >= 0.7)
      .map(m => m.course);

    const relatedCourses = await this.prisma.course.findMany({
      where: {
        departmentId: { in: Array.from(departmentIds) },
        id: { notIn: Array.from(enrolledCourseIds) },
        isActive: true,
      },
      include: {
        department: true,
        _count: { select: { enrollments: true } },
      },
      take: 10,
    });

    return relatedCourses
      .map(course => {
        let score = 0;
        if (strongSubjects.some(s => s.departmentId === course.departmentId)) score += 30;
        const enrollmentCount = (course as any)._count?.enrollments ?? 0;
        score += Math.min(enrollmentCount * 2, 30);
        return { ...course, recommendationScore: score, reason: this.getRecommendationReason(score) };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  private getRecommendationReason(score: number): string {
    if (score >= 50) return 'Highly recommended based on your performance and interests';
    if (score >= 30) return 'Recommended as a related course to your current studies';
    return 'Popular course among students in your department';
  }
}
