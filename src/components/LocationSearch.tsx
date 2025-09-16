/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDTgFxj8GM0Sa8du_EBBX1jMbNJCwP022w';

interface Location {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
}

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
  className?: string;
  defaultLocation?: string;
}

// Windhoek suburbs and areas
const WINDHOEK_AREAS = [
  'Klein Windhoek',
  'Eros',
  'Ludwigsdorf',
  'Pioneerspark',
  'Olympia',
  'Windhoek West',
  'Windhoek Central',
  'Katutura',
  'Khomasdal',
  'Academia',
  'Auasblick',
  'Dorado Park',
  'Goreangab',
  'Hochland Park',
  'Rocky Crest',
  'Suiderhof'
];

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  placeholder = "Search location in Windhoek...",
  className = "",
  defaultLocation = ""
}) => {
  const [query, setQuery] = useState(defaultLocation);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    // Initialize Google Maps services
    if (window.google && window.google.maps) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      geocoder.current = new google.maps.Geocoder();
    } else {
      // Load Google Maps API if not already loaded
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.onload = () => {
        autocompleteService.current = new google.maps.places.AutocompleteService();
        geocoder.current = new google.maps.Geocoder();
      };
      document.head.appendChild(script);
    }
  }, []);

  const searchLocations = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // First, filter local Windhoek areas
      const localMatches = WINDHOEK_AREAS
        .filter(area => area.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(area => ({
          lat: -22.5609, // Default Windhoek coordinates
          lng: 17.0658,
          address: `${area}, Windhoek, Namibia`,
          placeId: area.toLowerCase().replace(/\s+/g, '-')
        }));

      // If Google Maps is available, search for places
      if (autocompleteService.current && geocoder.current) {
        const request = {
          input: `${searchQuery} Windhoek, Namibia`,
          componentRestrictions: { country: 'na' }, // Namibia
          types: ['geocode', 'establishment']
        };

        autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const googleSuggestions = predictions.slice(0, 5).map(prediction => ({
              lat: -22.5609, // Will be updated with geocoding
              lng: 17.0658,
              address: prediction.description,
              placeId: prediction.place_id
            }));

            // Geocode the first few suggestions to get accurate coordinates
            Promise.all(
              googleSuggestions.slice(0, 3).map(suggestion => 
                new Promise<Location>((resolve) => {
                  if (geocoder.current && suggestion.placeId) {
                    geocoder.current.geocode(
                      { placeId: suggestion.placeId },
                      (results, status) => {
                        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                          const location = results[0].geometry.location;
                          resolve({
                            ...suggestion,
                            lat: location.lat(),
                            lng: location.lng()
                          });
                        } else {
                          resolve(suggestion);
                        }
                      }
                    );
                  } else {
                    resolve(suggestion);
                  }
                })
              )
            ).then(geocodedSuggestions => {
              setSuggestions([...localMatches, ...geocodedSuggestions]);
            });
          } else {
            setSuggestions(localMatches);
          }
        });
      } else {
        setSuggestions(localMatches);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
    }

    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchLocations(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleLocationSelect = (location: Location) => {
    setQuery(location.address);
    setShowSuggestions(false);
    onLocationSelect(location);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Current Location'
          };
          
          // Reverse geocode to get address
          if (geocoder.current) {
            geocoder.current.geocode(
              { location: { lat: location.lat, lng: location.lng } },
              (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                  location.address = results[0].formatted_address;
                }
                onLocationSelect(location);
                setQuery(location.address);
                setIsLoading(false);
              }
            );
          } else {
            onLocationSelect(location);
            setQuery(location.address);
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
          setIsLoading(false);
        }
      );
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow for clicks
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          className="pl-10 pr-12"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </Button>
      </div>

      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center p-3">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Searching...</span>
            </div>
          )}
          
          {suggestions.map((location, index) => (
            <div
              key={`${location.placeId || location.address}-${index}`}
              className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
              onClick={() => handleLocationSelect(location)}
            >
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{location.address}</p>
                <p className="text-xs text-muted-foreground">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default LocationSearch;