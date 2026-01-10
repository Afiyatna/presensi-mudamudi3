-- Add kategori column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS kategori VARCHAR DEFAULT 'Muda - Mudi';

-- Add check constraint for category values
ALTER TABLE profiles 
ADD CONSTRAINT check_kategori CHECK (kategori IN ('Muda - Mudi', 'Orang Tua'));

-- Optional: Update existing users to have a default category if needed
UPDATE profiles SET kategori = 'Muda - Mudi' WHERE kategori IS NULL;
