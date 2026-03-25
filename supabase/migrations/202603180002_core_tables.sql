-- 202603180002_core_tables.sql

CREATE TABLE IF NOT EXISTS public.app_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email citext NOT NULL UNIQUE,
  business_name text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  last_login_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.app_users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email citext NOT NULL,
  phone text,
  social_url text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE RESTRICT,
  business_name text NOT NULL,
  business_address text NOT NULL,
  gst_number text,
  pan_number text,
  business_phone text,
  business_email citext,
  website text,
  default_currency currency_code NOT NULL DEFAULT 'INR',
  logo_path text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  email citext NOT NULL,
  phone text,
  city text,
  gst_number text,
  since_date date,
  status customer_status NOT NULL DEFAULT 'good',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (business_id, email),
  UNIQUE (id, business_id)
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL,
  invoice_number text NOT NULL,
  issue_date date NOT NULL,
  due_date date NOT NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  currency currency_code NOT NULL DEFAULT 'INR',
  client_name_snapshot text NOT NULL,
  client_email_snapshot citext,
  client_address_snapshot text,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  gst_rate numeric(5,2) NOT NULL DEFAULT 18.00,
  gst_amount numeric(12,2) NOT NULL DEFAULT 0,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  pdf_path text,
  created_by uuid REFERENCES public.app_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (business_id, invoice_number),
  UNIQUE (id, business_id),
  CHECK (due_date >= issue_date),
  CHECK (subtotal >= 0),
  CHECK (gst_rate >= 0),
  CHECK (gst_amount >= 0),
  CHECK (total_amount >= 0),
  CONSTRAINT invoices_customer_business_fk
    FOREIGN KEY (customer_id, business_id)
    REFERENCES public.customers(id, business_id)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  line_no int NOT NULL,
  description text NOT NULL,
  quantity numeric(12,2) NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL CHECK (unit_price > 0),
  line_amount numeric(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (invoice_id, line_no)
);

CREATE TABLE IF NOT EXISTS public.reminder_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  auto_enabled boolean NOT NULL DEFAULT true,
  days_before_due int NOT NULL DEFAULT 2 CHECK (days_before_due BETWEEN 1 AND 30),
  channel_email_enabled boolean NOT NULL DEFAULT true,
  channel_whatsapp_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.reminder_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id uuid,
  invoice_id uuid,
  channel reminder_channel NOT NULL,
  state reminder_state NOT NULL DEFAULT 'pending',
  message text,
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT reminder_events_customer_business_fk
    FOREIGN KEY (customer_id, business_id)
    REFERENCES public.customers(id, business_id)
    ON DELETE SET NULL,
  CONSTRAINT reminder_events_invoice_business_fk
    FOREIGN KEY (invoice_id, business_id)
    REFERENCES public.invoices(id, business_id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.plans (
  id text PRIMARY KEY CHECK (id IN ('free', 'basic', 'standard', 'pro', 'enterprise')),
  name text NOT NULL,
  price_inr numeric(12,2),
  billing_cycle billing_cycle NOT NULL DEFAULT 'yearly',
  invoice_limit int,
  profiles_limit int,
  features jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(features) = 'array'),
  badge plan_badge,
  is_featured boolean NOT NULL DEFAULT false,
  cta_label text,
  cta_style cta_style NOT NULL DEFAULT 'default',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  status subscription_status NOT NULL DEFAULT 'active',
  starts_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  ends_at timestamptz,
  renews_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  report_type report_type NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  accent_color text,
  default_sections jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_system_template boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.report_templates(id) ON DELETE SET NULL,
  report_type report_type NOT NULL,
  title text NOT NULL,
  subtitle text,
  period_label text,
  date_from date,
  date_to date,
  generated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  file_path text,
  file_size_bytes bigint CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
  page_count int CHECK (page_count IS NULL OR page_count >= 0),
  generated_by uuid REFERENCES public.app_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES public.app_users(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);
