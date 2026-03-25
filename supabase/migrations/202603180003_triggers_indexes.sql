-- 202603180003_triggers_indexes.sql

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_profiles_updated_at') THEN
    CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_businesses_updated_at') THEN
    CREATE TRIGGER trg_businesses_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_customers_updated_at') THEN
    CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_invoices_updated_at') THEN
    CREATE TRIGGER trg_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_reminder_rules_updated_at') THEN
    CREATE TRIGGER trg_reminder_rules_updated_at
    BEFORE UPDATE ON public.reminder_rules
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_plans_updated_at') THEN
    CREATE TRIGGER trg_plans_updated_at
    BEFORE UPDATE ON public.plans
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_subscriptions_updated_at') THEN
    CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_report_templates_updated_at') THEN
    CREATE TRIGGER trg_report_templates_updated_at
    BEFORE UPDATE ON public.report_templates
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.recalc_invoice_totals(p_invoice_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_subtotal numeric(12,2);
  v_gst_rate numeric(5,2);
  v_gst_amount numeric(12,2);
BEGIN
  SELECT COALESCE(SUM(line_amount), 0)::numeric(12,2)
  INTO v_subtotal
  FROM public.invoice_items
  WHERE invoice_id = p_invoice_id;

  SELECT gst_rate INTO v_gst_rate
  FROM public.invoices
  WHERE id = p_invoice_id;

  v_gst_amount := ROUND((v_subtotal * COALESCE(v_gst_rate, 0) / 100.0)::numeric, 2);

  UPDATE public.invoices
  SET
    subtotal = v_subtotal,
    gst_amount = v_gst_amount,
    total_amount = ROUND((v_subtotal + v_gst_amount)::numeric, 2),
    updated_at = timezone('utc', now())
  WHERE id = p_invoice_id;
END
$$;

CREATE OR REPLACE FUNCTION public.invoice_items_after_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_invoice_id uuid;
BEGIN
  v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);
  PERFORM public.recalc_invoice_totals(v_invoice_id);
  RETURN NULL;
END
$$;

DROP TRIGGER IF EXISTS trg_invoice_items_after_change ON public.invoice_items;
CREATE TRIGGER trg_invoice_items_after_change
AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
FOR EACH ROW EXECUTE FUNCTION public.invoice_items_after_change();

CREATE UNIQUE INDEX IF NOT EXISTS ux_subscriptions_one_active_per_business
ON public.subscriptions (business_id)
WHERE status IN ('trialing', 'active', 'past_due');

CREATE INDEX IF NOT EXISTS ix_invoices_business_status_due_date
ON public.invoices (business_id, status, due_date DESC);

CREATE INDEX IF NOT EXISTS ix_invoices_business_issue_date
ON public.invoices (business_id, issue_date DESC);

CREATE INDEX IF NOT EXISTS ix_invoices_business_customer
ON public.invoices (business_id, customer_id);

CREATE INDEX IF NOT EXISTS ix_customers_business_name
ON public.customers (business_id, name);

CREATE INDEX IF NOT EXISTS ix_reminder_events_business_state_schedule
ON public.reminder_events (business_id, state, scheduled_for);

CREATE INDEX IF NOT EXISTS ix_generated_reports_business_generated_at
ON public.generated_reports (business_id, generated_at DESC);

CREATE INDEX IF NOT EXISTS ix_activity_logs_business_created_at
ON public.activity_logs (business_id, created_at DESC);
