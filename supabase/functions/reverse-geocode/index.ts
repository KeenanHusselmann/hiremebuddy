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
    // Prefer precise address-like results and avoid plus codes
    url.searchParams.set("result_type", "street_address|premise|subpremise|route");
    url.searchParams.set("location_type", "ROOFTOP|RANGE_INTERPOLATED");
    url.searchParams.set("key", apiKey);

    const resp = await fetch(url.toString());
    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(`Geocoding API error: ${resp.status}`);
    }

    // Pick the best result by priority
    const results: any[] = Array.isArray(data.results) ? data.results : [];
    const byType = (t: string) => results.find(r => Array.isArray(r.types) && r.types.includes(t));
    let candidate = byType('street_address') || byType('premise') || byType('subpremise') || byType('route') || results[0] || null;

    let address: string | null = null;

    const toAddress = (c: any): string | null => {
      if (!c) return null;
      const comps: any[] = c.address_components || [];
      const get = (type: string) => comps.find((comp) => comp.types?.includes(type))?.long_name ?? '';
      const streetNumber = get('street_number');
      const route = get('route');
      const suburb = get('sublocality') || get('sublocality_level_1') || get('neighborhood');
      const town = get('locality') || get('administrative_area_level_2');
      const street = [streetNumber, route].filter(Boolean).join(' ');
      const locality = [suburb, town].filter(Boolean).join(', ');
      const built = [street, locality].filter(Boolean).join(', ');
      return built || c.formatted_address || null;
    };

    address = toAddress(candidate);

    if (!address) {
      const fallbackUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json');
      fallbackUrl.searchParams.set('latlng', `${lat},${lng}`);
      fallbackUrl.searchParams.set('key', apiKey);
      const resp2 = await fetch(fallbackUrl.toString());
      const data2 = await resp2.json();
      const results2: any[] = Array.isArray(data2.results) ? data2.results : [];
      candidate = results2[0] || null;
      address = toAddress(candidate);
      if (!address) {
        const plusCode = data2.plus_code?.compound_code || data.plus_code?.compound_code || null;
        address = plusCode || null;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, address, raw: data }),
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
