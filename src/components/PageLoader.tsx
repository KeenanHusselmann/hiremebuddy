import React from 'react';
import logo from '@/assets/hiremebuddy-logo.png';

interface PageLoaderProps {
  isLoading: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      {/* Only HireMeBuddy Logo */}
      <img
        src={logo}
        alt="HireMeBuddy Logo"
        className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 object-contain animate-pulse"
      />
    </div>
  );
};

export default PageLoader;