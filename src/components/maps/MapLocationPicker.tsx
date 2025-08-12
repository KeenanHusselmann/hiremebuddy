/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Target, Satellite, Move } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC0qcSxvBv534pnfD5YvNimZlw8RbzTBCI';
const WINDHOEK_CENTER = { lat: -22.5609, lng: 17.0658 };

export interface PickedLocation {
  lat: number;
  lng: number;
  address: string;
}

interface PickerInnerProps {
  initial?: { lat: number; lng: number } | null;
  onConfirm: (loc: PickedLocation) => void;
}

const PickerInner: React.FC<PickerInnerProps> = ({ initial, onConfirm }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(initial || null);
  const [address, setAddress] = useState<string>('Pin a spot to select an address');
  const [tracking, setTracking] = useState(false);
  const [locating, setLocating] = useState(false);
  const watchId = useRef<number | null>(null);
  const { toast } = useToast();

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('reverse-geocode', { body: { lat, lng } });
      if (error) throw error as any;
      const addr = (data as any)?.address as string | undefined;
      setAddress(addr || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } catch (e) {
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const placeMarker = (pos: { lat: number; lng: number }) => {
    if (!map.current) return;
    if (marker.current) {
      marker.current.setPosition(pos);
    } else {
      marker.current = new google.maps.Marker({
        position: pos,
        map: map.current,
        draggable: true,
        title: 'Selected location',
      });
      marker.current.addListener('dragend', () => {
        const p = marker.current!.getPosition();
        if (!p) return;
        const loc = { lat: p.lat(), lng: p.lng() };
        setSelected(loc);
        reverseGeocode(loc.lat, loc.lng);
      });
    }
    map.current.setCenter(pos);
  };

  useEffect(() => {
    if (mapRef.current && !map.current) {
      map.current = new google.maps.Map(mapRef.current, {
        center: initial || WINDHOEK_CENTER,
        zoom: 16,
        streetViewControl: true,
        mapTypeControl: true,
        fullscreenControl: true,
      });

      map.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const loc = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setSelected(loc);
        placeMarker(loc);
        reverseGeocode(loc.lat, loc.lng);
      });

      // Try to center on current position initially
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setSelected(loc);
            placeMarker(loc);
            reverseGeocode(loc.lat, loc.lng);
          },
          async () => {
            // Fallback via server-side Google Geolocation API
            await fallbackGeolocate();
          },
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
      } else {
        // No geolocation available: try server-side fallback
        fallbackGeolocate();
      }
    }
  }, [initial]);

  const fallbackGeolocate = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('geolocate', { body: {} });
      if (error) throw error as any;
      const loc = (data as any)?.location ?? (data as any);
      if (loc?.lat && loc?.lng) {
        const pos = { lat: Number(loc.lat), lng: Number(loc.lng) };
        setSelected(pos);
        placeMarker(pos);
        reverseGeocode(pos.lat, pos.lng);
        return true;
      }
    } catch (e) {}
    return false;
  };

  const recenterToMe = () => {
    if (!navigator.geolocation) {
      setLocating(true);
      fallbackGeolocate().then((ok) => {
        setLocating(false);
        if (!ok) {
          toast({ title: 'Location unavailable', description: 'Geolocation not supported. Try opening the map in a new tab or search manually.', variant: 'destructive' });
        }
      });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setSelected(loc);
        placeMarker(loc);
        reverseGeocode(loc.lat, loc.lng);
        setLocating(false);
      },
      async (err) => {
        const ok = await fallbackGeolocate();
        setLocating(false);
        if (!ok) {
          let msg = 'Unable to get your position.';
          if ((err as any)?.code === 1) msg = 'Permission denied for location. Please allow access.';
          else if ((err as any)?.code === 2) msg = 'Position unavailable. Check your connection.';
          else if ((err as any)?.code === 3) msg = 'Location request timed out. Try again.';
          toast({ title: 'Location error', description: msg, variant: 'destructive' });
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const toggleTracking = (val: boolean) => {
    setTracking(val);
    if (val) {
      if (!navigator.geolocation) return;
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setSelected(loc);
          placeMarker(loc);
          reverseGeocode(loc.lat, loc.lng);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
      );
    } else if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-3 flex flex-col gap-3">
          <div className="text-sm">
            <div className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {address}
            </div>
            {selected && (
              <div className="text-muted-foreground text-xs mt-1">
                {selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={recenterToMe} disabled={locating}>
              <Target className="h-4 w-4 mr-1" />
              {locating ? 'Getting…' : 'My location'}
            </Button>
            <div className="flex items-center gap-2 ml-auto text-sm">
              <Satellite className="h-4 w-4" /> Track live
              <Switch checked={tracking} onCheckedChange={toggleTracking} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div ref={mapRef} className="w-full h-80 rounded-md border" />

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Move className="h-3 w-3" /> Tap map or drag the pin to fine-tune.
        </div>
        <Button
          type="button"
          disabled={!selected}
          onClick={() => {
            if (!selected) return;
            onConfirm({ lat: selected.lat, lng: selected.lng, address });
          }}
        >
          Use this location
        </Button>
      </div>
    </div>
  );
};

interface MapLocationPickerProps {
  initial?: { lat: number; lng: number } | null;
  onConfirm: (loc: PickedLocation) => void;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ initial = null, onConfirm }) => {
  return (
    <Wrapper apiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <PickerInner initial={initial} onConfirm={onConfirm} />
    </Wrapper>
  );
};

export default MapLocationPicker;
