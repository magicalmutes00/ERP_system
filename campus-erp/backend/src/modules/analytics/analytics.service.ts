import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(institutionId?: string) {
    const where: any = {};
    if (institutionId) where.institutionId = institutionId;

    const [
      totalStudents,
      totalFaculty,
      totalCourses,
      totalDepartments,
      attendanceRecords,
      feeRecords,
    ] = await Promise.all([
      this.prisma.student.count({ where: { ...where, isActive: true } }),
      this.prisma.faculty.count({ where: { ...where, isActive: true } }),
      this.prisma.course.count({ where: { ...where, isActive: true } }),
      this.prisma.department.count({ where: { ...where, isActive: true } }),
      this.prisma.attendance.findMany({ select: { status: true } }),
      this.prisma.feeRecord.findMany({ select: { amount: true, paidAmount: true, status: true } }),
    ]);

    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT').length;
    const attendancePercent = totalAttendance > 0
      ? ((presentCount / totalAttendance) * 100).toFixed(2)
      : '0';

    const totalRevenue = feeRecords.reduce((s, r) => s + r.paidAmount, 0);
    const totalAssigned = feeRecords.reduce((s, r) => s + r.amount, 0);
    const pendingFees = feeRecords.filter(r => r.status === 'PENDING' || r.status === 'OVERDUE').length;

    return {
      totalStudents,
      totalFaculty,
      totalCourses,
      totalDepartments,
      attendance: {
        total: totalAttendance,
        present: presentCount,
        percentage: `${attendancePercent}%`,
      },
      revenue: {
        totalCollected: totalRevenue,
        totalAssigned,
        outstanding: totalAssigned - totalRevenue,
        pendingRecords: pendingFees,
      },
    };
  }

  async getAttendanceTrends(period: 'daily' | 'weekly' | 'monthly', dateFrom?: string, dateTo?: string) {
    const where: any = {};
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const records = await this.prisma.attendance.findMany({
      where,
      select: { date: true, status: true },
      orderBy: { date: 'asc' },
    });

    const trendsMap = new Map<string, { present: number; absent: number; late: number; leave: number; total: number }>();

    for (const record of records) {
      let key: string;
      const d = new Date(record.date);

      if (period === 'daily') {
        key = d.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay());
        key = startOfWeek.toISOString().split('T')[0];
      } else {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!trendsMap.has(key)) {
        trendsMap.set(key, { present: 0, absent: 0, late: 0, leave: 0, total: 0 });
      }

      const entry = trendsMap.get(key)!;
      entry.total++;
      if (record.status === 'PRESENT') entry.present++;
      else if (record.status === 'ABSENT') entry.absent++;
      else if (record.status === 'LATE') entry.late++;
      else if (record.status === 'LEAVE') entry.leave++;
    }

    return Array.from(trendsMap.entries()).map(([periodKey, counts]) => ({
      period: periodKey,
      ...counts,
      percentage: counts.total > 0
        ? ((counts.present + counts.late) / counts.total * 100).toFixed(2)
        : '0',
    }));
  }

  async getPerformanceAnalytics(courseId?: string) {
    const where: any = {};
    if (courseId) where.courseId = courseId;

    const results = await this.prisma.examResult.findMany({
      where,
      include: { exam: { select: { title: true, courseId: true, totalMarks: true } } },
    });

    const gradeDistribution: Record<string, number> = {};
    let passCount = 0;
    let failCount = 0;
    let totalMarksSum = 0;
    let maxMarksSum = 0;

    for (const r of results) {
      if (r.marksObtained == null) continue;
      const pct = (r.marksObtained / (r.exam.totalMarks || 100)) * 100;
      let grade: string;
      if (pct >= 90) grade = 'A+';
      else if (pct >= 80) grade = 'A';
      else if (pct >= 70) grade = 'B+';
      else if (pct >= 60) grade = 'B';
      else if (pct >= 50) grade = 'C+';
      else if (pct >= 40) grade = 'C';
      else grade = 'F';

      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
      if (pct >= 40) passCount++; else failCount++;
      totalMarksSum += r.marksObtained;
      maxMarksSum += r.exam.totalMarks || 100;
    }

    const total = results.length;

    return {
      totalStudents: total,
      passCount,
      failCount,
      passRate: total > 0 ? ((passCount / total) * 100).toFixed(2) : '0',
      failRate: total > 0 ? ((failCount / total) * 100).toFixed(2) : '0',
      averageMarks: maxMarksSum > 0 ? (totalMarksSum / maxMarksSum * 100).toFixed(2) : '0',
      gradeDistribution,
    };
  }

  async getRevenueAnalytics(year?: number) {
    const currentYear = year || new Date().getFullYear();
    const startDate = new Date(`${currentYear}-01-01`);
    const endDate = new Date(`${currentYear + 1}-01-01`);

    const payments = await this.prisma.payment.findMany({
      where: {
        paidAt: { gte: startDate, lt: endDate },
        status: 'PAID',
      },
      select: { amount: true, paidAt: true },
      orderBy: { paidAt: 'asc' },
    });

    const monthlyMap = new Map<string, number>();
    for (let i = 0; i < 12; i++) {
      monthlyMap.set(`${currentYear}-${String(i + 1).padStart(2, '0')}`, 0);
    }

    let totalRevenue = 0;
    for (const p of payments) {
      const month = new Date(p.paidAt).getMonth();
      const key = `${currentYear}-${String(month + 1).padStart(2, '0')}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + p.amount);
      totalRevenue += p.amount;
    }

    return {
      year: currentYear,
      totalRevenue,
      monthly: Array.from(monthlyMap.entries()).map(([month, amount]) => ({
        month,
        amount,
      })),
    };
  }
}
