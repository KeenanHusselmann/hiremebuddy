import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Loader2, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMessages } from '@/hooks/useMessages';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ChatInterfaceProps {
  bookingId: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  onClose?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  bookingId,
  receiverId,
  receiverName,
  receiverAvatar,
  onClose
}) => {
  const { messages, isLoading, isSending, sendMessage } = useMessages(bookingId);
  const { getUserStatus, isUserAvailable } = useUserPresence();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userStatus = getUserStatus(receiverId);
  const isAvailable = isUserAvailable(receiverId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;

    const success = await sendMessage(newMessage, receiverId);
    if (success) {
      setNewMessage('');
      inputRef.current?.focus();
      toast({
        title: "Message sent",
        description: "Your message has been delivered successfully.",
      });
    } else {
      toast({
        title: "Failed to send message",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      default: return 'Offline';
    }
  };

  if (isLoading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={receiverAvatar} alt={receiverName} />
                <AvatarFallback>{receiverName[0]}</AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(userStatus)}`} />
            </div>
            
            <div>
              <CardTitle className="text-lg">{receiverName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {getStatusText(userStatus)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={!isAvailable}>
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled={!isAvailable}>
              <Video className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 px-4 overflow-hidden">
          <div className="space-y-4 py-4 max-w-full overflow-hidden">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Start a conversation</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id !== receiverId;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} w-full`}
                  >
                    <div className={`min-w-0 max-w-[75%] sm:max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwn 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {message.message_type === 'system' && (
                        <Badge variant="outline" className="mb-2 text-xs">
                          System
                        </Badge>
                      )}
                      
                      <div className="min-w-0 overflow-hidden">
                        <p className="text-sm whitespace-pre-wrap break-words hyphens-auto leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                      
                      <div className={`flex items-center justify-between mt-2 text-xs ${
                        isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        <span>
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                        
                        {isOwn && (
                          <div className="flex items-center gap-1">
                            {message.is_read ? (
                              <div className="text-xs opacity-70">Read</div>
                            ) : (
                              <div className="text-xs opacity-70">Sent</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isSending}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};