import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  isScreenReaderEnabled: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  toggleScreenReader: () => void;
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  toggleHighContrast: () => void;
  announceToScreenReader: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Load accessibility settings from localStorage
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      const { screenReader, fontSize: savedFontSize, highContrast: savedHighContrast } = JSON.parse(savedSettings);
      setIsScreenReaderEnabled(screenReader || false);
      setFontSize(savedFontSize || 'normal');
      setHighContrast(savedHighContrast || false);
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify({
      screenReader: isScreenReaderEnabled,
      fontSize,
      highContrast
    }));

    // Apply font size classes
    const root = document.documentElement;
    root.classList.remove('text-normal', 'text-large', 'text-extra-large');
    root.classList.add(`text-${fontSize}`);

    // Apply high contrast mode
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [isScreenReaderEnabled, fontSize, highContrast]);

  const toggleScreenReader = () => {
    setIsScreenReaderEnabled(prev => !prev);
  };

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  const announceToScreenReader = (message: string) => {
    if (isScreenReaderEnabled) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.setAttribute('class', 'sr-only');
      announcement.textContent = message;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  };

  return (
    <AccessibilityContext.Provider value={{
      isScreenReaderEnabled,
      fontSize,
      highContrast,
      toggleScreenReader,
      setFontSize,
      toggleHighContrast,
      announceToScreenReader
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};