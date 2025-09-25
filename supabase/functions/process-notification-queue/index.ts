import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Processing notification queue...');

    // Get pending notifications from queue
    const { data: queueItems, error: queueError } = await supabaseClient
      .from('notification_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .lt('retry_count', 3)
      .order('created_at')
      .limit(50);

    if (queueError) {
      console.error('Error fetching queue items:', queueError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch queue items' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!queueItems || queueItems.length === 0) {
      console.log('No pending notifications to process');
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No pending notifications' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${queueItems.length} notifications`);

    let processed = 0;
    let failed = 0;

    // Process each notification
    for (const item of queueItems) {
      try {
        // Mark as processing
        await supabaseClient
          .from('notification_queue')
          .update({ 
            status: 'processing',
            processed_at: new Date().toISOString()
          })
          .eq('id', item.id);

        // Call the send-push-notification function
        const { data: pushResult, error: pushError } = await supabaseClient.functions.invoke(
          'send-push-notification',
          {
            body: {
              user_id: item.user_id,
              title: item.title,
              body: item.body,
              data: item.data || {}
            }
          }
        );

        if (pushError) {
          throw new Error(`Push notification failed: ${pushError.message}`);
        }

        // Mark as sent
        await supabaseClient
          .from('notification_queue')
          .update({ 
            status: 'sent',
            processed_at: new Date().toISOString()
          })
          .eq('id', item.id);

        processed++;
        console.log(`Successfully processed notification ${item.id}`);

      } catch (error) {
        console.error(`Error processing notification ${item.id}:`, error);
        
        // Increment retry count or mark as failed
        const newRetryCount = (item.retry_count || 0) + 1;
        const maxRetries = item.max_retries || 3;

        if (newRetryCount >= maxRetries) {
          // Mark as failed
          await supabaseClient
            .from('notification_queue')
            .update({
              status: 'failed',
              error_message: error.message,
              processed_at: new Date().toISOString()
            })
            .eq('id', item.id);
        } else {
          // Schedule for retry in 5 minutes
          const retryTime = new Date();
          retryTime.setMinutes(retryTime.getMinutes() + 5);
          
          await supabaseClient
            .from('notification_queue')
            .update({
              status: 'pending',
              retry_count: newRetryCount,
              error_message: error.message,
              scheduled_for: retryTime.toISOString()
            })
            .eq('id', item.id);
        }

        failed++;
      }
    }

    console.log(`Queue processing complete: ${processed} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed,
        failed,
        total: queueItems.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-notification-queue:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});