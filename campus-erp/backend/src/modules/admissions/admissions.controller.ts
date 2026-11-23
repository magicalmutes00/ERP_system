import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdmissionsService } from './admissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admissions')
@Controller('admissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Get('students')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admitted students' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.admissionsService.findAll({ skip: ((page || 1) - 1) * (limit || 10), take: limit || 10 });
  }

  @Post('enroll')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enroll student in course' })
  async enroll(@Body() data: { studentId: string; courseId: string; semester: number }) {
    return this.admissionsService.enrollStudent(data);
  }

  @Post('bulk-enroll')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk enroll students' })
  async bulkEnroll(@Body() data: Array<{ studentId: string; courseId: string; semester: number }>) {
    return this.admissionsService.bulkEnroll(data);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get enrollment statistics' })
  async getStats() {
    return this.admissionsService.getEnrollmentStats();
  }
}
