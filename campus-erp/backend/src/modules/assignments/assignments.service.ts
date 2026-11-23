import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AssignmentWhereInput;
    orderBy?: Prisma.AssignmentOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    const [data, total] = await Promise.all([
      this.prisma.assignment.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          course: { select: { id: true, name: true, code: true } },
          _count: { select: { submissions: true } },
        },
      }),
      this.prisma.assignment.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: {
        course: true,
        submissions: {
          include: {
            student: {
              include: { user: { select: { email: true, phone: true } } },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }

  async create(data: Prisma.AssignmentCreateInput) {
    return this.prisma.assignment.create({
      data,
      include: { course: { select: { id: true, name: true, code: true } } },
    });
  }

  async update(id: string, data: Prisma.AssignmentUpdateInput) {
    await this.findById(id);
    return this.prisma.assignment.update({
      where: { id },
      data,
      include: { course: { select: { id: true, name: true, code: true } } },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.assignment.delete({ where: { id } });
    return { message: 'Assignment deleted successfully' };
  }

  async findByCourse(courseId: string) {
    return this.prisma.assignment.findMany({
      where: { courseId },
      include: {
        course: { select: { id: true, name: true, code: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async submitAssignment(assignmentId: string, studentId: string, data: { fileUrl?: string; content?: string }) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundException('Assignment not found');

    if (new Date() > assignment.dueDate) {
      throw new ForbiddenException('Assignment due date has passed');
    }

    const existing = await this.prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } },
    });

    if (existing) {
      return this.prisma.assignmentSubmission.update({
        where: { id: existing.id },
        data: { fileUrl: data.fileUrl, content: data.content, status: 'RESUBMITTED' },
        include: { assignment: true },
      });
    }

    return this.prisma.assignmentSubmission.create({
      data: { assignmentId, studentId, fileUrl: data.fileUrl, content: data.content },
      include: { assignment: true },
    });
  }

  async gradeSubmission(submissionId: string, data: { marksObtained: number; feedback?: string }) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });
    if (!submission) throw new NotFoundException('Submission not found');

    if (data.marksObtained > submission.assignment.maxMarks) {
      throw new ConflictException('Marks cannot exceed maximum marks');
    }

    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        marksObtained: data.marksObtained,
        feedback: data.feedback,
        status: 'GRADED',
        gradedAt: new Date(),
      },
      include: { assignment: true, student: { include: { user: { select: { email: true } } } } },
    });
  }
}
