import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserPresence {
  user_id: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: string;
  is_available: boolean;
}

export const useUserPresence = () => {
  const { profile } = useAuth();
  const [userPresence, setUserPresence] = useState<Record<string, UserPresence>>({});
  const [myStatus, setMyStatus] = useState<'online' | 'away' | 'busy' | 'offline'>('offline');

  // Update user presence status
  const updatePresence = useCallback(async (status: 'online' | 'away' | 'busy' | 'offline') => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase.rpc('update_user_presence', {
        status_param: status
      });

      if (error) {
        console.error('Error updating presence:', error);
        return;
      }

      setMyStatus(status);
    } catch (error) {
      console.error('Error in updatePresence:', error);
    }
  }, [profile?.id]);

  // Get presence for specific users
  const getPresenceForUsers = useCallback(async (userIds: string[]) => {
    if (userIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('*')
        .in('user_id', userIds);

      if (error) {
        console.error('Error fetching user presence:', error);
        return;
      }

      const presenceMap = data?.reduce((acc, presence) => {
        acc[presence.user_id] = presence as UserPresence;
        return acc;
      }, {} as Record<string, UserPresence>) || {};

      setUserPresence(prev => ({ ...prev, ...presenceMap }));
    } catch (error) {
      console.error('Error in getPresenceForUsers:', error);
    }
  }, []);

  // Subscribe to presence updates
  useEffect(() => {
    if (!profile?.id) return;

    // Set initial online status
    updatePresence('online');

    // Subscribe to real-time presence updates
    const channel = supabase
      .channel('user-presence-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          const presenceData = payload.new as UserPresence;
          if (presenceData) {
            setUserPresence(prev => ({
              ...prev,
              [presenceData.user_id]: presenceData
            }));
          }
        }
      )
      .subscribe();

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away');
      } else {
        updatePresence('online');
      }
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      updatePresence('offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      updatePresence('offline');
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [profile?.id, updatePresence]);

  // Get status for a specific user
  const getUserStatus = useCallback((userId: string) => {
    return userPresence[userId]?.status || 'offline';
  }, [userPresence]);

  // Check if user is available
  const isUserAvailable = useCallback((userId: string) => {
    const presence = userPresence[userId];
    return presence?.is_available && ['online', 'away'].includes(presence.status);
  }, [userPresence]);

  return {
    userPresence,
    myStatus,
    updatePresence,
    getPresenceForUsers,
    getUserStatus,
    isUserAvailable
  };
};