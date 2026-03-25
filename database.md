# Omix Database Design (Supabase)

## Overview
This document defines a complete Supabase-ready database structure inferred from the existing Omix frontend.
The app is multi-tenant (business-scoped), invoice-centric, and includes customer management, reminders, subscription plans, and PDF report history.

## Source Coverage (Reviewed)
- component/ui/Enter.tsx
- component/ui/Signin.tsx
- component/ui/Setting.tsx
- component/ui/Profile.tsx
- component/ui/Customer.tsx
- component/ui/CustomerProfile.tsx
- component/ui/Invoices.tsx
- component/ui/Invoicebill.tsx
- component/ui/Reminder.tsx
- component/ui/Planbilling.tsx
- component/ui/PDFreport.tsx
- app/pdfreport/reports/page.tsx
- component/ui/Dashboard.tsx

## Entity Inventory

### 1) app_users
Represents authenticated app accounts (extension of Supabase auth.users).

Attributes:
- id (uuid, PK, references auth.users.id)
- email (text, unique, required)
- business_name (text, optional)
- created_at (timestamptz, default now())
- last_login_at (timestamptz, nullable)

### 2) user_profiles
Extended profile metadata from profile form.

Attributes:
- id (uuid, PK)
- user_id (uuid, unique, FK -> app_users.id)
- name (text, required)
- email (text, required)
- phone (text)
- social_url (text)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

### 3) businesses
Tenant root entity for all business data.

Attributes:
- id (uuid, PK)
- owner_user_id (uuid, FK -> app_users.id)
- business_name (text, required)
- business_address (text, required)
- gst_number (text)
- pan_number (text)
- business_phone (text)
- business_email (text)
- website (text)
- default_currency (currency_code enum, default INR)
- logo_path (text)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

### 4) customers
Business customers who receive invoices.

Attributes:
- id (uuid, PK)
- business_id (uuid, FK -> businesses.id)
- name (text, required)
- email (text, required)
- phone (text)
- city (text)
- gst_number (text, optional)
- since_date (date, optional)
- status (customer_status enum: Good | Pending | Overdue)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

Constraints:
- unique (business_id, email)

### 5) invoices
Issued bills linked to customers and line items.

Attributes:
- id (uuid, PK)
- business_id (uuid, FK -> businesses.id)
- customer_id (uuid, FK -> customers.id)
- invoice_number (text, required, tenant-scoped unique)
- issue_date (date, required)
- due_date (date, required)
- status (invoice_status enum: Draft | Paid | Unpaid | Overdue)
- currency (currency_code enum, default INR)
- client_name_snapshot (text, required)
- client_email_snapshot (text)
- client_address_snapshot (text)
- subtotal (numeric(12,2), default 0)
- gst_rate (numeric(5,2), default 18.00)
- gst_amount (numeric(12,2), default 0)
- total_amount (numeric(12,2), default 0)
- notes (text)
- pdf_path (text)
- created_by (uuid, FK -> app_users.id)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

Constraints:
- unique (business_id, invoice_number)
- check (due_date >= issue_date)

### 6) invoice_items
Line-level invoice entries.

Attributes:
- id (uuid, PK)
- invoice_id (uuid, FK -> invoices.id, on delete cascade)
- line_no (int, required)
- description (text, required)
- quantity (numeric(12,2), required)
- unit_price (numeric(12,2), required)
- line_amount (numeric(12,2), required)
- created_at (timestamptz, default now())

Constraints:
- unique (invoice_id, line_no)
- check (quantity > 0)
- check (unit_price > 0)

### 7) reminder_rules
Business-level reminder settings.

Attributes:
- id (uuid, PK)
- business_id (uuid, unique, FK -> businesses.id)
- auto_enabled (boolean, default true)
- days_before_due (int, default 2)
- channel_email_enabled (boolean, default true)
- channel_whatsapp_enabled (boolean, default true)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

Constraints:
- check (days_before_due between 1 and 30)

### 8) reminder_events
Operational reminder send log per invoice/customer.

Attributes:
- id (uuid, PK)
- business_id (uuid, FK -> businesses.id)
- customer_id (uuid, FK -> customers.id)
- invoice_id (uuid, FK -> invoices.id, on delete cascade)
- channel (reminder_channel enum: Email | WhatsApp)
- state (reminder_state enum: Pending | Sent | Failed | Opened | Clicked)
- message (text)
- scheduled_for (timestamptz)
- sent_at (timestamptz)
- created_at (timestamptz, default now())

### 9) plans
System plan definitions shown in billing UI.

Attributes:
- id (text, PK: free | basic | standard | pro | enterprise)
- name (text, required)
- price_inr (numeric(12,2), nullable for free)
- billing_cycle (billing_cycle enum: monthly | yearly, default yearly)
- invoice_limit (int, nullable = unlimited)
- profiles_limit (int, nullable = unlimited)
- features (jsonb array, required)
- badge (text: free | popular | nullable)
- is_featured (boolean, default false)
- cta_label (text)
- cta_style (text: primary | outline | default)
- is_active (boolean, default true)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

### 10) subscriptions
Active or historical business plan subscription.

Attributes:
- id (uuid, PK)
- business_id (uuid, FK -> businesses.id)
- plan_id (text, FK -> plans.id)
- status (subscription_status enum: trialing | active | past_due | canceled | expired)
- starts_at (timestamptz, default now())
- ends_at (timestamptz)
- renews_at (timestamptz)
- canceled_at (timestamptz)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

Recommended constraint:
- one active subscription per business (partial unique index)

### 11) report_templates
Template definitions for report generation options.

Attributes:
- id (uuid, PK)
- business_id (uuid, FK -> businesses.id, nullable for global templates)
- title (text, required)
- description (text)
- report_type (report_type enum)
- tags (text[])
- accent_color (text)
- default_sections (jsonb)
- is_system_template (boolean, default false)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

### 12) generated_reports
Historical generated PDF report records.

Attributes:
- id (uuid, PK)
- business_id (uuid, FK -> businesses.id)
- template_id (uuid, FK -> report_templates.id)
- report_type (report_type enum)
- title (text, required)
- subtitle (text)
- period_label (text)
- date_from (date)
- date_to (date)
- generated_at (timestamptz, default now())
- file_path (text)
- file_size_bytes (bigint)
- page_count (int)
- generated_by (uuid, FK -> app_users.id)
- created_at (timestamptz, default now())

### 13) activity_logs (recommended)
Tracks dashboard activity feed and audit events.

Attributes:
- id (uuid, PK)
- business_id (uuid, FK -> businesses.id)
- actor_user_id (uuid, FK -> app_users.id)
- entity_type (text)
- entity_id (uuid)
- action (text)
- message (text)
- metadata (jsonb)
- created_at (timestamptz, default now())

## Relationship Model
- app_users (1) -> (N) businesses
- app_users (1) -> (1) user_profiles
- businesses (1) -> (N) customers
- businesses (1) -> (N) invoices
- customers (1) -> (N) invoices
- invoices (1) -> (N) invoice_items
- invoices (1) -> (N) reminder_events
- businesses (1) -> (1) reminder_rules
- plans (1) -> (N) subscriptions
- businesses (1) -> (N) subscriptions
- report_templates (1) -> (N) generated_reports
- businesses (1) -> (N) generated_reports

## Enum Definitions
- customer_status: Good, Pending, Overdue
- invoice_status: Draft, Paid, Unpaid, Overdue
- reminder_channel: Email, WhatsApp
- reminder_state: Pending, Sent, Failed, Opened, Clicked
- subscription_status: trialing, active, past_due, canceled, expired
- report_type: Revenue, InvoiceSummary, GST, Aging, Customer, Sales, Expense, ProfitLoss
- billing_cycle: monthly, yearly
- currency_code: INR, USD, EUR

## Inferred Validation Rules
- registration email must be valid format
- password minimum length >= 6 (enforce via Supabase Auth)
- customer email uniqueness is tenant-scoped
- invoice due_date must be >= issue_date
- invoice item quantity and unit_price must be > 0
- default GST starts at 18.00 unless future settings override

## Indexing Recommendations
- invoices(business_id, status, due_date desc)
- invoices(business_id, issue_date desc)
- invoices(business_id, customer_id)
- customers(business_id, name)
- reminder_events(business_id, state, scheduled_for)
- generated_reports(business_id, generated_at desc)
- activity_logs(business_id, created_at desc)

## RLS Strategy (Supabase)
Enable RLS on all business-domain tables and scope by business ownership.

Policy pattern:
- user can read/write records only when table.business_id belongs to businesses owned by auth.uid()
- app_users and user_profiles are scoped to auth.uid() = user_id
- plans are readable by all authenticated users, writable by service role/admin only

## Supabase Storage Buckets
Recommended buckets:
- business-assets (for logos)
- invoice-pdfs (for generated invoices)
- report-pdfs (for generated reports)

Store only file_path in DB tables.

## Frontend-to-Backend Mapping Notes
- Existing UI uses formatted money strings (for example: "₹12,500"). Persist numeric values in DB and format on UI.
- Existing mock invoice IDs (for example: #INV-0042) should become tenant-scoped invoice_number generation.
- Reminder and dashboard metrics are derived data; compute with SQL views/materialized views as needed.

## Suggested Implementation Sequence
1. Create enums
2. Create core tables (app_users, businesses, customers, invoices, invoice_items)
3. Create plan/subscription and reminder/report tables
4. Add constraints and indexes
5. Add RLS policies
6. Seed plans and optional demo data

## Supabase Runbook

### 1) Prerequisites
- Install Supabase CLI
- Login to Supabase CLI
- Link this project to your Supabase project

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
```

### 2) Apply Migrations
Run migrations in order (already timestamped in `supabase/migrations`):

```bash
supabase db push
```

### 3) Seed Plan Data
Run seed script to populate plan catalog:

```bash
supabase db query < supabase/seed.sql
```

### 4) Quick Verification
Verify all tables were created:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Verify enum columns are typed correctly:

```sql
select table_name, column_name, udt_name
from information_schema.columns
where table_schema = 'public'
	and column_name in ('status', 'currency', 'channel', 'state', 'report_type', 'billing_cycle', 'default_currency')
order by table_name, column_name;
```

Verify RLS is enabled:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

### 5) Recommended Smoke Test
1. Create/authenticate a user in Supabase Auth.
2. Insert one `businesses` row for that user.
3. Insert one `customers` row.
4. Insert one `invoices` row and 2 `invoice_items` rows.
5. Confirm invoice totals are auto-calculated in `invoices`.
6. Test cross-tenant read from a second user and confirm RLS denial.
