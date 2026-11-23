import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboard(@Query('institutionId') institutionId?: string) {
    return this.analyticsService.getDashboardStats(institutionId);
  }

  @Get('attendance/trends')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get attendance trends (daily/weekly/monthly)' })
  async getAttendanceTrends(
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'monthly',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getAttendanceTrends(period, from, to);
  }

  @Get('performance')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get performance analytics (grade distribution, pass/fail)' })
  async getPerformance(@Query('courseId') courseId?: string) {
    return this.analyticsService.getPerformanceAnalytics(courseId);
  }

  @Get('revenue')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get revenue analytics (monthly fee collection)' })
  async getRevenue(@Query('year') year?: number) {
    return this.analyticsService.getRevenueAnalytics(year);
  }
}
