import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/hiremebuddy-logo.png';

interface HeaderProps {
  isAuthenticated?: boolean;
  userType?: 'client' | 'labourer';
  userName?: string;
  notificationCount?: number;
}

const Header = ({ 
  isAuthenticated = false, 
  userType = 'client', 
  userName = '',
  notificationCount = 0 
}: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-card border-0 border-b border-glass-border/30 rounded-none">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200">
              <img src={logo} alt="HireMeBuddy Logo" className="h-10 w-10" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">HireMeBuddy</h1>
                <p className="text-xs text-muted-foreground">Connect • Create • Collaborate</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                Home
              </Link>
              <Link 
                to="/browse" 
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                Browse Services
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/profile" 
                  className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
                >
                  My Profile
                </Link>
              )}
            </nav>

            {/* Desktop Auth/User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </Button>

                  {/* User Menu */}
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{userName}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {userType === 'labourer' ? 'Service Provider' : 'Client'}
                    </span>
                  </div>

                  <Button variant="outline" size="sm">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="btn-sunset">
                      Get Started
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
                  Home
                </Link>
                <Link 
                  to="/browse" 
                  className="text-foreground hover:text-primary transition-colors duration-200 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Browse Services
                </Link>
                {isAuthenticated && (
                  <Link 
                    to="/profile" 
                    className="text-foreground hover:text-primary transition-colors duration-200 font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                )}
                
                <div className="pt-4 border-t border-glass-border/30">
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{userName}</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {userType === 'labourer' ? 'Provider' : 'Client'}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link to="/login" className="block">
                        <Button variant="ghost" size="sm" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link to="/signup" className="block">
                        <Button className="btn-sunset w-full">
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
  );
};

export default Header;