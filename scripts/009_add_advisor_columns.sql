-- Add disponibilidad column to profiles table if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS disponibilidad JSONB DEFAULT '{}';

-- Add other missing columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sesiones_completadas INTEGER DEFAULT 0;

-- Verify the migration
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('disponibilidad', 'rating', 'total_reviews', 'sesiones_completadas');
