import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { FacebookMarketplace } from '@/components/FacebookMarketplace';
import ServiceProviderMap from '@/components/ServiceProviderMap';
import { BackButton } from '@/hooks/useBackNavigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: string;
  title: string;
  provider: string;
  description: string;
  price: string;
  rating: number;
  reviewCount: number;
  location: string;
  category: string;
  availability: 'Available' | 'Busy' | 'Booked';
  tags: string[];
}

const BrowseServicesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    'all', 'plumbing', 'electrical', 'carpentry', 'painting', 
    'gardening', 'home-repairs', 'automotive', 'tech-support', 
    'photography', 'catering', 'tailoring', 'construction'
  ];

  const locations = [
    'all', 'windhoek', 'swakopmund', 'walvis-bay', 'oshakati', 
    'rundu', 'katima-mulilo', 'keetmanshoop', 'otjiwarongo'
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          labourer:profiles!labourer_id (
            id,
            full_name,
            town,
            contact_number,
            is_verified
          ),
          category:service_categories (
            name
          )
        `)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching services:', error);
        return;
      }

      // Filter out services from unverified providers
      const verifiedServices = (data || []).filter(service => service.labourer?.is_verified === true);
      
      // Transform data to match the interface
      const transformedServices: Service[] = verifiedServices.map(service => ({
        id: service.id,
        title: service.service_name,
        provider: service.labourer?.full_name || 'Unknown Provider',
        description: service.description,
        price: service.hourly_rate ? `N$${service.hourly_rate}/hour` : 'Contact for pricing',
        rating: 5.0, // Default for new services
        reviewCount: 0, // Default for new services
        location: service.labourer?.town || 'Unknown Location',
        category: service.category?.name?.toLowerCase() || 'general',
        availability: 'Available',
        tags: ['professional', 'verified']
      }));

      setServices(transformedServices);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || 
                           service.location.toLowerCase() === selectedLocation.replace('-', ' ');
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const sortedServices = filteredServices.sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        return parseInt(a.price.replace(/[^\d]/g, '')) - parseInt(b.price.replace(/[^\d]/g, ''));
      case 'reviews':
        return b.reviewCount - a.reviewCount;
      default:
        return 0;
    }
  });

  const handleServiceClick = (service: Service) => {
    navigate(`/services/${service.category}/${service.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button and Header */}
        <div className="mb-8">
          <BackButton fallbackPath="/" className="mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-4">Browse Services</h1>
          <p className="text-xl text-muted-foreground">
            Discover skilled professionals for all your needs
          </p>
        </div>

        {/* Browse Mode Tabs */}
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:w-auto">
            <TabsTrigger value="list">Service List</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search services, providers, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Filters */}
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location === 'all' ? 'All Locations' : location.charAt(0).toUpperCase() + location.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="reviews">Reviews</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                {loading ? 'Loading services...' : `Showing ${sortedServices.length} service${sortedServices.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading services...</p>
              </div>
            ) : sortedServices.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Providers Currently</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to offer your services on our platform!
                </p>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="btn-sunset"
                >
                  Register as Service Provider
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                  {/* Services Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sortedServices.map((service) => (
                      <Card 
                        key={service.id} 
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                        onClick={() => handleServiceClick(service)}
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start mb-2">
                            <Badge 
                              variant={service.availability === 'Available' ? 'default' : service.availability === 'Busy' ? 'secondary' : 'destructive'}
                            >
                              {service.availability}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{service.rating}</span>
                              <span className="text-sm text-muted-foreground">({service.reviewCount})</span>
                            </div>
                          </div>
                          <CardTitle className="text-xl">{service.title}</CardTitle>
                          <CardDescription className="text-lg font-semibold text-primary">
                            {service.provider}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {service.description}
                          </p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{service.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-semibold text-primary">{service.price}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {service.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag.replace('-', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Filters */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Filter Services</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            <SelectItem value="windhoek">Windhoek</SelectItem>
                            <SelectItem value="swakopmund">Swakopmund</SelectItem>
                            <SelectItem value="oshakati">Oshakati</SelectItem>
                            <SelectItem value="rundu">Rundu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        onClick={() => {
                          setSelectedLocation('all');
                        }}
                        variant="outline" 
                        className="w-full"
                      >
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Facebook Marketplace Integration */}
                  <FacebookMarketplace />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            <ServiceProviderMap 
              onProviderSelect={(provider) => {
                // Navigate to provider profile
                navigate(`/profile/${provider.id}`);
              }}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default BrowseServicesPage;