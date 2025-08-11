import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TermsPage = () => {
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
                  Last updated: {new Date().toLocaleDateString()}
                </p>

                <div className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Welcome to HireMeBuddy! These Terms and Conditions ("Terms") govern your use of our platform 
                      that connects skilled Namibian laborers with clients seeking their services. By accessing or 
                      using our service, you agree to be bound by these Terms.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">2. Platform Purpose</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      HireMeBuddy serves as a marketplace connecting clients with skilled laborers in Namibia. 
                      We facilitate connections but do not directly provide the services listed on our platform. 
                      All service agreements are between clients and service providers.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
                    <div className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Account Creation:</strong> You must create an account to use our services. 
                        You are responsible for maintaining the confidentiality of your account credentials.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Accurate Information:</strong> You must provide accurate, current, and complete 
                        information about yourself and keep your profile information updated.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Prohibited Use:</strong> You may not use our platform for illegal activities, 
                        spam, harassment, or any activity that violates these Terms.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">4. Service Provider Responsibilities</h2>
                    <div className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Qualifications:</strong> Service providers must accurately represent their 
                        skills, qualifications, and experience.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Service Quality:</strong> Providers are expected to deliver services professionally 
                        and as described in their listings.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Legal Compliance:</strong> All providers must comply with local laws, regulations, 
                        and licensing requirements for their respective trades.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">5. Client Responsibilities</h2>
                    <div className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Fair Treatment:</strong> Clients must treat service providers with respect 
                        and communicate clearly about project requirements.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Payment:</strong> Clients are responsible for negotiating and making payments 
                        directly with service providers as agreed.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>Safety:</strong> Clients must provide a safe working environment and 
                        communicate any potential hazards.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">6. Platform Limitations</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      HireMeBuddy acts as a marketplace facilitator only. We do not guarantee the quality 
                      of services, the completion of projects, or the conduct of users. Users interact 
                      with each other at their own risk and discretion.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">7. Dispute Resolution</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      While we encourage users to resolve disputes directly, we may provide mediation 
                      assistance when requested. However, we are not responsible for resolving disputes 
                      between users and recommend seeking appropriate legal advice when necessary.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">8. Privacy and Data Protection</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Your privacy is important to us. Please review our Privacy Policy to understand 
                      how we collect, use, and protect your personal information.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">9. Modifications to Terms</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We reserve the right to modify these Terms at any time. Users will be notified 
                      of significant changes, and continued use of the platform constitutes acceptance 
                      of the updated Terms.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Information</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      If you have questions about these Terms, please contact us at:
                    </p>
                    <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                      <p className="text-foreground font-medium">HireMeBuddy Support</p>
                      <p className="text-muted-foreground">Email: hiremebuddy061@gmail.com</p>
                      <p className="text-muted-foreground">Phone: +264 81 853 6789</p>
                      <p className="text-muted-foreground">Address: Windhoek, Namibia</p>
                    </div>
                  </section>
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