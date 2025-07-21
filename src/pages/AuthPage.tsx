import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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

    return () => subscription.unsubscribe();
  }, [navigate]);

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
      if (!idDocument) {
        toast({
          title: "Error",
          description: "Identity document is required for service providers",
          variant: "destructive",
        });
        return;
      }
      if (!agreeToTerms) {
        toast({
          title: "Error",
          description: "You must agree to terms and conditions",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      // First, upload ID document if provider
      let idDocumentUrl = null;
      if (userType === 'labourer' && idDocument) {
        const fileExt = idDocument.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(`id-documents/${fileName}`, idDocument);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('profile-images')
          .getPublicUrl(`id-documents/${fileName}`);
        
        idDocumentUrl = urlData.publicUrl;
      }

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
            id_document_url: idDocumentUrl,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdDocument(file);
    }
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
            <CardTitle className="text-3xl font-bold text-foreground mb-2">
              {isLogin ? 'Welcome Back!' : 'Join Hire.Me.Bra'}
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
                  ✨ Connect with trusted service providers<br/>
                  🔒 Secure and verified professionals<br/>
                  📱 Direct communication tools
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
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                    />
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

                        <div className="space-y-2">
                          <Label htmlFor="idDocument">Identity Document *</Label>
                          <div className="flex items-center space-x-3">
                            <input
                              id="idDocument"
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleFileChange}
                              className="hidden"
                              required
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('idDocument')?.click()}
                              className="flex items-center space-x-2"
                            >
                              <span>Upload ID Document</span>
                            </Button>
                            {idDocument && (
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span>{idDocument.name}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Upload your ID document or driver's license for verification
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="agreeToTerms"
                            checked={agreeToTerms}
                            onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                            required
                          />
                          <Label htmlFor="agreeToTerms" className="text-sm">
                            I agree to the{' '}
                            <Link to="/terms" className="text-primary hover:underline">
                              Terms and Conditions
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" className="text-primary hover:underline">
                              Privacy Policy
                            </Link>
                          </Label>
                        </div>
                      </>
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
    </div>
  );
};

export default AuthPage;