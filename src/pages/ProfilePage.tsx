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
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { FacebookMarketplace } from '@/components/FacebookMarketplace';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, User, Settings, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfileImageUpload from '@/components/ProfileImageUpload';

const ProfilePage = () => {
  const { user, profile, refreshProfile, signOut } = useAuth();
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
    bio: '',
    user_type: 'client' as 'client' | 'labourer' | 'both',
  });
  // Remove the separate language state - use the one from context

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!user) {
      navigate('/auth');
      return;
    }

    // Initialize form data with profile data
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        contact_number: profile.contact_number || '',
        whatsapp_link: profile.whatsapp_link || '',
        facebook_link: profile.facebook_link || '',
        location_text: profile.location_text || '',
        bio: profile.bio || '',
        user_type: profile.user_type || 'client',
      });
    }
  }, [user, profile, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
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
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
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
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <ProfileImageUpload 
              currentImageUrl={profile.avatar_url}
              onImageUpload={handleImageUpload}
              size="large"
            />
            <h1 className="text-3xl font-bold mt-4">{profile.full_name}</h1>
            <p className="text-muted-foreground capitalize">{profile.user_type}</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('profile.title')}
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t('profile.settings')}
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
                        <Label htmlFor="location_text">{t('profile.location')}</Label>
                        <Input
                          id="location_text"
                          value={formData.location_text}
                          onChange={(e) => handleInputChange('location_text', e.target.value)}
                          placeholder="City, Region"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="whatsapp_link">WhatsApp Link</Label>
                        <Input
                          id="whatsapp_link"
                          value={formData.whatsapp_link}
                          onChange={(e) => handleInputChange('whatsapp_link', e.target.value)}
                          placeholder="https://wa.me/264XXXXXXXXX"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="facebook_link">Facebook Profile</Label>
                        <Input
                          id="facebook_link"
                          value={formData.facebook_link}
                          onChange={(e) => handleInputChange('facebook_link', e.target.value)}
                          placeholder="https://facebook.com/username"
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