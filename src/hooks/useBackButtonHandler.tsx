import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const useBackButtonHandler = (customBackAction?: () => void) => {
  const navigate = useNavigate();
  const location = useLocation();
  const backPressedOnce = useRef(false);

  useEffect(() => {
    // Only handle back button on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const handleBackButton = () => {
      if (customBackAction) {
        customBackAction();
        return;
      }

      // If we're on the home page
      if (location.pathname === '/') {
        // First back press - show toast or warning
        if (!backPressedOnce.current) {
          backPressedOnce.current = true;
          // Reset flag after 2 seconds
          setTimeout(() => {
            backPressedOnce.current = false;
          }, 2000);
          
          // Could show toast here: "Press back again to exit"
          return;
        }
        
        // Second back press - exit the app
        App.exitApp();
        return;
      }

      // If we're not on home page, always navigate back to home first
      navigate('/');
    };

    // Add back button listener
    App.addListener('backButton', handleBackButton);

    // Cleanup listener on unmount
    return () => {
      App.removeAllListeners();
    };
  }, [navigate, location.pathname, customBackAction]);
};

export default useBackButtonHandler;