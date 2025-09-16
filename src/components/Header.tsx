import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { NotificationCenter } from '@/components/NotificationCenter';
import MobileHeader from '@/components/MobileHeader';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { Capacitor } from '@capacitor/core';
import logo from '@/assets/hiremebuddy-logo.png';

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollDirection = useScrollDirection();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      {/* Mobile Status Bar Header */}
      <MobileHeader />
      
      <header className={`fixed w-full transition-transform duration-300 z-40 ${
        Capacitor.isNativePlatform() 
          ? `top-8 ${scrollDirection === 'down' ? '-translate-y-[calc(100%+2rem)]' : 'translate-y-0'}`
          : `top-0 ${scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'}`
      }`}>
        <div className="glass-card border-0 border-b border-glass-border/30 rounded-none mobile-compact-header">
          <div className="container-responsive">
            <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
              {/* Logo and Brand */}
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 hover:scale-105 transition-transform duration-200 tap-target">
                <img src={logo} alt="Hire.Me.Bra Logo" className="logo-mobile h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20" />
                <div className="hidden sm:block">
                  <h1 className="text-base sm:text-lg font-bold text-foreground">HireMeBuddy</h1>
                  <p className="text-xs text-muted-foreground">Connect • Create • Collaborate</p>
                </div>
              </Link>

              {/* Desktop Navigation - now in burger menu for all screen sizes */}

              {/* Right side items */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                {user && <NotificationCenter />}
                
                {/* User profile avatar or login button */}
                {user ? (
                  <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity tap-target">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Profile" 
                        className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-full object-cover border border-border cursor-pointer"
                      />
                    ) : (
                      <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer tap-target">
                        <User className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary" />
                      </div>
                    )}
                  <span className="hidden sm:block text-sm font-medium truncate max-w-[120px]">{profile?.full_name || 'User'}</span>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="lg" className="h-12 px-6">
                    {t('nav.login')}
                  </Button>
                </Link>
              )}
            </div>

            {/* Burger Menu Button (always visible) */}
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleMobileMenu}
              className="tap-target min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] lg:min-h-[48px] lg:min-w-[48px]"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />}
            </Button>
          </div>

          {/* Burger Menu */}
          {isMobileMenuOpen && (
            <div className="py-4 border-t border-glass-border/30 nav-mobile">
              <nav className="flex flex-col space-y-3">
                <Link 
                  to="/" 
                  className="text-foreground hover:text-primary transition-colors duration-200 font-medium py-3 tap-target rounded-md px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('nav.home')}
                </Link>
                <Link 
                  to="/browse" 
                  className="text-foreground hover:text-primary transition-colors duration-200 font-medium py-3 tap-target rounded-md px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('nav.browse')}
                </Link>
                {user && (
                  <>
                    <Link 
                      to="/profile" 
                      className="text-foreground hover:text-primary transition-colors duration-200 font-medium py-3 tap-target rounded-md px-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('nav.profile')}
                    </Link>
                    <Link 
                      to="/insights" 
                      className="text-foreground hover:text-primary transition-colors duration-200 font-medium py-3 tap-target rounded-md px-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Insights
                    </Link>
                    {profile?.user_type === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="text-foreground hover:text-primary transition-colors duration-200 font-medium py-3 tap-target rounded-md px-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                  </>
                )}
                
                <div className="pt-4 border-t border-glass-border/30">
                  {user ? (
                    <div className="space-y-4">
                      <Link to="/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity tap-target p-2 rounded-md">
                        {profile?.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt="Profile" 
                            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border border-border cursor-pointer"
                          />
                        ) : (
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer tap-target">
                            <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-medium block truncate max-w-[150px]">{profile?.full_name || 'User'}</span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {profile?.user_type === 'labourer' ? 'Provider' : 'Client'}
                          </span>
                        </div>
                      </Link>
                      <Button variant="outline" size="sm" className="w-full tap-target btn-touch" onClick={signOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link to="/auth" className="block">
                        <Button variant="ghost" size="sm" className="w-full tap-target btn-touch" onClick={() => setIsMobileMenuOpen(false)}>
                          {t('nav.login')}
                        </Button>
                      </Link>
                      <Link to="/auth" className="block">
                        <Button className="btn-sunset w-full tap-target btn-touch" onClick={() => setIsMobileMenuOpen(false)}>
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;