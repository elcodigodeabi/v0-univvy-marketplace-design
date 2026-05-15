-- Drop existing table if exists (careful in production!)
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table for users (students and tutors)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  nombre TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'alumno',
  universidad TEXT,
  carrera TEXT,
  phone TEXT,
  descripcion TEXT,
  especialidades TEXT[] DEFAULT '{}',
  modalidad TEXT[] DEFAULT '{}',
  disponibilidad TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  sesiones_completadas INTEGER DEFAULT 0,
  precio_por_hora INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_connect_account_id TEXT,
  stripe_connect_onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_universidad ON public.profiles(universidad);

-- Insert sample data for testing (optional - remove in production)
-- INSERT INTO public.profiles (id, email, full_name, role, universidad, carrera, especialidades, rating, sesiones_completadas, precio_por_hora)
-- VALUES 
--   (gen_random_uuid(), 'maria@test.com', 'María García', 'asesor', 'PUCP', 'Ingeniería', ARRAY['Cálculo', 'Matemáticas'], 4.8, 120, 50),
--   (gen_random_uuid(), 'carlos@test.com', 'Carlos López', 'asesor', 'UNI', 'Física', ARRAY['Física', 'Matemáticas'], 4.5, 80, 45);
