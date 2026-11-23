'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare, Send, User, Users, Plus,
  Search, Loader2, Paperclip, MoreVertical
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-provider';

export default function ChatPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => chatApi.getRooms(),
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', selectedRoom],
    queryFn: () => chatApi.getRoomMessages(selectedRoom!),
    enabled: !!selectedRoom,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      chatApi.sendMessage({ roomId: selectedRoom, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedRoom] });
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
      setMessageInput('');
    },
  });

  const rooms = roomsData?.data?.data ?? roomsData?.data ?? [];
  const roomMessages = messagesData?.data?.data ?? messagesData?.data ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  const filteredRooms = rooms.filter((room: any) =>
    !searchQuery ||
    room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.participants?.some((p: any) =>
      `${p.user?.student?.firstName || p.user?.faculty?.firstName || ''} ${p.user?.student?.lastName || p.user?.faculty?.lastName || ''}`
        .toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getRoomName = (room: any) => {
    if (room.name) return room.name;
    const otherParticipants = room.participants?.filter((p: any) => p.userId !== user?.id) ?? [];
    if (otherParticipants.length === 1) {
      const p = otherParticipants[0];
      return `${p.user?.student?.firstName || p.user?.faculty?.firstName || 'User'} ${p.user?.student?.lastName || p.user?.faculty?.lastName || ''}`;
    }
    return `Group (${room.participants?.length || 0})`;
  };

  const getRoomAvatar = (room: any) => {
    const otherParticipants = room.participants?.filter((p: any) => p.userId !== user?.id) ?? [];
    if (otherParticipants.length === 1) {
      const p = otherParticipants[0];
      const firstName = p.user?.student?.firstName || p.user?.faculty?.firstName || 'U';
      const lastName = p.user?.student?.lastName || p.user?.faculty?.lastName || '';
      return `${firstName[0]}${lastName[0] || ''}`;
    }
    return (room.participants?.length || 0).toString();
  };

  const handleSend = () => {
    if (!messageInput.trim() || !selectedRoom || sendMutation.isPending) return;
    sendMutation.mutate(messageInput.trim());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">Chat with students, faculty, and staff</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex h-[600px]">
          <div className="w-80 border-r shrink-0">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-y-auto h-[calc(600px-73px)]">
              {roomsLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-14 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations</p>
                </div>
              ) : (
                filteredRooms.map((room: any) => {
                  const isActive = selectedRoom === room.id;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room.id)}
                      className={`w-full text-left p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors ${
                        isActive ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                        {getRoomAvatar(room)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{getRoomName(room)}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {room.messages?.[0]?.content || room.participants?.length + ' participants'}
                        </p>
                      </div>
                      {room.messages?.[0] && (
                        <time className="text-xs text-muted-foreground shrink-0">
                          {formatDate(room.messages[0].createdAt)}
                        </time>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {!selectedRoom ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {getRoomAvatar(rooms.find((r: any) => r.id === selectedRoom))}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{getRoomName(rooms.find((r: any) => r.id === selectedRoom))}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-12 bg-muted rounded animate-pulse w-1/2" />
                      ))}
                    </div>
                  ) : roomMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <p className="text-sm">No messages yet. Start a conversation!</p>
                    </div>
                  ) : (
                    roomMessages.map((msg: any) => {
                      const isMine = msg.senderId === user?.id;
                      return (
                        <div key={msg.id} className={`flex items-start gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                            isMine ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20'
                          }`}>
                            {msg.sender?.student?.firstName?.[0] || msg.sender?.faculty?.firstName?.[0] || 'U'}
                          </div>
                          <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                            <div className={`rounded-2xl px-4 py-2.5 ${
                              isMine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm'
                            }`}>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                            <p className={`text-xs text-muted-foreground mt-1 ${isMine ? 'text-right' : ''}`}>
                              {formatDate(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="shrink-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={!messageInput.trim() || sendMutation.isPending}
                    >
                      {sendMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
