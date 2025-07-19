import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageCircle, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhoneInputWithWhatsAppProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const PhoneInputWithWhatsApp: React.FC<PhoneInputWithWhatsAppProps> = ({
  value,
  onChange,
  placeholder = "Enter phone number",
  label = "Phone Number",
  className = ""
}) => {
  const [whatsappLink, setWhatsappLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Generate WhatsApp link when phone number changes
  useEffect(() => {
    if (value && value.length >= 8) {
      // Clean the number (remove spaces, dashes, parentheses)
      const cleanNumber = value.replace(/[^\d+]/g, '');
      
      // Add country code if not present (default to +264 for Namibia)
      let formattedNumber = cleanNumber;
      if (!cleanNumber.startsWith('+')) {
        if (cleanNumber.startsWith('264')) {
          formattedNumber = '+' + cleanNumber;
        } else if (cleanNumber.startsWith('0')) {
          formattedNumber = '+264' + cleanNumber.substring(1);
        } else {
          formattedNumber = '+264' + cleanNumber;
        }
      }
      
      setWhatsappLink(`https://wa.me/${formattedNumber.replace('+', '')}`);
    } else {
      setWhatsappLink('');
    }
  }, [value]);

  const copyToClipboard = async () => {
    if (whatsappLink) {
      try {
        await navigator.clipboard.writeText(whatsappLink);
        setCopied(true);
        toast({
          title: "Copied!",
          description: "WhatsApp link copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
        });
      }
    }
  };

  const openWhatsApp = () => {
    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          {label}
        </label>
        <Input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full"
        />
      </div>

      {whatsappLink && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              WhatsApp Link Generated
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 text-xs text-green-700 dark:text-green-300 bg-white dark:bg-green-950/50 p-2 rounded border font-mono">
              {whatsappLink}
            </div>
            
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            
            <Button
              onClick={openWhatsApp}
              variant="default"
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Test
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};