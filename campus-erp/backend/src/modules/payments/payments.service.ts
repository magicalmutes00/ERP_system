import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { skip?: number; take?: number; where?: Prisma.PaymentWhereInput }) {
    const { skip, take, where } = params;
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip, take, where,
        include: { feeRecord: { include: { student: { select: { firstName: true, lastName: true, enrollmentNo: true } } } } },
        orderBy: { paidAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id }, include: { feeRecord: true } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async processPayment(data: { feeRecordId: string; amount: number; method: string; transactionId?: string; receiptUrl?: string }) {
    const feeRecord = await this.prisma.feeRecord.findUnique({ where: { id: data.feeRecordId } });
    if (!feeRecord) throw new NotFoundException('Fee record not found');

    const newPaidAmount = feeRecord.paidAmount + data.amount;
    let status: PaymentStatus;

    if (newPaidAmount >= feeRecord.amount) {
      status = PaymentStatus.PAID;
    } else if (newPaidAmount > 0) {
      status = PaymentStatus.PARTIAL;
    } else {
      status = PaymentStatus.PENDING;
    }

    const [payment] = await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          feeRecordId: data.feeRecordId,
          amount: data.amount,
          method: data.method,
          transactionId: data.transactionId,
          receiptUrl: data.receiptUrl,
        },
      }),
      this.prisma.feeRecord.update({
        where: { id: data.feeRecordId },
        data: { paidAmount: newPaidAmount, status, paymentDate: new Date() },
      }),
    ]);

    return payment;
  }

  async getPaymentHistory(feeRecordId: string) {
    return this.prisma.payment.findMany({
      where: { feeRecordId },
      orderBy: { paidAt: 'desc' },
    });
  }

  async getRevenueSummary(institutionId: string, from?: string, to?: string) {
    const where: any = { feeRecord: { student: { department: { institutionId } } } };
    if (from || to) where.paidAt = {};
    if (from) where.paidAt.gte = new Date(from);
    if (to) where.paidAt.lte = new Date(to);

    const payments = await this.prisma.payment.findMany({ where });
    const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
    const totalTransactions = payments.length;

    return { totalRevenue, totalTransactions, averagePerTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0 };
  }
}
