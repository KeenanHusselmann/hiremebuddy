import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Star, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { FacebookMarketplace } from '@/components/FacebookMarketplace';
import { MapWithWorkers } from '@/components/MapWithWorkers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const categories = [
    'all', 'plumbing', 'electrical', 'carpentry', 'painting', 
    'gardening', 'home-repairs', 'automotive', 'tech-support', 
    'photography', 'catering', 'tailoring', 'construction'
  ];

  const locations = [
    'all', 'windhoek', 'swakopmund', 'walvis-bay', 'oshakati', 
    'rundu', 'katima-mulilo', 'keetmanshoop', 'otjiwarongo'
  ];

  // Mock services data
  const services: Service[] = [
    {
      id: '1',
      title: 'Professional Plumbing Services',
      provider: 'Johannes Mwandingi',
      description: 'Expert plumber with 10+ years experience. Specializing in pipe repairs, installations, and emergency fixes.',
      price: 'N$300/hour',
      rating: 4.8,
      reviewCount: 24,
      location: 'Windhoek',
      category: 'plumbing',
      availability: 'Available',
      tags: ['emergency-service', 'licensed', 'insured']
    },
    {
      id: '2',
      title: 'Electrical Installations & Repairs',
      provider: 'Maria Nghishikwa',
      description: 'Certified electrician offering residential and commercial electrical services.',
      price: 'N$400/hour',
      rating: 4.9,
      reviewCount: 18,
      location: 'Windhoek',
      category: 'electrical',
      availability: 'Available',
      tags: ['certified', 'commercial', 'residential']
    },
    {
      id: '3',
      title: 'Custom Carpentry & Woodwork',
      provider: 'David Uushona',
      description: 'Skilled carpenter creating custom furniture, cabinets, and home installations.',
      price: 'N$250/hour',
      rating: 4.7,
      reviewCount: 31,
      location: 'Swakopmund',
      category: 'carpentry',
      availability: 'Busy',
      tags: ['custom-work', 'furniture', 'installations']
    },
    {
      id: '4',
      title: 'Interior & Exterior Painting',
      provider: 'Anna Shifiona',
      description: 'Professional painter with eye for detail. Quality work guaranteed.',
      price: 'N$200/hour',
      rating: 4.6,
      reviewCount: 15,
      location: 'Walvis Bay',
      category: 'painting',
      availability: 'Available',
      tags: ['interior', 'exterior', 'quality-guaranteed']
    },
    {
      id: '5',
      title: 'Garden Design & Maintenance',
      provider: 'Peter Haikela',
      description: 'Landscape designer offering complete garden solutions and maintenance.',
      price: 'N$180/hour',
      rating: 4.5,
      reviewCount: 22,
      location: 'Windhoek',
      category: 'gardening',
      availability: 'Available',
      tags: ['landscaping', 'maintenance', 'design']
    }
  ];

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
        {/* Page Header */}
        <div className="mb-8">
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
            Showing {sortedServices.length} service{sortedServices.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
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

            {/* No Results */}
            {sortedServices.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No services found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse all services
                </p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
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
          </TabsContent>

          <TabsContent value="map">
            <MapWithWorkers 
              onWorkerSelect={(worker) => {
                // Navigate to worker profile or service detail
                navigate(`/services/${worker.service.toLowerCase()}/${worker.id}`);
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