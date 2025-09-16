import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MobileHeader from '@/components/MobileHeader';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle Supabase recovery redirect parameters which arrive in the URL hash
    // Example: /reset-password#access_token=...&refresh_token=...&type=recovery
    const hash = window.location.hash?.startsWith('#') ? window.location.hash.slice(1) : '';
    const hashParams = new URLSearchParams(hash);

    // Fallback to query params just in case
    const searchAccess = searchParams.get('access_token');
    const searchRefresh = searchParams.get('refresh_token');

    const accessToken = hashParams.get('access_token') || searchAccess;
    const refreshToken = hashParams.get('refresh_token') || searchRefresh;
    const type = hashParams.get('type');

    const processSession = async () => {
      if (accessToken && refreshToken && (type === 'recovery' || type === null || type === undefined)) {
        try {
          // Establish a temporary session so we can call updateUser
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;

          // Clean up the URL to remove sensitive tokens from the address bar
          if (window.location.hash) {
            history.replaceState(null, document.title, window.location.pathname + window.location.search);
          }
        } catch (err: any) {
          toast({
            title: "Session Error",
            description: "Unable to verify password reset link. Please request a new one.",
            variant: "destructive",
          });
          navigate('/auth');
        }
      } else if (!accessToken && !refreshToken) {
        // No tokens found, probably an invalid or expired link
        toast({
          title: "Invalid Link",
          description: "This password reset link is invalid or has expired. Please request a new one.",
          variant: "destructive",
        });
        navigate('/forgot-password');
      }
    };

    processSession();
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Success!",
        description: "Your password has been updated successfully",
      });

      // Redirect to sign in after a short delay
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <>
        <MobileHeader />
        <div className="min-h-screen bg-gradient-teal flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="glass-card border-glass-border/30">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Password Updated!
                </CardTitle>
                <CardDescription>
                  Your password has been successfully updated. Redirecting to sign in...
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MobileHeader />
      <div className="min-h-screen bg-gradient-teal flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="glass-card border-glass-border/30">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground">
                Reset Your Password
              </CardTitle>
              <CardDescription>
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full btn-sunset"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;