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
import { GoogleMap } from '@/components/GoogleMap';
import { BackButton } from '@/hooks/useBackNavigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useServiceRatings, formatRating, renderStars } from '@/hooks/useServiceRatings';

interface Service {
  id: string;
  title: string;
  provider: string;
  description: string;
  price: string;
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
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get ratings for all services
  const serviceIds = services.map(service => service.id);
const { ratings } = useServiceRatings(serviceIds);
  const { session } = useAuth();

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
    if (session) {
      fetchServices();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchServices = async () => {
    try {
      // 1) Fetch services without joining profiles (RLS-safe)
      const { data: servicesData, error } = await supabase
        .from('services')
        .select(`
          *,
          category:service_categories (
            name
          )
        `)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching services:', error);
        return;
      }

      const serviceList = servicesData || [];
      const providerIds = Array.from(new Set(serviceList.map((s: any) => s.labourer_id).filter(Boolean)));

      // 2) Fetch safe provider details via RPC (no sensitive data, allowed by RLS)
      const { data: safeProfiles, error: safeErr } = await supabase.rpc('get_safe_profiles', {
        profile_ids: providerIds
      });
      if (safeErr) {
        console.error('Error fetching provider profiles:', safeErr);
      }

      const profileMap: Record<string, any> = {};
      (safeProfiles || []).forEach((p: any) => {
        profileMap[p.id] = p;
      });

      // Only include services where the provider exists and is verified
      const verifiedServices = serviceList.filter((s: any) => profileMap[s.labourer_id]?.is_verified);

      // Group services by provider
      const servicesByProvider = verifiedServices.reduce((acc: Record<string, any[]>, service: any) => {
        const providerId = service.labourer_id;
        if (!acc[providerId]) acc[providerId] = [];
        acc[providerId].push(service);
        return acc;
      }, {} as Record<string, any[]>);

      // Transform data to show one card per provider summarizing services
      const transformedServices: Service[] = Object.entries(servicesByProvider).map(([providerId, providerServices]) => {
        const primaryService: any = providerServices[0];
        const allServiceNames = (providerServices as any[]).map((s) => s.service_name).join(', ');
        const provider = profileMap[providerId];

        return {
          id: primaryService.id,
          title: (providerServices as any[]).length > 1 ? allServiceNames : primaryService.service_name,
          provider: provider?.full_name || 'Unknown Provider',
          description:
            (providerServices as any[]).length > 1
              ? `Offers ${(providerServices as any[]).length} services: ${allServiceNames}. ${primaryService.description}`
              : primaryService.description,
          price: primaryService.hourly_rate ? `N$${primaryService.hourly_rate}/hour` : 'Contact for pricing',
          location: provider?.location_text || provider?.town || 'Namibia',
          category: primaryService.category?.name?.toLowerCase() || 'general',
          availability: 'Available' as const,
          tags: ['professional', provider?.is_verified ? 'verified' : '']
            .filter(Boolean) as string[],
        };
      });

      setServices(transformedServices);

      // Build provider markers for the map view from providers with services
      const providerIdsWithServices = Object.keys(servicesByProvider);
      const uniqueProviders = providerIdsWithServices.map((providerId) => {
        const provider = profileMap[providerId];
        const providerServices = servicesByProvider[providerId];

        // Use town-based geocoding for accuracy; map component will refine if needed
        const lng = 17.0658; // Windhoek center placeholder triggers geocoding
        const lat = -22.5609;

        return {
          id: providerId,
          name: provider?.full_name || 'Unknown Provider',
          service: (providerServices as any[]).map((s) => s.service_name).join(', '),
          location: {
            lat,
            lng,
            address: provider?.location_text || (provider?.town ? `${provider.town}, Namibia` : 'Windhoek, Namibia'),
          },
          profileImage: provider?.avatar_url,
          services: providerServices,
          isVerified: !!provider?.is_verified,
        };
      });

      // Also include verified, active providers who currently have no active services
      const { data: verifiedProfiles, error: verifiedErr } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, town, location_text, is_verified, is_active, user_type')
        .in('user_type', ['labourer', 'both'])
        .eq('is_verified', true)
        .eq('is_active', true);
      if (verifiedErr) {
        console.warn('Could not fetch verified profiles without services:', verifiedErr);
      }
      const providersWithMarkersSet = new Set(providerIdsWithServices);
      const additionalVerifiedProviders = (verifiedProfiles || [])
        .filter((p: any) => !providersWithMarkersSet.has(p.id))
        .map((p: any) => ({
          id: p.id,
          name: p.full_name || 'Verified Provider',
          service: 'Service Provider',
          location: {
            lat: -22.5609,
            lng: 17.0658,
            address: p.location_text || (p.town ? `${p.town}, Namibia` : 'Namibia'),
          },
          profileImage: p.avatar_url,
          services: [],
          isVerified: true,
        }));

      setProviders([...uniqueProviders, ...additionalVerifiedProviders]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  // NLP-style keyword expansion for search
  const synonymMap: Record<string, string[]> = {
    catering: ['food', 'cooking', 'chef', 'kitchen', 'cater'],
    'tech support': ['it', 'computer', 'software', 'hardware', 'tech', 'pc', 'laptop', 'repairs'],
    it: ['tech', 'computer', 'software', 'hardware', 'pc', 'laptop', 'repairs'],
    plumbing: ['pipes', 'leak', 'toilet', 'bathroom', 'sink', 'drain'],
    electrical: ['wiring', 'power', 'lights', 'electrician', 'circuit'],
  };

  const expandKeywords = (q: string): string[] => {
    if (!q.trim()) return [];
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    const expanded = new Set<string>();
    tokens.forEach((t) => {
      expanded.add(t);
      // include mapped synonyms
      Object.entries(synonymMap).forEach(([key, synonyms]) => {
        if (t.includes(key) || key.includes(t) || synonyms.some(s => t.includes(s) || s.includes(t))) {
          expanded.add(key);
          synonyms.forEach(s => expanded.add(s));
        }
      });
    });
    return Array.from(expanded);
  };

  const keywords = expandKeywords(searchQuery);

  const filteredServices = services.filter(service => {
    const haystack = `${service.title} ${service.description} ${service.provider} ${service.category}`.toLowerCase();
    const matchesSearch = keywords.length === 0 || keywords.some(k => haystack.includes(k));
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || 
                           service.location.toLowerCase() === selectedLocation.replace('-', ' ');
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const sortedServices = filteredServices.sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        // Sort by rating using the ratings data
        const ratingA = ratings[a.id]?.averageRating || 0;
        const ratingB = ratings[b.id]?.averageRating || 0;
        return ratingB - ratingA;
      case 'price':
        return parseInt(a.price.replace(/[^\d]/g, '')) - parseInt(b.price.replace(/[^\d]/g, ''));
      case 'reviews':
        const reviewsA = ratings[a.id]?.reviewCount || 0;
        const reviewsB = ratings[b.id]?.reviewCount || 0;
        return reviewsB - reviewsA;
      default:
        return 0;
    }
  });

  const handleServiceClick = (service: Service) => {
    navigate(`/services/${service.category}/${service.id}`);
  };

if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Login required</h1>
          <p className="text-muted-foreground mb-6">Please log in to browse services and view providers.</p>
          <Button className="btn-sunset" onClick={() => navigate('/auth')}>Log in</Button>
        </main>
        <Footer />
      </div>
    );
  }

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
                              {renderStars(ratings[service.id]?.averageRating, 'sm')}
                              <span className="text-sm font-medium">
                                {formatRating(ratings[service.id]?.averageRating, ratings[service.id]?.reviewCount || 0)}
                              </span>
                              {ratings[service.id]?.reviewCount > 0 && (
                                <span className="text-sm text-muted-foreground">
                                  ({ratings[service.id]?.reviewCount} review{ratings[service.id]?.reviewCount !== 1 ? 's' : ''})
                                </span>
                              )}
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
            <GoogleMap 
              workers={providers} 
              isAuthenticated={!!session}
              onWorkerSelect={(worker) => {
                // Find the first service for this worker to navigate to
                const workerService = services.find(service => 
                  service.provider === worker.name
                );
                if (workerService) {
                  navigate(`/services/${workerService.category}/${workerService.id}`);
                } else {
                  // If no service found, navigate to browse with the worker's service category
                  const category = worker.service.toLowerCase().replace(/\s+/g, '-');
                  navigate(`/services/${category}`);
                }
              }}
              className="w-full h-[600px]"
            />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default BrowseServicesPage;