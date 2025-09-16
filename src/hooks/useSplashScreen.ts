import { useEffect } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export const useSplashScreen = () => {
  const hideSplashScreen = async () => {
    if (Capacitor.isNativePlatform()) {
      await SplashScreen.hide();
    }
  };

  const showSplashScreen = async () => {
    if (Capacitor.isNativePlatform()) {
      await SplashScreen.show();
    }
  };

  useEffect(() => {
    // Auto-hide splash screen when component mounts
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide();
    }
  }, []);

  return {
    hideSplashScreen,
    showSplashScreen
  };
};