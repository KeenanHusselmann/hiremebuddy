import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  isScreenReaderEnabled: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  isReading: boolean;
  toggleScreenReader: () => void;
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  toggleHighContrast: () => void;
  announceToScreenReader: (message: string) => void;
  readPageContent: () => void;
  stopReading: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [isReading, setIsReading] = useState(false);

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

  const readPageContent = () => {
    if (isScreenReaderEnabled && 'speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      setIsReading(true);
      
      // Get page content to read
      const pageTitle = document.title;
      const mainContent = document.querySelector('main');
      const headings = document.querySelectorAll('h1, h2, h3');
      
      let contentToRead = `Page: ${pageTitle}. `;
      
      // Read main headings
      headings.forEach((heading, index) => {
        if (index < 3) { // Limit to first 3 headings
          contentToRead += `${heading.tagName}: ${heading.textContent}. `;
        }
      });
      
      // Read first paragraph or text content
      const firstParagraph = mainContent?.querySelector('p, .text-lg, .text-xl, .description');
      if (firstParagraph) {
        const text = firstParagraph.textContent?.slice(0, 200) || '';
        contentToRead += text;
      }
      
      // Create and configure speech
      const utterance = new SpeechSynthesisUtterance(contentToRead);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Handle speech end
      utterance.onend = () => {
        setIsReading(false);
      };
      
      utterance.onerror = () => {
        setIsReading(false);
      };
      
      // Speak the content
      window.speechSynthesis.speak(utterance);
      
      announceToScreenReader("Reading page content");
    }
  };

  const stopReading = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      announceToScreenReader("Stopped reading");
    }
  };

  return (
    <AccessibilityContext.Provider value={{
      isScreenReaderEnabled,
      fontSize,
      highContrast,
      isReading,
      toggleScreenReader,
      setFontSize,
      toggleHighContrast,
      announceToScreenReader,
      readPageContent,
      stopReading
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