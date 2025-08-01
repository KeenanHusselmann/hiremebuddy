import { useEffect, useState } from 'react';
import { Star, MapPin, Phone, MessageCircle, Facebook, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommunicationButtons } from '@/components/CommunicationButtons';
import { supabase } from '@/integrations/supabase/client';

interface Worker {
  id: string;
  name: string;
  profession: string;
  location: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  description: string;
  specialties: string[];
  avatar: string | null;
  isVerified: boolean;
  responseTime: string;
  completedJobs: number;
  contactNumber?: string;
  whatsappLink?: string;
  facebookLink?: string;
}

const FeaturedWorkers = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedWorkers = async () => {
      try {
        // Fetch services with profile information to show featured workers
        const { data: services, error } = await supabase
          .from('services')
          .select(`
            id,
            service_name,
            description,
            hourly_rate,
            labourer_id,
            profiles!inner (
              full_name,
              avatar_url,
              location_text,
              town,
              contact_number,
              whatsapp_link,
              facebook_link,
              is_verified
            )
          `)
          .eq('is_active', true)
          .limit(6);

        if (error) throw error;

        // Transform services data to worker format
        const workersData = services?.map(service => ({
          id: service.id,
          name: service.profiles.full_name,
          profession: service.service_name,
          location: service.profiles.town || 'Windhoek',
          rating: 0, // Will be calculated from reviews in future
          reviewCount: 0,
          hourlyRate: service.hourly_rate || 0,
          description: service.description,
          specialties: [service.service_name],
          avatar: service.profiles.avatar_url,
          isVerified: service.profiles.is_verified,
          responseTime: '< 2 hours',
          completedJobs: 0,
          contactNumber: service.profiles.contact_number,
          whatsappLink: service.profiles.whatsapp_link,
          facebookLink: service.profiles.facebook_link
        })) || [];

        setWorkers(workersData);
      } catch (error) {
        console.error('Error fetching workers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedWorkers();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : index < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-background/80">
      <div className="container-responsive">
        <div className="text-center mb-12 slide-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Skilled Workers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet some of our top-rated professionals who consistently deliver 
            excellent service and build lasting relationships with clients.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-16 h-16 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-4">No Providers Currently</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be the first to join our platform! Register as a service provider and start connecting with clients in your area.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="btn-sunset px-8 py-3"
                onClick={() => window.location.href = '/auth'}
              >
                Register as Provider
              </Button>
              <Button 
                className="btn-glass px-8 py-3"
                onClick={() => window.location.href = '/browse'}
              >
                Explore Services
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {workers.map((worker, index) => (
                <div
                  key={worker.id}
                  className="glass-card p-6 hover:shadow-large transition-all duration-300 fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {/* Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="relative">
                      <img
                        src={worker.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`}
                        alt={worker.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                      />
                      {worker.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground">{worker.name}</h3>
                      <p className="text-primary font-medium">{worker.profession}</p>
                      <div className="flex items-center text-muted-foreground text-sm mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {worker.location}
                      </div>
                    </div>
                  </div>

                  {/* Rating and Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {renderStars(worker.rating || 5)}
                      </div>
                      <span className="text-sm font-medium text-foreground">{worker.rating || 'New'}</span>
                      <span className="text-sm text-muted-foreground">({worker.reviewCount})</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">N${worker.hourlyRate}/hr</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {worker.description}
                  </p>

                  {/* Specialties */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {worker.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/20 rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{worker.completedJobs}</p>
                      <p className="text-xs text-muted-foreground">Jobs Done</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">{worker.responseTime}</p>
                      <p className="text-xs text-muted-foreground">Response Time</p>
                    </div>
                  </div>

                  {/* Contact Options */}
                  <div className="space-y-3">
                     <div className="grid grid-cols-2 gap-2">
                      <Button 
                        className="btn-sunset"
                        onClick={() => window.location.href = `/booking?serviceId=${worker.id}`}
                      >
                        Book Service
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = `/request-quote?serviceId=${worker.id}`}
                      >
                        Request Quote
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground text-center">Or contact me using:</p>
                      <div className="flex justify-center">
                        <CommunicationButtons 
                          phoneNumber={worker.contactNumber}
                          whatsappNumber={worker.whatsappLink}
                          facebookUrl={worker.facebookLink}
                          className="justify-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                className="btn-glass px-8 py-3 text-lg"
                onClick={() => window.location.href = '/browse'}
              >
                View All Professionals
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedWorkers;