import React from 'react';
import logo from '@/assets/hiremebuddy-logo.png';

interface PageLoaderProps {
  isLoading: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <img 
            src={logo} 
            alt="HireMeBuddy Logo" 
            className="w-16 h-16 animate-spin-slow"
          />
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
        </div>
        <div className="text-foreground font-medium">Loading...</div>
      </div>
    </div>
  );
};

export default PageLoader;