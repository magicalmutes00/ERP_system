import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, string>;
  userId: string;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendToUser(notification: PushNotification) {
    try {
      const deviceTokens = await this.prisma.deviceToken.findMany({
        where: { userId: notification.userId, isActive: true },
      });

      if (deviceTokens.length === 0) {
        this.logger.warn(`No device tokens for user ${notification.userId}`);
      }

      await this.prisma.notification.create({
        data: {
          userId: notification.userId,
          title: notification.title,
          message: notification.body,
          type: 'INFO',
        },
      });

      return { delivered: deviceTokens.length };
    } catch (error) {
      this.logger.error(`Push notification failed: ${error.message}`);
      throw error;
    }
  }

  async sendBulk(notifications: PushNotification[]) {
    const results: any[] = [];
    for (const notification of notifications) {
      results.push(await this.sendToUser(notification));
    }
    return results;
  }

  async sendToRole(role: string, notification: Omit<PushNotification, 'userId'>) {
    const users = await this.prisma.user.findMany({
      where: { role: role as any, isActive: true },
      select: { id: true },
    });

    return this.sendBulk(
      users.map(user => ({ ...notification, userId: user.id })),
    );
  }

  async sendToCourse(courseId: string, notification: Omit<PushNotification, 'userId'>) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId, status: 'ACTIVE' },
      include: { student: true },
    });

    const userIds = await this.prisma.student.findMany({
      where: { id: { in: enrollments.map(e => e.studentId) } },
      select: { userId: true },
    });

    return this.sendBulk(
      userIds.map(u => ({ ...notification, userId: u.userId })),
    );
  }

  async registerDeviceToken(userId: string, token: string, platform: string = 'web') {
    const existing = await this.prisma.deviceToken.findFirst({
      where: { token },
    });

    if (existing) {
      if (existing.userId !== userId) {
        await this.prisma.deviceToken.update({
          where: { id: existing.id },
          data: { userId, isActive: true },
        });
      }
      return existing;
    }

    return this.prisma.deviceToken.create({
      data: { userId, token, platform },
    });
  }

  async removeDeviceToken(token: string) {
    await this.prisma.deviceToken.updateMany({
      where: { token },
      data: { isActive: false },
    });
  }
}
