-- 202603180004_auth_rls.sql

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.app_users (id, email, business_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'business_name',
      NEW.raw_user_meta_data ->> 'businessName'
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    business_name = COALESCE(EXCLUDED.business_name, public.app_users.business_name);

  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_users_select_own ON public.app_users;
CREATE POLICY app_users_select_own
ON public.app_users
FOR SELECT
USING (id = auth.uid());

DROP POLICY IF EXISTS app_users_update_own ON public.app_users;
CREATE POLICY app_users_update_own
ON public.app_users
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS app_users_insert_own ON public.app_users;
CREATE POLICY app_users_insert_own
ON public.app_users
FOR INSERT
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS user_profiles_owner_all ON public.user_profiles;
CREATE POLICY user_profiles_owner_all
ON public.user_profiles
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS businesses_owner_all ON public.businesses;
CREATE POLICY businesses_owner_all
ON public.businesses
FOR ALL
USING (owner_user_id = auth.uid())
WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS customers_business_owner_all ON public.customers;
CREATE POLICY customers_business_owner_all
ON public.customers
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = customers.business_id
      AND b.owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = customers.business_id
      AND b.owner_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS invoices_business_owner_all ON public.invoices;
CREATE POLICY invoices_business_owner_all
ON public.invoices
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = invoices.business_id
      AND b.owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = invoices.business_id
      AND b.owner_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS invoice_items_via_invoice_owner_all ON public.invoice_items;
CREATE POLICY invoice_items_via_invoice_owner_all
ON public.invoice_items
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.invoices i
    JOIN public.businesses b ON b.id = i.business_id
    WHERE i.id = invoice_items.invoice_id
      AND b.owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.invoices i
    JOIN public.businesses b ON b.id = i.business_id
    WHERE i.id = invoice_items.invoice_id
      AND b.owner_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS reminder_rules_business_owner_all ON public.reminder_rules;
CREATE POLICY reminder_rules_business_owner_all
ON public.reminder_rules
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = reminder_rules.business_id
      AND b.owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = reminder_rules.business_id
      AND b.owner_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS reminder_events_business_owner_all ON public.reminder_events;
CREATE POLICY reminder_events_business_owner_all
ON public.reminder_events
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = reminder_events.business_id
      AND b.owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = reminder_events.business_id
      AND b.owner_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS subscriptions_business_owner_all ON public.subscriptions;
CREATE POLICY subscriptions_business_owner_all
ON public.subscriptions
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = subscriptions.business_id
      AND b.owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = subscriptions.business_id
      AND b.owner_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS report_templates_select ON public.report_templates;
CREATE POLICY report_templates_select
ON public.report_templates
FOR SELECT
USING (
  business_id IS NULL
  OR EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = report_templates.business_id
      AND b.owner_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS report_templates_modify_owned ON public.report_templates;
CREATE POLICY report_templates_modify_owned
ON public.report_templates
FOR ALL
USING (
  business_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = report_templates.business_id
      AND b.owner_user_id = auth.uid()
  )
)
WITH CHECK (
  business_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = report_templates.business_id
      AND b.owner_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS generated_reports_business_owner_all ON public.generated_reports;
CREATE POLICY generated_reports_business_owner_all
ON public.generated_reports
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = generated_reports.business_id
      AND b.owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = generated_reports.business_id
      AND b.owner_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS activity_logs_business_owner_all ON public.activity_logs;
CREATE POLICY activity_logs_business_owner_all
ON public.activity_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = activity_logs.business_id
      AND b.owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = activity_logs.business_id
      AND b.owner_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS plans_read_authenticated ON public.plans;
CREATE POLICY plans_read_authenticated
ON public.plans
FOR SELECT
USING (auth.role() = 'authenticated');
