import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ServiceCategories from '@/components/ServiceCategories';
import FeaturedWorkers from '@/components/FeaturedWorkers';
import Footer from '@/components/Footer';

const HomePage = () => {
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

export default HomePage;