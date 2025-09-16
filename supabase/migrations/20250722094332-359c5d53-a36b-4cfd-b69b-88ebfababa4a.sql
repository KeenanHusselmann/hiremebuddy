-- Create quote_requests table to store quote requests
CREATE TABLE public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  labourer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  project_description TEXT NOT NULL,
  budget TEXT,
  timeline TEXT,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'normal',
  preferred_contact TEXT NOT NULL DEFAULT 'phone',
  status TEXT NOT NULL DEFAULT 'pending',
  quote_amount NUMERIC,
  quote_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for quote_requests
CREATE POLICY "Users can view their own quote requests" 
ON public.quote_requests 
FOR SELECT 
USING (
  (client_id IN (
    SELECT profiles.id 
    FROM profiles 
    WHERE profiles.user_id = auth.uid()
  )) OR 
  (labourer_id IN (
    SELECT profiles.id 
    FROM profiles 
    WHERE profiles.user_id = auth.uid()
  ))
);

CREATE POLICY "Clients can create quote requests" 
ON public.quote_requests 
FOR INSERT 
WITH CHECK (
  client_id IN (
    SELECT profiles.id 
    FROM profiles 
    WHERE profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own quote requests" 
ON public.quote_requests 
FOR UPDATE 
USING (
  (client_id IN (
    SELECT profiles.id 
    FROM profiles 
    WHERE profiles.user_id = auth.uid()
  )) OR 
  (labourer_id IN (
    SELECT profiles.id 
    FROM profiles 
    WHERE profiles.user_id = auth.uid()
  ))
);

-- Add trigger for updated_at
CREATE TRIGGER update_quote_requests_updated_at
BEFORE UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create notification trigger for new quote requests
CREATE OR REPLACE FUNCTION public.notify_new_quote_request()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
    -- Notify the labourer about the new quote request
    PERFORM public.create_notification(
        NEW.labourer_id,
        'quote_request',
        'You have received a new quote request',
        'quote',
        '/quote-requests/' || NEW.id
    );
    
    RETURN NEW;
END;
$$;

-- Create trigger for new quote requests
CREATE TRIGGER notify_quote_request_created
AFTER INSERT ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_quote_request();