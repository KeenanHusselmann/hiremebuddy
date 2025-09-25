import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationTest } from '@/components/NotificationTest';
import NotificationQueueTest from '@/components/NotificationQueueTest';
import DatabaseTest from '@/components/DatabaseTest';
import { 
  Shield,
  Activity,
  Bell
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();

  // Admin check - redirect if not admin
  if (!profile || profile.user_type !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-2 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Complete system overview and management for HireMeBuddy
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 gap-0.5 h-auto p-1">
            <TabsTrigger value="overview" className="text-[10px] sm:text-sm px-1 sm:px-3 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">📊</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="text-[10px] sm:text-sm px-1 sm:px-3 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <span className="hidden sm:inline">Users</span>
              <span className="sm:hidden">👥</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="text-[10px] sm:text-sm px-1 sm:px-3 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <span className="hidden sm:inline">Bookings</span>
              <span className="sm:hidden">📅</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-[10px] sm:text-sm px-1 sm:px-3 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">🔔</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-[10px] sm:text-sm px-1 sm:px-3 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">⚙️</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Overview</CardTitle>
                <CardDescription>Platform analytics and key metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Dashboard statistics will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">User management functionality will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>Monitor and manage all platform bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Booking management functionality will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <CardTitle>Database Connection Test</CardTitle>
                  </div>
                  <CardDescription>
                    Test database connection and anonymous device token functionality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DatabaseTest />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle>Notification Queue Test</CardTitle>
                  </div>
                  <CardDescription>
                    Test the notification queue system that bridges in-app notifications with push notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotificationQueueTest />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle>Push Notification Testing</CardTitle>
                  </div>
                  <CardDescription>
                    Test the real-time push notification system for anonymous and logged-in users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotificationTest />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification System Status</CardTitle>
                  <CardDescription>
                    Overview of the notification infrastructure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Anonymous Device Tokens</h4>
                        <p className="text-xs text-muted-foreground">
                          Devices registered for notifications without user login
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">User Device Tokens</h4>
                        <p className="text-xs text-muted-foreground">
                          Devices registered for logged-in users
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Notifications are triggered by database events (new bookings, messages, services)</p>
                      <p>• Anonymous devices can receive location-based and category-based notifications</p>
                      <p>• Background service worker handles notifications when app is closed</p>
                      <p>• Firebase Cloud Messaging powers the delivery system</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure platform-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">System settings will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;