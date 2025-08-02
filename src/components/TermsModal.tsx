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
              <p className="mb-4">
                Welcome to HireMeBuddy, your trusted platform for connecting clients with skilled service providers in Namibia. 
                By using our platform, you agree to comply with and be bound by the following terms and conditions.
              </p>
              <p className="mb-4">
                These terms constitute a legally binding agreement between you and HireMeBuddy. Please read them carefully 
                before using our services. If you do not agree with these terms, you may not access or use our platform.
              </p>
              <p>
                These terms apply to all users of the platform, including clients seeking services and service providers 
                offering their professional skills through our marketplace.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Platform Purpose and Scope</h3>
              <p className="mb-4">
                HireMeBuddy serves as a digital marketplace connecting clients seeking services with qualified service providers 
                across Namibia. We facilitate connections but do not directly provide services or guarantee specific outcomes.
              </p>
              <p className="mb-4">
                Our platform covers a wide range of services including but not limited to: construction, plumbing, electrical work, 
                carpentry, automotive services, catering, photography, tech support, and various other professional services.
              </p>
              <p>
                We provide tools for communication, booking, payment processing, and review systems to facilitate successful 
                service transactions between our users.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Eligibility and Registration</h3>
              <div className="space-y-3">
                <p>• Users must be at least 18 years of age to register and use our platform</p>
                <p>• Service providers must be legally authorized to provide services in Namibia</p>
                <p>• All users must provide accurate and truthful information during registration</p>
                <p>• Users are responsible for maintaining the security and confidentiality of their account credentials</p>
                <p>• Users must immediately notify us of any suspected unauthorized access to their accounts</p>
                <p>• We reserve the right to suspend or terminate accounts that violate these terms</p>
              </div>
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
              <h3 className="text-lg font-semibold mb-3">Payment Terms and Fees</h3>
              <div className="space-y-3">
                <p>• Payment arrangements are made directly between clients and service providers</p>
                <p>• HireMeBuddy may charge service fees for platform usage and payment processing</p>
                <p>• All fees and charges will be clearly disclosed before any transaction</p>
                <p>• Refund policies are determined by individual service providers unless otherwise specified</p>
                <p>• Users are responsible for all applicable taxes on their transactions</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Intellectual Property Rights</h3>
              <p className="mb-4">
                All content on the HireMeBuddy platform, including but not limited to text, graphics, logos, images, 
                and software, is the property of HireMeBuddy or its licensors and is protected by copyright and 
                other intellectual property laws.
              </p>
              <p>
                Users retain ownership of content they upload but grant HireMeBuddy a license to use, display, 
                and distribute such content for platform operations and marketing purposes.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Limitation of Liability</h3>
              <div className="space-y-3">
                <p>• HireMeBuddy's liability is limited to the maximum extent permitted by law</p>
                <p>• We are not liable for indirect, incidental, or consequential damages</p>
                <p>• Our total liability shall not exceed the fees paid by the user in the preceding 12 months</p>
                <p>• Users acknowledge that they use the platform at their own risk</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Indemnification</h3>
              <p>
                Users agree to indemnify and hold harmless HireMeBuddy, its officers, directors, employees, and agents 
                from any claims, damages, or expenses arising from their use of the platform or violation of these terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Governing Law and Jurisdiction</h3>
              <p>
                These terms are governed by the laws of Namibia. Any disputes arising from these terms or use of 
                the platform shall be subject to the exclusive jurisdiction of the courts of Namibia.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Severability</h3>
              <p>
                If any provision of these terms is found to be unenforceable, the remaining provisions shall 
                continue to be valid and enforceable to the fullest extent permitted by law.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <p className="mb-3">
                For questions about these terms, please contact us:
              </p>
              <div className="space-y-2">
                <p>• Email: support@hiremebuddy.com</p>
                <p>• Phone: +264 61 123 456</p>
                <p>• Address: HireMeBuddy, P.O. Box 456, Windhoek, Namibia</p>
                <p>• Business Hours: Monday - Friday, 8:00 AM - 5:00 PM (CAT)</p>
              </div>
            </section>

            <div className="pt-8 border-t">
              <p className="text-center text-sm text-muted-foreground">
                Last updated: January 2025<br/>
                Effective Date: January 1, 2025
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
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