/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  MessageCircle, 
  Star, 
  Clock,
  Zap,
  RefreshCw
} from 'lucide-react';

// Use environment variable or fallback
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC0qcSxvBv534pnfD5YvNimZlw8RbzTBCI';

// Windhoek coordinates as default center
const WINDHOEK_CENTER = { lat: -22.5609, lng: 17.0658 };

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

interface RealTimeGoogleMapProps {
  onProviderSelect?: (provider: ServiceProvider) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  categoryFilter?: string;
  showUserLocation?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const MapComponent: React.FC<RealTimeGoogleMapProps> = ({
  onProviderSelect,
  center = WINDHOEK_CENTER,
  zoom = 12,
  className = "w-full h-[500px]",
  categoryFilter,
  showUserLocation = true,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation && showUserLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          
          // Center map on user location if it's the first time
          if (map && !providers.length) {
            map.setCenter(userPos);
          }
        },
        (error) => {
          console.warn('Could not get user location:', error);
          toast({
            title: "Location access",
            description: "Could not access your location. Using default location.",
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }
  }, [map, providers.length, showUserLocation, toast]);

  // Fetch service providers with real-time presence
  const fetchProviders = useCallback(async () => {
    try {
      const { data: providersData, error: providersError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          contact_number,
          town,
          latitude,
          longitude,
          bio,
          is_verified,
          avatar_url,
          is_active,
          user_type,
          services:services!labourer_id (
            id,
            service_name,
            description,
            hourly_rate,
            category:service_categories (name)
          )
        `)
        .in('user_type', ['labourer', 'both'])
        .eq('is_verified', true)
        .eq('is_active', true);

      if (providersError) throw providersError;

      // Fetch presence data separately
      const { data: presenceData, error: presenceError } = await supabase
        .from('user_presence')
        .select(`
          user_id,
          status,
          last_seen,
          is_available
        `);

      if (presenceError) console.warn('Could not fetch presence data:', presenceError);

      // Combine providers with presence data
      const providersWithPresence = (providersData || [])
        .filter(provider => provider.services && provider.services.length > 0)
        .map(provider => {
          const presence = presenceData?.find(p => p.user_id === provider.id);
          return {
            ...provider,
            presence: presence ? {
              status: presence.status as 'online' | 'busy' | 'offline',
              last_seen: presence.last_seen,
              is_available: presence.is_available
            } : undefined
          };
        });

      // Filter by category if specified
      const filteredProviders = categoryFilter 
        ? providersWithPresence.filter(provider => 
            provider.services.some(service => 
              service.category?.name?.toLowerCase().includes(categoryFilter.toLowerCase())
            )
          )
        : providersWithPresence;

      setProviders(filteredProviders);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: "Error",
        description: "Failed to load service providers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, toast]);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map) {
      const googleMap = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "transit",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
      });

      setMap(googleMap);
      
      // Add click listener for map
      googleMap.addListener('click', () => {
        setSelectedProvider(null);
      });
    }
  }, [mapRef, map, center, zoom]);

  // Get user location when map is ready
  useEffect(() => {
    if (map) {
      getUserLocation();
    }
  }, [map, getUserLocation]);

  // Fetch providers initially and set up real-time updates
  useEffect(() => {
    fetchProviders();

    // Set up real-time subscription for presence updates
    const presenceChannel = supabase
      .channel('user_presence_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        () => {
          // Refresh provider data when presence changes
          fetchProviders();
        }
      )
      .subscribe();

    // Set up periodic refresh if enabled
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh && refreshInterval > 0) {
      intervalId = setInterval(fetchProviders, refreshInterval);
    }

    return () => {
      presenceChannel.unsubscribe();
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchProviders, autoRefresh, refreshInterval]);

  // Update markers when providers change
  useEffect(() => {
    if (!map || !providers.length) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];

    // Add user location marker
    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="8" fill="#3b82f6" stroke="white" stroke-width="3"/>
              <circle cx="15" cy="15" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(30, 30),
          anchor: new google.maps.Point(15, 15)
        }
      });
      newMarkers.push(userMarker);
    }

    // Add provider markers
    providers.forEach((provider) => {
      let lat, lng;
      
      if (provider.latitude && provider.longitude) {
        lat = Number(provider.latitude);
        lng = Number(provider.longitude);
      } else {
        // Fallback to random position around Windhoek
        const offset = 0.01;
        lat = WINDHOEK_CENTER.lat + (Math.random() - 0.5) * offset;
        lng = WINDHOEK_CENTER.lng + (Math.random() - 0.5) * offset;
      }

      // Determine marker color based on status
      const getStatusColor = () => {
        if (!provider.presence) return '#6b7280'; // gray for unknown
        switch (provider.presence.status) {
          case 'online': return '#10b981'; // green
          case 'busy': return '#f59e0b'; // yellow  
          case 'offline': return '#ef4444'; // red
          default: return '#6b7280';
        }
      };

      const statusColor = getStatusColor();
      const isAvailable = provider.presence?.is_available !== false;

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: `${provider.full_name} - ${provider.services[0]?.service_name || 'Service Provider'}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="${statusColor}" stroke="white" stroke-width="3"/>
              <text x="20" y="26" text-anchor="middle" fill="white" font-size="14" font-weight="bold">
                ${isAvailable ? '✓' : '⏱'}
              </text>
              ${provider.is_verified ? '<circle cx="30" cy="10" r="5" fill="#3b82f6"/><text x="30" y="13" text-anchor="middle" fill="white" font-size="8">✓</text>' : ''}
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20)
        }
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(provider)
      });

      // Add click listener
      marker.addListener('click', () => {
        // Close any open info windows
        newMarkers.forEach(m => {
          if ((m as any).infoWindow) {
            (m as any).infoWindow.close();
          }
        });
        
        infoWindow.open(map, marker);
        setSelectedProvider(provider);
        
        // Center map on marker
        map.panTo(marker.getPosition()!);
      });

      (marker as any).infoWindow = infoWindow;
      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Set up global handlers for info window buttons
    (window as any).selectProvider = (providerId: string) => {
      const provider = providers.find(p => p.id === providerId);
      if (provider && onProviderSelect) {
        onProviderSelect(provider);
      }
    };

    (window as any).callProvider = (phoneNumber: string) => {
      window.open(`tel:${phoneNumber}`, '_self');
    };

    (window as any).getDirections = (lat: number, lng: number) => {
      if (userLocation) {
        const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}`;
        window.open(url, '_blank');
      } else {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, '_blank');
      }
    };

  }, [map, providers, markers, userLocation, onProviderSelect]);

  const createInfoWindowContent = (provider: ServiceProvider) => {
    const statusText = provider.presence?.status || 'unknown';
    const statusColor = provider.presence?.status === 'online' ? '#10b981' : 
                       provider.presence?.status === 'busy' ? '#f59e0b' : '#ef4444';
    
    return `
      <div class="p-4 min-w-72 max-w-sm">
        <div class="flex items-start gap-3 mb-3">
          ${provider.avatar_url ? 
            `<img src="${provider.avatar_url}" alt="${provider.full_name}" class="w-12 h-12 rounded-full object-cover"/>` :
            `<div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">${provider.full_name.charAt(0)}</div>`
          }
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-lg">${provider.full_name}</h3>
              ${provider.is_verified ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">✓ Verified</span>' : ''}
            </div>
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-flex items-center gap-1 text-xs">
                <span class="w-2 h-2 rounded-full" style="background-color: ${statusColor}"></span>
                ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}
              </span>
              <span class="text-xs text-gray-500">•</span>
              <span class="text-xs text-gray-600">${provider.town}</span>
            </div>
          </div>
        </div>
        
        ${provider.bio ? `<p class="text-sm text-gray-700 mb-3 line-clamp-2">${provider.bio.substring(0, 100)}${provider.bio.length > 100 ? '...' : ''}</p>` : ''}
        
        <div class="space-y-2 mb-4">
          <h4 class="font-medium text-sm">Services:</h4>
          ${provider.services.slice(0, 2).map(service => `
            <div class="flex justify-between items-center">
              <span class="text-sm">${service.service_name}</span>
              ${service.hourly_rate ? `<span class="text-sm font-medium text-blue-600">N$${service.hourly_rate}/hr</span>` : ''}
            </div>
          `).join('')}
          ${provider.services.length > 2 ? `<p class="text-xs text-gray-500">+${provider.services.length - 2} more services</p>` : ''}
        </div>
        
        <div class="flex gap-2">
          <button 
            onclick="selectProvider('${provider.id}')" 
            class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            View Profile
          </button>
          ${provider.contact_number ? `
            <button 
              onclick="callProvider('${provider.contact_number}')" 
              class="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
              title="Call"
            >
              📞
            </button>
          ` : ''}
          <button 
            onclick="getDirections(${provider.latitude || WINDHOEK_CENTER.lat}, ${provider.longitude || WINDHOEK_CENTER.lng})" 
            class="px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
            title="Get Directions"
          >
            🗺️
          </button>
        </div>
      </div>
    `;
  };

  const refreshData = () => {
    setLoading(true);
    fetchProviders();
    getUserLocation();
    toast({
      title: "Refreshed",
      description: "Map data has been updated",
    });
  };

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading real-time map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`${className} relative`}>
        <div ref={mapRef} className="w-full h-full rounded-lg" />
        
        {/* Map controls overlay */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">
              {providers.length} providers nearby
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={refreshData}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
        
        {/* Status legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Online</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Busy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Offline</span>
            </div>
            {userLocation && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>You</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected provider details */}
      {selectedProvider && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {selectedProvider.avatar_url ? (
                <img 
                  src={selectedProvider.avatar_url} 
                  alt={selectedProvider.full_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xl">
                  {selectedProvider.full_name.charAt(0)}
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{selectedProvider.full_name}</h3>
                  {selectedProvider.is_verified && (
                    <Badge variant="default" className="text-xs">✓ Verified</Badge>
                  )}
                  {selectedProvider.presence && (
                    <Badge 
                      variant={selectedProvider.presence.status === 'online' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      <div className={`w-2 h-2 rounded-full mr-1 ${
                        selectedProvider.presence.status === 'online' ? 'bg-green-500' :
                        selectedProvider.presence.status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      {selectedProvider.presence.status}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedProvider.town}</span>
                </div>
                
                {selectedProvider.bio && (
                  <p className="text-sm text-gray-700 mb-3">{selectedProvider.bio}</p>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => onProviderSelect?.(selectedProvider)}
                    className="flex-1"
                  >
                    View Full Profile
                  </Button>
                  {selectedProvider.contact_number && (
                    <Button 
                      variant="outline"
                      onClick={() => window.open(`tel:${selectedProvider.contact_number}`, '_self')}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const lat = selectedProvider.latitude || WINDHOEK_CENTER.lat;
                      const lng = selectedProvider.longitude || WINDHOEK_CENTER.lng;
                      if (userLocation) {
                        const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}`;
                        window.open(url, '_blank');
                      } else {
                        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                        window.open(url, '_blank');
                      }
                    }}
                  >
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const RealTimeGoogleMap: React.FC<RealTimeGoogleMapProps> = (props) => {
  return (
    <Wrapper apiKey={GOOGLE_MAPS_API_KEY} libraries={['places', 'geometry']}>
      <MapComponent {...props} />
    </Wrapper>
  );
};

export default RealTimeGoogleMap;