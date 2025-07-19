import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ServiceCategories from '@/components/ServiceCategories';
import FeaturedWorkers from '@/components/FeaturedWorkers';
import Footer from '@/components/Footer';

const Index = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ServiceCategories />
        <FeaturedWorkers />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
