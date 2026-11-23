import {
  Controller, Get, Post, Patch, Delete,
  Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Students')
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all students' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('departmentId') departmentId?: string,
    @Query('search') search?: string,
  ) {
    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { enrollmentNo: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.studentsService.findAll({
      skip: ((page || 1) - 1) * (limit || 10),
      take: limit || 10,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my student profile' })
  async getMyProfile(@CurrentUser() user: any) {
    return this.studentsService.findByUserId(user.sub);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student by ID' })
  async findById(@Param('id') id: string) {
    return this.studentsService.findById(id);
  }

  @Get(':id/analytics')
  @Roles(UserRole.ADMIN, UserRole.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student analytics' })
  async getAnalytics(@Param('id') id: string) {
    return this.studentsService.getStudentAnalytics(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new student' })
  async create(@Body() data: any) {
    return this.studentsService.create(data);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update student' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.studentsService.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete student' })
  async remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
