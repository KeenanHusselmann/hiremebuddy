import { Star, MapPin, Phone, MessageCircle, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeaturedWorkers = () => {
  const workers = [
    {
      id: 1,
      name: 'Johannes Hamutenya',
      profession: 'Master Electrician',
      location: 'Windhoek',
      rating: 4.9,
      reviewCount: 47,
      hourlyRate: 150,
      description: 'Certified electrician with 15+ years experience in residential and commercial projects.',
      specialties: ['Wiring', 'Solar Installation', 'Repairs'],
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      responseTime: '< 2 hours',
      completedJobs: 120
    },
    {
      id: 2,
      name: 'Maria Shikongo',
      profession: 'Plumbing Specialist',
      location: 'Walvis Bay',
      rating: 4.8,
      reviewCount: 32,
      hourlyRate: 120,
      description: 'Expert plumber specializing in bathroom renovations and emergency repairs.',
      specialties: ['Pipe Installation', 'Bathroom Renovation', 'Emergency Repairs'],
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      responseTime: '< 1 hour',
      completedJobs: 85
    },
    {
      id: 3,
      name: 'David Kapenda',
      profession: 'Master Carpenter',
      location: 'Oshakati',
      rating: 5.0,
      reviewCount: 28,
      hourlyRate: 180,
      description: 'Creative carpenter crafting custom furniture and home improvements.',
      specialties: ['Custom Furniture', 'Kitchen Cabinets', 'Renovations'],
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      responseTime: '< 3 hours',
      completedJobs: 67
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : index < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-background/80">
      <div className="container-responsive">
        <div className="text-center mb-12 slide-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Skilled Workers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet some of our top-rated professionals who consistently deliver 
            excellent service and build lasting relationships with clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workers.map((worker, index) => (
            <div
              key={worker.id}
              className="glass-card p-6 hover:shadow-large transition-all duration-300 fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Header */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="relative">
                  <img
                    src={worker.avatar}
                    alt={worker.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                  />
                  {worker.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">{worker.name}</h3>
                  <p className="text-primary font-medium">{worker.profession}</p>
                  <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {worker.location}
                  </div>
                </div>
              </div>

              {/* Rating and Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {renderStars(worker.rating)}
                  </div>
                  <span className="text-sm font-medium text-foreground">{worker.rating}</span>
                  <span className="text-sm text-muted-foreground">({worker.reviewCount})</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">N${worker.hourlyRate}/hr</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {worker.description}
              </p>

              {/* Specialties */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {worker.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/20 rounded-lg">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{worker.completedJobs}</p>
                  <p className="text-xs text-muted-foreground">Jobs Done</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">{worker.responseTime}</p>
                  <p className="text-xs text-muted-foreground">Response Time</p>
                </div>
              </div>

              {/* Contact Options */}
              <div className="space-y-3">
                <Button className="w-full btn-sunset">
                  Book Service
                </Button>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center">Or contact us using</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-blue-800 hover:bg-blue-900 text-white p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button className="btn-glass px-8 py-3 text-lg">
            View All Professionals
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedWorkers;