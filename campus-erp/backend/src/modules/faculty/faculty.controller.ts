import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FacultyService } from './faculty.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Faculty')
@Controller('faculty')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get()
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all faculty' })
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
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.facultyService.findAll({
      skip: ((page || 1) - 1) * (limit || 10),
      take: limit || 10,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my faculty profile' })
  async getMyProfile(@CurrentUser() user: any) {
    return this.facultyService.findByUserId(user.sub);
  }

  @Get('me/courses')
  @Roles(UserRole.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my courses' })
  async getMyCourses(@CurrentUser() user: any) {
    const faculty = await this.facultyService.findByUserId(user.sub);
    return this.facultyService.getMyCourses(faculty.id);
  }

  @Get('me/schedule')
  @Roles(UserRole.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my schedule' })
  async getMySchedule(@CurrentUser() user: any) {
    const faculty = await this.facultyService.findByUserId(user.sub);
    return this.facultyService.getMySchedule(faculty.id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get faculty by ID' })
  async findById(@Param('id') id: string) {
    return this.facultyService.findById(id);
  }

  @Get(':id/courses')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get courses taught by faculty' })
  async getCourses(@Param('id') id: string) {
    return this.facultyService.getMyCourses(id);
  }

  @Get(':id/schedule')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get faculty schedule' })
  async getSchedule(@Param('id') id: string) {
    return this.facultyService.getMySchedule(id);
  }

  @Post()
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new faculty' })
  async create(@Body() data: any) {
    return this.facultyService.create(data);
  }

  @Patch(':id')
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update faculty' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.facultyService.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete faculty' })
  async remove(@Param('id') id: string) {
    return this.facultyService.remove(id);
  }
}
