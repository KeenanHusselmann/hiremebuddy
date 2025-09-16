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
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState<boolean>(false);

  // Check if Firebase is available
  const checkFirebaseAvailability = async () => {
    try {
      // For now, we'll assume Firebase is available if we're on native platform
      // In a real scenario, you'd want to check if Firebase is properly initialized
      setIsFirebaseAvailable(Capacitor.isNativePlatform());
      return Capacitor.isNativePlatform();
    } catch (error) {
      console.log('Firebase not available:', error);
      setIsFirebaseAvailable(false);
      return false;
    }
  };

  const requestPermissions = async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, skipping native push notifications');
      return;
    }

    try {
      console.log('Requesting push notification permissions...');
      
      // Check Firebase availability first
      const firebaseReady = await checkFirebaseAvailability();
      if (!firebaseReady) {
        console.log('Firebase not available, using local notifications only');
        toast.success('Notifications enabled (local only)');
        setNotificationPermission('granted');
        return;
      }

      const result = await PushNotifications.requestPermissions();
      console.log('Permission result:', result);
      setNotificationPermission(result.receive);
      
      if (result.receive === 'granted') {
        console.log('Permission granted, registering for push notifications...');
        try {
          await PushNotifications.register();
          toast.success('Push notifications enabled');
        } catch (registerError) {
          console.error('Registration failed, but permissions granted:', registerError);
          toast.success('Notifications enabled (local only)');
          setNotificationPermission('granted');
        }
      } else {
        console.log('Permission not granted:', result.receive);
        toast.error('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting push notification permissions:', error);
      
      // Don't crash the app, provide fallback
      if (error instanceof Error && error.message.includes('Firebase')) {
        console.log('Firebase error detected, falling back to local notifications');
        toast.success('Notifications enabled (local only)');
        setNotificationPermission('granted');
      } else {
        toast.error('Failed to setup notifications');
        setNotificationPermission('denied');
      }
    }
  };

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Register for push notifications
    const initializePushNotifications = async () => {
      try {
        console.log('Initializing push notifications...');
        
        // Check Firebase availability
        const firebaseReady = await checkFirebaseAvailability();
        
        // Request permission to use push notifications
        await requestPermissions();

        // Only set up Firebase-dependent listeners if Firebase is available
        if (firebaseReady) {
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
            
            // Check if it's a Firebase error
            if (error && error.message && error.message.includes('Firebase')) {
              console.log('Firebase registration error, continuing with local notifications');
              toast.info('Using local notifications only');
              setIsFirebaseAvailable(false);
            } else {
              toast.error('Failed to register for notifications');
            }
          });
        } else {
          console.log('Firebase not available, skipping push notification registration');
        }

        // These listeners work regardless of Firebase availability
        // Handle notifications when app is in foreground
        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          console.log('Push notification received: ', notification);
          
          try {
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
          } catch (err) {
            console.error('Error handling notification:', err);
          }
        });

        // Handle notification tap when app is in background
        PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
          console.log('Push notification action performed: ', notification);
          
          try {
            // Handle navigation based on notification data
            if (notification.notification.data?.url) {
              // You can implement navigation logic here
              console.log('Navigate to:', notification.notification.data.url);
            }
          } catch (err) {
            console.error('Error handling notification action:', err);
          }
        });
      } catch (error) {
        console.error('Error initializing push notifications:', error);
        
        // Provide user-friendly fallback
        if (error instanceof Error && error.message.includes('Firebase')) {
          console.log('Firebase initialization failed, using local notifications');
          toast.info('Notifications enabled (local only)');
          setIsFirebaseAvailable(false);
          setNotificationPermission('granted');
        } else {
          toast.error('Failed to initialize notifications');
        }
      }
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
    isNativePlatform: Capacitor.isNativePlatform(),
    isFirebaseAvailable
  };
};