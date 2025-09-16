import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Phone, Mail, MessageCircle } from 'lucide-react';

interface ContactServiceProviderProps {
  workerName: string;
  workerEmail: string;
  workerPhone?: string;
  serviceName: string;
  onContactSent?: () => void;
}

export const ContactServiceProvider: React.FC<ContactServiceProviderProps> = ({
  workerName,
  workerEmail,
  workerPhone,
  serviceName,
  onContactSent
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const validateInput = (input: string) => {
    // Basic sanitization - remove potential XSS patterns
    return input.replace(/<script.*?>.*?<\/script>/gi, '').trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation and sanitization
    const sanitizedData = {
      name: validateInput(formData.name),
      email: validateInput(formData.email),
      phone: validateInput(formData.phone),
      message: validateInput(formData.message)
    };

    // Additional validation
    if (sanitizedData.name.length < 2) {
      toast({
        title: "Validation Error",
        description: "Name must be at least 2 characters long",
        variant: "destructive",
      });
      return;
    }

    if (sanitizedData.message.length < 10) {
      toast({
        title: "Validation Error", 
        description: "Message must be at least 10 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-notifications', {
        body: {
          type: 'client_contact_worker',
          clientName: sanitizedData.name,
          clientEmail: sanitizedData.email,
          clientPhone: sanitizedData.phone,
          workerName,
          workerEmail,
          workerPhone,
          serviceName,
          message: sanitizedData.message
        }
      });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: `Your inquiry has been sent to ${workerName}. They will contact you soon.`,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });

      onContactSent?.();
    } catch (error: unknown) {
      // Log error only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error sending message:', error);
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectContact = (method: 'email' | 'phone' | 'whatsapp') => {
    switch (method) {
      case 'email':
        window.open(`mailto:${workerEmail}?subject=Inquiry about ${serviceName}`, '_blank');
        break;
      case 'phone':
        if (workerPhone) {
          window.open(`tel:${workerPhone}`, '_self');
        }
        break;
      case 'whatsapp':
        if (workerPhone) {
          const cleanPhone = workerPhone.replace(/[^\d+]/g, '');
          const message = `Hi ${workerName}, I'm interested in your ${serviceName} service.`;
          window.open(`https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
        }
        break;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact {workerName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Contact Options */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDirectContact('email')}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
          {workerPhone && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDirectContact('phone')}
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Call
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDirectContact('whatsapp')}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            </>
          )}
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Your Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Your Phone (Optional)</label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+264 81 234 5678"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder={`Hi ${workerName}, I'm interested in your ${serviceName} service...`}
              rows={4}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full btn-sunset"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Message'}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};