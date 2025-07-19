import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Shield,
  Eye,
  Edit,
  Trash2,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface PlatformStats {
  totalUsers: number;
  totalBookings: number;
  totalEarnings: number;
  activeServices: number;
  pendingBookings: number;
  completedBookings: number;
  recentUsers: any[];
  recentBookings: any[];
}

interface UserManagement {
  users: any[];
  totalCount: number;
}

const AdminDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [userManagement, setUserManagement] = useState<UserManagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserType, setSelectedUserType] = useState<string>('all');

  // Admin check - redirect if not admin
  if (!profile || profile.user_type !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchPlatformStats();
    fetchUserManagement();
  }, [selectedUserType]);

  const fetchPlatformStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

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

      // Get recent users (last 10)
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent bookings (last 10)
      const { data: recentBookings } = await supabase
        .from('bookings')
        .select(`
          *,
          services!inner(service_name),
          profiles!bookings_client_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setPlatformStats({
        totalUsers: totalUsers || 0,
        totalBookings: bookings?.length || 0,
        totalEarnings,
        activeServices: activeServices || 0,
        pendingBookings,
        completedBookings,
        recentUsers: recentUsers || [],
        recentBookings: recentBookings || []
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load platform statistics",
        variant: "destructive"
      });
    }
  };

  const fetchUserManagement = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedUserType !== 'all') {
        query = query.eq('user_type', selectedUserType as 'client' | 'labourer' | 'both' | 'admin');
      }

      const { data: users, error, count } = await query;

      if (error) throw error;

      setUserManagement({
        users: users || [],
        totalCount: count || 0
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserType = async (userId: string, newUserType: 'client' | 'labourer' | 'both' | 'admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: newUserType })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User type updated successfully",
      });

      fetchUserManagement();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user type",
        variant: "destructive"
      });
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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Complete system overview and management for HireMeBra
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="bookings">Booking Management</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats?.totalBookings || 0}</div>
                <p className="text-xs text-muted-foreground">All time bookings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(platformStats?.totalEarnings || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total transaction value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats?.activeServices || 0}</div>
                <p className="text-xs text-muted-foreground">Published services</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platformStats?.recentUsers?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{user.user_type}</p>
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
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest booking activity</CardDescription>
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
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage all platform users</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="userType">Filter by type:</Label>
                  <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="client">Clients</SelectItem>
                      <SelectItem value="labourer">Workers</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userManagement?.users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.user_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.contact_number || 'N/A'}</TableCell>
                      <TableCell>{user.location_text}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={user.user_type}
                            onValueChange={(value) => updateUserType(user.id, value as 'client' | 'labourer' | 'both' | 'admin')}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="client">Client</SelectItem>
                              <SelectItem value="labourer">Worker</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
              <CardDescription>Monitor and manage all platform bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Pending Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{platformStats?.pendingBookings || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Completed Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{platformStats?.completedBookings || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {platformStats?.totalBookings ? 
                        ((platformStats.completedBookings / platformStats.totalBookings) * 100).toFixed(1) : 0}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platformStats?.recentBookings?.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.services?.service_name}</TableCell>
                      <TableCell>{booking.profiles?.full_name}</TableCell>
                      <TableCell>{new Date(booking.booking_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>{new Date(booking.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure platform-wide settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input id="platformName" defaultValue="HireMeBra" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input id="commissionRate" type="number" defaultValue="15" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBookings">Max Bookings Per Day</Label>
                  <Input id="maxBookings" type="number" defaultValue="50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <Select defaultValue="false">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Disabled</SelectItem>
                      <SelectItem value="true">Enabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full md:w-auto">
                <Settings className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;