/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Target,
  Filter,
  Star
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC0qcSxvBv534pnfD5YvNimZlw8RbzTBCI';
const WINDHOEK_CENTER = { lat: -22.5609, lng: 17.0658 };

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  price_level?: number;
  photos?: any[];
  opening_hours?: {
    open_now?: boolean;
  };
  types: string[];
}

interface GoogleMapsSearchProps {
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  onPlaceSelect?: (place: PlaceResult) => void;
  searchTypes?: string[];
  className?: string;
  placeholder?: string;
  showNearbySearch?: boolean;
  mapHeight?: string;
}

const SearchComponent: React.FC<GoogleMapsSearchProps> = ({
  onLocationSelect,
  onPlaceSelect,
  searchTypes = ['establishment'],
  className = "w-full",
  placeholder = "Search for places...",
  showNearbySearch = true,
  mapHeight = "h-96"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map) {
      const googleMap = new google.maps.Map(mapRef.current, {
        center: WINDHOEK_CENTER,
        zoom: 12,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      setMap(googleMap);
      setPlacesService(new google.maps.places.PlacesService(googleMap));

      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(userPos);
            googleMap.setCenter(userPos);
            
            // Add user location marker
            new google.maps.Marker({
              position: userPos,
              map: googleMap,
              title: 'Your Location',
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="6" fill="#3b82f6" stroke="white" stroke-width="2"/>
                    <circle cx="10" cy="10" r="2" fill="white"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(20, 20),
                anchor: new google.maps.Point(10, 10)
              }
            });
          },
          () => {
            console.warn('Could not get user location');
          }
        );
      }
    }
  }, [mapRef, map]);

  // Initialize autocomplete
  useEffect(() => {
    if (searchInputRef.current && !autocomplete && window.google) {
      const autocompleteInstance = new google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          types: ['geocode', 'establishment'],
          componentRestrictions: { country: 'NA' }, // Restrict to Namibia
          fields: ['place_id', 'geometry', 'name', 'formatted_address', 'rating', 'price_level', 'photos', 'opening_hours', 'types']
        }
      );

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        
        if (!place.geometry || !place.geometry.location) {
          toast({
            title: "No location found",
            description: "Please try a different search term",
            variant: "destructive",
          });
          return;
        }

        const placeResult: PlaceResult = {
          place_id: place.place_id!,
          name: place.name!,
          formatted_address: place.formatted_address!,
          geometry: {
            location: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          },
          rating: place.rating,
          price_level: place.price_level,
          photos: place.photos,
          opening_hours: place.opening_hours,
          types: place.types || []
        };

        setSelectedPlace(placeResult);
        
        if (map) {
          map.setCenter(place.geometry.location);
          map.setZoom(15);
          
          // Clear existing markers
          markers.forEach(marker => marker.setMap(null));
          
          // Add new marker
          const marker = new google.maps.Marker({
            position: place.geometry.location,
            map,
            title: place.name
          });
          
          setMarkers([marker]);
        }

        // Callbacks
        if (onLocationSelect) {
          onLocationSelect({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address!
          });
        }

        if (onPlaceSelect) {
          onPlaceSelect(placeResult);
        }
      });

      setAutocomplete(autocompleteInstance);
    }
  }, [searchInputRef, autocomplete, map, markers, onLocationSelect, onPlaceSelect, toast]);

  // Search nearby places
  const searchNearbyPlaces = (types: string[], radius = 5000) => {
    if (!placesService || !map) return;

    const center = userLocation || WINDHOEK_CENTER;
    
    const request: google.maps.places.PlaceSearchRequest = {
      location: center,
      radius,
      type: types[0] as any
    };

    placesService.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const places: PlaceResult[] = results.slice(0, 10).map(place => ({
          place_id: place.place_id!,
          name: place.name!,
          formatted_address: place.vicinity!,
          geometry: {
            location: {
              lat: place.geometry!.location!.lat(),
              lng: place.geometry!.location!.lng()
            }
          },
          rating: place.rating,
          price_level: place.price_level,
          photos: place.photos,
          opening_hours: place.opening_hours,
          types: place.types || []
        }));

        setSearchResults(places);
        
        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));
        
        // Add new markers
        const newMarkers = places.map(place => {
          const marker = new google.maps.Marker({
            position: place.geometry.location,
            map,
            title: place.name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="15" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
                  <text x="15" y="19" text-anchor="middle" fill="white" font-size="12" font-weight="bold">📍</text>
                </svg>
              `),
              scaledSize: new google.maps.Size(30, 30),
              anchor: new google.maps.Point(15, 15)
            }
          });

          marker.addListener('click', () => {
            setSelectedPlace(place);
            map.setCenter(place.geometry.location);
            
            if (onPlaceSelect) {
              onPlaceSelect(place);
            }
          });

          return marker;
        });
        
        setMarkers(newMarkers);
        
        toast({
          title: "Search completed",
          description: `Found ${places.length} places nearby`,
        });
      } else {
        toast({
          title: "Search failed",
          description: "Could not find nearby places",
          variant: "destructive",
        });
      }
    });
  };

  // Use current location
  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setUserLocation(location);
          
          if (map) {
            map.setCenter(location);
            map.setZoom(15);
          }
          
          // Reverse geocode to get address
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              if (onLocationSelect) {
                onLocationSelect({
                  ...location,
                  address: results[0].formatted_address
                });
              }
            }
          });
          
          toast({
            title: "Location updated",
            description: "Using your current location",
          });
        },
        () => {
          toast({
            title: "Location error",
            description: "Could not access your location",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Controls */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                ref={searchInputRef}
                placeholder={placeholder}
                className="pl-10"
              />
            </div>
            <Button onClick={useCurrentLocation} variant="outline" size="icon">
              <Target className="h-4 w-4" />
            </Button>
          </div>

          {showNearbySearch && (
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => searchNearbyPlaces(['restaurant'])}
                variant="outline"
                size="sm"
              >
                Restaurants
              </Button>
              <Button
                onClick={() => searchNearbyPlaces(['gas_station'])}
                variant="outline"
                size="sm"
              >
                Gas Stations
              </Button>
              <Button
                onClick={() => searchNearbyPlaces(['hospital'])}
                variant="outline"
                size="sm"
              >
                Hospitals
              </Button>
              <Button
                onClick={() => searchNearbyPlaces(['bank'])}
                variant="outline"
                size="sm"
              >
                Banks
              </Button>
              <Button
                onClick={() => searchNearbyPlaces(['store'])}
                variant="outline"
                size="sm"
              >
                Stores
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div ref={mapRef} className={`w-full ${mapHeight} rounded-lg`} />
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Search Results</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((place) => (
                <div
                  key={place.place_id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedPlace?.place_id === place.place_id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => {
                    setSelectedPlace(place);
                    if (map) {
                      map.setCenter(place.geometry.location);
                      map.setZoom(15);
                    }
                    if (onPlaceSelect) {
                      onPlaceSelect(place);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{place.name}</h4>
                      <p className="text-sm text-gray-600">{place.formatted_address}</p>
                      {place.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">{place.rating}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${place.geometry.location.lat},${place.geometry.location.lng}`;
                        window.open(url, '_blank');
                      }}
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Place Details */}
      {selectedPlace && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Selected Location</h3>
            <div className="space-y-2">
              <h4 className="font-medium">{selectedPlace.name}</h4>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {selectedPlace.formatted_address}
              </div>
              {selectedPlace.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{selectedPlace.rating} rating</span>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={() => {
                    if (onLocationSelect) {
                      onLocationSelect({
                        lat: selectedPlace.geometry.location.lat,
                        lng: selectedPlace.geometry.location.lng,
                        address: selectedPlace.formatted_address
                      });
                    }
                  }}
                  size="sm"
                >
                  Select This Location
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.geometry.location.lat},${selectedPlace.geometry.location.lng}`;
                    window.open(url, '_blank');
                  }}
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  Get Directions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const GoogleMapsSearch: React.FC<GoogleMapsSearchProps> = (props) => {
  return (
    <Wrapper apiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
      <SearchComponent {...props} />
    </Wrapper>
  );
};

export default GoogleMapsSearch;