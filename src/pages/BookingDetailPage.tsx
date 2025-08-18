import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  MessageSquare, 
  Phone, 
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ChatInterface } from '@/components/ChatInterface';
import { useUserPresence } from '@/hooks/useUserPresence';
import { BackButton } from '@/hooks/useBackNavigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ServiceRating } from '@/components/ServiceRating';
import { useServiceRating, formatRating, renderStars } from '@/hooks/useServiceRatings';

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  message?: string;
  client_id: string;
  labourer_id: string;
  service_id: string;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  contact_number?: string;
  whatsapp_link?: string;
  location_text?: string;
}

const BookingDetailPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { profile: currentProfile } = useAuth();
  const { getUserStatus, isUserAvailable } = useUserPresence();
  const { toast } = useToast();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [clientProfile, setClientProfile] = useState<Profile | null>(null);
  const [labourerProfile, setLabourerProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Determine if current user is client or labourer
  const isClient = currentProfile?.id === booking?.client_id;
  const otherProfile = isClient ? labourerProfile : clientProfile;
  const otherUserId = isClient ? booking?.labourer_id : booking?.client_id;

  // Get real-time rating data for service provider
  const { rating: serviceRating, loading: ratingLoading } = useServiceRating(
    (isClient && booking?.service_id) ? booking.service_id : ''
  );

  useEffect(() => {
    if (!bookingId) return;

    fetchBookingDetails();
    
    // Subscribe to real-time booking updates
    const channel = supabase
      .channel(`booking-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${bookingId}`
        },
        (payload) => {
          const updatedBooking = payload.new as any;
          setBooking(updatedBooking);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    if (!bookingId) return;

    try {
      // Fetch booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingError) {
        console.error('Error fetching booking:', bookingError);
        return;
      }

      setBooking(bookingData);

      // Fetch client and labourer profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, contact_number, whatsapp_link, location_text')
        .in('id', [bookingData.client_id, bookingData.labourer_id]);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      const client = profilesData?.find(p => p.id === bookingData.client_id);
      const labourer = profilesData?.find(p => p.id === bookingData.labourer_id);
      
      setClientProfile(client || null);
      setLabourerProfile(labourer || null);

    } catch (error) {
      console.error('Error in fetchBookingDetails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (newStatus: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled') => {
    if (!booking) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', booking.id);

      if (error) {
        console.error('Error updating booking status:', error);
        toast({
          title: "Error",
          description: "Failed to update booking status. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update local state immediately
      setBooking(prev => prev ? { ...prev, status: newStatus as any } : null);

      // Show success message
      const statusMessages = {
        accepted: "Booking accepted successfully! The client has been notified.",
        rejected: "Booking declined. The client has been notified.",
        completed: "Booking marked as completed!",
        cancelled: "Booking cancelled successfully."
      };

      toast({
        title: "Success",
        description: statusMessages[newStatus as keyof typeof statusMessages] || "Booking status updated successfully!",
      });

    } catch (error) {
      console.error('Error in updateBookingStatus:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
              <Button onClick={() => navigate('/bookings')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bookings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton fallbackPath="/bookings" />
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Booking Details</h1>
              <p className="text-muted-foreground">
                Booking #{booking.id.slice(0, 8)}
              </p>
            </div>
            
            <Badge 
              className={`${getStatusColor(booking.status)} text-white`}
            >
              {getStatusIcon(booking.status)}
              <span className="ml-1 capitalize">{booking.status.replace('_', ' ')}</span>
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Booking Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">{booking.booking_time}</p>
                    </div>
                  </div>
                </div>

                {booking.message && (
                  <div>
                    <p className="font-medium mb-2">Message</p>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {booking.message.split(/[,:;]/).map((item, index) => {
                        const trimmedItem = item.trim();
                        if (!trimmedItem) return null;
                        return (
                          <div key={index} className="mb-1 last:mb-0">
                            • {trimmedItem}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Created {format(new Date(booking.created_at), 'MMM d, yyyy')}
                  </p>
                  {booking.updated_at !== booking.created_at && (
                    <p className="text-sm text-muted-foreground">
                      Updated {format(new Date(booking.updated_at), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {(booking.status === 'pending' || booking.status === 'accepted') && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {isClient && booking.status === 'pending' && (
                      <Button 
                        variant="destructive"
                        onClick={() => updateBookingStatus('cancelled')}
                        disabled={isUpdating}
                      >
                        Cancel Booking
                      </Button>
                    )}
                    
                    {!isClient && booking.status === 'pending' && (
                      <>
                        <Button 
                          onClick={() => updateBookingStatus('accepted')}
                          disabled={isUpdating}
                        >
                          Accept Booking
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => updateBookingStatus('rejected')}
                          disabled={isUpdating}
                        >
                          Decline Booking
                        </Button>
                      </>
                    )}
                    
                    {booking.status === 'accepted' && (
                      <Button 
                        onClick={() => updateBookingStatus('completed')}
                        disabled={isUpdating}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contact Information & Chat */}
          <div className="space-y-6">
            {otherProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {isClient ? 'Service Provider' : 'Client'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {otherProfile.avatar_url ? (
                        <img 
                          src={otherProfile.avatar_url} 
                          alt={otherProfile.full_name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                        getUserStatus(otherUserId!) === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    <div>
                      <p className="font-medium">{otherProfile.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {getUserStatus(otherUserId!) === 'online' ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>

                  {otherProfile.contact_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{otherProfile.contact_number}</p>
                    </div>
                  )}

                  {otherProfile.location_text && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{otherProfile.location_text}</p>
                    </div>
                  )}

                  {/* Real-time Rating - only show for service providers */}
                  {isClient && !ratingLoading && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        {renderStars(serviceRating.averageRating, 'sm')}
                        <span className="text-sm font-medium">
                          {formatRating(serviceRating.averageRating, serviceRating.reviewCount)}
                        </span>
                        {serviceRating.reviewCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({serviceRating.reviewCount} reviews)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Service Rating - Only show for clients after completion */}
            {booking.status === 'completed' && isClient && otherUserId && otherProfile && (
              <ServiceRating
                bookingId={booking.id}
                serviceProviderId={otherUserId}
                serviceProviderName={otherProfile.full_name}
              />
            )}

            {/* Real-time Chat */}
            {otherUserId && otherProfile && (
              <ChatInterface
                bookingId={booking.id}
                receiverId={otherUserId}
                receiverName={otherProfile.full_name}
                receiverAvatar={otherProfile.avatar_url}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingDetailPage;