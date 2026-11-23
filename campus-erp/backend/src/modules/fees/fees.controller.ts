import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeesService } from './fees.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Fees')
@Controller('fees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Get('structures')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get fee structures' })
  async getStructures(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.feesService.getFeeStructures({
      skip: ((page || 1) - 1) * (limit || 10),
      take: limit || 10,
    });
  }

  @Post('structures')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create fee structure' })
  async createStructure(@Body() data: any) {
    return this.feesService.createFeeStructure(data);
  }

  @Post('records')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create fee record for student' })
  async createRecord(@Body() data: any) {
    return this.feesService.createFeeRecord(data);
  }

  @Get('student/:studentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get fee records for a student' })
  async getStudentFees(@Param('studentId') studentId: string) {
    return this.feesService.getStudentFees(studentId);
  }

  @Get('analytics')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get fee analytics' })
  async getAnalytics(@Query('institutionId') institutionId?: string) {
    return this.feesService.getFeeAnalytics(institutionId);
  }

  @Post(':id/pay')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process payment for a fee record' })
  async processPayment(@Param('id') id: string, @Body() data: any) {
    return this.feesService.processPayment(id, data);
  }

  @Get('payments')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment history' })
  async getPaymentHistory(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('studentId') studentId?: string,
  ) {
    const where: any = {};
    if (studentId) where.feeRecord = { studentId };
    return this.feesService.getPaymentHistory({
      skip: ((page || 1) - 1) * (limit || 10),
      take: limit || 10,
      where,
    });
  }
}
