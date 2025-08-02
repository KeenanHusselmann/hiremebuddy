import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const PrivacyPage = () => {
  const [hasRead, setHasRead] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleConfirmRead = () => {
    setHasRead(true);
    toast({
      title: "Privacy Policy Acknowledged",
      description: "Thank you for reading our Privacy Policy"
    });
    // Store in localStorage for persistence
    localStorage.setItem('privacy_acknowledged', 'true');
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 md:p-12">
              <h1 className="text-4xl font-bold text-foreground mb-8 text-center">
                Privacy Policy
              </h1>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground mb-6 text-center">
                  Last updated: {new Date().toLocaleDateString()}
                </p>

                <div className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
                    <div className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Personal Information:</strong> When you create an account, we collect information 
                        such as your name, email address, phone number, and location to facilitate connections 
                        between clients and service providers.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Profile Information:</strong> Service providers may share additional information 
                        about their skills, experience, hourly rates, and portfolio images.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Usage Data:</strong> We collect information about how you use our platform, 
                        including search queries, bookings, and interaction patterns to improve our services.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
                    <div className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Service Facilitation:</strong> We use your information to connect clients 
                        with appropriate service providers and facilitate bookings.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Communication:</strong> We may contact you regarding your bookings, platform 
                        updates, or customer support inquiries.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Platform Improvement:</strong> We analyze usage patterns to enhance user 
                        experience and develop new features.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Safety and Security:</strong> We monitor platform activity to prevent fraud, 
                        ensure user safety, and maintain platform integrity.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">3. Information Sharing</h2>
                    <div className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Between Users:</strong> We share relevant profile information between clients 
                        and service providers to facilitate connections. This includes contact information 
                        when bookings are made.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Legal Requirements:</strong> We may disclose information when required by law 
                        or to protect the rights, property, or safety of our users or the public.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Service Providers:</strong> We may share information with trusted third-party 
                        service providers who help us operate our platform, subject to confidentiality agreements.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Security</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We implement appropriate technical and organizational measures to protect your personal 
                      information against unauthorized access, alteration, disclosure, or destruction. However, 
                      no internet transmission is completely secure, and we cannot guarantee absolute security.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">5. Your Rights and Choices</h2>
                    <div className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Access and Update:</strong> You can access and update your profile information 
                        at any time through your account settings.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Data Deletion:</strong> You may request deletion of your account and associated 
                        data, subject to legal retention requirements.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Communication Preferences:</strong> You can opt out of non-essential communications 
                        while continuing to receive important service-related messages.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">6. Location Information</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      With your consent, we may collect and use location information to help match you with 
                      nearby service providers or clients. You can disable location sharing in your device 
                      settings or account preferences.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cookies and Tracking</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We use cookies and similar technologies to enhance your browsing experience, remember 
                      your preferences, and analyze platform usage. You can control cookie settings through 
                      your browser preferences.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">8. Children's Privacy</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Our platform is not intended for users under 18 years of age. We do not knowingly 
                      collect personal information from children under 18. If you believe we have collected 
                      such information, please contact us immediately.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">9. Changes to This Policy</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We may update this Privacy Policy periodically to reflect changes in our practices 
                      or legal requirements. We will notify users of significant changes and encourage 
                      regular review of this policy.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Us</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      If you have questions about this Privacy Policy or our data practices, please contact us:
                    </p>
                    <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                      <p className="text-foreground font-medium">HireMeBuddy Privacy Team</p>
                      <p className="text-muted-foreground">Email: privacy@hiremebuddy.com</p>
                      <p className="text-muted-foreground">Phone: +264 61 123 456</p>
                      <p className="text-muted-foreground">Address: Windhoek, Namibia</p>
                    </div>
                  </section>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      By clicking the button below, you acknowledge that you have read and understood our Privacy Policy.
                    </p>
                    <Button 
                      onClick={handleConfirmRead}
                      disabled={hasRead}
                      className="min-w-48"
                    >
                      {hasRead ? 'Privacy Policy Acknowledged ✓' : 'I Have Read and Understand the Privacy Policy'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;