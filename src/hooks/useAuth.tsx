import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  user_type: 'client' | 'labourer' | 'both' | 'admin';
  contact_number?: string;
  whatsapp_link?: string;
  facebook_link?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  is_verified?: boolean;
  first_login_completed?: boolean;
  town?: string | null;
  location_text?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (error) {
      // Log error only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching profile:', error);
      }
      return null;
    }
  };

  const showWelcomeToast = async (profile: Profile | null, sessionId: string) => {
    if (!profile || !sessionId) return;

    // Check if we've already shown welcome for this session
    const welcomeKey = `welcome_shown_${sessionId}`;
    const alreadyShown = sessionStorage.getItem(welcomeKey);
    
    if (alreadyShown) return;

    const isFirstLogin = !profile.first_login_completed;

    if (isFirstLogin) {
      // Update first_login_completed flag
      await supabase
        .from('profiles')
        .update({ first_login_completed: true })
        .eq('user_id', profile.user_id);

      toast({
        title: `Welcome ${profile.full_name}!`,
        description: "Welcome to Hire.Me.Bra! Start exploring services or offer your own.",
      });
    } else {
      toast({
        title: `Welcome back ${profile.full_name}!`,
        description: "You've been successfully logged in.",
      });
    }

    // Mark welcome as shown for this session
    sessionStorage.setItem(welcomeKey, 'true');
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer profile fetching to prevent deadlocks
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            // Show welcome toast only for actual sign-in events
            if (profileData && session.access_token) {
              showWelcomeToast(profileData, session.access_token);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          // Clear all welcome session storage on logout
          Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('welcome_shown_')) {
              sessionStorage.removeItem(key);
            }
          });
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Clear local state first
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Then sign out from Supabase
      await supabase.auth.signOut();
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      
      // Redirect to auth page
      window.location.href = '/auth';
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};