import { useEffect, useState } from 'react';
import { messaging, getToken, onMessage } from '@/lib/firebase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const usePushNotifications = () => {
  const { profile } = useAuth();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: 'PASTE_YOUR_VAPID_KEY_HERE' // Replace with your actual VAPID key
        });
        
        if (token && profile?.id) {
          setFcmToken(token);
          
          // Store token in database
          await supabase
            .from('device_tokens')
            .upsert({
              user_id: profile.id,
              token,
              platform: 'web',
              device_info: {
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
              }
            });
        }
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  };

  // Listen for foreground messages
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      if (payload.notification) {
        toast(payload.notification.title || 'New notification', {
          description: payload.notification.body,
          action: payload.data?.url ? {
            label: 'View',
            onClick: () => window.location.href = payload.data.url
          } : undefined
        });
      }
    });

    return unsubscribe;
  }, []);

  // Request permission on mount if user is logged in
  useEffect(() => {
    if (profile?.id && notificationPermission === 'default') {
      requestPermission();
    }
  }, [profile?.id, notificationPermission]);

  return {
    notificationPermission,
    fcmToken,
    requestPermission
  };
};