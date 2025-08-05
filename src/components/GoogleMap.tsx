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
      
      // Add user location marker
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            new google.maps.Marker({
              position: userLocation,
              map: googleMap,
              title: "Your Location",
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="#3b82f6" stroke="white" stroke-width="3"/>
                    <circle cx="16" cy="16" r="4" fill="white"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 16)
              }
            });
            
            // Center map on user location
            googleMap.setCenter(userLocation);
          },
          (error) => {
            console.warn('Could not get user location:', error);
          }
        );
      }
      
      setMap(googleMap);
    }
  }, [mapRef, map, center, zoom]);

  useEffect(() => {
    if (map && workers.length > 0) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      
      const newMarkers = workers.map(worker => {
        const marker = new google.maps.Marker({
          position: worker.location,
          map,
          title: `${worker.name} - ${worker.service}`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="hsl(var(--primary))" stroke="white" stroke-width="4"/>
                <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="bold">★</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-3 min-w-48">
              <div class="flex items-center gap-3 mb-2">
                ${worker.profileImage ? 
                  `<img src="${worker.profileImage}" alt="${worker.name}" class="w-12 h-12 rounded-full object-cover"/>` :
                  `<div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">${worker.name[0]}</div>`
                }
                <div>
                  <h3 class="font-semibold text-foreground">${worker.name}</h3>
                  <p class="text-sm text-muted-foreground">${worker.service}</p>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1">
                  <span class="text-yellow-500">★</span>
                  <span class="text-sm font-medium">${worker.rating}</span>
                </div>
                <button 
                  onclick="window.selectWorker('${worker.id}')" 
                  class="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
                >
                  View Profile
                </button>
              </div>
              <p class="text-xs text-muted-foreground mt-2">${worker.location.address}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        return marker;
      });

      setMarkers(newMarkers);

      // Set up global worker selection handler
      (window as any).selectWorker = (workerId: string) => {
        const worker = workers.find(w => w.id === workerId);
        if (worker && onWorkerSelect) {
          onWorkerSelect(worker);
        }
      };
    }
  }, [map, workers, onWorkerSelect, markers]);

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