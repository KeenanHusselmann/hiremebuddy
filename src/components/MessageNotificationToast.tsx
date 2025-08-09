import React, { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface MessageNotification {
  id: string;
  sender_name: string;
  sender_avatar?: string;
  message: string;
  booking_id: string;
  created_at: string;
}

export const MessageNotificationToast: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);

  useEffect(() => {
    if (!profile?.id) return;

    // Subscribe to notifications for new messages for this user
    const channel = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`
        },
        async (payload) => {
          const newNotification = payload.new as any;

          // Only handle message-type notifications
          if (newNotification.type !== 'new_message' && newNotification.category !== 'message') {
            return;
          }

          // Try to extract bookingId from target_url like '/bookings/{id}'
          let bookingId: string | undefined;
          try {
            const url: string | null = newNotification.target_url;
            if (url && url.includes('/bookings/')) {
              bookingId = url.split('/bookings/')[1]?.split(/[/?#]/)[0];
            }
          } catch (e) {
            // no-op
          }

          let senderName = 'Someone';
          let senderAvatar: string | undefined;
          let messagePreview = newNotification.message as string;

          // If we have a booking id, try to get the latest message to show content and sender
          if (bookingId) {
            const { data: latestMsg } = await supabase
              .from('messages')
              .select('content, sender_id')
              .eq('booking_id', bookingId)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (latestMsg) {
              messagePreview = latestMsg.content;
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', latestMsg.sender_id)
                .single();

              if (senderProfile) {
                senderName = senderProfile.full_name;
                senderAvatar = senderProfile.avatar_url;
              }
            }
          }

          const notification: MessageNotification = {
            id: newNotification.id,
            sender_name: senderName,
            sender_avatar: senderAvatar,
            message: messagePreview,
            booking_id: bookingId || '',
            created_at: newNotification.created_at
          };

          setNotifications(prev => [...prev, notification]);

          // Auto-remove after 5 seconds
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const handleNotificationClick = (notification: MessageNotification) => {
    navigate(`/bookings/${notification.booking_id}`);
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
  };

  const handleDismiss = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Card 
          key={notification.id}
          className="w-80 shadow-lg border-l-4 border-l-blue-500 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleNotificationClick(notification)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={notification.sender_avatar} alt={notification.sender_name} />
                  <AvatarFallback>
                    {notification.sender_name[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <p className="font-medium text-sm">New Message</p>
                </div>
                
                <p className="text-sm font-medium mb-1">
                  {notification.sender_name}
                </p>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
                
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss(notification.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};