import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { FacebookMarketplace } from '@/components/FacebookMarketplace';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, User, Settings, Camera, Gamepad2, BarChart3, MapPin, DollarSign, Eye, Edit, Briefcase, MoreVertical, Trash, Calendar, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import TicTacToe from '@/components/TicTacToe';
import MiniSudoku from '@/components/MiniSudoku';
import ProfileStats from '@/components/ProfileStats';
import ProviderCategories from '@/components/ProviderCategories';
import QuickActions from '@/components/QuickActions';

const ProfilePage = () => {
  const { user, profile, refreshProfile, signOut, isLoading: authLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    contact_number: '',
    whatsapp_link: '',
    facebook_link: '',
    location_text: '',
    town: '',
    bio: '',
    user_type: 'client' as 'client' | 'labourer' | 'both',
  });
  const [namibianTowns, setNamibianTowns] = useState<Array<{id: string, name: string, region: string}>>([]);
  const [userServices, setUserServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('profile');

  useEffect(() => {
    // Set up real-time subscription for profile changes (verification status)
    const channel = supabase
      .channel('profile-verification-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('Profile verification update received:', payload);
          // Refresh the profile data when verification status changes
          refreshProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refreshProfile]);

  useEffect(() => {
    // Wait for auth to finish loading to avoid wrong redirects on refresh
    if (authLoading) return;

    // Redirect to auth if not logged in
    if (!user) {
      navigate('/auth');
      return;
    }

    // Load Namibian towns
    loadNamibianTowns();

    // Load user services if they are a provider
    if (profile && (profile.user_type === 'labourer' || profile.user_type === 'both')) {
      loadUserServices();
    }

    // Initialize form data with profile data
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        contact_number: profile.contact_number || '',
        whatsapp_link: profile.whatsapp_link || '',
        facebook_link: profile.facebook_link || '',
        location_text: profile.location_text || '',
        town: (profile as any).town || '',
        bio: profile.bio || '',
        user_type: profile.user_type === 'admin' ? 'client' : profile.user_type || 'client',
      });
    }
  }, [authLoading, user, profile, navigate]);

  const loadNamibianTowns = async () => {
    try {
      const { data, error } = await supabase
        .from('namibian_towns')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setNamibianTowns(data || []);

      // Normalize form town to a valid option (case-insensitive)
      if (profile && (profile as any).town) {
        const match = (data || []).find((t) => t.name.toLowerCase() === String((profile as any).town || '').toLowerCase());
        if (match) {
          setFormData((prev) => ({ ...prev, town: match.name }));
        }
      }
    } catch (error: any) {
      console.error('Error loading towns:', error);
    }
  };

  const loadUserServices = async () => {
    if (!profile) return;
    
    setLoadingServices(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          service_categories(name)
        `)
        .eq('labourer_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUserServices(data || []);
    } catch (error: any) {
      console.error('Error loading services:', error);
      toast({
        title: "Error",
        description: "Failed to load your services",
        variant: "destructive",
      });
    }
    setLoadingServices(false);
  };

  const handleDeleteService = async (serviceId: string, serviceName: string) => {
    if (!confirm(`Are you sure you want to delete "${serviceName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);
      
      if (error) throw error;

      // Remove from local state
      setUserServices(prev => prev.filter(service => service.id !== serviceId));
      
      toast({
        title: "Service Deleted",
        description: "Your service has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId);
      
      if (error) throw error;

      // Update local state
      setUserServices(prev => 
        prev.map(service => 
          service.id === serviceId 
            ? { ...service, is_active: !currentStatus }
            : service
        )
      );
      
      toast({
        title: "Service Updated",
        description: `Service ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update service status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Geocode the user's address to update latitude/longitude for maps
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC0qcSxvBv534pnfD5YvNimZlw8RbzTBCI';
  const geocodeAddress = async (address: string, town?: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const fullAddress = [address, town, 'Namibia'].filter(Boolean).join(', ');
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'OK' && data.results && data.results[0]) {
        const loc = data.results[0].geometry.location;
        return { lat: loc.lat, lng: loc.lng };
      }
      return null;
    } catch (e) {
      console.warn('Geocoding failed:', e);
      return null;
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setIsLoading(true);
    try {
      // Build update payload (only allowed fields)
      const updateData: any = {
        full_name: formData.full_name,
        contact_number: formData.contact_number,
        whatsapp_link: formData.whatsapp_link,
        facebook_link: formData.facebook_link,
        location_text: formData.location_text,
        town: formData.town,
        bio: formData.bio,
      };

      // If location or town changed, geocode to update map coordinates
      const prevTown = (profile as any).town || '';
      const prevAddress = profile.location_text || '';
      const locationChanged = updateData.town !== prevTown || updateData.location_text !== prevAddress;

      if (locationChanged && (updateData.location_text || updateData.town)) {
        const coords = await geocodeAddress(updateData.location_text || '', updateData.town);
        if (coords) {
          updateData.latitude = coords.lat;
          updateData.longitude = coords.lng;
        }
      }

      const { data: updated, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select('id, town, location_text')
        .single();

      if (error) throw error;
      if (!updated) throw new Error('Profile update did not persist.');

      await refreshProfile();
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleLanguageChange = (newLanguage: 'en' | 'af' | 'de') => {
    setLanguage(newLanguage);
    toast({
      title: t('profile.settings'),
      description: `Language preference updated to ${newLanguage === 'en' ? 'English' : newLanguage === 'af' ? 'Afrikaans' : 'German'}`,
    });
  };

  const handleImageUpload = async (imageUrl: string) => {
    await refreshProfile();
    toast({
      title: "Profile Image Updated",
      description: "Your profile image has been successfully updated.",
    });
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: {
          email: user.email,
          redirectTo: `${window.location.origin}/reset-password`,
        },
      });

      if (error) throw error;

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for instructions to reset your password.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <Button
            aria-label="Open settings"
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center relative">
            <ProfileImageUpload 
              currentImageUrl={profile.avatar_url}
              onImageUpload={handleImageUpload}
              size="large"
            />
            <h1 className="text-3xl font-bold mt-4">{profile.full_name}</h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <p className="text-muted-foreground">{profile.user_type === 'labourer' ? 'Service Provider' : profile.user_type === 'both' ? 'Client & Service Provider' : profile.user_type === 'client' ? 'Client' : String(profile.user_type)}</p>
              {(profile.user_type === 'labourer' || profile.user_type === 'both') && (
                profile.is_verified ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    ✓ Verified Provider
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    ⏳ Pending Verification
                  </Badge>
                )
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              User since {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-nowrap gap-2">
              <TabsTrigger value="profile" className="flex items-center gap-2 text-xs lg:text-sm px-3 py-2 rounded-full">
                <User className="h-4 w-4" />
                <span>{t('profile.title')}</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2 text-xs lg:text-sm px-3 py-2 rounded-full">
                <Calendar className="h-4 w-4" />
                <span>Bookings</span>
              </TabsTrigger>
              {(profile.user_type === 'labourer' || profile.user_type === 'both') && profile.is_verified && (
                <TabsTrigger value="services" className="flex items-center gap-2 text-xs lg:text-sm px-3 py-2 rounded-full">
                  <Briefcase className="h-4 w-4" />
                  <span>Services</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="stats" className="flex items-center gap-2 text-xs lg:text-sm px-3 py-2 rounded-full">
                <BarChart3 className="h-4 w-4" />
                <span>Stats</span>
              </TabsTrigger>
              <TabsTrigger value="games" className="flex items-center gap-2 text-xs lg:text-sm px-3 py-2 rounded-full">
                <Gamepad2 className="h-4 w-4" />
                <span>Games</span>
              </TabsTrigger>
              <TabsTrigger id="profile-settings-tab" value="settings" className="sr-only absolute -left-full">
                <Settings className="h-4 w-4" />
                <span>{t('profile.settings')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.personalInfo')}</CardTitle>
                  <CardDescription>
                    Update your profile information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">{t('profile.fullName')}</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => handleInputChange('full_name', e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>

                      {profile.user_type === 'client' && (
                        <div className="space-y-2">
                          <Label htmlFor="user_type">{t('profile.accountType')}</Label>
                          <Select
                            value={formData.user_type}
                            onValueChange={(value) => handleInputChange('user_type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="client">{t('profile.client')}</SelectItem>
                              <SelectItem value="labourer">{t('profile.provider')}</SelectItem>
                              <SelectItem value="both">{t('profile.both')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="contact_number">{t('profile.phone')}</Label>
                        <Input
                          id="contact_number"
                          value={formData.contact_number}
                          onChange={(e) => handleInputChange('contact_number', e.target.value)}
                          placeholder="+264 XX XXX XXXX"
                        />
                      </div>

                        <div className="space-y-2">
                          <Label htmlFor="town">Town/City</Label>
                          <Input
                            id="town"
                            value={formData.town}
                            onChange={(e) => handleInputChange('town', e.target.value)}
                            placeholder="Enter your town/city"
                          />
                        </div>

                       <div className="space-y-2">
                         <Label htmlFor="location_text">{t('profile.location')}</Label>
                         <Input
                           id="location_text"
                           value={formData.location_text}
                           onChange={(e) => handleInputChange('location_text', e.target.value)}
                           placeholder="Specific address or area"
                         />
                       </div>

                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">{t('profile.bio')}</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell us about yourself and your services..."
                        rows={4}
                      />
                    </div>

                    <Button type="submit" disabled={isLoading} className="btn-sunset">
                      {isLoading ? t('profile.updating') : t('profile.updateProfile')}
                    </Button>
                  </form>
                 </CardContent>
               </Card>

                {/* Provider Categories for Labourers */}
                {(formData.user_type === 'labourer' || formData.user_type === 'both') && (
                  <ProviderCategories 
                    providerId={profile.id}
                    showTitle={true}
                  />
                )}

                {/* Service Management for Labourers - Only show if client type */}
                {(formData.user_type === 'labourer' || formData.user_type === 'both') && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Service Management</CardTitle>
                      <CardDescription>
                        {profile.is_verified 
                          ? "Manage your professional services and connect with clients"
                          : "Complete verification to start offering services"
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profile.is_verified ? (
                        <>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <Button 
                              onClick={() => navigate('/create-service')} 
                              className="btn-sunset flex-1"
                            >
                              Create New Service
                            </Button>
                            <Button 
                              onClick={() => navigate('/browse')} 
                              variant="outline"
                              className="flex-1"
                            >
                              View All Services
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Add your services to reach clients across Namibia. Upload portfolio images and set competitive rates.
                          </p>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="font-medium text-yellow-800 mb-2">Verification Required</h3>
                            <p className="text-sm text-yellow-700 mb-3">
                              Your profile is currently under review. Once verified by our admin team, you'll be able to create and offer services to clients.
                            </p>
                            <p className="text-xs text-yellow-600">
                              This typically takes 24-48 hours. You'll receive a notification once approved.
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

            {(profile.user_type === 'labourer' || profile.user_type === 'both') && profile.is_verified && (
              <TabsContent value="services" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      My Services
                      <Button 
                        onClick={() => navigate('/create-service')} 
                        className="btn-sunset"
                        size="sm"
                      >
                        Add Service
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Manage your registered services and portfolio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingServices ? (
                      <div className="text-center py-8">
                        <p>Loading services...</p>
                      </div>
                    ) : userServices.length === 0 ? (
                      <div className="text-center py-8">
                        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Services Yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Start by creating your first service to attract clients
                        </p>
                        <Button 
                          onClick={() => navigate('/create-service')} 
                          className="btn-sunset"
                        >
                          Create Your First Service
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {userServices.map((service) => (
                          <Card key={service.id} className="border">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold">{service.service_name}</h3>
                                    <Badge variant={service.is_active ? "default" : "secondary"}>
                                      {service.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                    {service.description}
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    {service.service_categories && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {service.service_categories.name}
                                      </span>
                                    )}
                                    {service.hourly_rate && (
                                      <span className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        N${service.hourly_rate}/hour
                                      </span>
                                    )}
                                  </div>
                                </div>
                                 <div className="flex items-center gap-2 ml-4">
                                   <Button
                                     size="sm"
                                     variant="outline"
                                     onClick={() => navigate(`/service/${service.id}`)}
                                     title="View Service Details"
                                   >
                                     <Eye className="h-3 w-3" />
                                   </Button>
                                   <Button
                                     size="sm"
                                     variant="outline"
                                     onClick={() => navigate('/create-service', { state: { editService: service } })}
                                     title="Edit Service"
                                   >
                                     <Edit className="h-3 w-3" />
                                   </Button>
                                   <DropdownMenu>
                                     <DropdownMenuTrigger asChild>
                                       <Button size="sm" variant="outline">
                                         <MoreVertical className="h-3 w-3" />
                                       </Button>
                                     </DropdownMenuTrigger>
                                     <DropdownMenuContent align="end">
                                       <DropdownMenuItem onClick={() => handleToggleServiceStatus(service.id, service.is_active)}>
                                         {service.is_active ? 'Deactivate' : 'Activate'} Service
                                       </DropdownMenuItem>
                                       <DropdownMenuItem 
                                         onClick={() => handleDeleteService(service.id, service.service_name)}
                                         className="text-destructive"
                                       >
                                         <Trash className="h-3 w-3 mr-2" />
                                         Delete Service
                                       </DropdownMenuItem>
                                     </DropdownMenuContent>
                                   </DropdownMenu>
                                 </div>
                              </div>
                              {service.portfolio_images && service.portfolio_images.length > 0 && (
                                <div className="mt-3 flex gap-2 overflow-x-auto">
                                  {service.portfolio_images.slice(0, 3).map((image: string, index: number) => (
                                    <img
                                      key={index}
                                      src={image}
                                      alt={`Portfolio ${index + 1}`}
                                      className="h-16 w-16 rounded object-cover flex-shrink-0"
                                    />
                                  ))}
                                  {service.portfolio_images.length > 3 && (
                                    <div className="h-16 w-16 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                                      +{service.portfolio_images.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="bookings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking & Quote Management</CardTitle>
                  <CardDescription>
                    Manage your service bookings and quote requests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={() => navigate('/bookings')} 
                      className="btn-sunset h-auto py-4"
                    >
                      <div className="flex flex-col items-center">
                        <Calendar className="h-6 w-6 mb-2" />
                        <span className="font-semibold">View Bookings</span>
                        <span className="text-xs opacity-80">
                          {profile.user_type === 'labourer' 
                            ? 'Manage booking requests' 
                            : 'Track your bookings'
                          }
                        </span>
                      </div>
                    </Button>
                    
                    <Button 
                      onClick={() => navigate('/quotes')} 
                      variant="outline" 
                      className="h-auto py-4"
                    >
                      <div className="flex flex-col items-center">
                        <MessageSquare className="h-6 w-6 mb-2" />
                        <span className="font-semibold">Quote Requests</span>
                        <span className="text-xs opacity-80">
                          {profile.user_type === 'labourer' 
                            ? 'Respond to quote requests' 
                            : 'Track your quote requests'
                          }
                        </span>
                      </div>
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground text-center pt-4">
                    {profile.user_type === 'labourer' 
                      ? "Manage all your client interactions and service requests in one place."
                      : "Keep track of all your service bookings and quote requests from providers."
                    }
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <ProfileStats 
                profile={profile} 
                joinDate={new Date(profile.created_at)} 
              />
              <QuickActions userType={profile.user_type} />
            </TabsContent>

            <TabsContent value="games" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Mini Games</h2>
                <p className="text-muted-foreground">
                  Take a break and enjoy these lightweight games!
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="flex justify-center">
                  <TicTacToe />
                </div>
                <div className="flex justify-center">
                  <MiniSudoku />
                </div>
              </div>

              {/* Fun Facts Section */}
              <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-center">Did You Know?</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <p className="text-muted-foreground">
                    Playing brain games can improve problem-solving skills and cognitive function.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Perfect skills for both service providers and clients on HireMeBuddy!
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.languagePreferences')}</CardTitle>
                  <CardDescription>
                    Choose your preferred language for the interface
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">{t('profile.language')}</Label>
                      <Select value={language} onValueChange={handleLanguageChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="af">Afrikaans</SelectItem>
                          <SelectItem value="de">Deutsch (German)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.accountSettings')}</CardTitle>
                  <CardDescription>
                    Manage your account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{t('profile.email')}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <Button onClick={handleChangePassword} variant="outline">
                    {t('profile.changePassword')}
                  </Button>

                  <div className="pt-4 border-t">
                    <Button onClick={signOut} variant="destructive">
                      {t('profile.signOut')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Accessibility Settings */}
              <AccessibilityPanel />

              {/* Facebook Marketplace */}
              <FacebookMarketplace />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;