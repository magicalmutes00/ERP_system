import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Timetable')
@Controller('timetable')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all timetable entries' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('courseId') courseId?: string,
    @Query('classroomId') classroomId?: string,
    @Query('dayOfWeek') dayOfWeek?: number,
  ) {
    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (classroomId) where.classroomId = classroomId;
    if (dayOfWeek) where.dayOfWeek = dayOfWeek;

    return this.timetableService.findAll({
      skip: ((page || 1) - 1) * (limit || 10),
      take: limit || 10,
      where,
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ] as Prisma.TimetableOrderByWithRelationInput[],
    });
  }

  @Get('day/:day')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get timetable by day of week' })
  async findByDay(@Param('day') day: number) {
    return this.timetableService.findByDay(day);
  }

  @Get('faculty/:facultyId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get timetable by faculty' })
  async findByFaculty(@Param('facultyId') facultyId: string) {
    return this.timetableService.findByFaculty(facultyId);
  }

  @Get('weekly')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weekly timetable' })
  async getWeekly(@Query('courseId') courseId?: string) {
    return this.timetableService.generateWeeklyTimetable(courseId);
  }

  @Get('check-conflicts')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check for time slot conflicts' })
  async checkConflicts(
    @Query('classroomId') classroomId: string,
    @Query('dayOfWeek') dayOfWeek: number,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('excludeId') excludeId?: string,
  ) {
    return this.timetableService.checkForConflicts({
      classroomId, dayOfWeek, startTime, endTime, excludeId,
    });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get timetable entry by ID' })
  async findById(@Param('id') id: string) {
    return this.timetableService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create timetable entry' })
  async create(@Body() data: any) {
    return this.timetableService.create(data);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update timetable entry' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.timetableService.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete timetable entry' })
  async remove(@Param('id') id: string) {
    return this.timetableService.remove(id);
  }
}
