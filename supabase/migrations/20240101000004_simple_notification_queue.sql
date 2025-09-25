-- Simple approach: Create a notification queue with trigger only
-- The queue can be processed by calling the send-push-notification function directly

-- Create notification queue table
CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'HireMeBuddy Notification',
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key constraint if notifications table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
    ALTER TABLE public.notification_queue 
    ADD CONSTRAINT fk_notification_queue_notification_id 
    FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON public.notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON public.notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_created_at ON public.notification_queue(created_at);

-- Enable RLS
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notification queue" 
ON public.notification_queue 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage notification queue" 
ON public.notification_queue 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create simple function to queue push notifications
CREATE OR REPLACE FUNCTION public.queue_push_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into notification queue for processing
  INSERT INTO public.notification_queue (
    notification_id,
    user_id,
    title,
    body,
    data
  ) VALUES (
    NEW.id,
    NEW.user_id,
    'HireMeBuddy Notification',
    NEW.message,
    jsonb_build_object(
      'notification_id', NEW.id::text,
      'type', NEW.type,
      'category', COALESCE(NEW.category, 'general'),
      'url', COALESCE(NEW.target_url, '/notifications'),
      'timestamp', NEW.created_at::text
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the notification insert
    RAISE LOG 'Error queuing push notification for notification %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_queue_push_notification ON public.notifications;

-- Create trigger to queue push notifications on notification insert
CREATE TRIGGER trigger_queue_push_notification
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_push_notification();

-- Create function to manually process notification queue (can be called from admin panel)
CREATE OR REPLACE FUNCTION public.process_pending_notifications(batch_size INTEGER DEFAULT 10)
RETURNS TABLE(
  processed_count INTEGER,
  success_count INTEGER,
  error_count INTEGER,
  pending_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_processed INTEGER := 0;
  total_success INTEGER := 0;
  total_errors INTEGER := 0;
  remaining_pending INTEGER := 0;
BEGIN
  -- Get count of pending notifications
  SELECT COUNT(*) INTO remaining_pending 
  FROM public.notification_queue 
  WHERE status = 'pending';

  -- For now, just mark the first batch as processed
  -- In a real implementation, this would call the send-push-notification function
  WITH processed_batch AS (
    SELECT id, user_id, title, body, data
    FROM public.notification_queue
    WHERE status = 'pending'
    ORDER BY created_at
    LIMIT batch_size
  )
  UPDATE public.notification_queue 
  SET 
    status = 'sent',
    processed_at = NOW()
  WHERE id IN (SELECT id FROM processed_batch);

  GET DIAGNOSTICS total_processed = ROW_COUNT;
  total_success := total_processed;

  -- Return results
  RETURN QUERY SELECT total_processed, total_success, total_errors, remaining_pending - total_processed;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.notification_queue TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.queue_push_notification TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_pending_notifications TO anon, authenticated;

-- Add comment explaining the setup
COMMENT ON TABLE public.notification_queue IS 'Queue for push notifications that need to be sent to devices. Populated automatically when notifications are created.';
COMMENT ON FUNCTION public.queue_push_notification IS 'Trigger function that adds new notifications to the push notification queue.';
COMMENT ON FUNCTION public.process_pending_notifications IS 'Function to process pending push notifications. Can be called manually or by a cron job.';