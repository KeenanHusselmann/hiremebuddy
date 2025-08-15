import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  source: 'support' | 'contact';
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  category?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing email request...');
    
    // Check if RESEND_API_KEY is available
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    console.log('RESEND_API_KEY available:', !!resendApiKey);
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set in environment variables');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email service not configured - missing RESEND_API_KEY',
        details: 'The RESEND_API_KEY environment variable is not set'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body: SendEmailRequest = await req.json();
    console.log('Request body:', { ...body, email: '[hidden]' });

    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      throw new Error('Missing required fields');
    }

    const toAddress = 'hiremebuddy061@gmail.com';
    const subjectPrefix = body.source === 'support' ? '[Support]' : '[Contact]';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${subjectPrefix} New message from ${body.name}</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>From:</strong> ${body.name} &lt;${body.email}&gt;</p>
          ${body.phone ? `<p><strong>Phone:</strong> ${body.phone}</p>` : ''}
          ${body.category ? `<p><strong>Category:</strong> ${body.category}</p>` : ''}
          <p><strong>Subject:</strong> ${body.subject}</p>
        </div>
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
          <h3>Message:</h3>
          <p style="line-height: 1.6; white-space: pre-wrap;">${body.message}</p>
        </div>
        <hr style="margin: 30px 0;" />
        <p style="color: #666; font-size: 14px;">
          This message was sent from the HireMeBuddy ${body.source} form.
        </p>
      </div>
    `;

    console.log('Attempting to send email to:', toAddress);

    const emailData = {
      from: 'HireMeBuddy <onboarding@resend.dev>',
      to: [toAddress],
      subject: `${subjectPrefix} ${body.subject}`,
      html,
      reply_to: body.email,
    };

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Email sending failed: ${JSON.stringify(error)}`);
    }

    console.log('Email sent successfully:', data);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email sent successfully',
      data 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('send-email error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Failed to send email',
      details: error.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
