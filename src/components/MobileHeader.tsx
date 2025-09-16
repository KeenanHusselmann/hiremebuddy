import { Capacitor } from '@capacitor/core';

interface MobileHeaderProps {
  className?: string;
}

const MobileHeader = ({ className = '' }: MobileHeaderProps) => {
  // Only show on mobile native platform
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  return (
    <div className={`mobile-header w-full sticky top-0 z-[60] h-8 ${className}`}>
      {/* Status bar spacer with teal gradient - increased height */}
      <div className="w-full h-full bg-gradient-to-r from-teal-600 to-teal-500 opacity-100" />
    </div>
  );
};

export default MobileHeader;