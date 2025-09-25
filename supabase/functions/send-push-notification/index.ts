import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  user_id?: string; // Optional for anonymous notifications
  device_id?: string; // For targeting specific anonymous devices
  title: string;
  body: string;
  data?: Record<string, string>;
  location?: {
    lat: number;
    lng: number;
    radius?: number; // Radius in kilometers
  };
  service_categories?: string[]; // Target users interested in specific categories
  send_to_all_anonymous?: boolean; // Send to all anonymous users
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { user_id, device_id, title, body, data, location, service_categories, send_to_all_anonymous }: NotificationPayload = await req.json();
    
    console.log('Sending push notification:', { user_id, device_id, title, send_to_all_anonymous });

    let allTokens = [];

    // Get tokens for logged-in users
    if (user_id) {
      const { data: userTokens, error: userTokensError } = await supabaseClient
        .from('device_tokens')
        .select('token, platform')
        .eq('user_id', user_id)
        .eq('is_active', true);

      if (userTokensError) {
        console.error('Error fetching user device tokens:', userTokensError);
      } else if (userTokens) {
        allTokens.push(...userTokens);
        console.log(`Found ${userTokens.length} tokens for user ${user_id}`);
      }
    }

    // Get tokens for anonymous devices
    if (device_id) {
      // Target specific anonymous device
      const { data: deviceTokens, error: deviceTokensError } = await supabaseClient
        .from('anonymous_device_tokens')
        .select('token, platform')
        .eq('device_id', device_id)
        .eq('is_active', true);

      if (deviceTokensError) {
        console.error('Error fetching device tokens:', deviceTokensError);
      } else if (deviceTokens) {
        allTokens.push(...deviceTokens);
        console.log(`Found ${deviceTokens.length} tokens for device ${device_id}`);
      }
    } else if (send_to_all_anonymous) {
      // Send to all anonymous devices (optionally filtered by location/categories)
      let query = supabaseClient
        .from('anonymous_device_tokens')
        .select('token, platform, location_lat, location_lng, service_categories')
        .eq('is_active', true);

      const { data: anonymousTokens, error: anonymousTokensError } = await query;

      if (anonymousTokensError) {
        console.error('Error fetching anonymous device tokens:', anonymousTokensError);
      } else if (anonymousTokens) {
        let filteredTokens = anonymousTokens;

        // Filter by location if provided
        if (location && location.lat && location.lng) {
          const radius = location.radius || 10; // Default 10km radius
          filteredTokens = filteredTokens.filter(token => {
            if (!token.location_lat || !token.location_lng) return false;
            
            // Calculate distance using Haversine formula
            const R = 6371; // Earth's radius in km
            const dLat = (token.location_lat - location.lat) * Math.PI / 180;
            const dLng = (token.location_lng - location.lng) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(location.lat * Math.PI / 180) * Math.cos(token.location_lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;
            
            return distance <= radius;
          });
        }

        // Filter by service categories if provided
        if (service_categories && service_categories.length > 0) {
          filteredTokens = filteredTokens.filter(token => {
            if (!token.service_categories || token.service_categories.length === 0) return false;
            return service_categories.some(category => 
              token.service_categories.includes(category)
            );
          });
        }

        allTokens.push(...filteredTokens.map(token => ({ token: token.token, platform: token.platform })));
        console.log(`Found ${filteredTokens.length} anonymous tokens (filtered from ${anonymousTokens.length})`);
      }
    }

    if (!allTokens || allTokens.length === 0) {
      console.log('No active device tokens found');
      return new Response(
        JSON.stringify({ success: true, message: 'No devices to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Firebase service account key
    const serviceAccountKey = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_KEY');
    if (!serviceAccountKey) {
      throw new Error('Firebase service account key not configured');
    }

    const serviceAccount = JSON.parse(serviceAccountKey);
    
    // Get Firebase access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: await createJWT(serviceAccount),
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Send notifications to all tokens
    const results = await Promise.allSettled(
      allTokens.map(async (tokenData) => {
        const message = {
          message: {
            token: tokenData.token,
            notification: {
              title,
              body,
            },
            data: data || {},
            webpush: {
              fcm_options: {
                link: data?.url || '/',
              },
            },
          },
        };

        const response = await fetch(
          `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('FCM Error:', errorText);
          
          // If token is invalid, deactivate it from both tables
          if (response.status === 404 || errorText.includes('UNREGISTERED')) {
            // Try to deactivate from device_tokens table
            await supabaseClient
              .from('device_tokens')
              .update({ is_active: false })
              .eq('token', tokenData.token);
            
            // Try to deactivate from anonymous_device_tokens table
            await supabaseClient
              .from('anonymous_device_tokens')
              .update({ is_active: false })
              .eq('token', tokenData.token);
          }
          
          throw new Error(`FCM request failed: ${errorText}`);
        }

        return await response.json();
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Push notification results: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successful,
        failed: failed,
        total: allTokens.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending push notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function createJWT(serviceAccount: any) {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  
  // Import the private key
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(serviceAccount.private_key),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  // Sign the JWT
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signingInput)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${signingInput}.${encodedSignature}`;
}