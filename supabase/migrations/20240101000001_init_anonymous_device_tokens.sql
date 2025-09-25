-- Create anonymous device tokens table for push notifications
create table public.anonymous_device_tokens (
  id uuid default gen_random_uuid() primary key,
  device_id text not null unique,
  fcm_token text not null,
  location_lat decimal(10, 8),
  location_lng decimal(11, 8),
  preferred_categories text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.anonymous_device_tokens enable row level security;

-- Create RLS policies (allow all operations for now since this is anonymous data)
create policy "Allow all operations on anonymous_device_tokens" 
  on public.anonymous_device_tokens 
  for all 
  using (true) 
  with check (true);

-- Create function to insert or update anonymous device token
create or replace function public.insert_anonymous_device_token(
  p_device_id text,
  p_fcm_token text,
  p_location_lat decimal default null,
  p_location_lng decimal default null,
  p_preferred_categories text[] default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_token_id uuid;
begin
  insert into public.anonymous_device_tokens (
    device_id,
    fcm_token,
    location_lat,
    location_lng,
    preferred_categories
  )
  values (
    p_device_id,
    p_fcm_token,
    p_location_lat,
    p_location_lng,
    p_preferred_categories
  )
  on conflict (device_id) 
  do update set
    fcm_token = excluded.fcm_token,
    location_lat = excluded.location_lat,
    location_lng = excluded.location_lng,
    preferred_categories = excluded.preferred_categories,
    updated_at = timezone('utc'::text, now())
  returning id into v_token_id;
  
  return v_token_id;
end;
$$;

-- Create function to update device preferences
create or replace function public.update_device_preferences(
  p_device_id text,
  p_location_lat decimal default null,
  p_location_lng decimal default null,
  p_preferred_categories text[] default null
)
returns boolean
language plpgsql
security definer
as $$
begin
  update public.anonymous_device_tokens 
  set
    location_lat = coalesce(p_location_lat, location_lat),
    location_lng = coalesce(p_location_lng, location_lng),
    preferred_categories = coalesce(p_preferred_categories, preferred_categories),
    updated_at = timezone('utc'::text, now())
  where device_id = p_device_id;
  
  return found;
end;
$$;

-- Create function to get device tokens by location (for location-based notifications)
create or replace function public.get_device_tokens_by_location(
  p_lat decimal,
  p_lng decimal,
  p_radius_km decimal default 10
)
returns table(device_id text, fcm_token text)
language plpgsql
security definer
as $$
begin
  return query
  select 
    adt.device_id,
    adt.fcm_token
  from public.anonymous_device_tokens adt
  where adt.location_lat is not null 
    and adt.location_lng is not null
    and (
      6371 * acos(
        cos(radians(p_lat)) * 
        cos(radians(adt.location_lat)) * 
        cos(radians(adt.location_lng) - radians(p_lng)) + 
        sin(radians(p_lat)) * 
        sin(radians(adt.location_lat))
      )
    ) <= p_radius_km;
end;
$$;

-- Create function to get device tokens by category
create or replace function public.get_device_tokens_by_category(
  p_category text
)
returns table(device_id text, fcm_token text)
language plpgsql
security definer
as $$
begin
  return query
  select 
    adt.device_id,
    adt.fcm_token
  from public.anonymous_device_tokens adt
  where p_category = any(adt.preferred_categories);
end;
$$;

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.anonymous_device_tokens to anon, authenticated;
grant execute on function public.insert_anonymous_device_token to anon, authenticated;
grant execute on function public.update_device_preferences to anon, authenticated;
grant execute on function public.get_device_tokens_by_location to anon, authenticated;
grant execute on function public.get_device_tokens_by_category to anon, authenticated;