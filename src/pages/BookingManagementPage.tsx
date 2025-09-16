import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Calendar, 
  Clock, 
  User, 
  MessageSquare,
  ArrowLeft,
  Eye,
  DollarSign,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

interface BookingItem {
  id: string;
  client_id: string;
  labourer_id: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  message: string;
  created_at: string;
  client_profile?: {
    id: string;
    full_name: string;
    contact_number: string;
  };
  labourer_profile?: {
    id: string;
    full_name: string;
    contact_number: string;
  };
  services: {
    id: string;
    service_name: string;
    hourly_rate: number;
  };
}

interface QuoteRequestItem {
  id: string;
  client_id: string;
  labourer_id: string;
  service_id: string;
  project_description: string;
  budget: string;
  status: string;
  quote_amount: number | null;
  created_at: string;
  client_profile?: {
    id: string;
    full_name: string;
    contact_number: string;
  };
  labourer_profile?: {
    id: string;
    full_name: string;
    contact_number: string;
  };
  services: {
    id: string;
    service_name: string;
    hourly_rate: number;
  };
}

const BookingManagementPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadBookingsAndQuotes();
    }
  }, [profile]);

  const loadBookingsAndQuotes = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      
      // Load bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          client_profile:profiles!bookings_client_id_fkey(id, full_name, contact_number),
          labourer_profile:profiles!bookings_labourer_id_fkey(id, full_name, contact_number),
          services(id, service_name, hourly_rate)
        `)
        .or(`client_id.eq.${profile.id},labourer_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);

      // Load quote requests
      const { data: quotesData, error: quotesError } = await supabase
        .from('quote_requests')
        .select(`
          *,
          client_profile:profiles!quote_requests_client_id_fkey(id, full_name, contact_number),
          labourer_profile:profiles!quote_requests_labourer_id_fkey(id, full_name, contact_number),
          services(id, service_name, hourly_rate)
        `)
        .or(`client_id.eq.${profile.id},labourer_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (quotesError) throw quotesError;
      setQuoteRequests(quotesData || []);

    } catch (error) {
      console.error('Error loading bookings and quotes:', error);
      toast({
        title: "Error",
        description: "Could not load your bookings and quotes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      case 'quoted': return 'default';
      case 'accepted': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      case 'quoted': return <DollarSign className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">You need to be signed in to view bookings.</p>
          <Button onClick={() => navigate('/auth')} className="btn-sunset">
            Sign In
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/profile')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <h1 className="text-3xl font-bold">Manage Bookings & Quotes</h1>
            <p className="text-muted-foreground">Track your bookings and quote requests</p>
          </div>

          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bookings">Service Bookings</TabsTrigger>
              <TabsTrigger value="quotes">Quote Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      {profile?.user_type === 'labourer' 
                        ? "You haven't received any bookings yet."
                        : "You haven't made any bookings yet."
                      }
                    </p>
                    <Button onClick={() => navigate('/browse')} className="btn-sunset">
                      Browse Services
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {bookings.map((booking) => {
                    const isProvider = profile?.id === booking.labourer_id;
                    const otherParty = isProvider ? booking.client_profile : booking.labourer_profile;
                    
                    return (
                      <Card key={booking.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                {booking.services.service_name}
                              </CardTitle>
                              <CardDescription>
                                {isProvider ? 'Booking from' : 'Booked with'} {otherParty?.full_name}
                              </CardDescription>
                            </div>
                            <Badge variant={getStatusColor(booking.status)}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">{booking.status}</span>
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {new Date(booking.booking_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{booking.booking_time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">N${booking.services.hourly_rate}/hour</span>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-semibold text-sm mb-1">Project Details:</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {booking.message}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/bookings/${booking.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            {otherParty?.contact_number && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(`tel:${otherParty.contact_number}`)}
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Contact
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="quotes" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading quote requests...</div>
              ) : quoteRequests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Quote Requests</h3>
                    <p className="text-muted-foreground mb-4">
                      {profile?.user_type === 'labourer' 
                        ? "You haven't received any quote requests yet."
                        : "You haven't made any quote requests yet."
                      }
                    </p>
                    <Button onClick={() => navigate('/browse')} className="btn-sunset">
                      Browse Services
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {quoteRequests.map((quote) => {
                    const isProvider = profile?.id === quote.labourer_id;
                    const otherParty = isProvider ? quote.client_profile : quote.labourer_profile;
                    
                    return (
                      <Card key={quote.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                {quote.services.service_name}
                              </CardTitle>
                              <CardDescription>
                                {isProvider ? 'Quote request from' : 'Quote requested from'} {otherParty?.full_name}
                              </CardDescription>
                            </div>
                            <Badge variant={getStatusColor(quote.status)}>
                              {getStatusIcon(quote.status)}
                              <span className="ml-1 capitalize">{quote.status}</span>
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <h4 className="font-semibold text-sm mb-1">Project Description:</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {quote.project_description}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <span className="text-xs text-muted-foreground">Budget Range:</span>
                              <p className="text-sm">{quote.budget || 'Not specified'}</p>
                            </div>
                            {quote.quote_amount && (
                              <div>
                                <span className="text-xs text-muted-foreground">Quoted Amount:</span>
                                <p className="text-sm font-semibold text-primary">N${quote.quote_amount}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-xs text-muted-foreground">Requested:</span>
                              <p className="text-sm">
                                {new Date(quote.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/quote-requests/${quote.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            {otherParty?.contact_number && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(`tel:${otherParty.contact_number}`)}
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Contact
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingManagementPage;