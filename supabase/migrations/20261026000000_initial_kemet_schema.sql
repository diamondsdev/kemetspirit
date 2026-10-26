-- ============================================================================
-- KEMET SPIRIT - AUTHORITATIVE SUPABASE SCHEMA MIGRATION
-- Migration: 20261026000000_initial_kemet_schema.sql
-- Description: Authoritative relational schema for destinations, excursions,
--              schedules, bookings, CRM, finance, staff roles, and audit logging.
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enums
DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM ('owner', 'admin', 'manager', 'operations', 'finance', 'support', 'traveler');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE tour_category_type AS ENUM ('diving', 'safari', 'history', 'boat', 'speedboat', 'cultural');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE tour_status_type AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status_type AS ENUM ('pending_approval', 'confirmed', 'completed', 'cancelled', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_type AS ENUM ('unpaid', 'partially_paid', 'paid', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE review_status_type AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE inquiry_status_type AS ENUM ('new', 'in_progress', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('payment', 'refund', 'adjustment', 'expense');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Utility Function: Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. User Profiles & Staff Roles
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  nationality TEXT,
  hotel_name TEXT,
  room_number TEXT,
  role user_role_type NOT NULL DEFAULT 'traveler',
  vip_tier TEXT NOT NULL DEFAULT 'Noble',
  lead_status TEXT NOT NULL DEFAULT 'Active Traveler',
  lead_score INTEGER NOT NULL DEFAULT 70,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User roles table for explicit multiple role assignments and auditing
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role_type NOT NULL,
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- ============================================================================
-- 5. Tourism Catalogue: Destinations, Categories, Tours & Media
-- ============================================================================
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  ancient_name TEXT,
  country TEXT NOT NULL DEFAULT 'Egypt',
  region TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tour_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  tagline TEXT,
  category_id UUID REFERENCES tour_categories(id) ON DELETE SET NULL,
  category_slug tour_category_type NOT NULL DEFAULT 'diving',
  destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
  duration TEXT NOT NULL,
  base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (rating >= 1.00 AND rating <= 5.00),
  review_count INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  primary_image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  ancient_lore TEXT,
  inclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  exclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status tour_status_type NOT NULL DEFAULT 'published',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  max_capacity_per_departure INTEGER NOT NULL DEFAULT 20,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_tours_updated_at
BEFORE UPDATE ON tours
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS tour_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  activities JSONB NOT NULL DEFAULT '[]'::jsonb,
  scribe_wisdom TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tour_pickup_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  default_pickup_time TEXT,
  extra_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. Tour Schedules & Real Capacity Management
-- ============================================================================
CREATE TABLE IF NOT EXISTS tour_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  departure_date DATE NOT NULL,
  start_time TIME WITHOUT TIME ZONE NOT NULL DEFAULT '08:00:00',
  max_capacity INTEGER NOT NULL DEFAULT 20 CHECK (max_capacity > 0),
  reserved_count INTEGER NOT NULL DEFAULT 0 CHECK (reserved_count >= 0),
  price_override NUMERIC(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tour_id, departure_date, start_time)
);

CREATE TRIGGER update_tour_schedules_updated_at
BEFORE UPDATE ON tour_schedules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. Bookings & Operations Ledger
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE RESTRICT,
  schedule_id UUID REFERENCES tour_schedules(id) ON DELETE SET NULL,
  tour_title TEXT NOT NULL,
  traveler_name TEXT NOT NULL,
  traveler_email TEXT NOT NULL,
  phone_number TEXT,
  whatsapp_number TEXT,
  hotel_name TEXT,
  room_number TEXT,
  pickup_location TEXT,
  pickup_time TEXT,
  scheduled_date DATE NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  base_price_snapshot NUMERIC(10,2) NOT NULL,
  promo_code_used TEXT,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_cost NUMERIC(10,2) NOT NULL CHECK (total_cost >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  status booking_status_type NOT NULL DEFAULT 'pending_approval',
  payment_status payment_status_type NOT NULL DEFAULT 'unpaid',
  special_requests TEXT,
  internal_notes TEXT,
  assigned_guide_name TEXT,
  assigned_driver_name TEXT,
  checked_in BOOLEAN NOT NULL DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Booking status transition audit history
CREATE TABLE IF NOT EXISTS booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  from_status booking_status_type,
  to_status booking_status_type NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. Finance & Transactions
-- ============================================================================
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  transaction_type transaction_type NOT NULL DEFAULT 'payment',
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'completed',
  payment_method TEXT NOT NULL DEFAULT 'Manual/On-Arrival',
  external_reference TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. Customer Relationship Management: Inquiries & Reviews
-- ============================================================================
CREATE TABLE IF NOT EXISTS crm_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status inquiry_status_type NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'medium',
  internal_notes TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_crm_inquiries_updated_at
BEFORE UPDATE ON crm_inquiries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT 'Noble Explorer',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  status review_status_type NOT NULL DEFAULT 'pending',
  moderated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  interests JSONB NOT NULL DEFAULT '[]'::jsonb,
  vip_tier TEXT NOT NULL DEFAULT 'Noble',
  promo_code TEXT,
  is_subscribed BOOLEAN NOT NULL DEFAULT true,
  consent_given_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 10. Website Settings & Security Audit Logging
-- ============================================================================
CREATE TABLE IF NOT EXISTS website_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'SUCCESS',
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 11. Indexes for Maximum Query Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_category_slug ON tours(category_slug);
CREATE INDEX IF NOT EXISTS idx_tours_destination ON tours(destination_id);
CREATE INDEX IF NOT EXISTS idx_tour_schedules_lookup ON tour_schedules(tour_id, departure_date);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tour ON bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_reviews_tour ON reviews(tour_id, status);
CREATE INDEX IF NOT EXISTS idx_crm_inquiries_status ON crm_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- 12. Helper Functions & Atomic Booking Reservation
-- ============================================================================

-- Helper: Check if current auth user is staff
CREATE OR REPLACE FUNCTION auth_is_staff()
RETURNS BOOLEAN AS $$
DECLARE
  v_role user_role_type;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
  RETURN v_role IN ('owner', 'admin', 'manager', 'operations', 'finance', 'support');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: Check if current auth user has a specific role
CREATE OR REPLACE FUNCTION auth_has_role(required_role user_role_type)
RETURNS BOOLEAN AS $$
DECLARE
  v_role user_role_type;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
  RETURN v_role = required_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Concurrency-Safe Atomic Booking Creation
CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_customer_id UUID,
  p_tour_id UUID,
  p_scheduled_date DATE,
  p_traveler_name TEXT,
  p_traveler_email TEXT,
  p_phone TEXT,
  p_whatsapp TEXT,
  p_hotel_name TEXT,
  p_room_number TEXT,
  p_pickup_location TEXT,
  p_guest_count INTEGER,
  p_promo_code TEXT,
  p_special_requests TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_tour tours%ROWTYPE;
  v_schedule tour_schedules%ROWTYPE;
  v_base_price NUMERIC(10,2);
  v_discount NUMERIC(10,2) := 0.00;
  v_total NUMERIC(10,2);
  v_ref TEXT;
  v_booking_id UUID;
  v_new_reserved INTEGER;
BEGIN
  -- 1. Fetch Tour and Lock
  SELECT * INTO v_tour FROM tours WHERE id = p_tour_id AND status = 'published';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tour not found or not published';
  END IF;

  -- 2. Fetch or Create Schedule with Concurrency Lock
  SELECT * INTO v_schedule 
  FROM tour_schedules 
  WHERE tour_id = p_tour_id AND departure_date = p_scheduled_date
  FOR UPDATE;

  IF NOT FOUND THEN
    -- Auto-create schedule row for that date
    INSERT INTO tour_schedules (tour_id, departure_date, max_capacity, reserved_count)
    VALUES (p_tour_id, p_scheduled_date, v_tour.max_capacity_per_departure, 0)
    RETURNING * INTO v_schedule;
  END IF;

  -- 3. Verify Capacity
  IF (v_schedule.reserved_count + p_guest_count) > v_schedule.max_capacity THEN
    RAISE EXCEPTION 'Excursion capacity exceeded. Only % spots available on %', 
      (v_schedule.max_capacity - v_schedule.reserved_count), p_scheduled_date;
  END IF;

  -- 4. Calculate Price & Promo
  v_base_price := COALESCE(v_schedule.price_override, v_tour.base_price);
  IF p_promo_code IS NOT NULL AND LOWER(TRIM(p_promo_code)) IN ('kemet30', 'royal30', 'pharaoh30') THEN
    v_discount := ROUND((v_base_price * p_guest_count * 0.30), 2);
  END IF;
  v_total := (v_base_price * p_guest_count) - v_discount;

  -- 5. Generate Unique Booking Reference: KEM-YYYY-XXXX
  v_ref := 'KEM-' || TO_CHAR(p_scheduled_date, 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');

  -- 6. Insert Booking
  INSERT INTO bookings (
    booking_reference,
    customer_id,
    tour_id,
    schedule_id,
    tour_title,
    traveler_name,
    traveler_email,
    phone_number,
    whatsapp_number,
    hotel_name,
    room_number,
    pickup_location,
    scheduled_date,
    guest_count,
    base_price_snapshot,
    promo_code_used,
    discount_amount,
    total_cost,
    currency,
    status,
    payment_status,
    special_requests
  ) VALUES (
    v_ref,
    p_customer_id,
    p_tour_id,
    v_schedule.id,
    v_tour.title,
    p_traveler_name,
    p_traveler_email,
    p_phone,
    p_whatsapp,
    p_hotel_name,
    p_room_number,
    p_pickup_location,
    p_scheduled_date,
    p_guest_count,
    v_base_price,
    p_promo_code,
    v_discount,
    v_total,
    v_tour.currency,
    'pending_approval',
    'unpaid',
    p_special_requests
  ) RETURNING id INTO v_booking_id;

  -- 7. Update Schedule Reserved Count Atomically
  UPDATE tour_schedules 
  SET reserved_count = reserved_count + p_guest_count
  WHERE id = v_schedule.id;

  -- 8. Add Status History
  INSERT INTO booking_status_history (booking_id, to_status, note)
  VALUES (v_booking_id, 'pending_approval', 'Booking submitted by traveler');

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'booking_reference', v_ref,
    'total_cost', v_total,
    'discount_amount', v_discount,
    'scheduled_date', p_scheduled_date,
    'guest_count', p_guest_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 13. Row Level Security (RLS) Configuration
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_pickup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can view limited fields; user can update own profile; staff can view all
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT USING (auth.uid() = id OR auth_is_staff());

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Tours & Catalogue: Public can view published tours
CREATE POLICY "Public can view published tours" 
ON tours FOR SELECT USING (status = 'published' OR auth_is_staff());

CREATE POLICY "Staff can manage tours" 
ON tours FOR ALL USING (auth_is_staff());

CREATE POLICY "Public can view destinations" 
ON destinations FOR SELECT USING (true);

CREATE POLICY "Staff can manage destinations" 
ON destinations FOR ALL USING (auth_is_staff());

CREATE POLICY "Public can view tour categories" 
ON tour_categories FOR SELECT USING (true);

CREATE POLICY "Public can view itineraries" 
ON tour_itineraries FOR SELECT USING (true);

CREATE POLICY "Public can view pickup locations" 
ON tour_pickup_locations FOR SELECT USING (true);

CREATE POLICY "Public can view active tour schedules" 
ON tour_schedules FOR SELECT USING (is_active = true OR auth_is_staff());

CREATE POLICY "Staff can manage tour schedules" 
ON tour_schedules FOR ALL USING (auth_is_staff());

-- Bookings: Customers can view their own bookings; Staff can view and manage all
CREATE POLICY "Customers can view own bookings" 
ON bookings FOR SELECT USING (customer_id = auth.uid() OR auth_is_staff());

CREATE POLICY "Customers can create bookings" 
ON bookings FOR INSERT WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);

CREATE POLICY "Staff can manage bookings" 
ON bookings FOR ALL USING (auth_is_staff());

CREATE POLICY "Staff can view status history" 
ON booking_status_history FOR SELECT USING (auth_is_staff());

-- Financial Transactions: Staff with finance/admin/owner role only
CREATE POLICY "Finance staff can view transactions" 
ON financial_transactions FOR SELECT USING (
  auth_is_staff() AND (auth_has_role('owner') OR auth_has_role('admin') OR auth_has_role('finance'))
);

CREATE POLICY "Finance staff can manage transactions" 
ON financial_transactions FOR ALL USING (
  auth_is_staff() AND (auth_has_role('owner') OR auth_has_role('admin') OR auth_has_role('finance'))
);

-- Reviews: Public can view approved reviews; customers can insert; staff can moderate
CREATE POLICY "Public can view approved reviews" 
ON reviews FOR SELECT USING (status = 'approved' OR auth_is_staff());

CREATE POLICY "Authenticated users can submit reviews" 
ON reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can moderate reviews" 
ON reviews FOR ALL USING (auth_is_staff());

-- CRM Inquiries: Anyone can submit inquiries; staff can view and manage
CREATE POLICY "Anyone can submit inquiry" 
ON crm_inquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can manage inquiries" 
ON crm_inquiries FOR ALL USING (auth_is_staff());

-- Newsletter: Anyone can subscribe; staff can view
CREATE POLICY "Anyone can subscribe to newsletter" 
ON newsletter_subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can view newsletter subscribers" 
ON newsletter_subscribers FOR SELECT USING (auth_is_staff());

-- Website Settings: Public can view public settings; staff can manage
CREATE POLICY "Public can view settings" 
ON website_settings FOR SELECT USING (true);

CREATE POLICY "Staff can manage settings" 
ON website_settings FOR ALL USING (auth_is_staff());

-- Audit Logs: Staff only
CREATE POLICY "Staff can view audit logs" 
ON audit_logs FOR SELECT USING (auth_is_staff());
