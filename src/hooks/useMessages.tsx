import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export const useMessages = (bookingId?: string) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Fetch messages for a booking
  const fetchMessages = useCallback(async () => {
    if (!bookingId || !profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages((data as Message[]) || []);
      
      // Mark unread messages as read
      const unreadMessages = data?.filter(m => 
        m.receiver_id === profile.id && !m.is_read
      ) || [];

      if (unreadMessages.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('booking_id', bookingId)
          .eq('receiver_id', profile.id)
          .eq('is_read', false);
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, profile?.id]);

  // Send a message
  const sendMessage = useCallback(async (
    content: string, 
    receiverId: string, 
    messageType: 'text' | 'image' | 'file' | 'system' = 'text'
  ) => {
    if (!bookingId || !profile?.id || !content.trim()) return;

    setIsSending(true);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          booking_id: bookingId,
          sender_id: profile.id,
          receiver_id: receiverId,
          content: content.trim(),
          message_type: messageType
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return false;
      }

      // Optimistically update local state so the UI reflects the new message immediately
      if (data) {
        setMessages(prev => {
          // Avoid duplicates if realtime delivers the same message
          if (prev.some(m => m.id === (data as any).id)) return prev;
          return [...prev, data as Message];
        });
      }

      return true;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return false;
    } finally {
      setIsSending(false);
    }
  }, [bookingId, profile?.id]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (!bookingId || !profile?.id) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('booking_id', bookingId)
        .eq('receiver_id', profile.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [bookingId, profile?.id]);

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!bookingId || !profile?.id) return;

    fetchMessages();

    const channel = supabase
      .channel(`messages-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          
          // Mark as read if user is the receiver and window is focused
          if (newMessage.receiver_id === profile.id && document.hasFocus()) {
            setTimeout(() => markMessagesAsRead(), 1000);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages(prev => 
            prev.map(m => m.id === updatedMessage.id ? updatedMessage : m)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, profile?.id, fetchMessages, markMessagesAsRead]);

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    markMessagesAsRead,
    refetch: fetchMessages
  };
};