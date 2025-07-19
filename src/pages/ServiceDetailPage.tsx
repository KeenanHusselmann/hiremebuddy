import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, Phone, MessageCircle, Calendar, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CommunicationButtons } from '@/components/CommunicationButtons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ContactServiceProvider } from '@/components/ContactServiceProvider';
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

  // Mock service data - in real app, this would come from API
  const service = {
    id: serviceId,
    title: 'Professional Plumbing Services',
    provider: 'Johannes Mwandingi',
    description: 'Expert plumber with 10+ years experience in residential and commercial plumbing. Specializing in pipe repairs, installations, emergency fixes, and complete bathroom renovations. Available for urgent repairs 24/7.',
    price: 'N$300/hour',
    rating: 4.8,
    reviewCount: 24,
    location: 'Windhoek, Khomas',
    category: category || 'plumbing',
    availability: 'Available',
    tags: ['emergency-service', 'licensed', 'insured', '24/7'],
    contact: {
      phone: '+264 81 123 4567',
      whatsapp: '+264 81 123 4567',
      facebook: 'https://facebook.com/johannes.plumber.namibia'
    },
    portfolio: [
      'Bathroom renovation - Klein Windhoek residence',
      'Commercial kitchen plumbing - Eros office complex',
      'Emergency pipe burst repair - Pioneers Park',
      'New home plumbing installation - Ludwigsdorf'
    ],
    reviews: [
      {
        id: 1,
        client: 'Sarah Williams',
        rating: 5,
        comment: 'Excellent work! Johannes fixed our kitchen leak quickly and professionally. Highly recommended.',
        date: '2 weeks ago'
      },
      {
        id: 2,
        client: 'Michael Jones',
        rating: 5,
        comment: 'Great service, fair pricing, and very reliable. Will definitely use again.',
        date: '1 month ago'
      },
      {
        id: 3,
        client: 'Lisa Smith',
        rating: 4,
        comment: 'Good quality work, arrived on time. Very professional approach.',
        date: '2 months ago'
      }
    ]
  };

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

      // Get real service from database
      const { data: realService, error: serviceError } = await supabase
        .from('services')
        .select(`
          *,
          profiles!services_labourer_id_fkey (
            id,
            full_name,
            contact_number,
            whatsapp_link
          )
        `)
        .eq('id', serviceId)
        .single();
      
      if (serviceError || !realService) {
        toast({
          title: "Service not found",
          description: "Unable to find this service",
          variant: "destructive"
        });
        return;
      }

      // Navigate to booking with real service data
      navigate('/booking', { 
        state: { 
          service: realService,
          serviceId: realService.id,
          labourerId: realService.labourer_id,
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

  const handleContact = (method: 'phone' | 'whatsapp') => {
    if (method === 'phone') {
      window.location.href = `tel:${service.contact.phone}`;
    } else {
      window.location.href = `https://wa.me/${service.contact.whatsapp.replace(/[^\d]/g, '')}`;
    }
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
                    variant={service.availability === 'Available' ? 'default' : 'secondary'}
                    className="text-sm"
                  >
                    {service.availability}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-semibold">{service.rating}</span>
                    <span className="text-muted-foreground">({service.reviewCount} reviews)</span>
                  </div>
                </div>

                <CardTitle className="text-3xl mb-2">{service.title}</CardTitle>
                <CardDescription className="text-xl text-primary font-semibold">
                  {service.provider}
                </CardDescription>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{service.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-primary">{service.price}</span>
                  </div>
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
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {service.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Work</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {service.portfolio.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {service.reviews.map((review) => (
                    <div key={review.id}>
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {review.client.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{review.client}</span>
                            <div className="flex">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      </div>
                      {review.id !== service.reviews[service.reviews.length - 1].id && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle>Book This Service</CardTitle>
                <CardDescription>
                  Connect with {service.provider} for your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{service.price}</p>
                  <p className="text-sm text-muted-foreground">Starting rate</p>
                </div>

                <Button 
                  onClick={handleBookService}
                  className="w-full btn-sunset"
                  size="lg"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Button>

                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-3">Contact Provider</h4>
                  <CommunicationButtons
                    phoneNumber={service.contact.phone}
                    whatsappNumber={service.contact.whatsapp}
                    facebookUrl={service.contact.facebook}
                    className="justify-center"
                  />
                </div>

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
                      {service.provider.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{service.provider}</p>
                    <p className="text-sm text-muted-foreground">Professional {service.category}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience:</span>
                    <span>10+ years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jobs completed:</span>
                    <span>150+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response time:</span>
                    <span>Within 2 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <ContactServiceProvider
              workerName={service.provider}
              workerEmail="johannes.plumber@email.com"
              workerPhone={service.contact.phone}
              serviceName={service.title}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceDetailPage;