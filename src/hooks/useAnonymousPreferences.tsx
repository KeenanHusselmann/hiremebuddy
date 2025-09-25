import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate or retrieve device ID for anonymous users
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

export const useAnonymousPreferences = () => {
  const updateLocation = async (lat: number, lng: number, locationName?: string) => {
    try {
      const deviceId = getDeviceId();
      const { error } = await supabase.rpc('update_anonymous_device_preferences', {
        p_device_id: deviceId,
        p_location_lat: lat,
        p_location_lng: lng,
        p_location_name: locationName
      });

      if (error) {
        console.error('Error updating device location:', error);
      } else {
        console.log('Device location updated successfully');
      }
    } catch (error) {
      console.error('Error updating device location:', error);
    }
  };

  const updateServiceCategories = async (categories: string[]) => {
    try {
      const deviceId = getDeviceId();
      const { error } = await supabase.rpc('update_anonymous_device_preferences', {
        p_device_id: deviceId,
        p_service_categories: categories
      });

      if (error) {
        console.error('Error updating device service categories:', error);
      } else {
        console.log('Device service categories updated successfully');
      }
    } catch (error) {
      console.error('Error updating device service categories:', error);
    }
  };

  const addServiceCategory = async (category: string) => {
    try {
      // Get current categories from localStorage to avoid DB call
      const existingCategories = JSON.parse(localStorage.getItem('user_interests') || '[]');
      const newCategories = [...new Set([...existingCategories, category])]; // Remove duplicates
      
      // Update localStorage
      localStorage.setItem('user_interests', JSON.stringify(newCategories));
      
      // Update database
      await updateServiceCategories(newCategories);
    } catch (error) {
      console.error('Error adding service category:', error);
    }
  };

  return {
    updateLocation,
    updateServiceCategories,
    addServiceCategory,
    getDeviceId
  };
};