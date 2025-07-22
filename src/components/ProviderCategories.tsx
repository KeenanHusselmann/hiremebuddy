import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Briefcase } from 'lucide-react';

interface ProviderCategoriesProps {
  providerId: string;
  showTitle?: boolean;
}

interface CategoryData {
  id: string;
  category_id: string;
  subcategory_id: string | null;
  service_categories: {
    id: string;
    name: string;
    description: string;
  };
  service_subcategories?: {
    id: string;
    name: string;
    description: string;
  } | null;
}

const ProviderCategories = ({ providerId, showTitle = true }: ProviderCategoriesProps) => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviderCategories();
  }, [providerId]);

  const loadProviderCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('provider_categories')
        .select(`
          id,
          category_id,
          subcategory_id,
          service_categories(id, name, description),
          service_subcategories(id, name, description)
        `)
        .eq('provider_id', providerId);

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading provider categories:', error);
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

  if (categories.length === 0) {
    return (
      <div className="text-center py-4">
        <Briefcase className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No service categories selected</p>
      </div>
    );
  }

  // Group categories by main category
  const groupedCategories = categories.reduce((acc, item) => {
    const categoryName = item.service_categories.name;
    if (!acc[categoryName]) {
      acc[categoryName] = {
        category: item.service_categories,
        subcategories: []
      };
    }
    
    if (item.service_subcategories) {
      acc[categoryName].subcategories.push(item.service_subcategories);
    }
    
    return acc;
  }, {} as Record<string, { category: any; subcategories: any[] }>);

  const content = (
    <div className="space-y-4">
      {Object.entries(groupedCategories).map(([categoryName, data]) => (
        <div key={categoryName} className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="font-medium">
              {data.category.name}
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