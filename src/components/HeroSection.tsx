import { useState, useEffect } from 'react';
import { Search, ArrowRight, Users, Award, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/hiremebuddy-logo.png';

const HeroSection = () => {
  const { t } = useLanguage();
  const { profile, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    // Don't allow empty searches
    if (!searchQuery.trim()) {
      toast({
        title: "Search required",
        description: "Please enter a keyword to search for services",
        variant: "destructive",
      });
      return;
    }
    navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <section className="relative flex flex-col items-center overflow-hidden bg-gradient-light pt-2 sm:pt-4 lg:pt-6 pb-8">
      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center w-full px-4 pt-20 sm:pt-24 md:pt-28">
        {/* Logo above title */}
        <div className="mb-6 fade-in">
          <img 
            src={logo} 
            alt="HireMeBuddy Logo" 
            className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 mx-auto"
          />
        </div>
        
        {/* App Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 text-center fade-in">
          {t('hero.title')}
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 text-center max-w-2xl leading-relaxed fade-in">
          {t('hero.subtitle')}
        </p>
        
        {/* Conditional Buttons - Only show for logged-in users */}
        {session && (
          <>
            {/* Search Section */}
            <div className="w-full max-w-md mb-8 fade-in">
              <Button 
                onClick={() => navigate('/browse')}
                className="btn-sunset w-full px-8 py-4 text-lg"
              >
                <Search className="mr-2 h-5 w-5" />
                {t('hero.searchButton')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 fade-in">
              <Button 
                className="btn-sunset px-8 py-3 text-lg min-w-[180px]"
                onClick={() => navigate('/browse')}
              >
                {t('hero.findServices')}
              </Button>
              <Button 
                className="btn-glass px-8 py-3 text-lg min-w-[180px]"
                onClick={() => navigate('/create-service')}
              >
                {t('hero.offerSkills')}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;