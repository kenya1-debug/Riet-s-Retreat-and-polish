-- =====================================================================
-- Riet's Retreat and Polish — Supabase schema
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query)
-- =====================================================================

-- ---------- Extensions ----------
create extension if not exists "uuid-ossp";

-- ---------- ENUM types ----------
do $$ begin
  create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_type as enum ('in_salon', 'call_in');
exception when duplicate_object then null; end $$;

do $$ begin
  create type staff_role as enum ('stylist', 'barber', 'receptionist', 'manager');
exception when duplicate_object then null; end $$;

-- ---------- services ----------
create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text default '',
  category text default 'General',
  price_kes numeric(10,2) not null default 0,
  duration_minutes int not null default 30,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- staff ----------
create table if not exists public.staff (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  role staff_role not null default 'stylist',
  phone text default '',
  email text default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- shifts (which staff member works which shift) ----------
create table if not exists public.shifts (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid references public.staff(id) on delete cascade,
  shift_date date not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now()
);

-- ---------- bookings (covers BOTH in-salon bookings and call-in/house requests) ----------
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  type booking_type not null default 'in_salon',
  customer_name text not null,
  phone text not null,
  email text default '',
  service_id uuid references public.services(id) on delete set null,
  preferred_date date not null,
  preferred_time time not null,
  address text default '',            -- only used for call_in
  notes text default '',
  status booking_status not null default 'pending',
  staff_id uuid references public.staff(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- walk-ins (front-desk quick log) ----------
create table if not exists public.walkins (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  service_id uuid references public.services(id) on delete set null,
  staff_id uuid references public.staff(id) on delete set null,
  price_kes numeric(10,2) not null default 0,
  served_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ---------- gallery ----------
create table if not exists public.gallery_images (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  caption text default '',
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- testimonials ----------
create table if not exists public.testimonials (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  quote text not null,
  rating int not null default 5 check (rating between 1 and 5),
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- site_settings (editable copy: hours, hero text, contact info) ----------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null
);

-- =====================================================================
-- Row Level Security
-- Public (anon) visitors may: read active services/gallery/testimonials/settings,
--   and insert new bookings.
-- Any authenticated user is treated as staff/admin (there is no public sign-up —
--   admin accounts are created by hand in the Supabase dashboard), and can
--   read/write everything.
-- =====================================================================

alter table public.services enable row level security;
alter table public.staff enable row level security;
alter table public.shifts enable row level security;
alter table public.bookings enable row level security;
alter table public.walkins enable row level security;
alter table public.gallery_images enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_settings enable row level security;

-- services: public read (active only), staff full access
create policy "public read active services" on public.services
  for select using (active = true or auth.role() = 'authenticated');
create policy "staff manage services" on public.services
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- gallery: public read (active only), staff full access
create policy "public read active gallery" on public.gallery_images
  for select using (active = true or auth.role() = 'authenticated');
create policy "staff manage gallery" on public.gallery_images
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- testimonials: public read (active only), staff full access
create policy "public read active testimonials" on public.testimonials
  for select using (active = true or auth.role() = 'authenticated');
create policy "staff manage testimonials" on public.testimonials
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- site_settings: public read, staff write
create policy "public read settings" on public.site_settings
  for select using (true);
create policy "staff write settings" on public.site_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- bookings: public may INSERT (create a booking/call-in request); only staff can read/update/delete
create policy "public create booking" on public.bookings
  for insert with check (true);
create policy "staff manage bookings" on public.bookings
  for select using (auth.role() = 'authenticated');
create policy "staff update bookings" on public.bookings
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "staff delete bookings" on public.bookings
  for delete using (auth.role() = 'authenticated');

-- staff, shifts, walkins: staff-only, front-of-house data, never public
create policy "staff manage staff" on public.staff
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "staff manage shifts" on public.shifts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "staff manage walkins" on public.walkins
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- =====================================================================
-- Seed data — safe to edit/delete from the admin dashboard later
-- =====================================================================

insert into public.site_settings (key, value) values
  ('hours', '{
     "monday_friday": "8:00 AM – 10:00 PM",
     "saturday": "9:00 AM – 7:00 PM",
     "sunday": "2:00 PM – 7:00 PM"
   }'::jsonb),
  ('contact', '{
     "phone": "+254 7XX XXX XXX",
     "whatsapp": "+254 7XX XXX XXX",
     "email": "hello@rietsretreat.co.ke",
     "address": "Kabarnet, Baringo County, Kenya",
     "tiktok": "https://www.tiktok.com/@jayharriet8"
   }'::jsonb),
  ('hero', '{
     "tagline": "Kabarnet''s home of retreat, refinement and polish.",
     "subtext": "Hair, grooming and nail care crafted with care — in our chair, or at your door."
   }'::jsonb)
on conflict (key) do nothing;

insert into public.services (name, description, category, price_kes, duration_minutes, sort_order) values
  ('Signature Haircut', 'Precision cut, wash and style finish.', 'Hair', 800, 45, 1),
  ('Gents Barber Cut & Line-up', 'Classic or fade cut with a crisp line-up.', 'Barber', 500, 30, 2),
  ('Braiding — Box Braids', 'Full-head box braids, medium size.', 'Hair', 3500, 240, 3),
  ('Silk Press & Blow-dry', 'Heat styling for a smooth, glossy finish.', 'Hair', 1200, 60, 4),
  ('Classic Manicure', 'Nail shaping, cuticle care and polish.', 'Nails', 600, 40, 5),
  ('Classic Pedicure', 'Soak, scrub, nail care and polish.', 'Nails', 800, 50, 6),
  ('Gel Manicure', 'Long-wear gel polish application.', 'Nails', 1000, 50, 7),
  ('Facial Treatment', 'Deep-cleanse facial with steam and mask.', 'Treatments', 1500, 60, 8),
  ('Bridal Package', 'Full hair, makeup and nails for the big day (by appointment).', 'Packages', 8000, 180, 9)
on conflict do nothing;

insert into public.staff (full_name, role, phone) values
  ('Harriet ("Jay Harriet")', 'manager', ''),
  ('Staff Member 2', 'stylist', ''),
  ('Staff Member 3', 'barber', '')
on conflict do nothing;

insert into public.testimonials (customer_name, quote, rating, sort_order) values
  ('Cherop A.', 'The best braiding experience I have had in Kabarnet. Neat, gentle and so patient.', 5, 1),
  ('Kiprop M.', 'Clean cut every single time. The shop feels upscale but the prices are fair.', 5, 2),
  ('Naliaka W.', 'They came to my home for a full bridal party — everyone looked flawless.', 5, 3)
on conflict do nothing;
