import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('rooms')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a chat room (direct or group)' })
  async createRoom(@Body() data: any, @CurrentUser() user: any) {
    const participantIds = [...new Set([...data.participantIds, user.sub])];
    return this.chatService.createRoom({
      type: data.type || 'DIRECT',
      name: data.name,
      participantIds,
    });
  }

  @Get('rooms')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my chat rooms' })
  async getMyRooms(@CurrentUser() user: any) {
    return this.chatService.getUserRooms(user.sub);
  }

  @Get('rooms/:roomId/messages')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get room messages (paginated)' })
  async getMessages(
    @Param('roomId') roomId: string,
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getRoomMessages({
      roomId,
      skip: ((page || 1) - 1) * (limit || 50),
      take: limit || 50,
      userId: user.sub,
    });
  }

  @Post('rooms/:roomId/messages')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a message in a room' })
  async sendMessage(
    @Param('roomId') roomId: string,
    @Body() data: any,
    @CurrentUser() user: any,
  ) {
    return this.chatService.sendMessage({
      roomId,
      senderId: user.sub,
      content: data.content,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      replyToId: data.replyToId,
    });
  }

  @Patch('rooms/:roomId/read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark room messages as read' })
  async markAsRead(@Param('roomId') roomId: string, @CurrentUser() user: any) {
    return this.chatService.markAsRead(roomId, user.sub);
  }
}
