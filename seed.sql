-- Enhanced seed.sql
-- Database schema and seed data for subscription cancellation flow
-- Production-ready with proper RLS policies and security

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  monthly_price INTEGER NOT NULL, -- Price in USD cents
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_cancellation', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced cancellations table
CREATE TABLE IF NOT EXISTS cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  downsell_variant TEXT NOT NULL CHECK (downsell_variant IN ('A', 'B')),
  reason TEXT,
  reason_other TEXT, -- For custom "other" reasons
  accepted_downsell BOOLEAN DEFAULT FALSE,
  downsell_original_price INTEGER, -- Original price in cents
  downsell_offered_price INTEGER, -- Offered price in cents
  session_id TEXT, -- For tracking unique sessions
  user_agent TEXT, -- Security tracking
  ip_address INET, -- Security tracking
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_cancellations_user_id ON cancellations(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_session_id ON cancellations(session_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_created_at ON cancellations(created_at);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for subscriptions updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own cancellations" ON cancellations;
DROP POLICY IF EXISTS "Users can view own cancellations" ON cancellations;

-- Enhanced RLS policies
-- Users policies
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Subscriptions policies
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "subscriptions_update_own" ON subscriptions
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.jwt() ->> 'role' = 'service_role'
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Cancellations policies
CREATE POLICY "cancellations_insert_own" ON cancellations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "cancellations_select_own" ON cancellations
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "cancellations_update_own" ON cancellations
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.jwt() ->> 'role' = 'service_role'
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Function to safely get user's active subscription
CREATE OR REPLACE FUNCTION get_user_active_subscription(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  monthly_price INTEGER,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) 
SECURITY DEFINER
AS $$
BEGIN
  -- Security check: ensure user can only access their own data
  IF auth.uid() != p_user_id AND auth.jwt() ->> 'role' != 'service_role' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  RETURN QUERY
  SELECT s.id, s.monthly_price, s.status, s.created_at
  FROM subscriptions s
  WHERE s.user_id = p_user_id AND s.status = 'active'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has existing cancellation in progress
CREATE OR REPLACE FUNCTION get_user_cancellation(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  downsell_variant TEXT,
  reason TEXT,
  accepted_downsell BOOLEAN,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER
AS $$
BEGIN
  -- Security check
  IF auth.uid() != p_user_id AND auth.jwt() ->> 'role' != 'service_role' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  RETURN QUERY
  SELECT c.id, c.downsell_variant, c.reason, c.accepted_downsell, c.completed_at, c.created_at
  FROM cancellations c
  JOIN subscriptions s ON c.subscription_id = s.id
  WHERE c.user_id = p_user_id 
    AND s.status IN ('active', 'pending_cancellation')
  ORDER BY c.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Seed data
INSERT INTO users (id, email) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'user1@example.com'),
  ('550e8400-e29b-41d4-a716-446655440002', 'user2@example.com'),
  ('550e8400-e29b-41d4-a716-446655440003', 'user3@example.com'),
  ('550e8400-e29b-41d4-a716-446655440004', 'user4@example.com'),
  ('550e8400-e29b-41d4-a716-446655440005', 'user5@example.com')
ON CONFLICT (email) DO NOTHING;

-- Seed subscriptions with $25 and $29 plans
INSERT INTO subscriptions (user_id, monthly_price, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 2500, 'active'), -- $25.00
  ('550e8400-e29b-41d4-a716-446655440002', 2900, 'active'), -- $29.00
  ('550e8400-e29b-41d4-a716-446655440003', 2500, 'active'), -- $25.00
  ('550e8400-e29b-41d4-a716-446655440004', 2900, 'active'), -- $29.00
  ('550e8400-e29b-41d4-a716-446655440005', 2500, 'active')  -- $25.00
ON CONFLICT DO NOTHING;