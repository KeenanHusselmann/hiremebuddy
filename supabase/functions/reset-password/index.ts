import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser calls
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface PasswordResetRequest {
  email: string;
  redirectTo?: string; // optional override
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests FIRST and return early
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { email, redirectTo }: PasswordResetRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Read secrets lazily to avoid init errors during preflight
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!resendApiKey || !supabaseUrl || !serviceRoleKey) {
      console.error("Missing required env", {
        hasResend: !!resendApiKey,
        hasUrl: !!supabaseUrl,
        hasServiceRole: !!serviceRoleKey,
      });
      return new Response(
        JSON.stringify({ error: "Server not configured. Missing secrets." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const resend = new Resend(resendApiKey);

    // Choose a safe redirect URL that is whitelisted in Supabase Auth
    const safeDefault = "https://hiremebuddy.lovable.app/reset-password";
    const redirect = redirectTo && !redirectTo.includes("sandbox.lovable.dev") ? redirectTo : safeDefault;

    // 1) Generate a recovery link using the Admin API
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: redirect },
    });

    if (error || !data?.properties?.action_link) {
      console.error("generateLink error", error);
      return new Response(
        JSON.stringify({ error: error?.message || "Failed to generate reset link" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resetLink = data.properties.action_link;

    // 2) Send email via Resend (use a verified domain or Resend's onboarding sender)
    const emailResponse = await resend.emails.send({
      from: "HireMeBuddy <onboarding@resend.dev>",
      to: [email],
      subject: "Reset Your Password - HireMeBuddy",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">HireMeBuddy</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Connecting Namibian Skills with Opportunities</p>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #ea580c; margin-top: 0;">Reset Your Password</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password for your HireMeBuddy account. If you didn't make this request, you can safely ignore this email.</p>
            <p>To reset your password, click the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px;">${resetLink}</p>
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 14px;">Best regards,<br>The HireMeBuddy Team</p>
          </div>
        </div>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in reset-password function:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unexpected error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

