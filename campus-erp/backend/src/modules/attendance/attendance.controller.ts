import { Controller, Get, Post, Param, Query, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark')
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark attendance for a student' })
  async markAttendance(@Body() data: any, @CurrentUser() user: any) {
    return this.attendanceService.markAttendance({
      ...data,
      facultyId: user.sub,
    });
  }

  @Post('bulk')
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark bulk attendance' })
  async markBulk(@Body() records: any[], @CurrentUser() user: any) {
    const withFaculty = records.map(r => ({ ...r, facultyId: user.sub }));
    return this.attendanceService.markBulkAttendance(withFaculty);
  }

  @Get('course/:courseId/date/:date')
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get attendance by course and date' })
  async getByCourseAndDate(
    @Param('courseId') courseId: string,
    @Param('date') date: string,
  ) {
    return this.attendanceService.findByCourseAndDate(courseId, date);
  }

  @Get('my')
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my attendance records' })
  async getMyAttendance(
    @CurrentUser() user: any,
    @Query('courseId') courseId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const student = await this.getStudentByUserId(user.sub);
    return this.attendanceService.findMyAttendance(student.id, { courseId, from, to });
  }

  @Get('report')
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get attendance report' })
  async getReport(
    @CurrentUser() user: any,
    @Query('courseId') courseId?: string,
  ) {
    const student = await this.getStudentByUserId(user.sub);
    return this.attendanceService.getAttendanceReport(student.id, courseId);
  }

  @Get('qr/:courseId')
  @Roles(UserRole.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate QR code for attendance' })
  async getQR(@Param('courseId') courseId: string, @CurrentUser() user: any) {
    return this.attendanceService.getQRCodeData(courseId, user.sub);
  }

  @Post('qr/mark')
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark attendance via QR' })
  async markByQR(@Body() data: any, @CurrentUser() user: any) {
    const student = await this.getStudentByUserId(user.sub);
    return this.attendanceService.markByQR({
      sessionId: data.sessionId,
      studentId: student.id,
      facultyId: data.facultyId,
    });
  }

  private async getStudentByUserId(userId: string) {
    const { PrismaService } = require('../../database/prisma.service');
    const prisma = new PrismaService();
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Student profile not found');
    return student;
  }
}
