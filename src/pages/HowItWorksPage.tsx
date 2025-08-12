import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HowItWorksContent from '@/components/HowItWorksContent';

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HowItWorksContent />
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;