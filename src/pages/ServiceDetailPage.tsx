import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, Calendar, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CommunicationButtons } from '@/components/CommunicationButtons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ServiceDetailPage = () => {
  const { category, serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState('');
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (serviceId) {
      fetchServiceData();
    }
  }, [serviceId]);

  const fetchServiceData = async () => {
    try {
      // Fetch service data with provider info
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select(`
          *,
          provider:profiles!services_labourer_id_fkey (
            id,
            full_name,
            contact_number,
            whatsapp_link,
            facebook_link,
            town,
            bio
          ),
          category:service_categories (
            name
          )
        `)
        .eq('id', serviceId)
        .single();

      if (serviceError) throw serviceError;

      // Fetch reviews for this service's provider
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey (
            full_name
          )
        `)
        .eq('reviewed_id', serviceData.labourer_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (reviewsError) throw reviewsError;

      setService(serviceData);
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching service data:', error);
      toast({
        title: "Error",
        description: "Failed to load service details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading service details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested service doesn't exist.</p>
          <Button onClick={() => navigate('/browse')}>Browse All Services</Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const handleBookService = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to book services",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    try {
      // Get user profile
      const { data: clientProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !clientProfile) {
        toast({
          title: "Profile not found",
          description: "Please complete your profile first",
          variant: "destructive"
        });
        navigate('/profile');
        return;
      }

      // Navigate to booking with service data
      navigate('/booking', { 
        state: { 
          service: service,
          serviceId: service.id,
          labourerId: service.labourer_id,
          clientId: clientProfile.id
        } 
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRequestQuote = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to request quotes",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Navigate to quote request page with service data
    navigate('/request-quote', { 
      state: { 
        service,
        serviceId: service.id,
        labourerId: service.labourer_id
      } 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <Badge 
                    variant={service.is_active ? 'default' : 'secondary'}
                    className="text-sm"
                  >
                    {service.is_active ? 'Available' : 'Unavailable'}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({reviews.length} reviews)</span>
                  </div>
                </div>

                <CardTitle className="text-3xl mb-2">{service.service_name}</CardTitle>
                <CardDescription className="text-xl text-primary font-semibold">
                  {service.provider?.full_name}
                </CardDescription>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{service.provider?.town || 'Location not specified'}</span>
                  </div>
                  {service.hourly_rate && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-primary">N${service.hourly_rate}/hour</span>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                
                {service.category && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline">
                      {service.category.name}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Portfolio */}
            {service.portfolio_images && service.portfolio_images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {service.portfolio_images.map((image: string, index: number) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={image} 
                          alt={`Portfolio item ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id}>
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {review.reviewer?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{review.reviewer?.full_name || 'Anonymous'}</span>
                              <div className="flex">
                                {Array.from({ length: review.rating }).map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                          </div>
                        </div>
                        {review.id !== reviews[reviews.length - 1].id && (
                          <Separator className="mt-6" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle>Book This Service</CardTitle>
                <CardDescription>
                  Connect with {service.provider?.full_name} for your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {service.hourly_rate && (
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <p className="text-2xl font-bold text-primary">N${service.hourly_rate}/hour</p>
                    <p className="text-sm text-muted-foreground">Starting rate</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={handleBookService}
                    className="btn-sunset"
                    size="lg"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                  <Button 
                    onClick={handleRequestQuote}
                    variant="outline"
                    size="lg"
                  >
                    Request Quote
                  </Button>
                </div>

                {(service.provider?.contact_number || service.provider?.whatsapp_link || service.provider?.facebook_link) && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-3">Contact Provider</h4>
                    <CommunicationButtons
                      phoneNumber={service.provider?.contact_number}
                      whatsappNumber={service.provider?.whatsapp_link}
                      facebookUrl={service.provider?.facebook_link}
                      className="justify-center"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure booking with HireMeBuddy protection</span>
                </div>
              </CardContent>
            </Card>

            {/* Provider Info */}
            <Card>
              <CardHeader>
                <CardTitle>About the Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-lg">
                      {service.provider?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{service.provider?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {service.category?.name || 'Service Provider'}
                    </p>
                  </div>
                </div>

                {service.provider?.bio && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {service.provider.bio}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{service.provider?.town || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reviews:</span>
                    <span>{reviews.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Rating:</span>
                    <span>{averageRating.toFixed(1)}/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceDetailPage;