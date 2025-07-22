import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  MessageSquare, 
  CheckCircle, 
  X,
  ArrowLeft,
  DollarSign
} from 'lucide-react';

interface QuoteRequest {
  id: string;
  client_id: string;
  labourer_id: string;
  service_id: string;
  project_description: string;
  budget: string;
  timeline: string;
  address: string;
  phone: string;
  urgency: string;
  preferred_contact: string;
  status: string;
  quote_amount: number | null;
  quote_message: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    full_name: string;
    contact_number: string;
    avatar_url: string;
  };
  services: {
    id: string;
    service_name: string;
    description: string;
    hourly_rate: number;
  };
}

const QuoteRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');

  useEffect(() => {
    if (id) {
      loadQuoteRequest();
    }
  }, [id]);

  const loadQuoteRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          *,
          profiles!quote_requests_client_id_fkey(id, full_name, contact_number, avatar_url),
          services(id, service_name, description, hourly_rate)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setQuoteRequest(data);
      
      if (data.quote_amount) {
        setQuoteAmount(data.quote_amount.toString());
      }
      if (data.quote_message) {
        setQuoteMessage(data.quote_message);
      }
    } catch (error) {
      console.error('Error loading quote request:', error);
      toast({
        title: "Error",
        description: "Could not load quote request details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuote = async () => {
    if (!quoteRequest || !profile) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({
          quote_amount: parseFloat(quoteAmount),
          quote_message: quoteMessage,
          status: 'quoted'
        })
        .eq('id', quoteRequest.id);

      if (error) throw error;

      // Send notification to client
      await supabase
        .from('notifications')
        .insert({
          user_id: quoteRequest.client_id,
          type: 'quote_received',
          message: `You received a quote of N$${quoteAmount} for your project`,
          category: 'quote',
          target_url: `/quote-requests/${quoteRequest.id}`
        });

      toast({
        title: "Quote Submitted",
        description: "Your quote has been sent to the client."
      });

      await loadQuoteRequest();
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast({
        title: "Error",
        description: "Failed to submit quote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptQuote = async () => {
    if (!quoteRequest) return;
    
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status: 'accepted' })
        .eq('id', quoteRequest.id);

      if (error) throw error;

      // Send notification to provider
      await supabase
        .from('notifications')
        .insert({
          user_id: quoteRequest.labourer_id,
          type: 'quote_accepted',
          message: `Your quote for N$${quoteRequest.quote_amount} has been accepted`,
          category: 'quote',
          target_url: `/quote-requests/${quoteRequest.id}`
        });

      toast({
        title: "Quote Accepted",
        description: "The provider will contact you to schedule the work."
      });

      await loadQuoteRequest();
    } catch (error) {
      console.error('Error accepting quote:', error);
      toast({
        title: "Error",
        description: "Failed to accept quote. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">You need to be signed in to view quote requests.</p>
          <Button onClick={() => navigate('/auth')} className="btn-sunset">
            Sign In
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!quoteRequest) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Quote Request Not Found</h1>
          <Button onClick={() => navigate('/profile')} variant="outline">
            Go Back
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isProvider = profile?.id === quoteRequest.labourer_id;
  const isClient = profile?.id === quoteRequest.client_id;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/profile')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <h1 className="text-3xl font-bold">Quote Request Details</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Request Details */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{quoteRequest.services.service_name}</CardTitle>
                      <CardDescription>
                        Requested on {new Date(quoteRequest.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant={quoteRequest.status === 'pending' ? 'secondary' : 
                                   quoteRequest.status === 'quoted' ? 'default' : 'outline'}>
                      {quoteRequest.status.charAt(0).toUpperCase() + quoteRequest.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Project Description</h4>
                    <p className="text-muted-foreground">{quoteRequest.project_description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-1">Budget Range</h4>
                      <p className="text-muted-foreground">{quoteRequest.budget || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Timeline</h4>
                      <p className="text-muted-foreground">{quoteRequest.timeline || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Priority</h4>
                      <p className="text-muted-foreground capitalize">{quoteRequest.urgency}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Preferred Contact</h4>
                      <p className="text-muted-foreground capitalize">{quoteRequest.preferred_contact}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Project Location
                    </h4>
                    <p className="text-muted-foreground">{quoteRequest.address}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Contact Number
                    </h4>
                    <p className="text-muted-foreground">{quoteRequest.phone}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quote Section */}
              {quoteRequest.status !== 'pending' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quote Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {quoteRequest.quote_amount && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-semibold">Quoted Amount:</span>
                          <span className="text-2xl font-bold text-primary">
                            N${quoteRequest.quote_amount}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {quoteRequest.quote_message && (
                      <div>
                        <h4 className="font-semibold mb-2">Provider Message</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {quoteRequest.quote_message}
                        </p>
                      </div>
                    )}

                    {isClient && quoteRequest.status === 'quoted' && (
                      <div className="flex gap-2 mt-4">
                        <Button onClick={handleAcceptQuote} className="btn-sunset">
                          Accept Quote
                        </Button>
                        <Button variant="outline">
                          Negotiate
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quote Submission Form (Provider Only) */}
              {isProvider && quoteRequest.status === 'pending' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Submit Quote</CardTitle>
                    <CardDescription>
                      Provide a detailed quote for this project
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Quote Amount (N$)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={quoteAmount}
                        onChange={(e) => setQuoteAmount(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Quote Message</Label>
                      <Textarea
                        id="message"
                        value={quoteMessage}
                        onChange={(e) => setQuoteMessage(e.target.value)}
                        placeholder="Explain what's included in your quote, timeline, materials, etc."
                        rows={4}
                      />
                    </div>

                    <Button 
                      onClick={handleSubmitQuote}
                      disabled={!quoteAmount || isSubmitting}
                      className="w-full btn-sunset"
                    >
                      {isSubmitting ? 'Submitting Quote...' : 'Submit Quote'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Client Info */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isProvider ? 'Client Information' : 'Your Request'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <User className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{quoteRequest.profiles.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {quoteRequest.profiles.contact_number}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold">{quoteRequest.services.service_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {quoteRequest.services.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Starting at N${quoteRequest.services.hourly_rate}/hour</span>
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

export default QuoteRequestDetailPage;