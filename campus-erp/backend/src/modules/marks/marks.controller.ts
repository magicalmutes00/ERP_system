import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarksService } from './marks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Marks')
@Controller('marks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all marks' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('courseId') courseId?: string,
    @Query('studentId') studentId?: string,
  ) {
    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (studentId) where.studentId = studentId;
    return this.marksService.findAll({ skip: ((page || 1) - 1) * (limit || 10), take: limit || 10, where });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get mark by ID' })
  async findById(@Param('id') id: string) {
    return this.marksService.findById(id);
  }

  @Post()
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create mark entry' })
  async create(@Body() data: any) {
    return this.marksService.create(data);
  }

  @Patch(':id')
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update mark' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.marksService.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete mark' })
  async remove(@Param('id') id: string) {
    return this.marksService.remove(id);
  }
}
