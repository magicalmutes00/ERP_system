import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { skip?: number; take?: number; where?: Prisma.DocumentWhereInput }) {
    const { skip, take, where } = params;
    const [data, total] = await Promise.all([
      this.prisma.document.findMany({ skip, take, where, orderBy: { createdAt: 'desc' } }),
      this.prisma.document.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async create(data: Prisma.DocumentCreateInput) {
    return this.prisma.document.create({ data });
  }

  async verify(id: string, verifiedBy: string) {
    const doc = await this.findById(id);
    return this.prisma.document.update({
      where: { id },
      data: { isVerified: true, verifiedBy, verifiedAt: new Date() },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.document.delete({ where: { id } });
    return { message: 'Document deleted successfully' };
  }

  async getStudentDocuments(studentId: string) {
    return this.prisma.document.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFacultyDocuments(facultyId: string) {
    return this.prisma.document.findMany({
      where: { facultyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
