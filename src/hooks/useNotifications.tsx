import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Notification {
  id: string;
  type: string;
  message: string;
  category: string;
  target_url?: string;
  is_read: boolean;
  created_at: string;
}

// Build a stable key to detect duplicates created by backend triggers
const buildKey = (n: Notification) => `${n.type}|${n.target_url || ''}|${n.created_at}`;

const dedupeNotifications = (list: Notification[]) => {
  const map = new Map<string, Notification>();
  for (const n of list) {
    const key = buildKey(n);
    if (!map.has(key)) map.set(key, n);
  }
  return Array.from(map.values());
};

export const useNotifications = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      const deduped = dedupeNotifications(data || []);
      setNotifications(deduped);
      setUnreadCount(deduped.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);

  const playDing = () => {
    try {
      const windowWithAudio = window as typeof window & {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const AudioCtx = windowWithAudio.AudioContext || windowWithAudio.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880; // A5
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      o.start();
      o.stop(ctx.currentTime + 0.2);
    } catch (error) {
      // Silently fail if audio context is not available
      console.debug('Audio notification failed:', error);
    }
  };

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  }, []);

  // Mark a group of duplicate notifications (same type/url/timestamp) as read
  const markGroupAsRead = useCallback(async (notificationId: string) => {
    if (!notifications.length) return;
    const target = notifications.find(n => n.id === notificationId);
    if (!target) return;
    const key = buildKey(target);
    const duplicateIds = notifications
      .filter(n => !n.is_read && buildKey(n) === key)
      .map(n => n.id);
    if (duplicateIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', duplicateIds);
      if (error) {
        console.error('Error marking group as read:', error);
        return;
      }
      setNotifications(prev => prev.map(n => buildKey(n) === key ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - duplicateIds.length));
    } catch (e) {
      console.error('Error in markGroupAsRead:', e);
    }
  }, [notifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  }, [profile?.id]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!profile?.id) return;

    fetchNotifications();

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => {
            const newKey = buildKey(newNotification);
            const exists = prev.some(n => buildKey(n) === newKey);
            const next = exists ? prev : [newNotification, ...prev];
            // Recalculate unread from deduped list
            setUnreadCount(next.filter(n => !n.is_read).length);
            return next;
          });
          
          // Send push notification for message notifications
          if (newNotification.category === 'message') {
            supabase.functions.invoke('send-push-notification', {
              body: {
                user_id: profile.id,
                title: 'New Message',
                body: newNotification.message,
                data: {
                  url: newNotification.target_url || '/',
                  type: newNotification.type
                }
              }
            }).catch(error => {
              console.error('Error sending push notification:', error);
            });
          }
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Notification', {
              body: newNotification.message,
              icon: '/favicon.ico'
            });
          }
          if (document.visibilityState === 'visible') {
            playDing();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications(prev => 
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markGroupAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};