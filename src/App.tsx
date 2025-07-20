import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AccessibilityProvider } from "@/hooks/useAccessibility";
import PageLoader from "@/components/PageLoader";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import BrowseServicesPage from "./pages/BrowseServicesPage";
import ServiceCategoryPage from "./pages/ServiceCategoryPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import ContactPage from "./pages/ContactPage";
import BookingDetailPage from "./pages/BookingDetailPage";
import InsightsPage from "./pages/InsightsPage";
import AdminDashboard from "./pages/AdminDashboard";
import SupportPage from "./pages/SupportPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import CreateServicePage from "./pages/CreateServicePage";
import NotFound from "./pages/NotFound";

// Component to handle scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="hiremebuddy-theme">
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <PageLoader isLoading={isLoading} />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <AccessibilityProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/create-service" element={<CreateServicePage />} />
                    <Route path="/insights" element={<InsightsPage />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/browse" element={<BrowseServicesPage />} />
                    <Route path="/services/:category" element={<ServiceCategoryPage />} />
                    <Route path="/services/:category/:serviceId" element={<ServiceDetailPage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/bookings/:bookingId" element={<BookingDetailPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AccessibilityProvider>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
