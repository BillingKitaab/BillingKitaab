-- Add missing columns to businesses table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS business_logo_url text,
ADD COLUMN IF NOT EXISTS signature_url text;

-- Add comment for clarity
COMMENT ON COLUMN public.businesses.business_logo_url IS 'Base64 encoded business logo image URL';
COMMENT ON COLUMN public.businesses.signature_url IS 'Base64 encoded authorized signature image URL';
