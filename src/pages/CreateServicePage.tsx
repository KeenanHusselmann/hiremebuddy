import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceCreationForm } from '@/components/ServiceCreationForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useBackNavigation } from '@/hooks/useBackNavigation';

const CreateServicePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getBackButtonProps } = useBackNavigation();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          {...getBackButtonProps('/profile')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <ServiceCreationForm />
      </main>

      <Footer />
    </div>
  );
};

export default CreateServicePage;