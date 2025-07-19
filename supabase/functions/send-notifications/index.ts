import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'client_contact_worker' | 'worker_contact_client';
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  workerName: string;
  workerEmail: string;
  workerPhone?: string;
  serviceName: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notificationData: NotificationRequest = await req.json();
    
    console.log("Processing notification:", notificationData);

    // Generate WhatsApp links
    const generateWhatsAppLink = (phone: string, message: string) => {
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      const encodedMessage = encodeURIComponent(message);
      return `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodedMessage}`;
    };

    let emailResponse;

    if (notificationData.type === 'client_contact_worker') {
      // Notify worker that a client wants to contact them
      const whatsappLink = notificationData.clientPhone 
        ? generateWhatsAppLink(
            notificationData.clientPhone, 
            `Hi ${notificationData.workerName}, I'm interested in your ${notificationData.serviceName} service. ${notificationData.message || ''}`
          )
        : null;

      emailResponse = await resend.emails.send({
        from: "HireMeBuddy <notifications@resend.dev>",
        to: [notificationData.workerEmail],
        subject: `New inquiry for your ${notificationData.serviceName} service`,
        html: `
          <h2>New Service Inquiry</h2>
          <p>Hello ${notificationData.workerName},</p>
          <p><strong>${notificationData.clientName}</strong> is interested in your <strong>${notificationData.serviceName}</strong> service.</p>
          
          ${notificationData.message ? `<p><strong>Message:</strong><br>${notificationData.message}</p>` : ''}
          
          <h3>Contact Information:</h3>
          <ul>
            <li><strong>Name:</strong> ${notificationData.clientName}</li>
            <li><strong>Email:</strong> ${notificationData.clientEmail}</li>
            ${notificationData.clientPhone ? `<li><strong>Phone:</strong> ${notificationData.clientPhone}</li>` : ''}
          </ul>
          
          <h3>Quick Actions:</h3>
          <p>
            <a href="mailto:${notificationData.clientEmail}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Reply via Email</a>
            ${whatsappLink ? `<a href="${whatsappLink}" style="background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Contact via WhatsApp</a>` : ''}
          </p>
          
          <p>Best regards,<br>The HireMeBuddy Team</p>
        `,
      });

      // Also notify the client
      await resend.emails.send({
        from: "HireMeBuddy <notifications@resend.dev>",
        to: [notificationData.clientEmail],
        subject: `Your inquiry has been sent to ${notificationData.workerName}`,
        html: `
          <h2>Inquiry Sent Successfully</h2>
          <p>Hello ${notificationData.clientName},</p>
          <p>Your inquiry for <strong>${notificationData.serviceName}</strong> has been sent to <strong>${notificationData.workerName}</strong>.</p>
          <p>They will contact you soon via email or phone.</p>
          
          <p>Thank you for using HireMeBuddy!</p>
          <p>Best regards,<br>The HireMeBuddy Team</p>
        `,
      });

    } else if (notificationData.type === 'worker_contact_client') {
      // Notify client that a worker wants to contact them
      const whatsappLink = notificationData.workerPhone 
        ? generateWhatsAppLink(
            notificationData.workerPhone, 
            `Hi ${notificationData.clientName}, I'm ${notificationData.workerName} regarding the ${notificationData.serviceName} service. ${notificationData.message || ''}`
          )
        : null;

      emailResponse = await resend.emails.send({
        from: "HireMeBuddy <notifications@resend.dev>",
        to: [notificationData.clientEmail],
        subject: `${notificationData.workerName} responded to your ${notificationData.serviceName} inquiry`,
        html: `
          <h2>Service Provider Response</h2>
          <p>Hello ${notificationData.clientName},</p>
          <p><strong>${notificationData.workerName}</strong> has responded to your inquiry for <strong>${notificationData.serviceName}</strong>.</p>
          
          ${notificationData.message ? `<p><strong>Message:</strong><br>${notificationData.message}</p>` : ''}
          
          <h3>Contact Information:</h3>
          <ul>
            <li><strong>Name:</strong> ${notificationData.workerName}</li>
            <li><strong>Email:</strong> ${notificationData.workerEmail}</li>
            ${notificationData.workerPhone ? `<li><strong>Phone:</strong> ${notificationData.workerPhone}</li>` : ''}
          </ul>
          
          <h3>Quick Actions:</h3>
          <p>
            <a href="mailto:${notificationData.workerEmail}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Reply via Email</a>
            ${whatsappLink ? `<a href="${whatsappLink}" style="background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Contact via WhatsApp</a>` : ''}
          </p>
          
          <p>Best regards,<br>The HireMeBuddy Team</p>
        `,
      });
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailResponse,
      message: "Notifications sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notifications function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);