import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

interface PredictionResult {
  predictedPercentage: number;
  trend: 'improving' | 'declining' | 'stable';
  confidence: number;
  factors: string[];
  recommendations: string[];
}

@Injectable()
export class PredictionsService {
  private readonly logger = new Logger(PredictionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async predictAttendance(courseId: string): Promise<PredictionResult> {
    const records = await this.prisma.attendance.findMany({
      where: { courseId },
      orderBy: { date: 'asc' },
    });

    if (records.length < 5) {
      return {
        predictedPercentage: 0,
        trend: 'stable',
        confidence: 0,
        factors: ['Insufficient data for prediction'],
        recommendations: ['Continue marking attendance regularly to enable predictions'],
      };
    }

    const weeklyPercentages = this.calculateWeeklyPercentages(records);
    const trend = this.analyzeTrend(weeklyPercentages);
    const predictedPercentage = this.extrapolate(weeklyPercentages);

    return {
      predictedPercentage: Math.round(predictedPercentage * 100) / 100,
      trend,
      confidence: Math.min(records.length / 20, 0.95),
      factors: this.identifyFactors(records),
      recommendations: this.generateRecommendations(trend, predictedPercentage),
    };
  }

  async predictOverallAttendance(institutionId: string) {
    const totalStudents = await this.prisma.student.count({ where: { department: { institutionId } } });
    const attendanceRecords = await this.prisma.attendance.findMany({
      where: { student: { department: { institutionId } } },
    });

    const present = attendanceRecords.filter(a => a.status === 'PRESENT').length;
    const overall = attendanceRecords.length > 0 ? (present / attendanceRecords.length) * 100 : 0;

    return {
      overallPercentage: Math.round(overall * 100) / 100,
      totalStudents,
      averagePerStudent: totalStudents > 0 ? Math.round(attendanceRecords.length / totalStudents) : 0,
      predictedNextMonth: Math.round((overall * 0.95) * 100) / 100,
    };
  }

  async getPerformanceInsights(institutionId: string) {
    const results = await this.prisma.examResult.findMany({
      where: { exam: { course: { institutionId } } },
      include: { exam: { select: { totalMarks: true } } },
    });

    const scores = results
      .filter(r => r.marksObtained != null && r.exam.totalMarks > 0)
      .map(r => (r.marksObtained! / r.exam.totalMarks) * 100);

    const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const topPerformers = scores.filter(s => s >= 80).length;
    const atRisk = scores.filter(s => s < 40).length;

    return {
      averageScore: Math.round(average * 100) / 100,
      totalExamsTaken: results.length,
      topPerformers,
      atRiskStudents: atRisk,
      distribution: {
        excellent: scores.filter(s => s >= 90).length,
        good: scores.filter(s => s >= 75 && s < 90).length,
        average: scores.filter(s => s >= 50 && s < 75).length,
        belowAverage: scores.filter(s => s >= 40 && s < 50).length,
        poor: scores.filter(s => s < 40).length,
      },
    };
  }

  async getAtRiskStudents(institutionId?: string, courseId?: string): Promise<any[]> {
    const where: any = {};
    if (courseId) {
      where.enrollments = { some: { courseId, status: 'ACTIVE' } };
    }
    if (institutionId) {
      where.department = { institutionId };
    }

    const students = await this.prisma.student.findMany({
      where,
      include: {
        user: { select: { email: true } },
        attendance: true,
        examResults: { include: { exam: true } },
        marks: true,
      },
    });

    return students
      .map(s => {
        const attendancePercent = s.attendance.length > 0
          ? (s.attendance.filter(a => a.status === 'PRESENT').length / s.attendance.length) * 100
          : 0;

        const avgMarks = s.marks.length > 0
          ? s.marks.reduce((sum, m) => sum + (m.marks / m.totalMarks), 0) / s.marks.length * 100
          : 0;

        const riskScore = this.calculateRiskScore(attendancePercent, avgMarks);

        return {
          studentId: s.id,
          name: `${s.firstName} ${s.lastName}`,
          enrollmentNo: s.enrollmentNo,
          attendancePercent: Math.round(attendancePercent * 100) / 100,
          averageMarks: Math.round(avgMarks * 100) / 100,
          riskScore,
          riskLevel: riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW',
        };
      })
      .filter(s => s.riskScore > 30)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 50);
  }

  private calculateRiskScore(attendance: number, marks: number): number {
    let score = 0;
    if (attendance < 75) score += 40;
    else if (attendance < 85) score += 20;
    if (marks < 40) score += 40;
    else if (marks < 60) score += 20;
    if (attendance < 75 && marks < 40) score += 20;
    return Math.min(score, 100);
  }

  private calculateWeeklyPercentages(records: any[]): number[] {
    const weekly: { [key: string]: { present: number; total: number } } = {};
    records.forEach(r => {
      const date = new Date(r.date);
      const week = `${date.getFullYear()}-W${this.getWeekNumber(date)}`;
      if (!weekly[week]) weekly[week] = { present: 0, total: 0 };
      weekly[week].total++;
      if (r.status === 'PRESENT') weekly[week].present++;
    });
    return Object.values(weekly).map(w => (w.present / w.total) * 100);
  }

  private analyzeTrend(percentages: number[]): 'improving' | 'declining' | 'stable' {
    if (percentages.length < 2) return 'stable';
    const recent = percentages.slice(-3);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const diff = last - first;
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  private extrapolate(percentages: number[]): number {
    if (percentages.length < 2) return percentages[0] || 75;
    const recent = percentages.slice(-3);
    return recent.reduce((a, b) => a + b, 0) / recent.length;
  }

  private identifyFactors(records: any[]): string[] {
    const factors: string[] = [];
    const mondayRecords = records.filter(r => new Date(r.date).getDay() === 1);
    if (mondayRecords.length > 0) {
      const mondayAbsent = mondayRecords.filter(r => r.status === 'ABSENT').length;
      if (mondayAbsent / mondayRecords.length > 0.3) {
        factors.push('Higher absenteeism on Mondays');
      }
    }
    return factors;
  }

  private generateRecommendations(trend: string, predictedPercentage: number): string[] {
    const recommendations: string[] = [];
    if (trend === 'declining' || predictedPercentage < 75) {
      recommendations.push('Schedule awareness sessions about attendance importance');
      recommendations.push('Set up automated attendance alerts for students and parents');
    }
    if (predictedPercentage < 85) {
      recommendations.push('Consider implementing rewards for regular attendance');
    }
    return recommendations;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  }
}
