import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Exams')
@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all exams' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('courseId') courseId?: string,
  ) {
    const where: any = {};
    if (courseId) where.courseId = courseId;
    return this.examsService.findAll({ skip: ((page || 1) - 1) * (limit || 10), take: limit || 10, where });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get exam by ID' })
  async findById(@Param('id') id: string) {
    return this.examsService.findById(id);
  }

  @Get('student/results')
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my exam results' })
  async getMyResults(@CurrentUser() user: any) {
    const { PrismaService } = require('../../database/prisma.service');
    const prisma = new PrismaService();
    const student = await prisma.student.findUnique({ where: { userId: user.sub } });
    return this.examsService.getStudentResults(student.id);
  }

  @Post()
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create exam' })
  async create(@Body() data: any) {
    return this.examsService.create(data);
  }

  @Patch(':id')
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update exam' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.examsService.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete exam' })
  async remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }

  @Post(':id/publish')
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish exam results' })
  async publishResults(@Param('id') id: string) {
    return this.examsService.publishResults(id);
  }

  @Post(':id/hallticket/:studentId')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate hall ticket' })
  async generateHallTicket(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.examsService.generateHallTicket(id, studentId);
  }
}
