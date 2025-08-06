/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC0qcSxvBv534pnfD5YvNimZlw8RbzTBCI';

// Windhoek coordinates
const WINDHOEK_CENTER = { lat: -22.5609, lng: 17.0658 };

interface Worker {
  id: string;
  name: string;
  service: string;
  rating: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  profileImage?: string;
}

interface GoogleMapProps {
  workers: Worker[];
  onWorkerSelect?: (worker: Worker) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

const MapComponent: React.FC<GoogleMapProps> = ({
  workers,
  onWorkerSelect,
  center = WINDHOEK_CENTER,
  zoom = 12,
  className = "w-full h-96"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  // Geocode address to get accurate coordinates
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!window.google?.maps?.Geocoder) {
        console.error('Google Maps Geocoder not available');
        resolve(null);
        return;
      }
      
      const geocoder = new google.maps.Geocoder();
      const fullAddress = `${address}, Windhoek, Namibia`;
      console.log('Attempting to geocode address:', fullAddress);
      
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        console.log('Geocoding results for', address, ':', { status, results });
        
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const coordinates = {
            lat: location.lat(),
            lng: location.lng()
          };
          console.log('Geocoded coordinates for', address, ':', coordinates);
          resolve(coordinates);
        } else {
          console.warn('Geocoding failed for address:', address, 'Status:', status);
          resolve(null);
        }
      });
    });
  };

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
          }
        ]
      });
      
      // Add user location marker with info window
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            const userMarker = new google.maps.Marker({
              position: userLocation,
              map: googleMap,
              title: "Your Current Location",
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="#3b82f6" stroke="white" stroke-width="3"/>
                    <circle cx="16" cy="16" r="4" fill="white"/>
                    <circle cx="16" cy="16" r="8" fill="none" stroke="#3b82f6" stroke-width="1" opacity="0.3"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 16)
              }
            });

            // Add info window for user location
            const userInfoWindow = new google.maps.InfoWindow({
              content: `
                <div class="p-4 min-w-48">
                  <div class="flex items-center gap-3 mb-2">
                    <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      📍
                    </div>
                    <div>
                      <h3 class="font-bold text-lg text-gray-800">Your Location</h3>
                      <p class="text-sm text-gray-600 font-medium">Current Position</p>
                    </div>
                  </div>
                  <p class="text-sm text-gray-700 font-medium">You are here</p>
                </div>
              `
            });

            userMarker.addListener('click', () => {
              userInfoWindow.open(googleMap, userMarker);
            });
            
            // Center map on user location
            googleMap.setCenter(userLocation);
          },
          (error) => {
            console.warn('Could not get user location:', error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      }
      
      setMap(googleMap);
    }
  }, [mapRef, map, center, zoom]);

  useEffect(() => {
    if (map && workers.length > 0) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      
      const createMarkersAsync = async () => {
        const newMarkers: google.maps.Marker[] = [];
        console.log('Creating markers for workers:', workers);
        
        for (const worker of workers) {
          console.log('Processing worker:', worker.name, 'at address:', worker.location.address, 'coordinates:', worker.location);
          let position = worker.location;
          
          // Try geocoding for addresses that contain specific street information or look inaccurate
          const shouldGeocode = worker.location.address && (
            // Has street number and name (like "55 Kenneth Mcarthur street")
            /\d+\s+[A-Za-z\s]+\s+(street|avenue|road|lane|drive|close|way)/i.test(worker.location.address) ||
            // Coordinates are default Windhoek center
            worker.location.lat === WINDHOEK_CENTER.lat || 
            worker.location.lng === WINDHOEK_CENTER.lng ||
            // Coordinates seem invalid
            Math.abs(worker.location.lat) < 1 || 
            Math.abs(worker.location.lng) < 1 ||
            // Coordinates are too close to each other (suggests they're fallback values)
            Math.abs(worker.location.lat + 22.5609) < 0.01
          );
          
          if (shouldGeocode) {
            console.log('Attempting to geocode address for accurate positioning:', worker.location.address);
            const geocodedPosition = await geocodeAddress(worker.location.address);
            if (geocodedPosition) {
              position = {
                lat: geocodedPosition.lat,
                lng: geocodedPosition.lng,
                address: worker.location.address
              };
              console.log('Successfully geocoded', worker.name, 'to:', geocodedPosition);
            } else {
              console.log('Geocoding failed for', worker.name, ', using original coordinates');
            }
          }
          
          const marker = new google.maps.Marker({
            position: { lat: position.lat, lng: position.lng },
            map,
            title: `${worker.name} - ${worker.service}`,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 0C8.95 0 0 8.95 0 20C0 35 20 50 20 50C20 50 40 35 40 20C40 8.95 31.05 0 20 0Z" fill="#10b981"/>
                  <circle cx="20" cy="20" r="12" fill="white"/>
                  <text x="20" y="26" text-anchor="middle" fill="#10b981" font-size="16" font-weight="bold">★</text>
                </svg>
              `),
              scaledSize: new google.maps.Size(40, 50),
              anchor: new google.maps.Point(20, 50)
            }
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-4 min-w-64 max-w-80">
                <div class="flex items-center gap-3 mb-3">
                  ${worker.profileImage ? 
                    `<img src="${worker.profileImage}" alt="${worker.name}" class="w-14 h-14 rounded-full object-cover border-2 border-gray-200"/>` :
                    `<div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">${worker.name[0]}</div>`
                  }
                  <div class="flex-1">
                    <h3 class="font-bold text-lg text-gray-800">${worker.name}</h3>
                    <p class="text-sm text-gray-600 font-medium">${worker.service}</p>
                  </div>
                </div>
                
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1">
                      <span class="text-yellow-400 text-lg">★</span>
                      <span class="font-semibold text-gray-800">${worker.rating}</span>
                      <span class="text-xs text-gray-500">/5</span>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button 
                      onclick="window.selectWorker('${worker.id}')" 
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
                
                <div class="border-t pt-2">
                  <p class="text-xs text-gray-500 flex items-center gap-1">
                    <span>📍</span>
                    ${position.address}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    Coordinates: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          newMarkers.push(marker);
        }
        
        setMarkers(newMarkers);
      };

      createMarkersAsync();

      // Set up global worker selection handler
      (window as any).selectWorker = (workerId: string) => {
        const worker = workers.find(w => w.id === workerId);
        if (worker && onWorkerSelect) {
          onWorkerSelect(worker);
        }
      };
    }
  }, [map, workers, onWorkerSelect]);

  return <div ref={mapRef} className={className} />;
};

export const GoogleMap: React.FC<GoogleMapProps> = (props) => {
  return (
    <Wrapper apiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
      <MapComponent {...props} />
    </Wrapper>
  );
};

export default GoogleMap;