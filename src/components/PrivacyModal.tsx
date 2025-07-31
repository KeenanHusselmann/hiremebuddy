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
              <h3 className="text-lg font-semibold mb-3">Introduction to Our Privacy Commitment</h3>
              <p className="mb-4">
                At HireMeBuddy, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, store, and protect your information when you use our platform.
              </p>
              <p className="mb-4">
                We understand that your privacy is important to you, and we want to be transparent about our data practices. 
                This policy applies to all users of our platform, including clients and service providers.
              </p>
              <p>
                By using HireMeBuddy, you consent to the collection and use of your information as described in this policy.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Information We Collect</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Personal Information:</p>
                  <p>• Full name, email address, phone number, and physical address</p>
                  <p>• Profile pictures and biographical information</p>
                  <p>• Identity verification documents for service providers</p>
                  <p>• Payment information and transaction history</p>
                </div>
                <div>
                  <p className="font-medium mb-2">Service Information:</p>
                  <p>• Details about services offered, including descriptions and pricing</p>
                  <p>• Portfolio images and work samples</p>
                  <p>• Professional credentials, licenses, and certifications</p>
                  <p>• Customer reviews and ratings</p>
                </div>
                <div>
                  <p className="font-medium mb-2">Usage Information:</p>
                  <p>• How you interact with our platform and features</p>
                  <p>• Search queries, browsing patterns, and preferences</p>
                  <p>• Communication logs between users</p>
                  <p>• Device information, IP addresses, and browser data</p>
                </div>
                <div>
                  <p className="font-medium mb-2">Location Information:</p>
                  <p>• Geographic location to connect you with nearby service providers</p>
                  <p>• Service area preferences and coverage zones</p>
                  <p>• GPS data when using mobile applications (with permission)</p>
                </div>
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
              <h3 className="text-lg font-semibold mb-3">Data Retention and Deletion</h3>
              <p className="mb-4">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. 
                You may request deletion of your account and data at any time, subject to certain legal requirements.
              </p>
              <p>
                Upon account deletion, we will remove your personal information within 30 days, except for data required 
                for legal compliance, dispute resolution, or fraud prevention.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Third-Party Services and Links</h3>
              <p className="mb-4">
                Our platform may contain links to third-party websites or integrate with external services. 
                We are not responsible for the privacy practices of these third parties.
              </p>
              <p>
                We may use third-party services for payment processing, analytics, and communication. 
                These services have their own privacy policies and data handling practices.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Data Breach Notification</h3>
              <p>
                In the event of a data breach that may affect your personal information, we will notify affected users 
                and relevant authorities within 72 hours of becoming aware of the breach, as required by applicable law.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Privacy Rights for Minors</h3>
              <p>
                Our platform is not intended for use by individuals under 18 years of age. We do not knowingly collect 
                personal information from minors. If we become aware of such collection, we will delete the information promptly.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
              <p className="mb-3">
                For privacy-related questions or concerns, please contact us:
              </p>
              <div className="space-y-2">
                <p>• Privacy Team Email: privacy@hiremebuddy.com</p>
                <p>• General Support: support@hiremebuddy.com</p>
                <p>• Phone: +264 61 123 456</p>
                <p>• Mail: HireMeBuddy Privacy Team, P.O. Box 123, Windhoek, Namibia</p>
                <p>• Response Time: We aim to respond to privacy inquiries within 48 hours</p>
              </div>
            </section>

            <div className="pt-8 border-t">
              <p className="text-center text-sm text-muted-foreground">
                Last updated: January 2025<br/>
                Effective Date: January 1, 2025<br/>
                Version 2.0
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