import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const useBackNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to home page if no history
      navigate('/');
    }
  };

  const canGoBack = () => {
    return window.history.length > 1;
  };

  const getBackButtonProps = (fallbackPath = '/') => {
    return {
      onClick: () => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate(fallbackPath);
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