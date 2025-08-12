import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ServiceCategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category) {
      fetchCategoryServices();
    }
  }, [category]);

  const fetchCategoryServices = async () => {
    try {
      // Map common slugs to category name patterns in DB
      const slug = (category || '').toLowerCase();
      const namePatterns: string[] = [];
      if (slug === 'tech-support') {
        namePatterns.push('%it%','%tech%');
      } else {
        namePatterns.push(`%${slug}%`);
      }

      // 1) Fetch services with category filter only (no profiles join)
      let baseQuery = supabase
        .from('services')
        .select(`
          *,
          category:service_categories!inner (
            name
          )
        `)
        .eq('is_active', true);

      // Apply OR filters for multiple patterns against joined category name
      const orFilters = namePatterns.map(p => `service_categories.name.ilike.${p}`).join(',');
      const { data: servicesData, error } = await baseQuery.or(orFilters);
      if (error) throw error;

      const serviceList = servicesData || [];
      const providerIds = Array.from(new Set(serviceList.map((s: any) => s.labourer_id).filter(Boolean)));

      // 2) Fetch safe provider details via RPC
      const { data: safeProfiles, error: safeErr } = await supabase.rpc('get_safe_profiles', {
        profile_ids: providerIds
      });
      if (safeErr) throw safeErr;
      const profileMap: Record<string, any> = {};
      (safeProfiles || []).forEach((p: any) => { profileMap[p.id] = p; });

      // 3) Only keep services with verified providers and attach minimal labourer info
      const withProviders = serviceList
        .filter((s: any) => profileMap[s.labourer_id]?.is_verified)
        .map((s: any) => ({
          ...s,
          labourer: {
            full_name: profileMap[s.labourer_id]?.full_name,
            town: profileMap[s.labourer_id]?.town,
          },
        }));

      setServices(withProviders);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };
  const categoryInfo = {
    plumbing: {
      title: 'Plumbing Services',
      description: 'Professional plumbers for all your water and pipe needs',
      icon: '🔧',
      services: [
        'Pipe Repairs & Installations',
        'Drain Cleaning & Unblocking',
        'Water Heater Services',
        'Bathroom Renovations',
        'Kitchen Plumbing',
        'Emergency Plumbing',
        'Leak Detection & Repair',
        'Toilet & Faucet Installation'
      ]
    },
    electrical: {
      title: 'Electrical Services',
      description: 'Certified electricians for safe and reliable electrical work',
      icon: '⚡',
      services: [
        'Electrical Installations',
        'Wiring & Rewiring',
        'Circuit Breaker Repairs',
        'Lighting Installation',
        'Electrical Inspections',
        'Generator Installation',
        'Solar Panel Setup',
        'Emergency Electrical Repairs'
      ]
    },
    carpentry: {
      title: 'Carpentry Services',
      description: 'Skilled carpenters for custom woodwork and installations',
      icon: '🔨',
      services: [
        'Custom Furniture',
        'Kitchen Cabinets',
        'Built-in Wardrobes',
        'Wooden Flooring',
        'Door & Window Frames',
        'Deck Construction',
        'Furniture Repairs',
        'Wooden Shelving'
      ]
    },
    painting: {
      title: 'Painting Services',
      description: 'Professional painters for interior and exterior projects',
      icon: '🎨',
      services: [
        'Interior Painting',
        'Exterior Painting',
        'Wall Preparation',
        'Decorative Painting',
        'Commercial Painting',
        'Fence Painting',
        'Roof Painting',
        'Paint removal'
      ]
    },
    gardening: {
      title: 'Gardening Services',
      description: 'Garden maintenance and landscaping professionals',
      icon: '🌳',
      services: [
        'Garden Design',
        'Lawn Mowing',
        'Tree Trimming',
        'Plant Installation',
        'Irrigation Systems',
        'Garden Cleanup',
        'Landscaping',
        'Pest Control'
      ]
    },
    'home-repairs': {
      title: 'Home Repair Services',
      description: 'General maintenance and repair services for your home',
      icon: '🏠',
      services: [
        'General Handyman',
        'Appliance Repairs',
        'Ceiling Repairs',
        'Wall Patching',
        'Minor Plumbing',
        'Basic Electrical',
        'Furniture Assembly',
        'Home Maintenance'
      ]
    },
    automotive: {
      title: 'Automotive Services',
      description: 'Vehicle maintenance and repair specialists',
      icon: '🚗',
      services: [
        'Car Servicing',
        'Engine Repairs',
        'Brake Services',
        'Tire Changes',
        'Battery Replacement',
        'Air Conditioning',
        'Transmission Repairs',
        'Mobile Mechanic'
      ]
    },
    'tech-support': {
      title: 'Tech Support Services',
      description: 'Computer and device repair specialists',
      icon: '💻',
      services: [
        'Computer Repairs',
        'Laptop Servicing',
        'Phone Repairs',
        'Data Recovery',
        'Software Installation',
        'Network Setup',
        'Virus Removal',
        'Hardware Upgrades'
      ]
    },
    photography: {
      title: 'Photography Services',
      description: 'Professional photographers for all occasions',
      icon: '📷',
      services: [
        'Wedding Photography',
        'Event Photography',
        'Portrait Sessions',
        'Commercial Photography',
        'Product Photography',
        'Real Estate Photography',
        'Family Photos',
        'Corporate Events'
      ]
    },
    catering: {
      title: 'Catering Services',
      description: 'Food preparation and catering for events',
      icon: '👨‍🍳',
      services: [
        'Event Catering',
        'Wedding Catering',
        'Corporate Catering',
        'Private Chef',
        'Meal Preparation',
        'Buffet Services',
        'Traditional Cuisine',
        'Special Diets'
      ]
    },
    tailoring: {
      title: 'Tailoring Services',
      description: 'Custom clothing and alteration services',
      icon: '✂️',
      services: [
        'Clothing Alterations',
        'Custom Suits',
        'Dress Making',
        'Hem Adjustments',
        'Zipper Repairs',
        'Traditional Wear',
        'Uniform Making',
        'Fabric Repairs'
      ]
    },
    construction: {
      title: 'Construction Services',
      description: 'Building and renovation specialists',
      icon: '🏗️',
      services: [
        'Home Renovations',
        'Room Additions',
        'Roofing Services',
        'Foundation Work',
        'Concrete Work',
        'Masonry',
        'Demolition',
        'Project Management'
      ]
    }
  };

  const currentCategory = categoryInfo[category as keyof typeof categoryInfo];

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested service category doesn't exist.</p>
          <Button onClick={() => navigate('/browse')}>Browse All Services</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const filteredServices = currentCategory.services.filter(service =>
    service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/browse')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Browse
        </Button>

        {/* Category Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{currentCategory.icon}</div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {currentCategory.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {currentCategory.description}
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search specific services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading providers...</p>
          </div>
        ) : (
          <>
            {/* Service Providers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {services.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-4">No Providers Currently</h3>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Be the first to offer {currentCategory.title.toLowerCase()} on our platform! Register as a service provider and start connecting with clients.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      className="btn-sunset px-8 py-3"
                      onClick={() => navigate('/auth')}
                    >
                      Register as Provider
                    </Button>
                    <Button 
                      className="btn-glass px-8 py-3"
                      onClick={() => navigate('/browse')}
                    >
                      Browse Other Categories
                    </Button>
                  </div>
                </div>
              ) : (
                services
                  .filter(service => 
                    searchQuery === '' || 
                    service.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    service.labourer?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((service) => (
                    <Card 
                      key={service.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => navigate(`/service/${service.id}`)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{service.service_name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{service.labourer?.full_name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-muted-foreground">📍 {service.labourer?.town}</span>
                            </div>
                            {service.hourly_rate && (
                              <div className="text-right">
                                <span className="text-sm font-semibold text-primary">
                                  N${service.hourly_rate}/hr
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">4.8 (24 reviews)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>

            {/* No Search Results */}
            {services.length > 0 && services.filter(service => 
              searchQuery === '' || 
              service.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              service.labourer?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No providers found</h3>
                <p className="text-muted-foreground mb-4">
                  Try a different search term or browse all {category} providers
                </p>
                <Button onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              </div>
            )}

            {/* Call to Action */}
            {services.length > 0 && (
              <div className="text-center bg-gradient-to-r from-primary/10 to-sunset-accent/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">Ready to book a provider?</h2>
                <p className="text-muted-foreground mb-6">
                  Connect with {currentCategory.title.toLowerCase()} specialists in your area
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate(`/browse?category=${category}`)}
                    className="btn-sunset"
                  >
                    View All {currentCategory.title}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/browse')}
                  >
                    Browse Other Categories
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ServiceCategoryPage;