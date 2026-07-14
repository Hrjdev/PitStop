-- 1. Tabloları oluştur
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    model TEXT NOT NULL,
    plate_number TEXT NOT NULL,
    status TEXT DEFAULT 'active'::text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.operations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false NOT NULL
);

-- 2. RLS (Row Level Security) Etkinleştir
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;

-- 3. Staj projesi olduğu için şimdilik anonim/tüm erişimlere açık politikalar ekliyoruz
-- (Gerçek projede auth.uid() kontrolleri olmalıdır)

-- Vehicles tablosu için politikalar
CREATE POLICY "Enable read access for all users" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.vehicles FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.vehicles FOR DELETE USING (true);

-- Operations tablosu için politikalar
CREATE POLICY "Enable read access for all users" ON public.operations FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.operations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.operations FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.operations FOR DELETE USING (true);
