-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create `reports` table for Environment Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    urgency TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Menunggu',
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    address TEXT,
    image_url TEXT,
    reporter_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create `requests` table for Digital Administration
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Menunggu',
    tracking_number TEXT UNIQUE NOT NULL,
    requester_name TEXT NOT NULL,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create `businesses` table for UMKM Marketplace
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    owner_name TEXT NOT NULL,
    phone_number TEXT,
    rating DOUBLE PRECISION DEFAULT 0.0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: You might want to enable Row Level Security (RLS) depending on your authentication strategy.
-- For now, allowing open read/insert for development purposes.

-- Set up Row Level Security (RLS) policies (Example open access for prototyping)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read reports" ON public.reports;
CREATE POLICY "Allow anonymous read reports" ON public.reports FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anonymous insert reports" ON public.reports;
CREATE POLICY "Allow anonymous insert reports" ON public.reports FOR INSERT WITH CHECK (true);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read requests" ON public.requests;
CREATE POLICY "Allow anonymous read requests" ON public.requests FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anonymous insert requests" ON public.requests;
CREATE POLICY "Allow anonymous insert requests" ON public.requests FOR INSERT WITH CHECK (true);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read businesses" ON public.businesses;
CREATE POLICY "Allow anonymous read businesses" ON public.businesses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anonymous insert businesses" ON public.businesses;
CREATE POLICY "Allow anonymous insert businesses" ON public.businesses FOR INSERT WITH CHECK (true);

-- Create reports bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow anonymous update reports" ON public.reports;
CREATE POLICY "Allow anonymous update reports" ON public.reports FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous delete reports" ON public.reports;
CREATE POLICY "Allow anonymous delete reports" ON public.reports FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow anonymous update requests" ON public.requests;
CREATE POLICY "Allow anonymous update requests" ON public.requests FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous delete requests" ON public.requests;
CREATE POLICY "Allow anonymous delete requests" ON public.requests FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow anonymous update businesses" ON public.businesses;
CREATE POLICY "Allow anonymous update businesses" ON public.businesses FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous delete businesses" ON public.businesses;
CREATE POLICY "Allow anonymous delete businesses" ON public.businesses FOR DELETE USING (true);

-- Storage bucket RLS policies for 'reports'
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'reports' );
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'reports' );

-- ═══════════════════════════════════════════
-- Village Boundaries (Pemetaan Wilayah Desa)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.village_boundaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#16a34a',
    coordinates JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.village_boundaries ENABLE ROW LEVEL SECURITY;

-- Everyone can read village boundaries
DROP POLICY IF EXISTS "Allow public read village_boundaries" ON public.village_boundaries;
CREATE POLICY "Allow public read village_boundaries" ON public.village_boundaries FOR SELECT USING (true);

-- Only authenticated users (admin) can insert/update/delete
DROP POLICY IF EXISTS "Allow authenticated insert village_boundaries" ON public.village_boundaries;
CREATE POLICY "Allow authenticated insert village_boundaries" ON public.village_boundaries FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update village_boundaries" ON public.village_boundaries;
CREATE POLICY "Allow authenticated update village_boundaries" ON public.village_boundaries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete village_boundaries" ON public.village_boundaries;
CREATE POLICY "Allow authenticated delete village_boundaries" ON public.village_boundaries FOR DELETE TO authenticated USING (true);
