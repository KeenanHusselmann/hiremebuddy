import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// You need to add your Mapbox token to Supabase Edge Function Secrets
const MAPBOX_TOKEN = 'MAPBOX_PUBLIC_TOKEN_HERE'; // This will be replaced with actual token

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
  services: {
    id: string;
    service_name: string;
    description: string;
    hourly_rate: number;
    category: {
      name: string;
    };
  }[];
}

interface ServiceProviderMapProps {
  onProviderSelect?: (provider: ServiceProvider) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

const ServiceProviderMap: React.FC<ServiceProviderMapProps> = ({
  onProviderSelect,
  center = [17.0658, -22.5609], // Windhoek, Namibia [lng, lat]
  zoom = 12,
  className = "w-full h-[500px]"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLng = position.coords.longitude;
          const userLat = position.coords.latitude;
          setUserLocation([userLng, userLat]);
        },
        (error) => {
          console.warn('Could not get user location:', error);
          // Default to Windhoek if geolocation fails
          setUserLocation([17.0658, -22.5609]);
        }
      );
    } else {
      setUserLocation([17.0658, -22.5609]);
    }
  }, []);

  // Fetch service providers from database
  useEffect(() => {
    fetchServiceProviders();
  }, []);

  const fetchServiceProviders = async () => {
    try {
      const { data, error } = await supabase
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
          services:services!labourer_id (
            id,
            service_name,
            description,
            hourly_rate,
            category:service_categories (name)
          )
        `)
        .eq('user_type', 'labourer')
        .eq('is_verified', true)
        .eq('is_active', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;

      // Filter providers that have services and valid coordinates
      const validProviders = (data || []).filter(provider => 
        provider.services && 
        provider.services.length > 0 &&
        provider.latitude && 
        provider.longitude
      );

      setProviders(validProviders);
    } catch (error) {
      console.error('Error fetching service providers:', error);
      toast({
        title: "Error",
        description: "Failed to load service providers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || MAPBOX_TOKEN === 'MAPBOX_PUBLIC_TOKEN_HERE') {
      if (MAPBOX_TOKEN === 'MAPBOX_PUBLIC_TOKEN_HERE') {
        toast({
          title: "Map Setup Required",
          description: "Please add your Mapbox token to Supabase Edge Function Secrets",
          variant: "destructive",
        });
      }
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const initialCenter = userLocation || center;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter,
      zoom: zoom,
      attributionControl: false
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    }), 'top-right');

    // Add user location marker if available
    if (userLocation) {
      new mapboxgl.Marker({ color: '#3b82f6' })
        .setLngLat(userLocation)
        .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Location</h3>'))
        .addTo(map.current);
    }

    return () => {
      map.current?.remove();
    };
  }, [userLocation, center, zoom]);

  // Add provider markers
  useEffect(() => {
    if (!map.current || providers.length === 0) return;

    providers.forEach(provider => {
      if (!provider.latitude || !provider.longitude) return;

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'provider-marker';
      markerElement.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: hsl(var(--primary));
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      `;
      markerElement.textContent = provider.full_name.charAt(0);

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div class="p-4 min-w-72">
          <div class="flex items-start gap-3 mb-3">
            ${provider.avatar_url ? 
              `<img src="${provider.avatar_url}" alt="${provider.full_name}" class="w-12 h-12 rounded-full object-cover"/>` :
              `<div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">${provider.full_name.charAt(0)}</div>`
            }
            <div class="flex-1">
              <h3 class="font-semibold text-lg">${provider.full_name}</h3>
              ${provider.is_verified ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">✓ Verified</span>' : ''}
              <p class="text-sm text-gray-600 mt-1">${provider.town}</p>
            </div>
          </div>
          
          ${provider.bio ? `<p class="text-sm text-gray-700 mb-3">${provider.bio.substring(0, 100)}${provider.bio.length > 100 ? '...' : ''}</p>` : ''}
          
          <div class="space-y-2 mb-4">
            <h4 class="font-medium text-sm">Services:</h4>
            ${provider.services.slice(0, 3).map(service => `
              <div class="flex justify-between items-center">
                <span class="text-sm">${service.service_name}</span>
                ${service.hourly_rate ? `<span class="text-sm font-medium text-primary">N$${service.hourly_rate}/hr</span>` : ''}
              </div>
            `).join('')}
            ${provider.services.length > 3 ? `<p class="text-xs text-gray-500">+${provider.services.length - 3} more services</p>` : ''}
          </div>
          
          <div class="flex gap-2">
            <button 
              onclick="window.viewProvider('${provider.id}')" 
              class="flex-1 px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors"
            >
              View Profile
            </button>
            ${provider.contact_number ? `
              <button 
                onclick="window.contactProvider('${provider.contact_number}')" 
                class="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
              >
                📞
              </button>
            ` : ''}
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setDOMContent(popupContent);

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([provider.longitude, provider.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      // Add click handler for marker
      markerElement.addEventListener('click', () => {
        setSelectedProvider(provider);
        popup.addTo(map.current!);
      });
    });

    // Set up global handlers
    (window as any).viewProvider = (providerId: string) => {
      const provider = providers.find(p => p.id === providerId);
      if (provider) {
        if (onProviderSelect) {
          onProviderSelect(provider);
        } else {
          navigate(`/profile/${providerId}`);
        }
      }
    };

    (window as any).contactProvider = (phoneNumber: string) => {
      window.open(`tel:${phoneNumber}`, '_self');
    };

  }, [providers, navigate, onProviderSelect]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (MAPBOX_TOKEN === 'MAPBOX_PUBLIC_TOKEN_HERE') {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Map Setup Required</h3>
          <p className="text-sm text-gray-600 mb-4">
            To display the map, please add your Mapbox public token to Supabase Edge Function Secrets.
          </p>
          <Button 
            onClick={() => window.open('https://supabase.com/dashboard/project/vjpaolkqlumpyuxxmmvr/settings/functions', '_blank')}
            variant="outline"
          >
            Configure Mapbox Token
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`${className} relative`}>
        <div ref={mapContainer} className="w-full h-full rounded-lg" />
        
        {/* Map overlay with provider count */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium">
            {providers.length} verified providers nearby
          </p>
        </div>
      </div>

      {/* Selected provider details */}
      {selectedProvider && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Provider</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProvider(null)}
              >
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedProvider.town}</span>
                </div>
                
                {selectedProvider.bio && (
                  <p className="text-sm text-gray-700 mb-3">{selectedProvider.bio}</p>
                )}
                
                <div className="space-y-2 mb-4">
                  <h4 className="font-medium text-sm">Services:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedProvider.services.map(service => (
                      <Badge key={service.id} variant="outline" className="text-xs">
                        {service.service_name}
                        {service.hourly_rate && ` - N$${service.hourly_rate}/hr`}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigate(`/profile/${selectedProvider.id}`)}
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
                    onClick={() => navigate(`/contact/${selectedProvider.id}`)}
                  >
                    <MessageCircle className="h-4 w-4" />
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

export default ServiceProviderMap;