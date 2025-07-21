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
  className = ''
}) => {
  const handleCall = () => {
    if (phoneNumber) {
      // Clean the phone number and make the call
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      window.location.href = `tel:+${cleanNumber.startsWith('264') ? cleanNumber : '264' + cleanNumber}`;
    }
  };

  const handleWhatsApp = () => {
    if (whatsappNumber) {
      // If it's already a WhatsApp link, use it directly
      if (whatsappNumber.startsWith('https://wa.me/')) {
        window.open(whatsappNumber, '_blank');
      } else if (whatsappNumber.startsWith('https://')) {
        // If it's another type of URL, use it directly
        window.open(whatsappNumber, '_blank');
      } else {
        // Extract numbers and create WhatsApp link
        const cleanNumber = whatsappNumber.replace(/\D/g, '');
        const formattedNumber = cleanNumber.startsWith('264') ? cleanNumber : '264' + cleanNumber;
        const waLink = `https://wa.me/${formattedNumber}`;
        window.open(waLink, '_blank');
      }
    }
  };

  const handleFacebook = () => {
    if (facebookUrl) {
      window.open(facebookUrl, '_blank');
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {phoneNumber && (
        <Button
          onClick={handleCall}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20 text-xs sm:text-sm px-2 py-1 min-w-0 flex-shrink"
        >
          <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
          <span className="hidden xs:inline">Call</span>
        </Button>
      )}

      {whatsappNumber && (
        <Button
          onClick={handleWhatsApp}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20 text-xs sm:text-sm px-2 py-1 min-w-0 flex-shrink"
        >
          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
          <span className="hidden xs:inline">WhatsApp</span>
        </Button>
      )}

      {facebookUrl && (
        <Button
          onClick={handleFacebook}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 text-xs sm:text-sm px-2 py-1 min-w-0 flex-shrink"
        >
          <Facebook className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
          <span className="hidden xs:inline">Facebook</span>
        </Button>
      )}
    </div>
  );
};