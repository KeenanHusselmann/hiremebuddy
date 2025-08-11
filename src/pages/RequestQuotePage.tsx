import { Calendar, User, MessageSquare, Clock, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const RequestQuotePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get service data passed from service detail page
  const service = location.state?.service || {
    title: 'Professional Service',
    provider: 'Service Provider',
    price: 'N$300/hour',
    rating: 4.8,
    category: 'general'
  };

  const [quoteData, setQuoteData] = useState({
    projectDescription: '',
    budget: '',
    timeline: '',
    address: '',
    phone: '',
    urgency: 'normal',
    preferredContact: 'phone'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">You need to be signed in to request quotes.</p>
          <Button onClick={() => navigate('/auth')} className="btn-sunset">
            Sign In
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setQuoteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get user profile first
      const { data: clientProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !clientProfile) {
        toast({
          title: "Profile Error",
          description: "Could not find your profile. Please complete your profile first.",
          variant: "destructive"
        });
        navigate('/profile');
        return;
      }

      // Resolve service and provider IDs from state or URL
      let labourerId = location.state?.labourerId as string | undefined;
      let serviceId = location.state?.serviceId as string | undefined;

      if (!labourerId || !serviceId) {
        const params = new URLSearchParams(window.location.search);
        const serviceIdParam = params.get('serviceId');
        if (serviceIdParam) {
          const { data: svc, error: svcError } = await supabase
            .from('services')
            .select('id, labourer_id')
            .eq('id', serviceIdParam)
            .single();
          if (!svcError && svc) {
            serviceId = svc.id;
            labourerId = svc.labourer_id;
          }
        }
      }

      if (!labourerId || !serviceId) {
        toast({
          title: "Missing Information",
          description: "Service information is missing. Please select a service first.",
          variant: "destructive"
        });
        navigate('/browse');
        return;
      }

      // Create quote request in the database
      const { data: quoteRequest, error: quoteError } = await supabase
        .from('quote_requests')
        .insert({
          client_id: clientProfile.id,
          labourer_id: labourerId,
          service_id: serviceId,
          project_description: quoteData.projectDescription,
          budget: quoteData.budget || null,
          timeline: quoteData.timeline || null,
          address: quoteData.address,
          phone: quoteData.phone,
          urgency: quoteData.urgency,
          preferred_contact: quoteData.preferredContact,
          status: 'pending'
        })
        .select()
        .single();

      if (quoteError) {
        console.error('Quote request creation error:', quoteError);
        throw new Error('Failed to create quote request');
      }

      toast({
        title: "Quote Request Sent!",
        description: "The provider will contact you with a custom quote within 24-48 hours.",
      });
      
      navigate('/profile');
    } catch (error: any) {
      console.error('Quote request error:', error);
      toast({
        title: "Request Failed",
        description: error.message || "There was an error sending your quote request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const timelineOptions = [
    'ASAP',
    'Within a week',
    'Within 2 weeks', 
    'Within a month',
    'More than a month',
    'Flexible timing'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Request Quote</h1>
            <p className="text-muted-foreground">Get a custom quote for your project</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quote Request Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>
                    Provide detailed information about your project to get an accurate quote
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Project Description */}
                    <div className="space-y-2">
                      <Label htmlFor="projectDescription">
                        <MessageSquare className="inline h-4 w-4 mr-2" />
                        Project Description
                      </Label>
                      <Textarea
                        id="projectDescription"
                        value={quoteData.projectDescription}
                        onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                        placeholder="Describe your project in detail - what needs to be done, materials required, size/scope, any special requirements..."
                        rows={5}
                        required
                      />
                    </div>

                    {/* Budget and Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="budget">Budget Range (N$)</Label>
                        <Input
                          id="budget"
                          value={quoteData.budget}
                          onChange={(e) => handleInputChange('budget', e.target.value)}
                          placeholder="e.g., 500-1000 or flexible"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timeline">
                          <Clock className="inline h-4 w-4 mr-2" />
                          Timeline
                        </Label>
                        <Select value={quoteData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="When do you need this done?" />
                          </SelectTrigger>
                          <SelectContent>
                            {timelineOptions.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Contact and Address */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Contact Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={quoteData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+264 XX XXX XXXX"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Project Location</Label>
                        <Textarea
                          id="address"
                          value={quoteData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          placeholder="Enter the address where the work will be done"
                          rows={2}
                          required
                        />
                      </div>
                    </div>

                    {/* Urgency and Contact Preference */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="urgency">Priority Level</Label>
                        <Select value={quoteData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                        <Select value={quoteData.preferredContact} onValueChange={(value) => handleInputChange('preferredContact', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="How should they contact you?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="phone">Phone Call</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="message">In-App Message</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full btn-sunset text-lg py-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending Request...' : 'Request Quote'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Service Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{service.title}</h3>
                    <p className="text-primary font-medium">{service.provider}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{service.rating}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Starting Rate:</span>
                      <span>{service.price}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    * Final quote will be based on your specific requirements
                  </div>
                </CardContent>
              </Card>

              {/* Quote Process */}
              <Card>
                <CardHeader>
                  <CardTitle>Quote Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</div>
                      <p>Submit your detailed project requirements</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</div>
                      <p>Provider reviews and may ask clarifying questions</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">3</div>
                      <p>Receive custom quote within 24-48 hours</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">4</div>
                      <p>Discuss details and finalize booking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RequestQuotePage;