import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Capacitor } from '@capacitor/core';

export const useBackNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle hardware back button on mobile devices
    if (Capacitor.isNativePlatform()) {
      const handleBackButton = () => {
        goBack();
        return true; // Prevent default behavior
      };

      // Add event listener for hardware back button
      document.addEventListener('backbutton', handleBackButton);
      
      return () => {
        document.removeEventListener('backbutton', handleBackButton);
      };
    }
  }, [location.pathname]);

  const goBack = () => {
    // Enhanced back navigation logic
    const navigationHistory = window.history.state;
    
    // Check if we can safely go back in history
    if (window.history.length > 1 && navigationHistory !== null) {
      try {
        navigate(-1);
      } catch (error) {
        console.warn('Navigation error, falling back to home:', error);
        navigate('/');
      }
    } else {
      // Determine smart fallback based on current path
      const currentPath = location.pathname;
      
      if (currentPath.startsWith('/service/')) {
        navigate('/browse');
      } else if (currentPath.startsWith('/booking/')) {
        navigate('/bookings');
      } else if (currentPath.startsWith('/quote/')) {
        navigate('/profile');
      } else if (currentPath === '/auth' || currentPath === '/forgot-password') {
        navigate('/');
      } else {
        navigate('/');
      }
    }
  };

  const canGoBack = () => {
    return window.history.length > 1;
  };

  const getBackButtonProps = (fallbackPath = '/') => {
    return {
      onClick: () => {
        const navigationHistory = window.history.state;
        
        if (window.history.length > 1 && navigationHistory !== null) {
          try {
            navigate(-1);
          } catch (error) {
            console.warn('Navigation error, using fallback:', error);
            navigate(fallbackPath);
          }
        } else {
          // Use smart fallback or provided fallback
          const currentPath = location.pathname;
          
          if (currentPath.startsWith('/service/')) {
            navigate('/browse');
          } else if (currentPath.startsWith('/booking/')) {
            navigate('/bookings');
          } else if (currentPath.startsWith('/quote/')) {
            navigate('/profile');
          } else {
            navigate(fallbackPath);
          }
        }
      },
      variant: 'ghost' as const,
      size: 'sm' as const,
      className: 'mb-4'
    };
  };

  return {
    goBack,
    canGoBack,
    getBackButtonProps,
    currentPath: location.pathname
  };
};

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
  children?: React.ReactNode;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  fallbackPath = '/', 
  className = '',
  children 
}) => {
  const { getBackButtonProps } = useBackNavigation();
  
  return (
    <Button {...getBackButtonProps(fallbackPath)} className={className}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      {children || 'Back'}
    </Button>
  );
};