# Omix App - Bug Fixes & Updates Log

This document tracks all the problems encountered in the project and their respective fixes. It will be actively updated as more issues are fixed.

## Table of Contents
- [Issue 1: Login & Registration Failing](#issue-1-login--registration-failing)
- [Issue 2: Hardcoded Dummy Data](#issue-2-hardcoded-dummy-data)
- [Issue 3: Hardcoded Dashboard Dates](#issue-3-hardcoded-dashboard-dates)
- [Issue 4: "Business profile not found" on Invoice Gen](#issue-4-business-profile-not-found-on-invoice-gen)
- [Issue 5: "invalid input value for enum invoice_status" Error](#issue-5-invalid-input-value-for-enum-invoice_status-error)
- [Issue 6: Customer Edit Button Not Working](#issue-6-customer-edit-button-not-working)
- [Issue 7: Search Box Crashing App](#issue-7-search-box-crashing-app)
- [Issue 8: Cannot Manually Mark Invoice as Paid](#issue-8-cannot-manually-mark-invoice-as-paid)
- [Issue 9: Generated PDFs Not Saving to Cloud](#issue-9-generated-pdfs-not-saving-to-cloud)
- [Feature 10: Mobile Number & Invoice Items UI](#feature-10-mobile-number--invoice-items-ui)
- [Issue 11: Dummy Stat Cards on Dashboard and Lists](#issue-11-dummy-stat-cards-on-dashboard-and-lists)
- [Issue 12: Hardcoded Sub-metrics and Warnings](#issue-12-hardcoded-sub-metrics-and-warnings)
- [Issue 13: Unlinked Navbar Navigation (Service & Pricing)](#issue-13-unlinked-navbar-navigation-service--pricing)
- [Feature 14: Dual Pricing Tiers & Razorpay Integration](#feature-14-dual-pricing-tiers--razorpay-integration)

---

### Issue 1: Login & Registration Failing
**Problem:** Users were getting "Invalid login credentials" after registering, and new user rows were not appearing in the database.
**Fix:** The Supabase database trigger `handle_new_auth_user` was failing silently. It was patched via SQL to correctly insert the newly registered user into the `businesses` table so they have a valid session context immediately after signup.

### Issue 2: Hardcoded Dummy Data
**Problem:** All pages (`Dashboard`, `Reminder`, `Invoices`, `Customer`) were displaying fake numbers and mock data instead of real database entries.
**Fix:** Removed the frontend's mock arrays and wired up Supabase API hooks (`loadInvoices`, `loadCustomers`, etc.) on all pages to display live user data.

### Issue 3: Hardcoded Dashboard Dates
**Problem:** The date "Today 2 March 2026" was permanently stuck on the headers of most pages.
**Fix:** Replaced hardcoded text strings with a dynamic Javascript `Date` string: ``new Date().toLocaleDateString(...)`` and wrapped it in `suppressHydrationWarning` to prevent Next.js SSR mismatch errors.

### Issue 4: "Business profile not found" on Invoice Gen
**Problem:** Attempting to create a new invoice threw a blocking error message stating no business profile existed.
**Fix:** Several legacy user accounts did not have a linked business profile. A SQL script was executed on Supabase to backfill and auto-generate `businesses` rows for all abandoned `uid`s.

### Issue 5: "invalid input value for enum invoice_status" Error
**Problem:** When successfully submitting an invoice, the database rejected it with a strict enum type error for "pending".
**Fix:** The Supabase table was strictly typed to accept `draft`, `unpaid`, `paid`, and `overdue`. Updated the `Invoicebill.tsx` and `Reminder.tsx` components to map the frontend's "pending" UI logic to the database's strict `"unpaid"` enum.

### Issue 6: Customer Edit Button Not Working
**Problem:** Clicking the "Edit" button on a Customer's profile did absolutely nothing.
**Fix:** Implemented the UI logic in `Customer.tsx`. Clicking "Edit" now launches the Add Customer modal in "Edit Mode" (`editingCustomerId`), pre-filling all inputs with the customer's data and using a `supabase.from('customers').update()` SQL query upon clicking Save. Also added a dropdown to change the Customer's standing (`Good`, `Pending`, `Overdue`).

### Issue 7: Search Box Crashing App
**Problem:** Typing into the global search bar on `Invoices.tsx` or `Customer.tsx` caused the entire application to crash and white-screen.
**Fix:** The search filter was calling `.toLowerCase()` directly on snapshot fields. If a customer had no email or name in the database (Null value), it threw a fatal "Cannot read properties of null" error. Added safe fallback checks `(field || '').toLowerCase()` across all filtering logic to prevent the crash.

### Issue 8: Cannot Manually Mark Invoice as Paid
**Problem:** When a client transferred money, there was no way in the UI to change an old unpaid bill to "Paid".
**Fix:** Transformed the static UI status badges in the `Invoices.tsx` list into live, interactive `<select>` dropdowns. Changing the dropdown directly triggers an `updateStatus()` helper function that saves the new `paid/unpaid` status into the Supabase database.

### Issue 9: Generated PDFs Not Saving to Cloud
**Problem:** Clicking "Generate Invoice" successfully saved it to the DB and downloaded a PDF to the user's hard drive, but it wasn't saved in the app's online "Storage" section to view later.
**Fix:**
1. Created a public `invoices` storage bucket strictly configured in Supabase.
2. Updated `Invoicebill.tsx` to generate a binary `Blob` from `jsPDF` and automatically `.upload()` it to the cloud.
3. Updated the `invoices` table to store the returning `pdf_path`.
4. Added a new "Download PDF" arrow button inside `Invoices.tsx` grid to let users quickly retrieve their cloud-hosted invoices anytime.

### Feature 10: Mobile Number & Invoice Items UI
**Request:** Add a field for the customer's mobile number during invoice creation, and display the billed "Items" overview directly in the Invoices list.
**Fix:**
1. Ran SQL migration to add `client_phone_snapshot` column to the `invoices` table.
2. Updated `Invoicebill.tsx` by adding a `<Field name="clientPhone">` to the form, capturing it in the PDF generation (`doc.text`), and sending it to Supabase via `insert` and customer `upsert`.
3. Updated `Invoices.tsx` data fetching (`loadInvoices()`) to run a relational join `select('*, invoice_items(description, quantity)')`.
4. Re-structured the `Invoices.tsx` CSS Grid to have 7 columns, giving "ITEMS" its own dedicated layout space. Displayed the first billed item with a text badge counting the remaining items (e.g., `+1 more items`) and implemented a native `title` tooltip so hovering reveals the complete itemized breakdown for quick reference.

### Issue 11: Dummy Stat Cards on Dashboard and Lists
**Problem:** The summary metric cards at the top of the **Dashboard**, **Invoices**, and **Customers** pages were hardcoded with fake placeholder data (e.g. ₹5.1L revenue, ₹4,78,589 collected). 
**Fix:**
1. **Dashboard.tsx:** Upgraded the SQL query to fetch all invoices across the business (removing `.limit(7)`) to calculate true gross revenue, paid, and overdue metrics, then explicitly slicing the array so the visual list only shows the 7 latest rows.
2. **Invoices.tsx:** Wrote reductive algorithms (`array.reduce`) on the `invoices` state to dynamically tally up `totalInvoiced`, `collected`, `pending`, and `overdueAmount`. Replaced the static HTML elements with these exact calculations.
3. **Customer.tsx:** Expanded the Supabase fetching layer to not only pull customers, but also pull relation invoices to compute lifetime `totalBilled`. Connected the count of `good`, `overdue`, and `pending` customers to the UI cards and the interactive Tabs.

### Issue 12: Hardcoded Sub-metrics and Warnings
**Problem:** The `Dashboard.tsx` and `Reminder.tsx` components contained static placeholder subtext under the statistic cards (e.g., "↑ 18% from last month", "₹68,000 pending", "3 invoices overdue", "74% Response Rate").
**Fix:**
1. **Dashboard.tsx**: Enhanced the `array.reduce` functions to calculate true total amounts for `unpaidAmt`, `overdueAmt`, and `paidAmt`. Bound these calculated strings directly to the sub-text of their respective stat cards.
2. **Reminder.tsx**: Bound the active tab text messages (ex: "X invoices overdue") directly to the `stats.overdueCount` and `stats.weekCount` state variables ensuring the UI warnings only pop-up reflecting accurate DB numbers. Set strictly untracked metrics (Response Rates) to 'N/A' to eliminate confusion.

### Issue 13: Unlinked Navbar Navigation (Service & Pricing)
**Problem:** The Landing page's Desktop `Navbar` component had empty text blocks for 'Services', 'Pricing', and 'About us' that did not redirect when clicked. Furthermore, the Landing page lacked a proper "Pricing" view.
**Fix:**
1. **Landing Page Architecture**: Edited `app/landing/page.tsx` to dynamically inject the `Planbilling.tsx` component into the flow of the landing site, wrapping it with an `id="pricing"` CSS anchor.
2. **Component ID Linking**: Appended `id="services"` to `Services.tsx` and `id="about"` to `About.tsx` root div blocks.
3. **Navbar Hook**: Upgraded all three navigation strings within `Navbar.tsx` from plain strings into hyperlinked paragraphs executing the visual `navigateWithFade('/#xyz')` transition.

### Feature 14: Dual Pricing Tiers & Razorpay Integration
**Problem:** The `plans` database table only facilitated a single price value. We required a robust architecture catering to both Monthly & Yearly pricing variables (Free, Basic, Standard, Pro, Enterprise) and a checkout process mapping correctly to a payment gateway.
**Fix:**
1. **Database Revamp**: Altered the `plans` table, excising the generic `price_inr` and injecting `price_inr_monthly` & `price_inr_yearly`. Dropped legacy entries and inserted the 5 official tiers.
2. **Dynamic UI Rendering**: Implemented a state `Toggle` in `Planbilling.tsx` allowing Users to swap back and forth between 'Monthly' and 'Yearly', conditionally flipping rendered layout fees.
3. **Payment Endpoints**: Executed `npm i razorpay`. Added two secured NextJS Backend routes: `/api/razorpay/order` (creating the cart) and `/api/razorpay/verify` (decoding HMAC hashes to securely execute the Supabase `subscriptions` upsert).
4. **Checkout JS Injection**: Wired standard `Script` payload injections carrying `https://checkout.razorpay.com/v1/checkout.js` into the plans map, bridging the `handleSelectPlan` CTA to the API endpoints and natively popping open the Razorpay GUI overlay.

### Feature 15: Subscription Feature Limitations & Watermarking
**Problem:** Users could generate unlimited invoices despite the tier limits advertised. Output documents lacked incentive markers prompting plan upgrades.
**Fix:**
1. **Invoice Grid Lockout**: `Invoices.tsx` now cross-references `supabase.subscriptions` vs active usage (`count` generated within the current calendar month). The "New Invoice" CTA dynamically disables into a "Limit Reached" badge.
2. **Backend Submission Lockout**: `Invoicebill.tsx` identically bounds PDF generation strings, guarding against URL bypasses.
3. **Free Tier Watermarking**: `jsPDF` payloads query `planName`. 'Starter' tier accounts generate PDFs watermarked with an intrusive 'Generated by InvoiceLux - Upgrade to remove watermark' prompt mapped across the document base.

### Feature 16: Optional GST Toggle
**Problem:** The invoice form forcefully calculated and appended 18% GST to every bill unconditionally.
**Fix:**
1. **Formik State Toggle**: Added `includeGST` mapping (default false) to `InvoiceSchema`.
2. **Conditional Appends**: Built a checkbox inside `Invoicebill.tsx` instructing the math utilities to apply `.18` multipliers only if `includeGST` evaluates true. Conditionally hides the `GST (18%)` readout from the printed JS PDF output payload if unchecked.

### Feature 17: Stop Auto-Downloads & Add 'Save and Send' Native Protocols
**Problem:** All invocations of Invoice generation automatically forced local downloads of the PDF document without routing them to clients.
**Fix:**
1. **Separation of Concerns**: Extracted generation workflows from `doc.save()` into dual button boundaries tracing `"save"` and `"send"` actions dynamically hooked inside `Invoicekill.tsx`.
2. **Public URL Cloud Routing**: Traces the output `doc.blob()` strictly toward Supabase Storage `invoices/` uploading it behind authentication paths. Resolves `getPublicUrl` to query the live document string.
3. **Web Share Integrations (Overridden)**: Initially executed `navigator.share()` APIs carrying standard message templates mapped against the output Public URL resolving out over System sharing sheets (like Whatsapp Apps, system email dialogs, etc.).

### Feature 18: One-Click Email Sending API (Resend.com)
**Problem:** Users wanted instantaneous 'One-Click' delivery avoiding popup OS dialogues.
**Fix:**
1. **`resend` API Payload**: Deployed an `/api/send-invoice` POST endpoint initializing a Resend Node context rendering formatted HTML emails with amounts and direct CTA link boxes accessing the Supabase `publicUrl`.
2. **Frontend Wiring**: Shifted `Invoicebill.tsx` `"send"` state interceptors to query `/api/send-invoice` bypassing manual App openings. Returns native feedback toasts confirming delivery IDs.

### Feature 19: Twilio API WhatsApp Sending Automations
**Problem:** Need instantaneous "One-Click" broadcasting algorithms linking Whatsapp workflows seamlessly matching the backend Email processes.
**Fix:**
1. **Twilio Module Structure**: Initialized `twilio` tracking `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_WHATSAPP_NUMBER` bindings.
2. **Endpoint Scaffold**: Developed `/api/send-whatsapp` accepting JSON formatted strings generating dynamic `Hello <Client>, You have a new invoice...` string formatting wrapping live invoice urls.
3. **Frontend Injection**: 
   - Refactored `Invoicebill.tsx` 'Save & Send' buttons parsing concurrent fetches mapping Whatsapp URLs sequentially down to Mobile/Desktop devices if phone variables resolve. 
   - Retrofitted `Reminder.tsx` binding bulk `.forEach()` loops into existing UI `Send via Whatsapp` CTA elements looping overdue invoice variables toward endpoints asynchronously preventing app freezes.

### Feature 20: Debugging Registration PostgreSQL Trigger Faults
**Problem:** `Database error saving new user` overlaid across the `/register` endpoints preventing initial user onboarding metrics.
**Fix:**
1. **Log Diagnostic**: Isolated Postgres internal traces failing across an `ON CONFLICT (owner_user_id)` constraint check during the `handle_new_auth_user()` database trigger function.
2. **Schema Resolution**: Connected dynamically over the Supabase MCP architecture bridging a new SQL Migration: `ALTER TABLE public.businesses ADD CONSTRAINT businesses_owner_user_id_key UNIQUE (owner_user_id);` enforcing identical unique states enabling the conflict resolution blocks to natively pass safely. 

### Feature 21: Auto Country Code Selector for UI Elements
**Problem:** Need to explicitly append country digits avoiding redundant typing blocks over the WhatsApp payload inputs.
**Fix:** 
Built a default Select List dropping explicitly into the Formik `<Field>` grids overriding manually typed keys if isolated. Values merge atop variables passing cleanly toward Twilio backend routes preventing `To` field parsing crashes.

---

*(This document will be updated as new bug fixes and features are deployed.)*
