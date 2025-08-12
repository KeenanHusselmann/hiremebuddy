/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { useServiceRating, formatRating, renderStars } from '@/hooks/useServiceRatings';
import { escapeHTML, safeUrl, escapeJSString } from '@/lib/utils';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC0qcSxvBv534pnfD5YvNimZlw8RbzTBCI';

// Windhoek coordinates
const WINDHOEK_CENTER = { lat: -22.5609, lng: 17.0658 };

interface Worker {
  id: string;
  name: string;
  service: string;
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
  isAuthenticated?: boolean;
}

const MapComponent: React.FC<GoogleMapProps> = ({
  workers,
  onWorkerSelect,
  center = WINDHOEK_CENTER,
  zoom = 12,
  className = "w-full h-96",
  isAuthenticated = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  // Helpers
  const isFiniteNumber = (n: any) => typeof n === 'number' && Number.isFinite(n);
  const isValidLatLng = (lat?: any, lng?: any) => isFiniteNumber(lat) && isFiniteNumber(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

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
                <div class="p-4 min-w-64 max-w-80">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      📍
                    </div>
                    <div class="flex-1">
                      <h3 class="font-bold text-lg text-gray-800">Your Location</h3>
                      <p class="text-sm text-gray-600 font-medium">Current Position</p>
                    </div>
                  </div>
                  
                  <div class="border-t pt-2">
                    <p class="text-xs text-gray-500 flex items-center gap-1">
                      <span>📍</span>
                      You are here
                    </p>
                  </div>
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
      const desiredIds = new Set(workers.map(w => w.id));

      // Remove markers for workers no longer present
      for (const [id, marker] of markersRef.current.entries()) {
        if (!desiredIds.has(id)) {
          marker.setMap(null);
          markersRef.current.delete(id);
        }
      }

      const updateMarkersAsync = async () => {
        for (const worker of workers) {
          let position = worker.location;

           const shouldGeocode = !!worker.location.address && (
             !isValidLatLng(worker.location.lat, worker.location.lng) ||
             (Math.abs(worker.location.lat - WINDHOEK_CENTER.lat) < 0.0001 && Math.abs(worker.location.lng - WINDHOEK_CENTER.lng) < 0.0001)
           );

          if (shouldGeocode) {
             const geocodedPosition = await geocodeAddress(worker.location.address);
             if (geocodedPosition) {
               position = { lat: geocodedPosition.lat, lng: geocodedPosition.lng, address: worker.location.address };
             }
           }
           // Fallback if coordinates still invalid
           if (!isValidLatLng(position.lat, position.lng)) {
             position = { lat: center.lat, lng: center.lng, address: position.address || 'Windhoek, Namibia' };
           }
 
           let marker = markersRef.current.get(worker.id);
          if (!marker) {
            marker = new google.maps.Marker({
              position: { lat: position.lat, lng: position.lng },
              map,
              title: `${escapeHTML(worker.name)} - ${escapeHTML(worker.service)}`,
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

            // Lazily create a single InfoWindow and reuse it
            if (!infoWindowRef.current) {
              infoWindowRef.current = new google.maps.InfoWindow({ 
                maxWidth: 360,
                disableAutoPan: true,
                pixelOffset: new google.maps.Size(0, -14)
              });
              infoWindowRef.current.addListener('closeclick', () => {
                selectedIdRef.current = null;
              });
              infoWindowRef.current.addListener('domready', () => {
                const iwC = document.querySelector('.gm-style-iw-c') as HTMLElement | null;
                const iwD = document.querySelector('.gm-style-iw-d') as HTMLElement | null;
                if (iwC) {
                  iwC.style.padding = '0';
                  iwC.style.background = 'transparent';
                  iwC.style.borderRadius = '20px';
                  iwC.style.overflow = 'visible';
                }
                if (iwD) {
                  iwD.style.overflow = 'visible';
                }
              });
            }

            marker.addListener('click', () => {
               selectedIdRef.current = worker.id;
               const authContent = `
                 <style>
                   .hmb-card { width: min(92vw, 360px); background: hsl(var(--card)); color: hsl(var(--foreground)); border-radius: 16px; box-shadow: 0 12px 28px hsl(var(--foreground) / 0.12); padding: 12px; border: 1px solid hsl(var(--border)); }
                   .hmb-header { display:flex; gap:12px; align-items:center; }
                   .hmb-avatar { width:48px; height:48px; border-radius:9999px; object-fit:cover; border:1px solid hsl(var(--border)); background:hsl(var(--primary) / 0.12); display:flex; align-items:center; justify-content:center; font-weight:700; }
                   .hmb-title { font-weight:700; font-size:14px; line-height:1.3; color:hsl(var(--foreground)); margin:0; }
                   .hmb-sub { font-size:12px; line-height:1.3; color:hsl(var(--foreground)); margin:2px 0 0 0; }
                   .hmb-meta { margin-top:10px; }
                   .hmb-addr { font-size:11px; display:flex; align-items:center; gap:6px; margin:0; color:hsl(var(--foreground)); }
                   .hmb-actions { margin-top:10px; display:flex; gap:8px; }
                   .hmb-btn { padding:8px 10px; border-radius:8px; background:hsl(var(--primary)); color:hsl(var(--primary-foreground)); font-weight:600; font-size:12px; text-decoration:none; border:none; cursor:pointer; }
                 </style>
                 <div class="hmb-card">
                   <div class="hmb-header">
                     ${worker.profileImage ? 
                       `<img src="${safeUrl(worker.profileImage || '')}" alt="${escapeHTML(worker.name)}" class="hmb-avatar"/>` :
                       `<div class="hmb-avatar">${escapeHTML(worker.name.charAt(0) || '★')}</div>`
                     }
                     <div style="flex:1; min-width:0;">
                       <h3 class="hmb-title">${escapeHTML(worker.name)}</h3>
                       <p class="hmb-sub">${escapeHTML(worker.service)}</p>
                     </div>
                   </div>
                   <div class="hmb-meta">
                     <p class="hmb-addr"><span>📍</span><span>${escapeHTML(position.address)}</span></p>
                   </div>
                   <div class="hmb-actions">
                     <button onclick="window.selectWorker('${escapeJSString(worker.id)}')" class="hmb-btn">View Profile</button>
                   </div>
                 </div>`;
               
               const guestContent = `
                 <style>
                   .hmb-card { width: min(92vw, 360px); background: hsl(var(--card)); color: hsl(var(--foreground)); border-radius: 16px; box-shadow: 0 12px 28px hsl(var(--foreground) / 0.12); padding: 12px; border: 1px solid hsl(var(--border)); box-sizing: border-box; }
                   .hmb-header { display:flex; gap:12px; align-items:center; }
                   .hmb-avatar { width:48px; height:48px; border-radius:9999px; object-fit:cover; border:1px solid hsl(var(--border)); background:hsl(var(--primary) / 0.12); display:flex; align-items:center; justify-content:center; font-weight:700; }
                   .hmb-title { font-weight:700; font-size:14px; line-height:1.3; color:hsl(var(--foreground)); margin:0; }
                   .hmb-sub { font-size:12px; line-height:1.3; color:hsl(var(--foreground)); margin:2px 0 0 0; }
                   .hmb-actions { margin-top:10px; display:flex; gap:8px; }
                   .hmb-btn { padding:8px 10px; border-radius:8px; background:hsl(var(--primary)); color:hsl(var(--primary-foreground)); font-weight:600; font-size:12px; text-decoration:none; border:none; cursor:pointer; }
                 </style>
                 <div class="hmb-card">
                   <div class="hmb-header">
                     <div class="hmb-avatar">🔒</div>
                     <div style="flex:1; min-width:0;">
                       <h3 class="hmb-title">Login required</h3>
                       <p class="hmb-sub">Sign in to view provider details</p>
                     </div>
                   </div>
                   <div class="hmb-actions">
                     <a href="/auth" class="hmb-btn">Log in to view</a>
                   </div>
                 </div>`;
                 
               const content = isAuthenticated ? authContent : guestContent;
  
               infoWindowRef.current!.setContent(content);
               infoWindowRef.current!.open(map, marker!);
             });

            markersRef.current.set(worker.id, marker);
          } else {
            // Update marker position if changed
            marker.setPosition({ lat: position.lat, lng: position.lng });
          }

          // Keep info window as-is to avoid flicker on marker updates
        }
      };

      updateMarkersAsync();

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