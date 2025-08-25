import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TermsModal } from '@/components/TermsModal';
import { PrivacyModal } from '@/components/PrivacyModal';
import IdentityVerification from '@/components/IdentityVerification';
import logo from '@/assets/hiremebuddy-logo.png';
import CameraCapture from '@/components/CameraCapture';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<'client' | 'labourer'>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Additional fields for providers and clients
  const [contactNumber, setContactNumber] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  // Identity verification state
  const [verificationData, setVerificationData] = useState<{
    frontImagePath: string;
    backImagePath: string;
    selfieImagePath: string;
  } | null>(null);

  
  // Modal states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false);
  
  // Provider categories state
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<{categoryId: string, subcategoryIds: string[]}[]>([]);
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentSubcategory, setCurrentSubcategory] = useState('');
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/');
      }
    });

    // Load categories and subcategories
    loadCategories();
    loadSubcategories();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSubcategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_subcategories')
        .select('*, service_categories(name)')
        .order('name');
      
      if (error) throw error;
      setSubcategories(data || []);
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Validation for providers
    if (userType === 'labourer') {
      if (!verificationData) {
        toast({
          title: "Verification required",
          description: "Please complete identity verification to continue",
          variant: "destructive",
        });
        return;
      }
      if (!hasAcceptedTerms || !hasAcceptedPrivacy) {
        // Show terms modal first if not accepted
        if (!hasAcceptedTerms) {
          setShowTermsModal(true);
        } else if (!hasAcceptedPrivacy) {
          setShowPrivacyModal(true);
        }
        toast({
          title: "Terms and Privacy Required",
          description: "Please read and accept both Terms and Privacy Policy to continue",
          variant: "destructive",
        });
        return;
      }
    } else {
      // For clients, require both terms and privacy acceptance
      if (!hasAcceptedTerms || !hasAcceptedPrivacy) {
        // Show terms modal first if not accepted
        if (!hasAcceptedTerms) {
          setShowTermsModal(true);
        } else if (!hasAcceptedPrivacy) {
          setShowPrivacyModal(true);
        }
        toast({
          title: "Terms and Privacy Required",
          description: "Please read and accept both Terms and Privacy Policy to continue",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType,
            contact_number: contactNumber,
            location_text: location,
            experience: userType === 'labourer' ? experience : undefined,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      // Save verification data for providers
      if (userType === 'labourer' && verificationData) {
        try {
          // Get the newly created user session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Update the profile with verification data
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                id_document_image_path: verificationData.frontImagePath,
                id_document_back_image_path: verificationData.backImagePath,
                selfie_image_path: verificationData.selfieImagePath,
                verification_status: 'pending'
              })
              .eq('user_id', session.user.id);

            if (updateError) {
              console.error('Error saving verification data:', updateError);
            }
          }
        } catch (verificationError) {
          console.error('Error saving verification data:', verificationError);
        }
      }

      toast({
        title: "Success!",
        description: "Please check your email to verify your account.",
      });
      
      // Reset form after successful signup
      resetForm();
      
      // Redirect to home page
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Welcome toast will be handled by useAuth hook
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const saveProviderCategories = async () => {
    try {
      // Get the current user to find their profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!profile) return;

      // Insert provider categories
      for (const categorySelection of selectedCategories) {
        if (categorySelection.subcategoryIds.length > 0) {
          // Insert with subcategories
          for (const subcategoryId of categorySelection.subcategoryIds) {
            await supabase
              .from('provider_categories')
              .insert({
                provider_id: profile.id,
                category_id: categorySelection.categoryId,
                subcategory_id: subcategoryId
              });
          }
        } else {
          // Insert just the category
          await supabase
            .from('provider_categories')
            .insert({
              provider_id: profile.id,
              category_id: categorySelection.categoryId,
              subcategory_id: null
            });
        }
      }
    } catch (error) {
      console.error('Error saving provider categories:', error);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setUserType('client');
    setContactNumber('');
    setLocation('');
    setExperience('');
    setIdDocument(null);
    setAgreeToTerms(false);
    setSelectedCategories([]);
    setCurrentCategory('');
    setCurrentSubcategory('');
    setHasAcceptedTerms(false);
    setHasAcceptedPrivacy(false);
    setVerificationData(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdDocument(file);
    }
  };

  const addCategory = () => {
    if (!currentCategory) return;
    
    const categoryExists = selectedCategories.find(c => c.categoryId === currentCategory);
    if (categoryExists) {
      // Add subcategory to existing category
      if (currentSubcategory && !categoryExists.subcategoryIds.includes(currentSubcategory)) {
        setSelectedCategories(prev => 
          prev.map(c => 
            c.categoryId === currentCategory 
              ? { ...c, subcategoryIds: [...c.subcategoryIds, currentSubcategory] }
              : c
          )
        );
      }
    } else {
      // Add new category
      setSelectedCategories(prev => [...prev, {
        categoryId: currentCategory,
        subcategoryIds: currentSubcategory ? [currentSubcategory] : []
      }]);
    }
    
    setCurrentCategory('');
    setCurrentSubcategory('');
  };

  const removeCategory = (categoryId: string) => {
    setSelectedCategories(prev => prev.filter(c => c.categoryId !== categoryId));
  };

  const removeSubcategory = (categoryId: string, subcategoryId: string) => {
    setSelectedCategories(prev => 
      prev.map(c => 
        c.categoryId === categoryId 
          ? { ...c, subcategoryIds: c.subcategoryIds.filter(s => s !== subcategoryId) }
          : c
      )
    );
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunset-deep via-sunset-primary to-sunset-light flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
      </div>
      
      <div className="w-full max-w-lg relative z-10">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-white hover:text-sunset-accent transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="glass-card border-glass-border/30 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="HireMeBuddy" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground mb-2">
              {isLogin ? 'Welcome Back!' : 'Join HireMeBuddy'}
            </CardTitle>
            <CardDescription className="text-lg">
              {isLogin 
                ? 'Sign in to connect with skilled professionals' 
                : 'Start connecting with Namibian talent today'
              }
            </CardDescription>
            {!isLogin && (
              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Connect with trusted service providers<br/>
                  Secure and verified professionals<br/>
                  Direct communication tools
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>I am a:</Label>
                    <RadioGroup
                      value={userType}
                      onValueChange={(value) => setUserType(value as 'client' | 'labourer')}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="client" id="client" />
                        <Label htmlFor="client">Client (Looking for services)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="labourer" id="labourer" />
                        <Label htmlFor="labourer">Service Provider (Offering services)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Additional fields for both clients and providers */}
                  <div className="space-y-4 pt-4 border-t border-glass-border/30">
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number *</Label>
                      <Input
                        id="contactNumber"
                        type="tel"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        placeholder="Enter your contact number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter your location"
                        required
                      />
                    </div>

                    {/* Provider-specific fields */}
                    {userType === 'labourer' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="experience">Experience *</Label>
                          <Textarea
                            id="experience"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            placeholder="Describe your experience and skills"
                            required
                            className="min-h-[80px]"
                          />
                        </div>

                        <IdentityVerification
                          onVerificationComplete={(data) => setVerificationData(data)}
                        />

                        {/* Service Categories Selection removed per requirements */}

                        {/* Terms and Privacy Acceptance for Providers */}
                        <div className="space-y-4 pt-4 border-t border-glass-border/30">
                          <Label className="text-base font-medium">Terms and Privacy Agreement</Label>
                          <p className="text-sm text-muted-foreground">
                            As a service provider, you must read and accept our terms to ensure platform compliance
                          </p>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={hasAcceptedTerms}
                                  disabled={true}
                                  className={hasAcceptedTerms ? 'border-green-500 bg-green-500' : ''}
                                />
                                <span className="text-sm">Terms and Conditions</span>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowTermsModal(true)}
                              >
                                {hasAcceptedTerms ? 'Accepted ✓' : 'Read & Accept'}
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={hasAcceptedPrivacy}
                                  disabled={true}
                                  className={hasAcceptedPrivacy ? 'border-green-500 bg-green-500' : ''}
                                />
                                <span className="text-sm">Privacy Policy</span>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPrivacyModal(true)}
                              >
                                {hasAcceptedPrivacy ? 'Accepted ✓' : 'Read & Accept'}
                              </Button>
                            </div>
                          </div>
                          
                          {hasAcceptedTerms && hasAcceptedPrivacy && (
                            <p className="text-sm text-green-600 font-medium">
                              ✓ All requirements completed. You can now register as a service provider.
                            </p>
                          )}
                        </div>
                      </>
                    )}
                    
                    {/* Terms and Privacy Acceptance for Clients */}
                    {!isLogin && userType === 'client' && (
                      <div className="space-y-4 pt-4 border-t border-glass-border/30">
                        <Label className="text-base font-medium">Terms and Privacy Agreement</Label>
                        <p className="text-sm text-muted-foreground">
                          Please read and accept our terms and privacy policy to continue
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={hasAcceptedTerms}
                                disabled={true}
                                className={hasAcceptedTerms ? 'border-green-500 bg-green-500' : ''}
                              />
                              <span className="text-sm">Terms and Conditions</span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowTermsModal(true)}
                            >
                              {hasAcceptedTerms ? 'Accepted ✓' : 'Read & Accept'}
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={hasAcceptedPrivacy}
                                disabled={true}
                                className={hasAcceptedPrivacy ? 'border-green-500 bg-green-500' : ''}
                              />
                              <span className="text-sm">Privacy Policy</span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowPrivacyModal(true)}
                            >
                              {hasAcceptedPrivacy ? 'Accepted ✓' : 'Read & Accept'}
                            </Button>
                          </div>
                        </div>
                        
                        {hasAcceptedTerms && hasAcceptedPrivacy && (
                          <p className="text-sm text-green-600 font-medium">
                            ✓ All requirements completed. You can now register.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              <Button 
                type="submit" 
                className="w-full btn-sunset"
                disabled={isLoading}
              >
                {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Button
                  variant="link"
                  onClick={toggleMode}
                  className="p-0 h-auto font-semibold text-primary hover:text-primary/80"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </Button>
              </p>
            </div>

            {isLogin && (
              <div className="mt-4 text-center">
                <Link to="/forgot-password">
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
                  >
                    Forgot your password?
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Terms Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setHasAcceptedTerms(true)}
      />
      
      {/* Privacy Modal */}
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={() => setHasAcceptedPrivacy(true)}
      />
    </div>
  );
};

export default AuthPage;