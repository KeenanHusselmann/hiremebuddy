import { Calendar, User, DollarSign, MessageSquare, Clock, Star, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get service data passed from service detail page
  const service = location.state?.service || {
    title: 'Professional Plumbing Services',
    provider: 'Johannes Mwandingi',
    price: 'N$300/hour',
    rating: 4.8,
    category: 'plumbing'
  };

  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    duration: '',
    message: '',
    address: '',
    phone: '',
    urgency: 'normal'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">You need to be signed in to book services.</p>
          <Button onClick={() => navigate('/auth')} className="btn-sunset">
            Sign In
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotal = () => {
    const hourlyRate = parseInt(service.price.replace(/[^\d]/g, ''));
    const hours = parseFloat(bookingData.duration) || 1;
    const urgencyMultiplier = bookingData.urgency === 'urgent' ? 1.5 : 1;
    return (hourlyRate * hours * urgencyMultiplier).toFixed(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate booking submission
    setTimeout(() => {
      toast({
        title: "Booking Confirmed!",
        description: "Your service has been booked. The provider will contact you shortly.",
      });
      navigate('/profile'); // Redirect to profile where bookings would be listed
      setIsSubmitting(false);
    }, 2000);
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Book Service</h1>
            <p className="text-muted-foreground">Complete your booking details below</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                  <CardDescription>
                    Provide the necessary information for your service booking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">
                          <Calendar className="inline h-4 w-4 mr-2" />
                          Preferred Date
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={bookingData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time">
                          <Clock className="inline h-4 w-4 mr-2" />
                          Preferred Time
                        </Label>
                        <Select value={bookingData.time} onValueChange={(value) => handleInputChange('time', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map(time => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Duration and Urgency */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">
                          <Clock className="inline h-4 w-4 mr-2" />
                          Estimated Duration (hours)
                        </Label>
                        <Input
                          id="duration"
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={bookingData.duration}
                          onChange={(e) => handleInputChange('duration', e.target.value)}
                          placeholder="e.g., 2.5"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="urgency">Urgency Level</Label>
                        <Select value={bookingData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="urgent">Urgent (+50% fee)</SelectItem>
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
                          value={bookingData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+264 XX XXX XXXX"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Service Address</Label>
                        <Textarea
                          id="address"
                          value={bookingData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          placeholder="Enter the address where the service should be performed"
                          rows={2}
                          required
                        />
                      </div>
                    </div>

                    {/* Project Description */}
                    <div className="space-y-2">
                      <Label htmlFor="message">
                        <MessageSquare className="inline h-4 w-4 mr-2" />
                        Project Description
                      </Label>
                      <Textarea
                        id="message"
                        value={bookingData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Describe the work you need done, any specific requirements, materials needed, etc."
                        rows={4}
                        required
                      />
                    </div>

                    {/* Terms */}
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span className="font-medium">Booking Terms</span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Payment is due upon completion of service</li>
                        <li>• 24-hour cancellation policy applies</li>
                        <li>• Provider will contact you to confirm details</li>
                        <li>• Emergency services may incur additional fees</li>
                      </ul>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full btn-sunset text-lg py-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing Booking...' : 'Confirm Booking'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="space-y-6">
              {/* Service Summary */}
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
                      <span className="text-muted-foreground">Base Rate:</span>
                      <span>{service.price}</span>
                    </div>
                    {bookingData.duration && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{bookingData.duration} hours</span>
                      </div>
                    )}
                    {bookingData.urgency === 'urgent' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Urgency Fee:</span>
                        <span className="text-orange-600">+50%</span>
                      </div>
                    )}
                  </div>

                  {bookingData.duration && (
                    <>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Estimated Total:</span>
                        <span className="text-primary">N${calculateTotal()}</span>
                      </div>
                    </>
                  )}

                  <div className="text-xs text-muted-foreground">
                    * Final cost may vary based on actual work required
                  </div>
                </CardContent>
              </Card>

              {/* Provider Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Provider Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{service.provider}</p>
                        <p className="text-sm text-muted-foreground">
                          Professional {service.category}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      The provider will contact you within 2 hours to confirm booking details.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Have questions about your booking?
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/contact')}>
                    Contact Support
                  </Button>
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

export default BookingPage;