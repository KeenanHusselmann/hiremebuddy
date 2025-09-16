import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Search,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter
} from 'lucide-react';

interface UserManagement {
  users: any[];
  totalCount: number;
}

const AdminUsers: React.FC = () => {
  const { toast } = useToast();
  const [userManagement, setUserManagement] = useState<UserManagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserType, setSelectedUserType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');

  useEffect(() => {
    fetchUserManagement();
    
    // Set up real-time subscription for profile changes
    const channel = supabase
      .channel('admin-profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Real-time profile update received:', payload);
          // Update the specific user in the state
          setUserManagement(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              users: prev.users.map(user => 
                user.id === payload.new.id 
                  ? { ...user, ...payload.new }
                  : user
              )
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUserType, verificationFilter]);

  const fetchUserManagement = async () => {
    console.log('Fetching user management data...');
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedUserType !== 'all') {
        query = query.eq('user_type', selectedUserType as 'client' | 'labourer' | 'both' | 'admin');
      }

      if (verificationFilter === 'verified') {
        query = query.eq('is_verified', true);
      } else if (verificationFilter === 'unverified') {
        query = query.eq('is_verified', false);
      }

      const { data: users, error, count } = await query;
      
      console.log('Fetched users data:', users?.length, 'users');

      if (error) throw error;

      setUserManagement({
        users: users || [],
        totalCount: count || 0
      });
    } catch (error) {
      console.error('Error fetching user management:', error);
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

  const handleVerifyProvider = async (userId: string, isVerified: boolean) => {
    console.log('Starting verification update for user:', userId, 'isVerified:', isVerified);
    
    try {
      // First, update the local state immediately for better UX
      setUserManagement(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.map(user => 
            user.id === userId 
              ? { ...user, is_verified: isVerified }
              : user
          )
        };
      });

      const { data, error } = await supabase
        .from('profiles')
        .update({ is_verified: isVerified })
        .eq('id', userId)
        .select();

      console.log('Database update result:', { data, error });

      if (error) throw error;

      // Send notification to the provider
      if (isVerified) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'profile_verified',
            message: 'Congratulations! Your profile has been verified. You can now offer your services.',
            category: 'system',
            target_url: '/profile'
          });

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        }
      }

      toast({
        title: "Success",
        description: `Provider ${isVerified ? 'verified' : 'rejected'} successfully`,
      });

      // Refresh data from server to ensure consistency
      console.log('Refreshing user management data...');
      await fetchUserManagement();
      
    } catch (error: any) {
      console.error('Error updating verification status:', error);
      
      // Revert the optimistic update on error
      setUserManagement(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.map(user => 
            user.id === userId 
              ? { ...user, is_verified: !isVerified } // Revert
              : user
          )
        };
      });
      
      toast({
        title: "Error",
        description: `Failed to update verification status: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const filteredUsers = userManagement?.users?.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.contact_number?.includes(searchTerm) ||
    (typeof user.location_text === 'string' && user.location_text.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

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
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8" />
          User Management
        </h1>
        <p className="text-muted-foreground">
          Manage all platform users and their permissions
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, phone, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">User Type</Label>
              <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="labourer">Workers</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification">Verification Status</Label>
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={fetchUserManagement} className="w-full">
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              {searchTerm || selectedUserType !== 'all' || verificationFilter !== 'all' 
                ? 'Filtered results' 
                : 'Total platform users'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Providers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredUsers.filter(u => 
                (u.user_type === 'labourer' || u.user_type === 'both') && u.is_verified
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Approved workers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredUsers.filter(u => 
                (u.user_type === 'labourer' || u.user_type === 'both') && !u.is_verified
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage user types and verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.user_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.contact_number || 'N/A'}</TableCell>
                    <TableCell className="max-w-32 truncate">
                      {typeof user.location_text === 'string' ? user.location_text : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {(user.user_type === 'labourer' || user.user_type === 'both') ? (
                        user.is_verified ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {/* User Type Selector */}
                        <Select
                          value={user.user_type}
                          onValueChange={(value) => updateUserType(user.id, value as 'client' | 'labourer' | 'both' | 'admin')}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="labourer">Worker</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Verification Actions */}
                        {(user.user_type === 'labourer' || user.user_type === 'both') && (
                          <div className="flex space-x-1">
                            {!user.is_verified ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerifyProvider(user.id, true)}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verify
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerifyProvider(user.id, false)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Revoke
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;