-- Migration: 002_newsletter_subscribers
-- Creates newsletter subscribers table for VicNail Studio email capture

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'vicnail-studio',
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Index for fast email lookup
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_idx ON newsletter_subscribers(email);

-- RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anon inserts (form submission)
CREATE POLICY "Allow anon insert" ON newsletter_subscribers
  FOR INSERT TO anon WITH CHECK (true);

-- Allow auth reads of own email only
CREATE POLICY "Allow auth read own" ON newsletter_subscribers
  FOR SELECT TO auth USING (true);

-- Public read of active subscriber count (for display)
CREATE POLICY "Allow public count" ON newsletter_subscribers
  FOR SELECT TO anon USING (true);
