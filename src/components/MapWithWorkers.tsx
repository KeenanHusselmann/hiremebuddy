import React, { useState, useEffect } from 'react';
import { GoogleMap } from './GoogleMap';
import { LocationSearch } from './LocationSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Filter, List, Map as MapIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Worker {
  id: string;
  name: string;
  service: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  profileImage?: string;
  availability: 'available' | 'busy' | 'offline';
  experience: string;
  verified: boolean;
}

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface MapWithWorkersProps {
  onWorkerSelect?: (worker: Worker) => void;
}

// Mock workers data for Windhoek
const MOCK_WORKERS: Worker[] = [
  {
    id: '1',
    name: 'Johannes Shikongo',
    service: 'Plumber',
    rating: 4.8,
    reviewCount: 23,
    hourlyRate: 200,
    location: {
      lat: -22.5570,
      lng: 17.0835,
      address: 'Klein Windhoek, Windhoek'
    },
    availability: 'available',
    experience: '8 years',
    verified: true
  },
  {
    id: '2',
    name: 'Maria Nakamhela',
    service: 'House Cleaning',
    rating: 4.9,
    reviewCount: 45,
    hourlyRate: 120,
    location: {
      lat: -22.5445,
      lng: 17.0758,
      address: 'Eros, Windhoek'
    },
    availability: 'available',
    experience: '5 years',
    verified: true
  },
  {
    id: '3',
    name: 'Thomas Amukwaya',
    service: 'Electrician',
    rating: 4.7,
    reviewCount: 32,
    hourlyRate: 250,
    location: {
      lat: -22.5789,
      lng: 17.0442,
      address: 'Pioneerspark, Windhoek'
    },
    availability: 'busy',
    experience: '12 years',
    verified: true
  },
  {
    id: '4',
    name: 'Helena Iipinge',
    service: 'Garden Services',
    rating: 4.6,
    reviewCount: 18,
    hourlyRate: 150,
    location: {
      lat: -22.5523,
      lng: 17.0923,
      address: 'Ludwigsdorf, Windhoek'
    },
    availability: 'available',
    experience: '6 years',
    verified: false
  },
  {
    id: '5',
    name: 'Andreas Katjiuongua',
    service: 'Carpenter',
    rating: 4.9,
    reviewCount: 28,
    hourlyRate: 220,
    location: {
      lat: -22.5198,
      lng: 17.0532,
      address: 'Olympia, Windhoek'
    },
    availability: 'available',
    experience: '10 years',
    verified: true
  }
];

export const MapWithWorkers: React.FC<MapWithWorkersProps> = ({ onWorkerSelect }) => {
  const [workers, setWorkers] = useState<Worker[]>(MOCK_WORKERS);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>(MOCK_WORKERS);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(5); // km
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [mapCenter, setMapCenter] = useState({ lat: -22.5609, lng: 17.0658 });

  // Get unique services
  const services = [...new Set(workers.map(w => w.service))];

  useEffect(() => {
    let filtered = workers;

    // Filter by service
    if (serviceFilter !== 'all') {
      filtered = filtered.filter(worker => worker.service === serviceFilter);
    }

    // Filter by availability
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(worker => worker.availability === availabilityFilter);
    }

    // Filter by location radius
    if (selectedLocation) {
      filtered = filtered.filter(worker => {
        const distance = calculateDistance(
          selectedLocation.lat,
          selectedLocation.lng,
          worker.location.lat,
          worker.location.lng
        );
        return distance <= searchRadius;
      });
    }

    setFilteredWorkers(filtered);
  }, [workers, serviceFilter, availabilityFilter, selectedLocation, searchRadius]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setMapCenter({ lat: location.lat, lng: location.lng });
  };

  const handleWorkerSelect = (worker: Worker) => {
    if (onWorkerSelect) {
      onWorkerSelect(worker);
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Find Workers Near You</span>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <MapIcon className="h-4 w-4 mr-1" />
                Map
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LocationSearch 
            onLocationSelect={handleLocationSelect}
            placeholder="Search for a location in Windhoek..."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {services.map(service => (
                  <SelectItem key={service} value={service}>{service}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>

            <Select value={searchRadius.toString()} onValueChange={(value) => setSearchRadius(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 km</SelectItem>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="20">20 km</SelectItem>
                <SelectItem value="50">All Windhoek</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              {filteredWorkers.length} workers found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map or List View */}
      {viewMode === 'map' ? (
        <Card>
          <CardContent className="p-0">
            <GoogleMap
              workers={filteredWorkers}
              onWorkerSelect={handleWorkerSelect}
              center={mapCenter}
              zoom={selectedLocation ? 13 : 12}
              className="w-full h-[500px] rounded-lg"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredWorkers.map(worker => (
            <Card key={worker.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {worker.profileImage ? (
                      <img 
                        src={worker.profileImage} 
                        alt={worker.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                        {worker.name[0]}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{worker.name}</h3>
                        {worker.verified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                        <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(worker.availability)}`} />
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{worker.service}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{worker.rating}</span>
                          <span className="text-muted-foreground">({worker.reviewCount})</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{worker.location.address}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-lg font-semibold">N${worker.hourlyRate}</span>
                          <span className="text-sm text-muted-foreground">/hour</span>
                        </div>
                        
                        <Button 
                          onClick={() => handleWorkerSelect(worker)}
                          size="sm"
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredWorkers.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No workers found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search in a different area.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default MapWithWorkers;