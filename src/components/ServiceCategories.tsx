import { 
  Wrench, 
  Zap, 
  Hammer, 
  Paintbrush, 
  Trees, 
  Home,
  Car,
  Laptop,
  Camera,
  ChefHat,
  Scissors,
  Building
} from 'lucide-react';

const ServiceCategories = () => {
  const categories = [
    {
      icon: Wrench,
      title: 'Plumbing',
      description: 'Pipe repairs, installations, and maintenance',
      count: '50+ Providers'
    },
    {
      icon: Zap,
      title: 'Electrical',
      description: 'Wiring, installations, and electrical repairs',
      count: '35+ Providers'
    },
    {
      icon: Hammer,
      title: 'Carpentry',
      description: 'Furniture, cabinets, and woodwork',
      count: '40+ Providers'
    },
    {
      icon: Paintbrush,
      title: 'Painting',
      description: 'Interior and exterior painting services',
      count: '25+ Providers'
    },
    {
      icon: Trees,
      title: 'Gardening',
      description: 'Landscaping, maintenance, and design',
      count: '30+ Providers'
    },
    {
      icon: Home,
      title: 'Home Repairs',
      description: 'General maintenance and repair services',
      count: '45+ Providers'
    },
    {
      icon: Car,
      title: 'Automotive',
      description: 'Vehicle repairs and maintenance',
      count: '20+ Providers'
    },
    {
      icon: Laptop,
      title: 'Tech Support',
      description: 'Computer and device repairs',
      count: '15+ Providers'
    },
    {
      icon: Camera,
      title: 'Photography',
      description: 'Event and portrait photography',
      count: '12+ Providers'
    },
    {
      icon: ChefHat,
      title: 'Catering',
      description: 'Food preparation and catering services',
      count: '18+ Providers'
    },
    {
      icon: Scissors,
      title: 'Tailoring',
      description: 'Clothing alterations and custom tailoring',
      count: '10+ Providers'
    },
    {
      icon: Building,
      title: 'Construction',
      description: 'Building and renovation services',
      count: '25+ Providers'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-background/50 to-background">
      <div className="container-responsive">
        <div className="text-center mb-12 slide-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Popular Service Categories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover skilled professionals across various trades and services. 
            From essential repairs to creative projects, find the right expert for your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            const categorySlug = category.title.toLowerCase().replace(/\s+/g, '-');
            return (
              <div
                key={category.title}
                className="service-card group cursor-pointer fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => window.location.href = `/services/${categorySlug}`}
              >
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-sunset rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {category.description}
                </p>
                
                <div className="pt-3 border-t border-glass-border/30">
                  <span className="text-xs text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
                    {category.count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <button 
            className="btn-glass px-8 py-3 text-lg hover:scale-105 transition-transform duration-200"
            onClick={() => window.location.href = '/browse'}
          >
            View All Services
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;