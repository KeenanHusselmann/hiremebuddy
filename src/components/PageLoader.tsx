import React from 'react';
import logo from '@/assets/hiremebuddy-logo.png';

interface PageLoaderProps {
  isLoading: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        </div>
        <div className="text-foreground font-medium text-lg">Loading...</div>
      </div>
    </div>
  );
};

export default PageLoader;