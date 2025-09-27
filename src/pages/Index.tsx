import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ServiceCategories from '@/components/ServiceCategories';
import FeaturedWorkers from '@/components/FeaturedWorkers';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import HowItWorksContent from '@/components/HowItWorksContent';
import useBackButtonHandler from '@/hooks/useBackButtonHandler';

const Index = () => {
  const { session } = useAuth();
  
  // Handle back button for home page (double-tap to exit)
  useBackButtonHandler();
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {session ? (
          <>
            <HeroSection />
            <ServiceCategories />
            <FeaturedWorkers />
          </>
        ) : (
          <>
            <HeroSection />
            <HowItWorksContent />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
