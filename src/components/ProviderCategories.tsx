import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Briefcase } from 'lucide-react';

interface ProviderCategoriesProps {
  providerId: string;
  showTitle?: boolean;
}

interface ServiceCategoryItem {
  id: string; // service id
  category: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
  subcategory?: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
}

const ProviderCategories = ({ providerId, showTitle = true }: ProviderCategoriesProps) => {
  const [serviceItems, setServiceItems] = useState<ServiceCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviderServices();
  }, [providerId]);

  const loadProviderServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select(`
          id,
          category:service_categories(id, name, description),
          subcategory:service_subcategories(id, name, description)
        `)
        .eq('labourer_id', providerId);

      if (error) throw error;
      setServiceItems((data as any) || []);
    } catch (error) {
      console.error('Error loading provider services:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (serviceItems.length === 0) {
    return (
      <div className="text-center py-4">
        <Briefcase className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No services registered yet</p>
      </div>
    );
  }

  // Group categories by main category derived from services
  const groupedCategories = serviceItems.reduce((acc, item) => {
    const categoryName = item.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = {
        category: item.category,
        subcategories: [] as any[],
      };
    }

    if (item.subcategory) {
      if (!acc[categoryName].subcategories.some((s: any) => s.id === item.subcategory?.id)) {
        acc[categoryName].subcategories.push(item.subcategory);
      }
    }

    return acc;
  }, {} as Record<string, { category: any; subcategories: any[] }>);

  const content = (
    <div className="space-y-4">
      {Object.entries(groupedCategories).map(([categoryName, data]) => (
        <div key={categoryName} className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="font-medium">
              {(data.category?.name as string) || 'Uncategorized'}
            </Badge>
          </div>
          
          {data.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-1 ml-2">
              {data.subcategories.map((subcategory) => (
                <Badge 
                  key={subcategory.id} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {subcategory.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (!showTitle) {
    return content;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Service Specializations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

export default ProviderCategories;