import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
    imageUrl?: string;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
        link: data.link,
        imageUrl: data.imageUrl,
      },
    });
  }

  async bulkCreate(notifications: Array<{
    userId: string;
    title: string;
    message: string;
  }>) {
    const data = notifications.map(n => ({
      userId: n.userId,
      title: n.title,
      message: n.message,
    }));
    return this.prisma.notification.createMany({ data });
  }

  async findByUser(userId: string, params: { page?: number; limit?: number; unreadOnly?: boolean }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const where: any = { userId };
    if (params.unreadOnly) where.isRead = false;

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { data, total, unreadCount, page, limit };
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: { id, userId },
    });
  }

  async createAnnouncement(data: { title: string; content: string; targetRole?: string; authorId?: string }) {
    return this.prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        targetRole: data.targetRole || 'ALL',
        authorId: data.authorId,
      },
    });
  }

  async getAnnouncements() {
    return this.prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
