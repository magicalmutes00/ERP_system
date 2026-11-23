import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/ws',
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private connectedUsers = new Map<string, string[]>(); // userId -> socketIds[]

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as any;
      const userId = decoded.sub;

      client.data.userId = userId;
      client.data.role = decoded.role;

      const existing = this.connectedUsers.get(userId) || [];
      existing.push(client.id);
      this.connectedUsers.set(userId, existing);

      client.join(`user:${userId}`);
      client.join(`role:${decoded.role}`);

      this.logger.log(`User ${userId} connected (${client.id})`);
      this.server.to(`user:${userId}`).emit('connected', { userId, socketId: client.id });
    } catch (error) {
      this.logger.warn(`WebSocket connection rejected: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const existing = this.connectedUsers.get(userId) || [];
      const filtered = existing.filter(id => id !== client.id);
      if (filtered.length === 0) {
        this.connectedUsers.delete(userId);
      } else {
        this.connectedUsers.set(userId, filtered);
      }
      this.logger.log(`User ${userId} disconnected (${client.id})`);
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    client.join(`room:${data.roomId}`);
    this.logger.log(`User ${client.data.userId} joined room ${data.roomId}`);
    return { event: 'joined-room', data: { roomId: data.roomId } };
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    client.leave(`room:${data.roomId}`);
    return { event: 'left-room', data: { roomId: data.roomId } };
  }

  @SubscribeMessage('send-message')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; content: string; fileUrl?: string }) {
    const message = {
      roomId: data.roomId,
      senderId: client.data.userId,
      content: data.content,
      fileUrl: data.fileUrl,
      timestamp: new Date().toISOString(),
    };
    this.server.to(`room:${data.roomId}`).emit('new-message', message);
    return { event: 'message-sent', data: message };
  }

  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; isTyping: boolean }) {
    client.to(`room:${data.roomId}`).emit('user-typing', {
      userId: client.data.userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('notification')
  handleNotification(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string; title: string; message: string }) {
    this.server.to(`user:${data.userId}`).emit('new-notification', {
      title: data.title,
      message: data.message,
      timestamp: new Date().toISOString(),
    });
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToRoom(roomId: string, event: string, data: any) {
    this.server.to(`room:${roomId}`).emit(event, data);
  }

  sendToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }

  getConnectedUsers(): number {
    return this.connectedUsers.size;
  }
}
