import React from 'react';
import { Phone, MessageCircle, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommunicationButtonsProps {
  phoneNumber?: string;
  whatsappNumber?: string;
  facebookUrl?: string;
  className?: string;
}

export const CommunicationButtons: React.FC<CommunicationButtonsProps> = ({
  phoneNumber,
  whatsappNumber,
  facebookUrl,
  className = ""
}) => {
  const handleCall = () => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  const handleWhatsApp = () => {
    if (whatsappNumber) {
      const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    }
  };

  const handleFacebook = () => {
    if (facebookUrl) {
      window.open(facebookUrl, '_blank');
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {phoneNumber && (
        <Button
          onClick={handleCall}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20"
        >
          <Phone className="h-4 w-4 text-green-600" />
          Call
        </Button>
      )}

      {whatsappNumber && (
        <Button
          onClick={handleWhatsApp}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20"
        >
          <MessageCircle className="h-4 w-4 text-green-600" />
          WhatsApp
        </Button>
      )}

      {facebookUrl && (
        <Button
          onClick={handleFacebook}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
        >
          <Facebook className="h-4 w-4 text-blue-600" />
          Facebook
        </Button>
      )}
    </div>
  );
};