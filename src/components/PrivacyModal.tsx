import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose, onAccept }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
    }
  }, [isOpen]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
    setHasScrolledToBottom(isAtBottom);
  };

  const handleAccept = () => {
    onAccept();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4" onScrollCapture={handleScroll}>
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="text-lg font-semibold mb-3">Information We Collect</h3>
              <div className="space-y-2">
                <p><strong>Personal Information:</strong> Name, email address, phone number, location, and profile information</p>
                <p><strong>Service Information:</strong> Details about services offered, portfolio images, and professional credentials</p>
                <p><strong>Usage Information:</strong> How you interact with our platform, including search queries and communication logs</p>
                <p><strong>Location Information:</strong> Geographic location to connect you with nearby service providers</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">How We Use Your Information</h3>
              <div className="space-y-2">
                <p>• To facilitate connections between clients and service providers</p>
                <p>• To verify the identity and credentials of service providers</p>
                <p>• To improve our platform and user experience</p>
                <p>• To communicate important updates and notifications</p>
                <p>• To provide customer support and resolve disputes</p>
                <p>• To ensure platform security and prevent fraud</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Information Sharing</h3>
              <div className="space-y-2">
                <p><strong>With Other Users:</strong> Profile information is visible to facilitate service connections</p>
                <p><strong>Service Providers:</strong> We may share necessary information to complete service requests</p>
                <p><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights</p>
                <p><strong>Business Partners:</strong> We do not sell personal information to third parties</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Data Security</h3>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission 
                is completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Your Rights</h3>
              <div className="space-y-2">
                <p>• Access and review your personal information</p>
                <p>• Request corrections to inaccurate information</p>
                <p>• Delete your account and associated data</p>
                <p>• Opt-out of marketing communications</p>
                <p>• Request data portability where applicable</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Location Information</h3>
              <p>
                We collect and use location information to connect you with nearby service providers and 
                to provide location-based services. You can control location sharing through your device settings.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Cookies and Tracking</h3>
              <p>
                We use cookies and similar technologies to improve user experience, analyze usage patterns, 
                and maintain user sessions. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Children's Privacy</h3>
              <p>
                Our platform is not intended for children under 18. We do not knowingly collect personal 
                information from children. If we become aware of such collection, we will delete the information promptly.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">International Data Transfers</h3>
              <p>
                Your information may be transferred to and processed in countries other than Namibia. 
                We ensure appropriate safeguards are in place for such transfers.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Changes to This Policy</h3>
              <p>
                We may update this privacy policy periodically. We will notify users of significant changes 
                and post the updated policy on our platform.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
              <p>
                For privacy-related questions or concerns, please contact our Privacy Team at 
                privacy@hiremebuddy.com or write to us at HireMeBuddy Privacy Team, P.O. Box 123, Windhoek, Namibia.
              </p>
            </section>

            <div className="pt-8 border-t">
              <p className="text-center text-sm text-muted-foreground">
                Last updated: January 2024
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAccept} 
            disabled={!hasScrolledToBottom}
            className={!hasScrolledToBottom ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {!hasScrolledToBottom ? 'Scroll to bottom to accept' : 'Accept Privacy Policy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};