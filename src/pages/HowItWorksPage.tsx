import { CheckCircle, Users, Search, Calendar, Shield, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const HowItWorksPage = () => {
  const { session } = useAuth();
  const steps = [
    {
      number: 1,
      title: 'Search & Browse',
      description: 'Find skilled professionals by searching for specific services or browsing our categories. Filter by location, price, and ratings.',
      icon: Search,
      details: [
        'Browse 12+ service categories',
        'Advanced search with filters',
        'View provider profiles and ratings',
        'Compare prices and availability'
      ]
    },
    {
      number: 2,
      title: 'Connect & Communicate',
      description: 'Contact service providers directly through phone, WhatsApp, or our platform messaging system.',
      icon: Users,
      details: [
        'Direct phone and WhatsApp contact',
        'In-platform messaging',
        'Request quotes and estimates',
        'Discuss project requirements'
      ]
    },
    {
      number: 3,
      title: 'Book & Schedule',
      description: 'Schedule your service at a convenient time. Our booking system helps coordinate between you and the provider.',
      icon: Calendar,
      details: [
        'Flexible scheduling options',
        'Secure booking process',
        'Automatic confirmations',
        'Appointment reminders'
      ]
    },
    {
      number: 4,
      title: 'Safe & Secure Work',
      description: 'Enjoy peace of mind with our verified professionals and secure payment protection.',
      icon: Shield,
      details: [
        'Verified service providers',
        'Secure payment processing',
        'Insurance protection',
        'Dispute resolution support'
      ]
    },
    {
      number: 5,
      title: 'Review & Rate',
      description: 'Share your experience by rating and reviewing the service provider to help future customers.',
      icon: Star,
      details: [
        'Rate your experience',
        'Write detailed reviews',
        'Upload photos of completed work',
        'Help build trust in the community'
      ]
    }
  ];

  const benefits = [
    {
      title: 'For Customers',
      points: [
        'Access to verified skilled professionals',
        'Transparent pricing and reviews',
        'Secure booking and payment',
        'Quick response times',
        'Local service providers',
        'Quality guarantee'
      ],
      color: 'bg-primary/10 border-primary/20'
    },
    {
      title: 'For Service Providers',
      points: [
        'Reach more customers in your area',
        'Build your professional reputation',
        'Flexible work opportunities',
        'Secure payment processing',
        'Marketing and promotion support',
        'Customer review system'
      ],
      color: 'bg-sunset-accent/10 border-sunset-accent/20'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-sunset-accent/5">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              How HireMeBuddy Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Connecting skilled Namibian professionals with customers has never been easier. 
              Here's how our platform brings trust and quality to every service interaction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={session ? "/browse" : "/auth"}>
                <Button className="btn-sunset px-8 py-3 text-lg">
                  Find Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" className="px-8 py-3 text-lg">
                  Join as Provider
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                5 Simple Steps to Get Things Done
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From finding the right professional to completing your project safely and securely
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.number} className="relative">
                  <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
                    {/* Step Number & Icon */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-sunset rounded-full flex items-center justify-center mb-4">
                          <step.icon className="h-10 w-10 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{step.number}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-lg text-muted-foreground mb-4">
                        {step.description}
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute left-10 top-20 w-0.5 h-12 bg-gradient-to-b from-primary to-primary/20"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gradient-to-b from-background to-primary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Benefits for Everyone
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                HireMeBuddy creates value for both customers seeking services and professionals offering them
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <Card key={benefit.title} className={`border-2 ${benefit.color}`}>
                  <CardHeader>
                    <CardTitle className="text-2xl text-center">
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {benefit.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Safety & Trust Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Your Safety is Our Priority
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We implement multiple layers of protection to ensure safe and reliable service experiences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Providers</h3>
                <p className="text-muted-foreground">
                  All service providers undergo verification checks including identity, skills, and references.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Review System</h3>
                <p className="text-muted-foreground">
                  Transparent reviews and ratings help you choose the best providers based on real customer experiences.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Support Team</h3>
                <p className="text-muted-foreground">
                  Our dedicated support team is available to help resolve any issues and ensure quality service.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-sunset-accent text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of satisfied customers and skilled professionals on HireMeBuddy today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={session ? "/browse" : "/auth"}>
                <Button variant="secondary" className="px-8 py-3 text-lg">
                  Find Services Now
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-primary">
                  Join as Provider
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;