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
    const body: SendEmailRequest = await req.json();

    const toAddress = 'hiremebuddy061@gmail.com';
    const subjectPrefix = body.source === 'support' ? '[Support]' : '[Contact]';

    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>${subjectPrefix} New message from ${body.name}</h2>
        <p><strong>From:</strong> ${body.name} &lt;${body.email}&gt;</p>
        ${body.phone ? `<p><strong>Phone:</strong> ${body.phone}</p>` : ''}
        ${body.category ? `<p><strong>Category:</strong> ${body.category}</p>` : ''}
        <p><strong>Subject:</strong> ${body.subject}</p>
        <hr />
        <p>${(body.message || '').replace(/\n/g, '<br/>')}</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'HireMeBuddy Support <onboarding@resend.dev>',
      to: [toAddress],
      subject: `${subjectPrefix} ${body.subject}`,
      html,
      reply_to: body.email,
    } as any);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ ok: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('send-email error:', error);
    return new Response(JSON.stringify({ ok: false, error: error.message || String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
