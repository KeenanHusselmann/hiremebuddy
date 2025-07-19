import React from 'react';
import { Eye, Type, Contrast, Volume2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAccessibility } from '@/hooks/useAccessibility';

export const AccessibilityPanel: React.FC = () => {
  const {
    isScreenReaderEnabled,
    fontSize,
    highContrast,
    toggleScreenReader,
    setFontSize,
    toggleHighContrast,
    announceToScreenReader,
    readPageContent
  } = useAccessibility();

  const handleScreenReaderTest = () => {
    announceToScreenReader('Screen reader is working correctly. This is a test announcement from HireMeBuddy.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Accessibility Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Screen Reader */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium">Screen Reader Support</label>
            <p className="text-xs text-muted-foreground">
              Enable announcements for screen readers
            </p>
          </div>
          <Switch
            checked={isScreenReaderEnabled}
            onCheckedChange={toggleScreenReader}
            aria-label="Toggle screen reader support"
          />
        </div>

        {isScreenReaderEnabled && (
          <div className="ml-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
            <Button
              onClick={handleScreenReaderTest}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Test Screen Reader
            </Button>
            <Button
              onClick={readPageContent}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Read Current Page
            </Button>
          </div>
        )}

        {/* Font Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Type className="h-4 w-4" />
            Font Size
          </label>
          <Select value={fontSize} onValueChange={setFontSize}>
            <SelectTrigger>
              <SelectValue placeholder="Select font size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="large">Large</SelectItem>
              <SelectItem value="extra-large">Extra Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-2">
              <Contrast className="h-4 w-4" />
              High Contrast Mode
            </label>
            <p className="text-xs text-muted-foreground">
              Improve visibility with higher contrast colors
            </p>
          </div>
          <Switch
            checked={highContrast}
            onCheckedChange={toggleHighContrast}
            aria-label="Toggle high contrast mode"
          />
        </div>

        {/* Keyboard Navigation Help */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Keyboard Navigation</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Tab: Navigate between elements</li>
            <li>• Enter/Space: Activate buttons and links</li>
            <li>• Arrow keys: Navigate in dropdowns</li>
            <li>• Escape: Close modals and dropdowns</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};