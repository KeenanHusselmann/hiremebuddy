import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ServiceForm {
  service_name: string;
  description: string;
  hourly_rate: number;
  category_id: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon_name: string;
}

export const ServiceCreationForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ServiceForm>();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');
    
    if (error) {
      toast({
        title: "Error loading categories",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setCategories(data || []);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 5 - portfolioImages.length);
      setPortfolioImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setPortfolioImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (serviceId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const image of portfolioImages) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${serviceId}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, image);
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const onSubmit = async (data: ServiceForm) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create services",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !profile) {
        toast({
          title: "Profile not found",
          description: "Please complete your profile first",
          variant: "destructive"
        });
        return;
      }

      // Create service
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .insert([{
          service_name: data.service_name,
          description: data.description,
          hourly_rate: data.hourly_rate,
          category_id: data.category_id,
          labourer_id: profile.id,
          portfolio_images: []
        }])
        .select()
        .single();
      
      if (serviceError) {
        throw serviceError;
      }

      // Upload portfolio images if any
      let portfolioUrls: string[] = [];
      if (portfolioImages.length > 0) {
        portfolioUrls = await uploadImages(service.id);
        
        // Update service with portfolio images
        const { error: updateError } = await supabase
          .from('services')
          .update({ portfolio_images: portfolioUrls })
          .eq('id', service.id);
        
        if (updateError) {
          console.error('Error updating portfolio images:', updateError);
        }
      }

      toast({
        title: "Service created successfully!",
        description: "Your service is now live and available to clients"
      });

      // Reset form
      setValue('service_name', '');
      setValue('description', '');
      setValue('hourly_rate', 0);
      setValue('category_id', '');
      setPortfolioImages([]);
      
    } catch (error: any) {
      toast({
        title: "Error creating service",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Service</CardTitle>
        <CardDescription>
          Add your professional service to connect with clients in Namibia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="service_name">Service Name</Label>
            <Input
              id="service_name"
              {...register('service_name', { required: 'Service name is required' })}
              placeholder="e.g., Professional Plumbing Services"
            />
            {errors.service_name && (
              <p className="text-sm text-destructive">{errors.service_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Service Category</Label>
            <Select onValueChange={(value) => setValue('category_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-destructive">Please select a category</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Service Description</Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              placeholder="Describe your service, experience, and what makes you unique..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Hourly Rate (N$)</Label>
            <Input
              id="hourly_rate"
              type="number"
              {...register('hourly_rate', { 
                required: 'Hourly rate is required',
                min: { value: 1, message: 'Rate must be at least N$1' }
              })}
              placeholder="300"
            />
            {errors.hourly_rate && (
              <p className="text-sm text-destructive">{errors.hourly_rate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Portfolio Images (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  Upload up to 5 images of your work
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="portfolio-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('portfolio-upload')?.click()}
                  disabled={portfolioImages.length >= 5}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Images
                </Button>
              </div>
            </div>
            
            {portfolioImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {portfolioImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Service...' : 'Create Service'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};