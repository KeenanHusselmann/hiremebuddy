import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
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
          <DialogTitle>Terms and Conditions</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4" onScrollCapture={handleScroll}>
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="text-lg font-semibold mb-3">Introduction</h3>
              <p>
                Welcome to HireMeBuddy, your trusted platform for connecting clients with skilled service providers in Namibia. 
                By using our platform, you agree to comply with and be bound by the following terms and conditions.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Platform Purpose</h3>
              <p>
                HireMeBuddy serves as a marketplace connecting clients seeking services with qualified service providers. 
                We facilitate connections but do not directly provide services or guarantee specific outcomes.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">User Accounts</h3>
              <div className="space-y-2">
                <p>• Users must provide accurate and complete information when creating accounts</p>
                <p>• Service providers must verify their identity through our verification process</p>
                <p>• Account holders are responsible for maintaining the confidentiality of their login credentials</p>
                <p>• Users must notify us immediately of any unauthorized access to their accounts</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Service Provider Responsibilities</h3>
              <div className="space-y-2">
                <p>• Provide services with professional competence and in accordance with industry standards</p>
                <p>• Maintain appropriate licenses, certifications, and insurance as required by law</p>
                <p>• Communicate clearly and honestly about service capabilities, timelines, and costs</p>
                <p>• Complete work within agreed timeframes and to the standard specified</p>
                <p>• Handle client property and information with care and confidentiality</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Client Responsibilities</h3>
              <div className="space-y-2">
                <p>• Provide accurate project descriptions and requirements</p>
                <p>• Ensure safe working conditions and access to work areas</p>
                <p>• Make timely payments as agreed with service providers</p>
                <p>• Communicate changes or concerns promptly and professionally</p>
                <p>• Provide honest and fair reviews based on actual service experience</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Platform Limitations</h3>
              <div className="space-y-2">
                <p>• HireMeBuddy does not guarantee the quality, safety, or legality of services provided</p>
                <p>• We are not responsible for disputes between clients and service providers</p>
                <p>• Users engage service providers at their own risk and discretion</p>
                <p>• The platform may experience downtime or technical issues beyond our control</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Dispute Resolution</h3>
              <p>
                Users are encouraged to resolve disputes directly. HireMeBuddy may provide mediation assistance 
                but is not obligated to resolve conflicts between users.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Privacy and Data Protection</h3>
              <p>
                We are committed to protecting user privacy. Please review our Privacy Policy for detailed 
                information about how we collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Modifications to Terms</h3>
              <p>
                HireMeBuddy reserves the right to modify these terms at any time. Users will be notified of 
                significant changes and continued use constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <p>
                For questions about these terms, please contact us at support@hiremebuddy.com or 
                call us at +264 61 123 456.
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
            {!hasScrolledToBottom ? 'Scroll to bottom to accept' : 'Accept Terms'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};