import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReverseGeocodeRequest {
  lat: number;
  lng: number;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng }: ReverseGeocodeRequest = await req.json();
    if (typeof lat !== "number" || typeof lng !== "number") {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid lat/lng provided" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ ok: false, error: "GOOGLE_MAPS_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("latlng", `${lat},${lng}`);
    url.searchParams.set("key", apiKey);

    const resp = await fetch(url.toString());
    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(`Geocoding API error: ${resp.status}`);
    }

    const result = Array.isArray(data.results) && data.results.length > 0 ? data.results[0] : null;
    const formatted_address: string | null = result?.formatted_address ?? null;

    return new Response(
      JSON.stringify({ ok: true, address: formatted_address, raw: data }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("reverse-geocode error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: error?.message ?? String(error) }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
