import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MobileHeader from './MobileHeader';
import MobileFooter from './MobileFooter';
import BackButton from './BackButton';
import useBackButtonHandler from '@/hooks/useBackButtonHandler';

interface MobilePageLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  backButtonTo?: string;
  title?: string;
  className?: string;
}

const MobilePageLayout = ({ 
  children, 
  showBackButton = true, 
  backButtonTo = '/',
  title,
  className = '' 
}: MobilePageLayoutProps) => {
  const location = useLocation();

  // Handle device back button
  useBackButtonHandler();

  // Scroll to top when component mounts or route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Mobile Header (teal bar) */}
      <MobileHeader />
      
      {/* Mobile Navigation Bar */}
      <div className="sticky top-6 z-50 bg-background border-b border-border/30 backdrop-blur-md">
        <div className="flex items-center justify-between h-14 px-4">
          {showBackButton && (
            <BackButton to={backButtonTo}>
              Back
            </BackButton>
          )}
          {title && (
            <h1 className="text-lg font-semibold text-foreground flex-1 text-center">
              {title}
            </h1>
          )}
          <div className="w-16" /> {/* Spacer for centering title */}
        </div>
      </div>

      {/* Page Content */}
      <main className="pb-20 pt-4">
        {children}
      </main>

      {/* Mobile Footer (teal bar) */}
      <MobileFooter />
    </div>
  );
};

export default MobilePageLayout;