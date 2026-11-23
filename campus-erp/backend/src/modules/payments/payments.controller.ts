import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('revenue/summary')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get revenue summary' })
  async getRevenueSummary(
    @Query('institutionId') institutionId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.paymentsService.getRevenueSummary(institutionId, from, to);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all payments' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.paymentsService.findAll({ skip: ((page || 1) - 1) * (limit || 10), take: limit || 10 });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by ID' })
  async findById(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Post('process')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process a payment' })
  async processPayment(@Body() data: { feeRecordId: string; amount: number; method: string; transactionId?: string; receiptUrl?: string }) {
    return this.paymentsService.processPayment(data);
  }
}
