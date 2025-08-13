import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PrivacyPage = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | HireMeBuddy';
    const desc = 'Learn how HireMeBuddy collects, uses, and protects your personal data.';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', `${window.location.origin}/privacy`);
  }, []);
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
  Last updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}<br />
  Effective Date: January 1, 2025 • Version 2.0
</p>

<div className="space-y-8">
  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction to Our Privacy Commitment</h2>
    <p className="text-muted-foreground leading-relaxed mb-4">
      At HireMeBuddy, we are committed to protecting your privacy and ensuring the security of your personal information.
      This Privacy Policy explains how we collect, use, store, and protect your information when you use our platform.
    </p>
    <p className="text-muted-foreground leading-relaxed mb-4">
      We understand that your privacy is important to you, and we want to be transparent about our data practices.
      This policy applies to all users of our platform, including clients and service providers.
    </p>
    <p className="text-muted-foreground leading-relaxed">
      By using HireMeBuddy, you consent to the collection and use of your information as described in this policy.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
    <div className="space-y-4 text-muted-foreground">
      <div>
        <p className="font-medium mb-2 text-foreground">Personal Information:</p>
        <p>• Full name, email address, phone number, and physical address</p>
        <p>• Profile pictures and biographical information</p>
        <p>• Identity verification documents for service providers</p>
        <p>• Payment information and transaction history</p>
      </div>
      <div>
        <p className="font-medium mb-2 text-foreground">Service Information:</p>
        <p>• Details about services offered, including descriptions and pricing</p>
        <p>• Portfolio images and work samples</p>
        <p>• Professional credentials, licenses, and certifications</p>
        <p>• Customer reviews and ratings</p>
      </div>
      <div>
        <p className="font-medium mb-2 text-foreground">Usage Information:</p>
        <p>• How you interact with our platform and features</p>
        <p>• Search queries, browsing patterns, and preferences</p>
        <p>• Communication logs between users</p>
        <p>• Device information, IP addresses, and browser data</p>
      </div>
      <div>
        <p className="font-medium mb-2 text-foreground">Location Information:</p>
        <p>• Geographic location to connect you with nearby service providers</p>
        <p>• Service area preferences and coverage zones</p>
        <p>• GPS data when using mobile applications (with permission)</p>
      </div>
    </div>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
    <div className="space-y-2 text-muted-foreground">
      <p>• To facilitate connections between clients and service providers</p>
      <p>• To verify the identity and credentials of service providers</p>
      <p>• To improve our platform and user experience</p>
      <p>• To communicate important updates and notifications</p>
      <p>• To provide customer support and resolve disputes</p>
      <p>• To ensure platform security and prevent fraud</p>
    </div>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Information Sharing</h2>
    <div className="space-y-2 text-muted-foreground">
      <p><strong className="text-foreground">With Other Users:</strong> Profile information is visible to facilitate service connections</p>
      <p><strong className="text-foreground">Service Providers:</strong> We may share necessary information to complete service requests</p>
      <p><strong className="text-foreground">Legal Requirements:</strong> We may disclose information if required by law or to protect our rights</p>
      <p><strong className="text-foreground">Business Partners:</strong> We do not sell personal information to third parties</p>
    </div>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
    <p className="text-muted-foreground leading-relaxed">
      We implement appropriate technical and organizational measures to protect your personal information
      against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission
      is completely secure, and we cannot guarantee absolute security.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
    <div className="space-y-2 text-muted-foreground">
      <p>• Access and review your personal information</p>
      <p>• Request corrections to inaccurate information</p>
      <p>• Delete your account and associated data</p>
      <p>• Opt-out of marketing communications</p>
      <p>• Request data portability where applicable</p>
    </div>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Location Information</h2>
    <p className="text-muted-foreground leading-relaxed">
      We collect and use location information to connect you with nearby service providers and to provide location-based services.
      You can control location sharing through your device settings.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies and Tracking</h2>
    <p className="text-muted-foreground leading-relaxed">
      We use cookies and similar technologies to improve user experience, analyze usage patterns, and maintain user sessions.
      You can control cookie preferences through your browser settings.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Children's Privacy</h2>
    <p className="text-muted-foreground leading-relaxed">
      Our platform is not intended for children under 18. We do not knowingly collect personal information from children.
      If we become aware of such collection, we will delete the information promptly.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">International Data Transfers</h2>
    <p className="text-muted-foreground leading-relaxed">
      Your information may be transferred to and processed in countries other than Namibia.
      We ensure appropriate safeguards are in place for such transfers.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to This Policy</h2>
    <p className="text-muted-foreground leading-relaxed">
      We may update this privacy policy periodically. We will notify users of significant changes and post the updated policy on our platform.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Data Retention and Deletion</h2>
    <p className="text-muted-foreground leading-relaxed mb-4">
      We retain your personal information for as long as necessary to provide our services and comply with legal obligations.
      You may request deletion of your account and data at any time, subject to certain legal requirements.
    </p>
    <p className="text-muted-foreground leading-relaxed">
      Upon account deletion, we will remove your personal information within 30 days, except for data required for legal compliance,
      dispute resolution, or fraud prevention.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Services and Links</h2>
    <p className="text-muted-foreground leading-relaxed mb-4">
      Our platform may contain links to third-party websites or integrate with external services.
      We are not responsible for the privacy practices of these third parties.
    </p>
    <p className="text-muted-foreground leading-relaxed">
      We may use third-party services for payment processing, analytics, and communication.
      These services have their own privacy policies and data handling practices.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Data Breach Notification</h2>
    <p className="text-muted-foreground leading-relaxed">
      In the event of a data breach that may affect your personal information, we will notify affected users and relevant authorities
      within 72 hours of becoming aware of the breach, as required by applicable law.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Privacy Rights for Minors</h2>
    <p className="text-muted-foreground leading-relaxed">
      Our platform is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from minors.
      If we become aware of such collection, we will delete the information promptly.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
    <p className="text-muted-foreground leading-relaxed mb-3">For privacy-related questions or concerns, please contact us:</p>
    <div className="mt-4 p-4 bg-muted/20 rounded-lg text-muted-foreground">
      <p>• Email: hiremebuddy061@gmail.com</p>
      <p>• Phone: +264 81 853 6789</p>
      <p>• Address: 55 Kenneth Mcarthur Street, Auasblick</p>
      <p>• Response Time: We aim to respond to privacy inquiries within 48 hours</p>
    </div>
  </section>

  <div className="pt-8 border-t">
    <p className="text-center text-sm text-muted-foreground">
      Last updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}<br/>
      Effective Date: January 1, 2025<br/>
      Version 2.0
    </p>
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