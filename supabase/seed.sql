-- supabase/seed.sql

INSERT INTO public.plans
(id, name, price_inr, billing_cycle, invoice_limit, profiles_limit, features, badge, is_featured, cta_label, cta_style, is_active)
VALUES
('free', 'Starter', NULL, 'yearly', 30, 1, '["Basic templates","Community support"]'::jsonb, 'free', false, 'Get started', 'outline', true),
('basic', 'Basic', 199.00, 'yearly', 199, 2, '["Custom templates","Email support"]'::jsonb, NULL, false, 'Upgrade', 'default', true),
('standard', 'Standard', 499.00, 'yearly', 499, 5, '["GST reports","Priority email support"]'::jsonb, NULL, false, 'Upgrade', 'default', true),
('pro', 'Pro', 999.00, 'yearly', NULL, 10, '["Advanced analytics","Chat and email support"]'::jsonb, 'popular', true, 'Upgrade to Pro', 'primary', true),
('enterprise', 'Enterprise', 2999.00, 'yearly', NULL, NULL, '["Dedicated manager","Custom integrations"]'::jsonb, NULL, false, 'Contact sales', 'default', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_inr = EXCLUDED.price_inr,
  billing_cycle = EXCLUDED.billing_cycle,
  invoice_limit = EXCLUDED.invoice_limit,
  profiles_limit = EXCLUDED.profiles_limit,
  features = EXCLUDED.features,
  badge = EXCLUDED.badge,
  is_featured = EXCLUDED.is_featured,
  cta_label = EXCLUDED.cta_label,
  cta_style = EXCLUDED.cta_style,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc', now());
