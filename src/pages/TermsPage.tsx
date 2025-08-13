import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TermsPage = () => {
  useEffect(() => {
    document.title = 'Terms and Conditions | HireMeBuddy';
    const desc = "Read HireMeBuddy's Terms and Conditions for clients and service providers in Namibia.";
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
    link.setAttribute('href', `${window.location.origin}/terms`);
  }, []);
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 md:p-12">
              <h1 className="text-4xl font-bold text-foreground mb-8 text-center">
                Terms and Conditions
              </h1>
              
              <div className="prose prose-lg max-w-none">
<p className="text-muted-foreground mb-6 text-center">
  Last updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}<br />
  Effective Date: January 1, 2025
</p>

<div className="space-y-8">
  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
    <p className="text-muted-foreground leading-relaxed mb-4">
      Welcome to HireMeBuddy, your trusted platform for connecting clients with skilled service providers in Namibia.
      By using our platform, you agree to comply with and be bound by the following terms and conditions.
    </p>
    <p className="text-muted-foreground leading-relaxed mb-4">
      These terms constitute a legally binding agreement between you and HireMeBuddy. Please read them carefully
      before using our services. If you do not agree with these terms, you may not access or use our platform.
    </p>
    <p className="text-muted-foreground leading-relaxed">
      These terms apply to all users of the platform, including clients seeking services and service providers
      offering their professional skills through our marketplace.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Platform Purpose and Scope</h2>
    <p className="text-muted-foreground leading-relaxed mb-4">
      HireMeBuddy serves as a digital marketplace connecting clients seeking services with qualified service providers
      across Namibia. We facilitate connections but do not directly provide services or guarantee specific outcomes.
    </p>
    <p className="text-muted-foreground leading-relaxed mb-4">
      Our platform covers a wide range of services including but not limited to: construction, plumbing, electrical work,
      carpentry, automotive services, catering, photography, tech support, and various other professional services.
    </p>
    <p className="text-muted-foreground leading-relaxed">
      We provide tools for communication, booking, payment processing, and review systems to facilitate successful
      service transactions between our users.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Eligibility and Registration</h2>
    <div className="space-y-2 text-muted-foreground">
      <p>• Users must be at least 18 years of age to register and use our platform</p>
      <p>• Service providers must be legally authorized to provide services in Namibia</p>
      <p>• All users must provide accurate and truthful information during registration</p>
      <p>• Users are responsible for maintaining the security and confidentiality of their account credentials</p>
      <p>• Users must immediately notify us of any suspected unauthorized access to their accounts</p>
      <p>• We reserve the right to suspend or terminate accounts that violate these terms</p>
    </div>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">User Accounts</h2>
    <div className="space-y-2 text-muted-foreground">
      <p>• Users must provide accurate and complete information when creating accounts</p>
      <p>• Service providers must verify their identity through our verification process</p>
      <p>• Account holders are responsible for maintaining the confidentiality of their login credentials</p>
      <p>• Users must notify us immediately of any unauthorized access to their accounts</p>
    </div>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Service Provider Responsibilities</h2>
    <div className="space-y-2 text-muted-foreground">
      <p>• Provide services with professional competence and in accordance with industry standards</p>
      <p>• Maintain appropriate licenses, certifications, and insurance as required by law</p>
      <p>• Communicate clearly and honestly about service capabilities, timelines, and costs</p>
      <p>• Complete work within agreed timeframes and to the standard specified</p>
      <p>• Handle client property and information with care and confidentiality</p>
    </div>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Client Responsibilities</h2>
    <div className="space-y-2 text-muted-foreground">
      <p>• Provide accurate project descriptions and requirements</p>
      <p>• Ensure safe working conditions and access to work areas</p>
      <p>• Make timely payments as agreed with service providers</p>
      <p>• Communicate changes or concerns promptly and professionally</p>
      <p>• Provide honest and fair reviews based on actual service experience</p>
    </div>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Platform Limitations</h2>
    <div className="space-y-2 text-muted-foreground">
      <p>• HireMeBuddy does not guarantee the quality, safety, or legality of services provided</p>
      <p>• We are not responsible for disputes between clients and service providers</p>
      <p>• Users engage service providers at their own risk and discretion</p>
      <p>• The platform may experience downtime or technical issues beyond our control</p>
    </div>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Dispute Resolution</h2>
    <p className="text-muted-foreground leading-relaxed">
      Users are encouraged to resolve disputes directly. HireMeBuddy may provide mediation assistance
      but is not obligated to resolve conflicts between users.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Privacy and Data Protection</h2>
    <p className="text-muted-foreground leading-relaxed">
      We are committed to protecting user privacy. Please review our Privacy Policy for detailed information
      about how we collect, use, and protect your personal information.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Modifications to Terms</h2>
    <p className="text-muted-foreground leading-relaxed">
      HireMeBuddy reserves the right to modify these terms at any time. Users will be notified of significant
      changes and continued use constitutes acceptance of modified terms.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Payment Terms and Fees</h2>
    <div className="space-y-2 text-muted-foreground">
      <p>• Clients pay HireMeBuddy directly; HireMeBuddy pays providers after the service is completed</p>
      <p>• HireMeBuddy may charge service fees for platform usage and payment processing</p>
      <p>• All fees and charges will be clearly disclosed before any transaction</p>
      <p>• Refund policies are determined by individual service providers unless otherwise specified</p>
      <p>• Users are responsible for all applicable taxes on their transactions</p>
    </div>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Intellectual Property Rights</h2>
    <p className="text-muted-foreground leading-relaxed mb-4">
      All content on the HireMeBuddy platform, including but not limited to text, graphics, logos, images,
      and software, is the property of HireMeBuddy or its licensors and is protected by copyright and
      other intellectual property laws.
    </p>
    <p className="text-muted-foreground leading-relaxed">
      Users retain ownership of content they upload but grant HireMeBuddy a license to use, display,
      and distribute such content for platform operations and marketing purposes.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
    <div className="space-y-2 text-muted-foreground">
      <p>• HireMeBuddy's liability is limited to the maximum extent permitted by law</p>
      <p>• We are not liable for indirect, incidental, or consequential damages</p>
      <p>• Our total liability shall not exceed the fees paid by the user in the preceding 12 months</p>
      <p>• Users acknowledge that they use the platform at their own risk</p>
    </div>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Indemnification</h2>
    <p className="text-muted-foreground leading-relaxed">
      Users agree to indemnify and hold harmless HireMeBuddy, its officers, directors, employees, and agents
      from any claims, damages, or expenses arising from their use of the platform or violation of these terms.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Governing Law and Jurisdiction</h2>
    <p className="text-muted-foreground leading-relaxed">
      These terms are governed by the laws of Namibia. Any disputes arising from these terms or use of
      the platform shall be subject to the exclusive jurisdiction of the courts of Namibia.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Severability</h2>
    <p className="text-muted-foreground leading-relaxed">
      If any provision of these terms is found to be unenforceable, the remaining provisions shall
      continue to be valid and enforceable to the fullest extent permitted by law.
    </p>
  </section>

  <section>
    <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
    <p className="text-muted-foreground leading-relaxed mb-3">For questions about these terms, please contact us:</p>
    <div className="mt-4 p-4 bg-muted/20 rounded-lg text-muted-foreground">
      <p>• Email: hiremebuddy061@gmail.com</p>
      <p>• Phone: +264 81 853 6789</p>
      <p>• Address: 55 Kenneth Mcarthur Street, Auasblick</p>
      <p>• Business Hours: Monday - Friday, 8:00 AM - 5:00 PM (CAT)</p>
    </div>
  </section>

  <div className="pt-8 border-t">
    <p className="text-center text-sm text-muted-foreground">
      Last updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}<br/>
      Effective Date: January 1, 2025
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

export default TermsPage;