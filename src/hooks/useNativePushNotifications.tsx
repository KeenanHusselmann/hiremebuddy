import { useEffect, useState } from 'react';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useNativePushNotifications = () => {
  const { profile } = useAuth();
  const [notificationPermission, setNotificationPermission] = useState<string>('prompt');
  const [pushToken, setPushToken] = useState<string | null>(null);

  const requestPermissions = async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, skipping native push notifications');
      return;
    }

    try {
      const result = await PushNotifications.requestPermissions();
      setNotificationPermission(result.receive);
      
      if (result.receive === 'granted') {
        await PushNotifications.register();
      }
    } catch (error) {
      console.error('Error requesting push notification permissions:', error);
    }
  };

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Register for push notifications
    const initializePushNotifications = async () => {
      // Request permission to use push notifications
      await requestPermissions();

      // On successful registration, store the token
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token: ' + token.value);
        setPushToken(token.value);
        
        // Store token in database
        if (profile?.id) {
          supabase
            .from('device_tokens')
            .upsert({
              user_id: profile.id,
              token: token.value,
              platform: Capacitor.getPlatform(),
              device_info: {
                platform: Capacitor.getPlatform(),
                timestamp: new Date().toISOString()
              }
            })
            .then(({ error }) => {
              if (error) {
                console.error('Error storing device token:', error);
              } else {
                console.log('Device token stored successfully');
              }
            });
        }
      });

      // Handle registration errors
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      // Handle notifications when app is in foreground
      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push notification received: ', notification);
        
        // Show toast notification
        toast(notification.title || 'New notification', {
          description: notification.body,
          action: notification.data?.url ? {
            label: 'View',
            onClick: () => {
              // Handle navigation to the URL if needed
              console.log('Navigate to:', notification.data.url);
            }
          } : undefined
        });
      });

      // Handle notification tap when app is in background
      PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        console.log('Push notification action performed: ', notification);
        
        // Handle navigation based on notification data
        if (notification.notification.data?.url) {
          // You can implement navigation logic here
          console.log('Navigate to:', notification.notification.data.url);
        }
      });
    };

    initializePushNotifications();

    // Cleanup listeners
    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [profile?.id]);

  return {
    notificationPermission,
    pushToken,
    requestPermissions,
    isNativePlatform: Capacitor.isNativePlatform()
  };
};