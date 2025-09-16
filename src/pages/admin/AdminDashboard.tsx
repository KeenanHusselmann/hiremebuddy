import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  BookOpen
} from 'lucide-react';

interface PlatformStats {
  totalUsers: number;
  totalBookings: number;
  totalEarnings: number;
  activeServices: number;
  pendingBookings: number;
  completedBookings: number;
  recentUsers: any[];
  recentBookings: any[];
  verifiedProviders: number;
  unverifiedProviders: number;
}

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get verified/unverified providers
      const { count: verifiedProviders } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('user_type', ['labourer', 'both'])
        .eq('is_verified', true);

      const { count: unverifiedProviders } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('user_type', ['labourer', 'both'])
        .eq('is_verified', false);

      // Get total bookings and earnings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          services!inner(hourly_rate)
        `);

      if (bookingsError) throw bookingsError;

      const totalEarnings = bookings?.reduce((sum, booking) => {
        return sum + (booking.services?.hourly_rate || 0);
      }, 0) || 0;

      // Get active services count
      const { count: activeServices } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get booking status counts
      const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
      const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;

      // Get recent users (last 5)
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent bookings (last 5)
      const { data: recentBookings } = await supabase
        .from('bookings')
        .select(`
          *,
          services!inner(service_name),
          profiles!bookings_client_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setPlatformStats({
        totalUsers: totalUsers || 0,
        totalBookings: bookings?.length || 0,
        totalEarnings,
        activeServices: activeServices || 0,
        pendingBookings,
        completedBookings,
        recentUsers: recentUsers || [],
        recentBookings: recentBookings || [],
        verifiedProviders: verifiedProviders || 0,
        unverifiedProviders: unverifiedProviders || 0
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load platform statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NA', { 
      style: 'currency', 
      currency: 'NAD' 
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'cancelled':
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><AlertTriangle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Complete platform analytics and key metrics
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {platformStats?.pendingBookings || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(platformStats?.totalEarnings || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Platform transaction value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats?.activeServices || 0}</div>
            <p className="text-xs text-muted-foreground">
              Published services
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Provider Verification Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Providers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {platformStats?.verifiedProviders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Approved service providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {platformStats?.unverifiedProviders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Recent User Registrations
            </CardTitle>
            <CardDescription>Latest users who joined the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformStats?.recentUsers?.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {user.user_type}
                      </Badge>
                      {(user.user_type === 'labourer' || user.user_type === 'both') && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            user.is_verified 
                              ? 'text-green-600 border-green-600' 
                              : 'text-yellow-600 border-yellow-600'
                          }`}
                        >
                          {user.is_verified ? 'Verified' : 'Pending'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-4">No recent users</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recent Booking Activity
            </CardTitle>
            <CardDescription>Latest bookings on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformStats?.recentBookings?.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{booking.services?.service_name}</p>
                    <p className="text-sm text-muted-foreground">
                      by {booking.profiles?.full_name}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(booking.status)}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-4">No recent bookings</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;