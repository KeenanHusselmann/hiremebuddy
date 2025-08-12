import { Link } from 'react-router-dom';
import { Facebook, MessageCircle, Phone, Mail, MapPin } from 'lucide-react';
import logo from '@/assets/hiremebuddy-logo.png';
import { useAuth } from '@/hooks/useAuth';

const Footer = () => {
  const { session } = useAuth();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <footer className="mt-16 border-t border-glass-border/30">
      <div className="glass-card rounded-none border-0">
        <div className="container-responsive py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img src={logo} alt="Hire.Me.Bra Logo" className="h-8 w-8" />
                <div>
                  <h3 className="font-bold text-foreground">HireMeBuddy</h3>
                  <p className="text-xs text-muted-foreground">Empowering Namibian Skills</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connecting skilled Namibian laborers with clients to build trust, 
                create opportunities, and strengthen our communities.
              </p>
              <div className="flex space-x-3">
                <div className="p-2 glass-card rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
                  <Facebook className="h-4 w-4 text-primary" />
                </div>
                <div className="p-2 glass-card rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <div className="p-2 glass-card rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Quick Links</h4>
              <nav className="flex flex-col space-y-2">
                 <Link 
                   to="/" 
                   onClick={scrollToTop}
                   className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 text-left"
                 >
                   Home
                 </Link>
                 <Link 
                   to="/browse" 
                   onClick={scrollToTop}
                   className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 text-left"
                 >
                   Browse Services
                 </Link>
                 <Link 
                   to="/how-it-works" 
                   onClick={scrollToTop}
                   className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 text-left"
                 >
                   How It Works
                 </Link>
                 <Link 
                   to="/contact" 
                   onClick={scrollToTop}
                   className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 text-left"
                 >
                   Contact Us
                 </Link>
              </nav>
            </div>

            {/* Services (Only for authenticated users) */}
            {session && (
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Popular Services</h4>
                <nav className="flex flex-col space-y-2">
                  <Link to="/services/plumbing" onClick={scrollToTop} className="text-sm text-muted-foreground hover:text-primary transition-colors">Plumbing</Link>
                  <Link to="/services/electrical" onClick={scrollToTop} className="text-sm text-muted-foreground hover:text-primary transition-colors">Electrical Work</Link>
                  <Link to="/services/carpentry" onClick={scrollToTop} className="text-sm text-muted-foreground hover:text-primary transition-colors">Carpentry</Link>
                  <Link to="/services/home-repairs" onClick={scrollToTop} className="text-sm text-muted-foreground hover:text-primary transition-colors">Home Repairs</Link>
                  <Link to="/services/gardening" onClick={scrollToTop} className="text-sm text-muted-foreground hover:text-primary transition-colors">Gardening</Link>
                  <Link to="/services/painting" onClick={scrollToTop} className="text-sm text-muted-foreground hover:text-primary transition-colors">Painting</Link>
                </nav>
              </div>
            )}

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Windhoek, Namibia<br />
                    Serving all regions
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    hiremebuddy061@gmail.com
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    +264 81 853 6789
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-glass-border/30">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                ©2025 HireMeBuddy - Connecting Namibian Skills with Opportunities
              </p>
               <nav className="flex flex-wrap items-center justify-center space-x-6">
                <Link 
                  to="/terms" 
                  onClick={scrollToTop}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Terms and Conditions
                </Link>
                <Link 
                  to="/privacy" 
                  onClick={scrollToTop}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
                <Link 
                  to="/support" 
                  onClick={scrollToTop}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Support
                </Link>
               </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;