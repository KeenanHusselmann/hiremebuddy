import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

const ServiceCategories = () => {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
  const fetchCategoryCounts = async () => {
      try {
        // Get counts by category
        const { data: categoryData, error: categoryError } = await supabase
          .from('service_categories')
          .select(`
            name,
            services(count),
            service_subcategories(
              services(count)
            )
          `);

        if (categoryError) {
          console.error('Error fetching category counts:', categoryError);
          return;
        }

        const counts: Record<string, number> = {};
        categoryData?.forEach((category: any) => {
          // Count services directly in category
          const directServices = category.services?.[0]?.count || 0;
          
          // Count services in subcategories
          const subcategoryServices = category.service_subcategories?.reduce((total: number, sub: any) => {
            return total + (sub.services?.[0]?.count || 0);
          }, 0) || 0;
          
          // Use only the higher count (avoid double counting when services exist in both)
          // If there are subcategory services, use that count, otherwise use direct services
          counts[category.name.toLowerCase()] = subcategoryServices > 0 ? subcategoryServices : directServices;
        });
        
        setCategoryCounts(counts);
      } catch (error) {
        console.error('Error fetching category counts:', error);
      }
    };

    fetchCategoryCounts();
  }, []);

  const categories = [
    {
      icon: Wrench,
      title: 'Plumbing',
      description: 'Pipe repairs, installations, and maintenance',
    },
    {
      icon: Zap,
      title: 'Electrical',
      description: 'Wiring, installations, and electrical repairs',
    },
    {
      icon: Hammer,
      title: 'Carpentry',
      description: 'Furniture, cabinets, and woodwork',
    },
    {
      icon: Paintbrush,
      title: 'Painting',
      description: 'Interior and exterior painting services',
    },
    {
      icon: Trees,
      title: 'Gardening',
      description: 'Landscaping, maintenance, and design',
    },
    {
      icon: Home,
      title: 'Home Repairs',
      description: 'General maintenance and repair services',
    },
    {
      icon: Car,
      title: 'Automotive',
      description: 'Vehicle repairs and maintenance',
    },
    {
      icon: Laptop,
      title: 'Tech Support',
      description: 'Computer and device repairs',
    },
    {
      icon: Camera,
      title: 'Photography',
      description: 'Event and portrait photography',
    },
    {
      icon: ChefHat,
      title: 'Catering',
      description: 'Food preparation and catering services',
    },
    {
      icon: Scissors,
      title: 'Tailoring',
      description: 'Clothing alterations and custom tailoring',
    },
    {
      icon: Building,
      title: 'Construction',
      description: 'Building and renovation services',
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
                    {(() => {
                      const count = categoryCounts[category.title.toLowerCase()] || 0;
                      return count === 0 ? '0 Providers' : `${count} Provider${count === 1 ? '' : 's'}`;
                    })()}
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