import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ ok: false, error: "GOOGLE_MAPS_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const url = `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`;
    const body = { considerIp: true };

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("geolocate API error:", data);
      throw new Error(`Google Geolocation API error: ${resp.status}`);
    }

    const result = {
      ok: true,
      location: data?.location ?? null,
      accuracy: data?.accuracy ?? null,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("geolocate function error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: error?.message ?? String(error) }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
