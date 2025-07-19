import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import logo from '@/assets/hiremebuddy-logo.png';

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-card border-0 border-b border-glass-border/30 rounded-none">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200">
              <img src={logo} alt="Hire.Me.Bra Logo" className="h-10 w-10" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">Hire.Me.Bra</h1>
                <p className="text-xs text-muted-foreground">Connect • Create • Collaborate</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {t('nav.home')}
              </Link>
              <Link 
                to="/browse" 
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {t('nav.browse')}
              </Link>
              {user && (
                <Link 
                  to="/profile" 
                  className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
                >
                  {t('nav.profile')}
                </Link>
              )}
            </nav>

            {/* Desktop Auth/User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                  </Button>

                  {/* User Menu */}
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{profile?.full_name || 'User'}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {profile?.user_type === 'labourer' ? 'Service Provider' : 'Client'}
                    </span>
                  </div>

                  <Button variant="outline" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" size="sm">
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="btn-sunset">
                      {t('nav.getStarted')}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-glass-border/30">
              <nav className="flex flex-col space-y-4">
                <Link 
                  to="/" 
                  className="text-foreground hover:text-primary transition-colors duration-200 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('nav.home')}
                </Link>
                <Link 
                  to="/browse" 
                  className="text-foreground hover:text-primary transition-colors duration-200 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('nav.browse')}
                </Link>
                {user && (
                  <Link 
                    to="/profile" 
                    className="text-foreground hover:text-primary transition-colors duration-200 font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.profile')}
                  </Link>
                )}
                
                <div className="pt-4 border-t border-glass-border/30">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{profile?.full_name || 'User'}</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {profile?.user_type === 'labourer' ? 'Provider' : 'Client'}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('nav.logout')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link to="/auth" className="block">
                        <Button variant="ghost" size="sm" className="w-full">
                          {t('nav.login')}
                        </Button>
                      </Link>
                      <Link to="/auth" className="block">
                        <Button className="btn-sunset w-full">
                          {t('nav.getStarted')}
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
  );
};

export default Header;