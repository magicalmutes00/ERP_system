import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, PaymentStatus } from '@prisma/client';

@Injectable()
export class FeesService {
  constructor(private readonly prisma: PrismaService) {}

  async createFeeStructure(data: Prisma.FeeStructureCreateInput) {
    return this.prisma.feeStructure.create({ data });
  }

  async getFeeStructures(params: {
    skip?: number;
    take?: number;
    where?: Prisma.FeeStructureWhereInput;
  }) {
    const { skip, take, where } = params;
    const [data, total] = await Promise.all([
      this.prisma.feeStructure.findMany({
        skip, take, where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.feeStructure.count({ where }),
    ]);
    return { data, total };
  }

  async createFeeRecord(data: Prisma.FeeRecordCreateInput) {
    return this.prisma.feeRecord.create({
      data,
      include: { student: { include: { user: { select: { email: true } } } } },
    });
  }

  async getStudentFees(studentId: string) {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.feeRecord.findMany({
      where: { studentId },
      include: { feeStructure: true, payments: { orderBy: { paidAt: 'desc' } } },
      orderBy: { dueDate: 'desc' },
    });
  }

  async getFeeAnalytics(institutionId?: string) {
    const where: any = {};
    if (institutionId) {
      where.feeStructure = { institutionId };
    }

    const records = await this.prisma.feeRecord.findMany({ where });
    const totalAssigned = records.reduce((sum, r) => sum + r.amount, 0);
    const totalCollected = records.reduce((sum, r) => sum + r.paidAmount, 0);
    const totalPending = totalAssigned - totalCollected;
    const totalDue = records.filter(r => r.status === 'PENDING' || r.status === 'OVERDUE').length;
    const totalPaid = records.filter(r => r.status === 'PAID').length;
    const totalPartial = records.filter(r => r.status === 'PARTIAL').length;

    return {
      summary: {
        totalAssigned,
        totalCollected,
        totalPending,
        collectionRate: totalAssigned > 0 ? ((totalCollected / totalAssigned) * 100).toFixed(2) : '0',
      },
      counts: {
        totalRecords: records.length,
        paid: totalPaid,
        partial: totalPartial,
        due: totalDue,
      },
    };
  }

  async processPayment(
    feeRecordId: string,
    data: {
      amount: number;
      method: string;
      transactionId?: string;
      gatewayResponse?: any;
    },
  ) {
    const record = await this.prisma.feeRecord.findUnique({ where: { id: feeRecordId } });
    if (!record) throw new NotFoundException('Fee record not found');

    if (record.status === 'PAID') {
      throw new BadRequestException('Fee record is already fully paid');
    }

    const newPaidAmount = record.paidAmount + data.amount;
    const newStatus: PaymentStatus =
      newPaidAmount >= record.amount ? 'PAID' : 'PARTIAL';

    const [payment, updatedRecord] = await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          feeRecordId,
          amount: data.amount,
          method: data.method,
          transactionId: data.transactionId,
          status: 'PAID',
          gatewayResponse: data.gatewayResponse || undefined,
        },
      }),
      this.prisma.feeRecord.update({
        where: { id: feeRecordId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
          paymentDate: new Date(),
          paymentMethod: data.method,
          transactionId: data.transactionId,
        },
      }),
    ]);

    return { payment, record: updatedRecord };
  }

  async getPaymentHistory(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PaymentWhereInput;
  }) {
    const { skip, take, where } = params;
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip, take, where,
        include: {
          feeRecord: {
            include: {
              student: { include: { user: { select: { email: true } } } },
              feeStructure: true,
            },
          },
        },
        orderBy: { paidAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);
    return { data, total };
  }
}
