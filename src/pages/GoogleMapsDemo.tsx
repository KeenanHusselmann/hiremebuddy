import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import RealTimeGoogleMap from '@/components/maps/RealTimeGoogleMap';
import LiveLocationTracker from '@/components/maps/LiveLocationTracker';
import GoogleMapsSearch from '@/components/maps/GoogleMapsSearch';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Activity,
  Zap,
  Users,
  Clock,
  Smartphone
} from 'lucide-react';

interface ServiceProvider {
  id: string;
  full_name: string;
  contact_number: string;
  town: string;
  latitude: number;
  longitude: number;
  bio: string;
  is_verified: boolean;
  avatar_url: string;
  is_active: boolean;
  services: {
    id: string;
    service_name: string;
    description: string;
    hourly_rate: number;
    category: {
      name: string;
    };
  }[];
  presence?: {
    status: 'online' | 'busy' | 'offline';
    last_seen: string;
    is_available: boolean;
  };
}

const GoogleMapsDemo: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const { toast } = useToast();

  const handleProviderSelect = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    toast({
      title: "Provider Selected",
      description: `You selected ${provider.full_name}`,
    });
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    toast({
      title: "Location Selected",
      description: location.address,
    });
  };

  const handleLocationUpdate = (location: any) => {
    console.log('Location updated:', location);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Google Maps Real-Time Features</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Experience live location tracking, real-time service provider maps, and advanced search capabilities 
          powered by Google Maps API and Supabase real-time updates.
        </p>
        
        <div className="flex justify-center gap-4 flex-wrap">
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            Real-time Updates
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <MapPin className="h-3 w-3" />
            Live Location Tracking
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Search className="h-3 w-3" />
            Advanced Search
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            Service Provider Network
          </Badge>
        </div>
      </div>

      {/* Feature Showcase */}
      <Tabs defaultValue="real-time-map" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="real-time-map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Real-Time Map
          </TabsTrigger>
          <TabsTrigger value="location-tracker" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Location Tracker
          </TabsTrigger>
          <TabsTrigger value="search-places" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search & Places
          </TabsTrigger>
        </TabsList>

        {/* Real-Time Service Provider Map */}
        <TabsContent value="real-time-map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Live Service Provider Map
                <Badge variant="default" className="ml-auto">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                  Live Updates
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-semibold">Real-Time Presence</div>
                      <div className="text-sm text-muted-foreground">Live status updates</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-semibold">Auto Refresh</div>
                      <div className="text-sm text-muted-foreground">Every 30 seconds</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-orange-500" />
                    <div>
                      <div className="font-semibold">Smart Routing</div>
                      <div className="text-sm text-muted-foreground">Optimal directions</div>
                    </div>
                  </div>
                </Card>
              </div>

              <RealTimeGoogleMap
                onProviderSelect={handleProviderSelect}
                showUserLocation={true}
                autoRefresh={true}
                refreshInterval={30000}
                className="w-full h-[600px]"
              />

              {selectedProvider && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Selected Service Provider</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedProvider.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{selectedProvider.full_name}</div>
                        <div className="text-sm text-muted-foreground">{selectedProvider.town}</div>
                      </div>
                      {selectedProvider.presence && (
                        <Badge variant={selectedProvider.presence.status === 'online' ? 'default' : 'secondary'}>
                          {selectedProvider.presence.status}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Location Tracker */}
        <TabsContent value="location-tracker" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Location Tracker
                <Badge variant="secondary" className="ml-auto">
                  <Smartphone className="h-3 w-3 mr-1" />
                  GPS Powered
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-3 text-center">
                  <div className="text-2xl font-bold text-blue-500">Real-Time</div>
                  <div className="text-sm text-muted-foreground">Location Updates</div>
                </Card>
                <Card className="p-3 text-center">
                  <div className="text-2xl font-bold text-green-500">High</div>
                  <div className="text-sm text-muted-foreground">Accuracy GPS</div>
                </Card>
                <Card className="p-3 text-center">
                  <div className="text-2xl font-bold text-orange-500">Auto</div>
                  <div className="text-sm text-muted-foreground">Database Sync</div>
                </Card>
                <Card className="p-3 text-center">
                  <div className="text-2xl font-bold text-purple-500">Live</div>
                  <div className="text-sm text-muted-foreground">Path Tracking</div>
                </Card>
              </div>

              <LiveLocationTracker
                enableTracking={trackingEnabled}
                updateInterval={30000}
                showMap={true}
                onLocationUpdate={handleLocationUpdate}
                className="w-full h-96"
              />

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Features Included:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Real-time GPS location tracking with high accuracy</li>
                  <li>• Automatic database synchronization with Supabase</li>
                  <li>• Live path visualization and movement history</li>
                  <li>• Online/offline status monitoring</li>
                  <li>• Speed and direction tracking</li>
                  <li>• Accuracy indicators and reliability metrics</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Maps Search */}
        <TabsContent value="search-places" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Advanced Search & Places
                <Badge variant="outline" className="ml-auto">
                  Google Places API
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-3 text-center">
                  <Search className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="font-semibold">Smart Search</div>
                  <div className="text-xs text-muted-foreground">Autocomplete</div>
                </Card>
                <Card className="p-3 text-center">
                  <MapPin className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="font-semibold">Nearby Places</div>
                  <div className="text-xs text-muted-foreground">Categories</div>
                </Card>
                <Card className="p-3 text-center">
                  <Navigation className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="font-semibold">Directions</div>
                  <div className="text-xs text-muted-foreground">Route Planning</div>
                </Card>
                <Card className="p-3 text-center">
                  <Activity className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="font-semibold">Live Data</div>
                  <div className="text-xs text-muted-foreground">Real-time Info</div>
                </Card>
              </div>

              <GoogleMapsSearch
                onLocationSelect={handleLocationSelect}
                showNearbySearch={true}
                mapHeight="h-96"
                placeholder="Search for places in Namibia..."
              />

              {selectedLocation && (
                <Card className="bg-green-50 border-green-200 mt-4">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Selected Location</h3>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium">
                          {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                        </div>
                        <div className="text-sm text-muted-foreground">{selectedLocation.address}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Search Capabilities:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Intelligent autocomplete with Google Places API</li>
                  <li>• Category-based nearby search (restaurants, hospitals, etc.)</li>
                  <li>• Real-time place information including ratings and hours</li>
                  <li>• Integrated directions and route planning</li>
                  <li>• Location restrictions for Namibia-focused results</li>
                  <li>• Interactive map with custom markers and info windows</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Google Maps Integration Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">Real-Time Updates</h4>
              <ul className="text-sm space-y-1">
                <li>• Live service provider locations</li>
                <li>• Real-time presence status</li>
                <li>• Automatic data synchronization</li>
                <li>• WebSocket-based updates</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Location Services</h4>
              <ul className="text-sm space-y-1">
                <li>• High-accuracy GPS tracking</li>
                <li>• Geofencing capabilities</li>
                <li>• Route optimization</li>
                <li>• Distance calculations</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-600">Advanced Features</h4>
              <ul className="text-sm space-y-1">
                <li>• Places API integration</li>
                <li>• Custom map styling</li>
                <li>• Interactive markers</li>
                <li>• Responsive design</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleMapsDemo;