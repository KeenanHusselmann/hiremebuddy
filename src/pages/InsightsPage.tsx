import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, Star, TrendingUp, Users, DollarSign, Clock, Target, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
}

interface EarningsData {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  averagePerBooking: number;
}

interface ClientStats {
  totalBookings: number;
  totalSpent: number;
  favoriteServices: { service_name: string; count: number }[];
  satisfactionScore: number;
}

const InsightsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchInsights();
    }
  }, [profile]);

  const fetchInsights = async () => {
    try {
      if (profile?.user_type === 'labourer' || profile?.user_type === 'both') {
        await Promise.all([
          fetchWorkerBookingStats(),
          fetchWorkerReviewStats(),
          fetchEarningsData()
        ]);
      }
      
      if (profile?.user_type === 'client' || profile?.user_type === 'both') {
        await fetchClientStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load insights data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkerBookingStats = async () => {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('status')
      .eq('labourer_id', profile?.id);

    if (error) throw error;

    const stats: BookingStats = {
      total: bookings?.length || 0,
      pending: bookings?.filter(b => b.status === 'pending').length || 0,
      confirmed: bookings?.filter(b => b.status === 'accepted').length || 0,
      completed: bookings?.filter(b => b.status === 'completed').length || 0,
      cancelled: bookings?.filter(b => b.status === 'cancelled' || b.status === 'rejected').length || 0,
    };

    setBookingStats(stats);
  };

  const fetchWorkerReviewStats = async () => {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewed_id', profile?.id);

    if (error) throw error;

    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const ratingDistribution: { [key: number]: number } = {};
    [1, 2, 3, 4, 5].forEach(rating => {
      ratingDistribution[rating] = reviews?.filter(r => r.rating === rating).length || 0;
    });

    setReviewStats({
      totalReviews,
      averageRating,
      ratingDistribution
    });
  };

  const fetchEarningsData = async () => {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        status,
        booking_date,
        services!inner(hourly_rate)
      `)
      .eq('labourer_id', profile?.id)
      .eq('status', 'completed');

    if (error) throw error;

    const totalEarnings = bookings?.reduce((sum, booking) => {
      return sum + (booking.services?.hourly_rate || 0);
    }, 0) || 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonth = bookings?.filter(booking => {
      const bookingDate = new Date(booking.booking_date);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    }).reduce((sum, booking) => sum + (booking.services?.hourly_rate || 0), 0) || 0;

    const lastMonth = bookings?.filter(booking => {
      const bookingDate = new Date(booking.booking_date);
      const lastMonthDate = new Date(currentYear, currentMonth - 1);
      return bookingDate.getMonth() === lastMonthDate.getMonth() && 
             bookingDate.getFullYear() === lastMonthDate.getFullYear();
    }).reduce((sum, booking) => sum + (booking.services?.hourly_rate || 0), 0) || 0;

    const averagePerBooking = bookings?.length > 0 ? totalEarnings / bookings.length : 0;

    setEarningsData({
      totalEarnings,
      thisMonth,
      lastMonth,
      averagePerBooking
    });
  };

  const fetchClientStats = async () => {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        status,
        services!inner(service_name, hourly_rate)
      `)
      .eq('client_id', profile?.id);

    if (error) throw error;

    const totalBookings = bookings?.length || 0;
    const totalSpent = bookings?.reduce((sum, booking) => {
      return sum + (booking.services?.hourly_rate || 0);
    }, 0) || 0;

    // Calculate favorite services
    const serviceCount: { [key: string]: number } = {};
    bookings?.forEach(booking => {
      const serviceName = booking.services?.service_name;
      if (serviceName) {
        serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
      }
    });

    const favoriteServices = Object.entries(serviceCount)
      .map(([service_name, count]) => ({ service_name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate satisfaction score based on completed bookings ratio
    const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
    const satisfactionScore = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

    setClientStats({
      totalBookings,
      totalSpent,
      favoriteServices,
      satisfactionScore
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NA', { 
      style: 'currency', 
      currency: 'NAD' 
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-responsive space-y-4 sm:space-y-6 pb-safe-bottom">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-responsive font-bold">Insights Dashboard</h1>
          <p className="text-responsive text-muted-foreground">
            Comprehensive analytics for your {profile?.user_type} account
          </p>
        </div>
      </div>

      <Tabs defaultValue={profile?.user_type === 'client' ? 'client' : 'worker'} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-1">
          {(profile?.user_type === 'labourer' || profile?.user_type === 'both') && (
            <TabsTrigger value="worker">Worker Analytics</TabsTrigger>
          )}
          {(profile?.user_type === 'client' || profile?.user_type === 'both') && (
            <TabsTrigger value="client">Client Analytics</TabsTrigger>
          )}
        </TabsList>

        {(profile?.user_type === 'labourer' || profile?.user_type === 'both') && (
          <TabsContent value="worker" className="space-y-4 sm:space-y-6">
            {/* Booking Statistics */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="card-mobile">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookingStats?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">All time bookings</p>
                </CardContent>
              </Card>

              <Card className="card-mobile">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reviewStats?.averageRating?.toFixed(1) || '0.0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {reviewStats?.totalReviews || 0} reviews
                  </p>
                </CardContent>
              </Card>

              <Card className="card-mobile">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(earningsData?.totalEarnings || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Avg: {formatCurrency(earningsData?.averagePerBooking || 0)}/booking
                  </p>
                </CardContent>
              </Card>

              <Card className="card-mobile">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(earningsData?.thisMonth || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    vs {formatCurrency(earningsData?.lastMonth || 0)} last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Booking Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Status Overview</CardTitle>
                <CardDescription>Distribution of your booking statuses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pending</span>
                      <Badge variant="outline">{bookingStats?.pending || 0}</Badge>
                    </div>
                    <Progress 
                      value={bookingStats?.total ? (bookingStats.pending / bookingStats.total) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Accepted</span>
                      <Badge variant="outline">{bookingStats?.confirmed || 0}</Badge>
                    </div>
                    <Progress 
                      value={bookingStats?.total ? (bookingStats.confirmed / bookingStats.total) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completed</span>
                      <Badge variant="outline">{bookingStats?.completed || 0}</Badge>
                    </div>
                    <Progress 
                      value={bookingStats?.total ? (bookingStats.completed / bookingStats.total) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cancelled</span>
                      <Badge variant="outline">{bookingStats?.cancelled || 0}</Badge>
                    </div>
                    <Progress 
                      value={bookingStats?.total ? (bookingStats.cancelled / bookingStats.total) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>How clients rate your services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 w-12">
                        <span className="text-sm">{rating}</span>
                        <Star className="h-3 w-3 fill-current text-yellow-400" />
                      </div>
                      <Progress 
                        value={reviewStats?.totalReviews ? 
                          (reviewStats.ratingDistribution[rating] / reviewStats.totalReviews) * 100 : 0
                        } 
                        className="flex-1 h-2"
                      />
                      <span className="text-sm text-muted-foreground w-8">
                        {reviewStats?.ratingDistribution[rating] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {(profile?.user_type === 'client' || profile?.user_type === 'both') && (
          <TabsContent value="client" className="space-y-4 sm:space-y-6">
            {/* Client Statistics */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="card-mobile">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clientStats?.totalBookings || 0}</div>
                  <p className="text-xs text-muted-foreground">Services booked</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(clientStats?.totalSpent || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">All time spending</p>
                </CardContent>
              </Card>

              <Card className="card-mobile">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {clientStats?.satisfactionScore?.toFixed(1) || '0.0'}%
                  </div>
                  <p className="text-xs text-muted-foreground">Completion rate</p>
                </CardContent>
              </Card>

              <Card className="card-mobile">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg per Booking</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      clientStats?.totalBookings ? 
                      (clientStats.totalSpent / clientStats.totalBookings) : 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Average spending</p>
                </CardContent>
              </Card>
            </div>

            {/* Favorite Services */}
              <Card className="card-mobile">
              <CardHeader>
                <CardTitle>Most Booked Services</CardTitle>
                <CardDescription>Your frequently used services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientStats?.favoriteServices?.map((service, index) => (
                    <div key={service.service_name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium">{service.service_name}</span>
                      </div>
                      <Badge variant="secondary">{service.count} bookings</Badge>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-8">
                      No booking history available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Satisfaction Meter */}
              <Card className="card-mobile">
              <CardHeader>
                <CardTitle>Satisfaction Meter</CardTitle>
                <CardDescription>Based on your booking completion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Satisfaction</span>
                    <span className="text-2xl font-bold">
                      {clientStats?.satisfactionScore?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                  <Progress 
                    value={clientStats?.satisfactionScore || 0} 
                    className="h-3"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Poor</span>
                    <span>Average</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default InsightsPage;