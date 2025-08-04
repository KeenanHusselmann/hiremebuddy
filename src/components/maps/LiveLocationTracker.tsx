/// <reference types="@types/google.maps" />
import React, { useEffect, useState, useRef } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Activity, 
  Clock, 
  AlertCircle,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC0qcSxvBv534pnfD5YvNimZlw8RbzTBCI';
const WINDHOEK_CENTER = { lat: -22.5609, lng: 17.0658 };

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  speed?: number;
  heading?: number;
}

interface LiveLocationTrackerProps {
  enableTracking?: boolean;
  updateInterval?: number;
  className?: string;
  showMap?: boolean;
  onLocationUpdate?: (location: LocationData) => void;
}

const TrackerComponent: React.FC<LiveLocationTrackerProps> = ({
  enableTracking = false,
  updateInterval = 30000, // 30 seconds
  className = "w-full h-96",
  showMap = true,
  onLocationUpdate
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(enableTracking);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [path, setPath] = useState<google.maps.Polyline | null>(null);
  const [accuracy, setAccuracy] = useState<google.maps.Circle | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map && showMap) {
      const googleMap = new google.maps.Map(mapRef.current, {
        center: WINDHOEK_CENTER,
        zoom: 15,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true
      });
      setMap(googleMap);
    }
  }, [mapRef, map, showMap]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update user presence and location in database
  const updateLocationInDatabase = async (location: LocationData) => {
    if (!user) return;

    try {
      // Update user location in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          latitude: location.latitude,
          longitude: location.longitude,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update user presence
      const { error: presenceError } = await supabase
        .rpc('update_user_presence', { status_param: 'online' });

      if (presenceError) throw presenceError;

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error updating location in database:', error);
      if (isOnline) {
        toast({
          title: "Location sync failed",
          description: "Could not update your location. Will retry automatically.",
          variant: "destructive",
        });
      }
    }
  };

  // Get current location
  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined
          };
          resolve(locationData);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        }
      );
    });
  };

  // Start location tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your device doesn't support location tracking",
        variant: "destructive",
      });
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined
        };

        setCurrentLocation(locationData);
        setLocationHistory(prev => [...prev.slice(-99), locationData]); // Keep last 100 locations
        
        // Update in database
        updateLocationInDatabase(locationData);
        
        // Callback
        if (onLocationUpdate) {
          onLocationUpdate(locationData);
        }

        // Update map
        if (map) {
          updateMapLocation(locationData);
        }
      },
      (error) => {
        console.error('Location error:', error);
        toast({
          title: "Location error",
          description: error.message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );

    setWatchId(id);
    setIsTracking(true);
    
    toast({
      title: "Location tracking started",
      description: "Your location is now being tracked in real-time",
    });
  };

  // Stop location tracking
  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    
    toast({
      title: "Location tracking stopped",
      description: "Your location is no longer being tracked",
    });
  };

  // Update map with current location
  const updateMapLocation = (location: LocationData) => {
    if (!map) return;

    const position = { lat: location.latitude, lng: location.longitude };

    // Update or create marker
    if (marker) {
      marker.setPosition(position);
    } else {
      const newMarker = new google.maps.Marker({
        position,
        map,
        title: 'Your Current Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="white" stroke-width="3"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
              <circle cx="12" cy="12" r="12" fill="none" stroke="#3b82f6" stroke-width="1" opacity="0.3"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12)
        }
      });
      setMarker(newMarker);
    }

    // Update or create accuracy circle
    if (accuracy) {
      accuracy.setCenter(position);
      accuracy.setRadius(location.accuracy);
    } else {
      const accuracyCircle = new google.maps.Circle({
        strokeColor: '#3b82f6',
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        map,
        center: position,
        radius: location.accuracy
      });
      setAccuracy(accuracyCircle);
    }

    // Update path
    if (locationHistory.length > 1) {
      const pathCoordinates = locationHistory.map(loc => ({
        lat: loc.latitude,
        lng: loc.longitude
      }));

      if (path) {
        path.setPath(pathCoordinates);
      } else {
        const polyline = new google.maps.Polyline({
          path: pathCoordinates,
          geodesic: true,
          strokeColor: '#3b82f6',
          strokeOpacity: 1.0,
          strokeWeight: 3,
          map
        });
        setPath(polyline);
      }
    }

    // Center map on current location
    map.setCenter(position);
  };

  // Toggle tracking
  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  // Get one-time location
  const getLocationOnce = async () => {
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      if (user) {
        await updateLocationInDatabase(location);
      }
      
      if (onLocationUpdate) {
        onLocationUpdate(location);
      }
      
      if (map) {
        updateMapLocation(location);
      }
      
      toast({
        title: "Location updated",
        description: "Your current location has been updated",
      });
    } catch (error) {
      console.error('Error getting location:', error);
      toast({
        title: "Location error",
        description: "Could not get your current location",
        variant: "destructive",
      });
    }
  };

  const formatAccuracy = (accuracy: number) => {
    if (accuracy < 10) return `±${accuracy.toFixed(1)}m (High accuracy)`;
    if (accuracy < 50) return `±${accuracy.toFixed(0)}m (Good accuracy)`;
    if (accuracy < 100) return `±${accuracy.toFixed(0)}m (Fair accuracy)`;
    return `±${accuracy.toFixed(0)}m (Low accuracy)`;
  };

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Location Tracker
            <div className="ml-auto flex items-center gap-2">
              {isOnline ? (
                <Badge variant="default" className="gap-1">
                  <Wifi className="h-3 w-3" />
                  Online
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <WifiOff className="h-3 w-3" />
                  Offline
                </Badge>
              )}
              {isTracking && (
                <Badge variant="secondary" className="gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Tracking
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Real-time tracking</div>
              <div className="text-xs text-muted-foreground">
                Updates your location every {updateInterval / 1000} seconds
              </div>
            </div>
            <Switch checked={isTracking} onCheckedChange={toggleTracking} />
          </div>

          <div className="flex gap-2">
            <Button onClick={getLocationOnce} variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-1" />
              Get Location Once
            </Button>
            <Button onClick={toggleTracking} size="sm">
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </Button>
          </div>

          {currentLocation && (
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span>{formatAccuracy(currentLocation.accuracy)}</span>
              </div>
              {lastUpdate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Last synced: {lastUpdate.toLocaleTimeString()}</span>
                </div>
              )}
              {currentLocation.speed && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span>Speed: {(currentLocation.speed * 3.6).toFixed(1)} km/h</span>
                </div>
              )}
            </div>
          )}

          {locationHistory.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Location history: {locationHistory.length} points recorded
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      {showMap && (
        <Card>
          <CardContent className="p-0">
            <div ref={mapRef} className={className + " rounded-lg"} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const LiveLocationTracker: React.FC<LiveLocationTrackerProps> = (props) => {
  return (
    <Wrapper apiKey={GOOGLE_MAPS_API_KEY} libraries={['places', 'geometry']}>
      <TrackerComponent {...props} />
    </Wrapper>
  );
};

export default LiveLocationTracker;