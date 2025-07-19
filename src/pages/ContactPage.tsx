import { Mail, Phone, MapPin, MessageCircle, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhoneInputWithWhatsApp } from '@/components/PhoneInputWithWhatsApp';
import { CommunicationButtons } from '@/components/CommunicationButtons';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Send us an email and we\'ll respond within 24 hours',
      value: 'hello@hiremebuddy.na',
      action: 'mailto:hello@hiremebuddy.na'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak with our support team during business hours',
      value: '+264 61 123 456',
      action: 'tel:+26461123456'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Quick support via WhatsApp messaging',
      value: '+264 81 123 4567',
      action: 'https://wa.me/264811234567'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Our office location in Windhoek',
      value: 'Windhoek, Namibia',
      action: null
    }
  ];

  const faqs = [
    {
      question: 'How do I book a service?',
      answer: 'Browse our services, select a provider, and use the booking system or contact them directly via phone or WhatsApp.'
    },
    {
      question: 'Are service providers verified?',
      answer: 'Yes, all our service providers undergo verification checks including identity, skills assessment, and reference checks.'
    },
    {
      question: 'What if I\'m not satisfied with the service?',
      answer: 'We have a dispute resolution process. Contact our support team and we\'ll work to resolve any issues.'
    },
    {
      question: 'How do I become a service provider?',
      answer: 'Sign up on our platform, complete your profile, provide verification documents, and start receiving service requests.'
    },
    {
      question: 'What areas do you cover?',
      answer: 'We currently serve all 14 regions of Namibia, with the highest concentration of providers in major urban areas.'
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
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions, need support, or want to provide feedback? 
              We're here to help and would love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Get in Touch
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the most convenient way to reach us
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactMethods.map((method) => (
                <Card 
                  key={method.title}
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${method.action ? 'hover:scale-[1.02]' : ''}`}
                  onClick={() => method.action && window.open(method.action, '_blank')}
                >
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <method.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{method.title}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="font-semibold text-primary">{method.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Form and Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <PhoneInputWithWhatsApp
                      value={formData.phone}
                      onChange={(value) => handleInputChange('phone', value)}
                      placeholder="+264 81 234 5678"
                      label="Phone Number (Optional)"
                    />

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="provider">Become a Provider</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Brief description of your inquiry"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Please provide details about your inquiry..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full btn-sunset"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Business Hours and FAQ */}
              <div className="space-y-8">
                {/* Business Hours */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Business Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monday - Friday:</span>
                        <span className="font-medium">8:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Saturday:</span>
                        <span className="font-medium">9:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sunday:</span>
                        <span className="font-medium">Closed</span>
                      </div>
                      <div className="pt-2 text-sm text-muted-foreground">
                        <p>* Emergency support available 24/7 for urgent service requests</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ */}
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>
                      Quick answers to common questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-border/50 pb-4 last:border-b-0">
                          <h4 className="font-semibold text-foreground mb-2">
                            {faq.question}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {faq.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Office Location */}
        <section className="py-16 bg-gradient-to-b from-background to-primary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Office
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Visit us at our Windhoek headquarters or reach out through any of our digital channels
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-4">HireMeBuddy Headquarters</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Address</p>
                            <p className="text-muted-foreground">
                              123 Independence Avenue<br />
                              Windhoek Central<br />
                              Windhoek, Namibia
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="font-medium">Phone</p>
                            <p className="text-muted-foreground">+264 61 123 456</p>
                          </div>
                        </div>
                        
                        <CommunicationButtons
                          phoneNumber="+264611234567"
                          whatsappNumber="+264611234567"
                          facebookUrl="https://facebook.com/hiremebuddy"
                          className="mt-4"
                        />

                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-muted-foreground">hello@hiremebuddy.na</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-6 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Interactive map coming soon
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;