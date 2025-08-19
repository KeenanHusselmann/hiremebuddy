import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MapLocationPicker from '@/components/maps/MapLocationPicker';

interface ServiceForm {
  service_name: string;
  description: string;
  hourly_rate: number;
  category_id: string;
  subcategory_id: string;
  location_text: string;
  latitude?: number;
  longitude?: number;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon_name: string;
}

interface ServiceSubcategory {
  id: string;
  name: string;
  description: string;
  category_id: string;
}

export const ServiceCreationForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ServiceSubcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<ServiceSubcategory[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<File[]>([]);
  const [existingPortfolioUrls, setExistingPortfolioUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ServiceForm>();
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  // Get edit service data from navigation state
  const editService = location.state?.editService;
  const isEditing = !!editService;

  useEffect(() => {
    loadCategories();
    loadSubcategories();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (isEditing && editService && categories.length > 0 && subcategories.length > 0) {
      setValue('service_name', editService.service_name);
      setValue('description', editService.description);
      setValue('hourly_rate', editService.hourly_rate || 0);
      setValue('category_id', editService.category_id || '');
      setValue('subcategory_id', editService.subcategory_id || '');
      
      if (editService.category_id) {
        const filtered = subcategories.filter(sub => sub.category_id === editService.category_id);
        setFilteredSubcategories(filtered);
      }
      
      if (editService.portfolio_images) {
        setExistingPortfolioUrls(editService.portfolio_images);
      }
    }
  }, [isEditing, editService, categories, subcategories, setValue]);

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

  const loadSubcategories = async () => {
    const { data, error } = await supabase
      .from('service_subcategories')
      .select('*')
      .order('name');
    
    if (error) {
      toast({
        title: "Error loading subcategories",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setSubcategories(data || []);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setValue('category_id', categoryId);
    setValue('subcategory_id', ''); // Reset subcategory when category changes
    
    // Filter subcategories based on selected category
    const filtered = subcategories.filter(sub => sub.category_id === categoryId);
    setFilteredSubcategories(filtered);
    setShowAddSubcategory(false);
    setNewSubcategoryName('');
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategoryName.trim() || !watch('category_id')) {
      toast({
        title: "Invalid input",
        description: "Please provide a subcategory name and select a category first",
        variant: "destructive"
      });
      return;
    }

    setIsAddingSubcategory(true);

    try {
      const { data: newSubcategory, error } = await supabase
        .from('service_subcategories')
        .insert([{
          name: newSubcategoryName.trim(),
          description: `Custom subcategory: ${newSubcategoryName.trim()}`,
          category_id: watch('category_id'),
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add the new subcategory to our local state
      setSubcategories(prev => [...prev, newSubcategory]);
      setFilteredSubcategories(prev => [...prev, newSubcategory]);
      
      // Select the newly created subcategory
      setValue('subcategory_id', newSubcategory.id);
      
      // Reset the form
      setShowAddSubcategory(false);
      setNewSubcategoryName('');

      toast({
        title: "Subcategory added successfully!",
        description: `"${newSubcategory.name}" has been added and selected`
      });

    } catch (error: any) {
      toast({
        title: "Error adding subcategory",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsAddingSubcategory(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services",
        variant: "destructive"
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue('latitude', latitude);
        setValue('longitude', longitude);
        // Optimistically set while we reverse-geocode
        setValue('location_text', `${latitude.toFixed(6)}, ${longitude.toFixed(6)} (resolving address...)`);

        // Reverse geocode to street address via Edge Function
        (async () => {
          try {
            const { data, error } = await supabase.functions.invoke('reverse-geocode', {
              body: { lat: latitude, lng: longitude }
            });
            const address = (data as any)?.address as string | undefined;
            if (error) throw error as any;
            setValue('location_text', address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          } catch (e) {
            // Fallback to coordinates if reverse geocoding fails
            setValue('location_text', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          } finally {
            setIsGettingLocation(false);
            toast({
              title: "Location added!",
              description: "Your current location has been set with a street address",
            });
          }
        })();
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: "Location error",
          description: "Could not get your current location. Please enter it manually.",
          variant: "destructive"
        });
      }
    );
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

  const removeExistingImage = (index: number) => {
    setExistingPortfolioUrls(prev => prev.filter((_, i) => i !== index));
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
        description: "Please sign in to manage services",
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

      // Upload portfolio images if any
      let portfolioUrls: string[] = [...existingPortfolioUrls];
      if (portfolioImages.length > 0) {
        const newUrls = await uploadImages(isEditing ? editService.id : 'temp');
        portfolioUrls = [...portfolioUrls, ...newUrls];
      }

      if (isEditing) {
        // Update existing service
        const { error: serviceError } = await supabase
          .from('services')
          .update({
            service_name: data.service_name,
            description: data.description,
            hourly_rate: data.hourly_rate,
            category_id: data.category_id,
            subcategory_id: data.subcategory_id || null,
            portfolio_images: portfolioUrls
          })
          .eq('id', editService.id);
        
        if (serviceError) {
          throw serviceError;
        }

        toast({
          title: "Service updated successfully!",
          description: "Your changes have been saved"
        });

        // Navigate back to profile
        navigate('/profile', { state: { activeTab: 'services' } });
      } else {
        // Create new service
        const { data: service, error: serviceError } = await supabase
          .from('services')
          .insert([{
            service_name: data.service_name,
            description: data.description,
            hourly_rate: data.hourly_rate,
            category_id: data.category_id,
            subcategory_id: data.subcategory_id || null,
            labourer_id: profile.id,
            portfolio_images: portfolioUrls
          }])
          .select()
          .single();
        
        if (serviceError) {
          throw serviceError;
        }

        // Update provider categories if not already exists
        const { data: existingCategory } = await supabase
          .from('provider_categories')
          .select('id')
          .eq('provider_id', profile.id)
          .eq('category_id', data.category_id)
          .eq('subcategory_id', data.subcategory_id || null)
          .single();

        if (!existingCategory) {
          const { error: categoryError } = await supabase
            .from('provider_categories')
            .insert({
              provider_id: profile.id,
              category_id: data.category_id,
              subcategory_id: data.subcategory_id || null
            });

          if (categoryError) {
            console.error('Error updating provider categories:', categoryError);
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
        setValue('subcategory_id', '');
        setValue('location_text', '');
        setValue('latitude', undefined);
        setValue('longitude', undefined);
        setPortfolioImages([]);
        setExistingPortfolioUrls([]);
        setFilteredSubcategories([]);
      }

      // Update provider location if coordinates provided
      if (data.latitude && data.longitude) {
        const { error: locationError } = await supabase
          .from('profiles')
          .update({ 
            latitude: data.latitude, 
            longitude: data.longitude,
            location_text: data.location_text 
          })
          .eq('id', profile.id);
        
        if (locationError) {
          console.error('Error updating location:', locationError);
        }
      }
      
    } catch (error: any) {
      toast({
        title: isEditing ? "Error updating service" : "Error creating service",
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
        <CardTitle>{isEditing ? 'Edit Service' : 'Create New Service'}</CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update your service details and portfolio' 
            : 'Add your professional service to connect with clients in Namibia'
          }
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
            <Select onValueChange={(value) => handleCategoryChange(value)}>
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

          {watch('category_id') && (
            <div className="space-y-2">
              <Label htmlFor="subcategory_id">
                Service Subcategory {filteredSubcategories.length > 0 ? '*' : '(Optional)'}
              </Label>
              <Select 
                onValueChange={(value) => setValue('subcategory_id', value)} 
                disabled={filteredSubcategories.length === 0 && !showAddSubcategory}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={
                      filteredSubcategories.length === 0 
                        ? "No subcategories available" 
                        : "Select a subcategory"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {!showAddSubcategory ? (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {filteredSubcategories.length > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Required: Selecting a specific subcategory helps clients find your services more easily
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No subcategories available for this category
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddSubcategory(true)}
                    className="ml-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
                  <Label htmlFor="new-subcategory">Create New Subcategory</Label>
                  <div className="flex gap-2">
                    <Input
                      id="new-subcategory"
                      value={newSubcategoryName}
                      onChange={(e) => setNewSubcategoryName(e.target.value)}
                      placeholder="e.g., Leak Detection, Emergency Repairs"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddSubcategory}
                      disabled={isAddingSubcategory || !newSubcategoryName.trim()}
                      size="sm"
                    >
                      {isAddingSubcategory ? 'Adding...' : 'Add'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddSubcategory(false);
                        setNewSubcategoryName('');
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This will create a new subcategory for the selected category that other providers can also use.
                  </p>
                </div>
              )}

              {errors.subcategory_id && (
                <p className="text-sm text-destructive">Please select a subcategory</p>
              )}
            </div>
          )}

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
            <Label htmlFor="location_text">Service Location</Label>
            <div className="flex gap-2 flex-wrap">
              <Input
                id="location_text"
                {...register('location_text', { required: 'Location is required for map display' })}
                placeholder="e.g., Windhoek Central, Klein Windhoek"
                className="flex-1 min-w-[220px]"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMapOpen(true)}
              >
                Choose on Map
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This location will be displayed on the map to help clients find you
            </p>
            {errors.location_text && (
              <p className="text-sm text-destructive">{errors.location_text.message}</p>
            )}

            <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Select your location</DialogTitle>
                  <DialogDescription>Move the pin or tap the map to set your precise address.</DialogDescription>
                </DialogHeader>
                <MapLocationPicker
                  initial={watch('latitude') && watch('longitude') ? { lat: watch('latitude') as number, lng: watch('longitude') as number } : null}
                  onConfirm={(loc) => {
                    setValue('latitude', loc.lat);
                    setValue('longitude', loc.lng);
                    setValue('location_text', loc.address);
                    setIsMapOpen(false);
                    toast({ title: 'Location selected', description: loc.address });
                  }}
                />
              </DialogContent>
            </Dialog>
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
            
            {/* Display existing portfolio images when editing */}
            {isEditing && existingPortfolioUrls.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Current Portfolio Images</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {existingPortfolioUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Existing Portfolio ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display new images being uploaded */}
            {portfolioImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">New Images to Upload</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {portfolioImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`New Portfolio ${index + 1}`}
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
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading 
              ? (isEditing ? 'Updating Service...' : 'Creating Service...') 
              : (isEditing ? 'Update Service' : 'Create Service')
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};