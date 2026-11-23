import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Assignments')
@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all assignments' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('courseId') courseId?: string,
  ) {
    const where: any = {};
    if (courseId) where.courseId = courseId;
    return this.assignmentsService.findAll({
      skip: ((page || 1) - 1) * (limit || 10),
      take: limit || 10,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get assignment by ID' })
  async findById(@Param('id') id: string) {
    return this.assignmentsService.findById(id);
  }

  @Get('course/:courseId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get assignments by course' })
  async findByCourse(@Param('courseId') courseId: string) {
    return this.assignmentsService.findByCourse(courseId);
  }

  @Post()
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create assignment' })
  async create(@Body() data: any) {
    return this.assignmentsService.create(data);
  }

  @Patch(':id')
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update assignment' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.assignmentsService.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete assignment' })
  async remove(@Param('id') id: string) {
    return this.assignmentsService.remove(id);
  }

  @Post(':id/submit')
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit assignment' })
  async submit(
    @Param('id') id: string,
    @Body() data: any,
    @CurrentUser() user: any,
  ) {
    const student = await this.getStudentByUserId(user.sub);
    return this.assignmentsService.submitAssignment(id, student.id, data);
  }

  @Patch(':id/grade/:submissionId')
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Grade submission' })
  async grade(
    @Param('submissionId') submissionId: string,
    @Body() data: any,
  ) {
    return this.assignmentsService.gradeSubmission(submissionId, data);
  }

  private async getStudentByUserId(userId: string) {
    const { PrismaService } = require('../../database/prisma.service');
    const prisma = new PrismaService();
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) throw new Error('Student profile not found');
    return student;
  }
}
