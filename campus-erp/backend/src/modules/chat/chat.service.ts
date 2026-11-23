import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createRoom(data: {
    type: 'DIRECT' | 'GROUP';
    name?: string;
    participantIds: string[];
  }) {
    return this.prisma.chatRoom.create({
      data: {
        type: data.type,
        name: data.name,
        participants: {
          create: data.participantIds.map(userId => ({ userId })),
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, email: true, role: true } } },
        },
      },
    });
  }

  async sendMessage(data: {
    roomId: string;
    senderId: string;
    content: string;
    fileUrl?: string;
    fileType?: string;
    replyToId?: string;
  }) {
    const room = await this.prisma.chatRoom.findUnique({ where: { id: data.roomId } });
    if (!room) throw new NotFoundException('Chat room not found');

    const participant = await this.prisma.chatParticipant.findUnique({
      where: { roomId_userId: { roomId: data.roomId, userId: data.senderId } },
    });
    if (!participant) throw new ForbiddenException('You are not a participant of this room');

    return this.prisma.message.create({
      data: {
        roomId: data.roomId,
        senderId: data.senderId,
        content: data.content,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        replyToId: data.replyToId,
      },
      include: {
        sender: { select: { id: true, email: true, role: true } },
      },
    });
  }

  async getRoomMessages(params: {
    roomId: string;
    skip?: number;
    take?: number;
    userId: string;
  }) {
    const { roomId, skip, take, userId } = params;

    const participant = await this.prisma.chatParticipant.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    if (!participant) throw new ForbiddenException('Access denied');

    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { roomId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { id: true, email: true, role: true } },
        },
      }),
      this.prisma.message.count({ where: { roomId } }),
    ]);

    return { data, total };
  }

  async getUserRooms(userId: string) {
    return this.prisma.chatRoom.findMany({
      where: {
        participants: { some: { userId } },
        isActive: true,
      },
      include: {
        participants: {
          include: { user: { select: { id: true, email: true, role: true } } },
        },
        messages: {
          take: 1,
        orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, email: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async markAsRead(roomId: string, userId: string) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    if (!participant) throw new NotFoundException('Participation not found');

    await this.prisma.chatParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    });

    await this.prisma.message.updateMany({
      where: {
        roomId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true };
  }
}
