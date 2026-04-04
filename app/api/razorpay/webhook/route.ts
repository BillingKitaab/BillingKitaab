import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// CRITICAL: Must use raw text body for HMAC verification
// Parsing as JSON first would break the signature check
export async function POST(req: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Cannot read body" }, { status: 400 });
  }

  // ── 1. Signature Verification ────────────────────────────────────────────
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const receivedSignature = req.headers.get("x-razorpay-signature") ?? "";
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (receivedSignature !== expectedSignature) {
    console.warn("Webhook signature mismatch — rejecting");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── 2. Parse Event ───────────────────────────────────────────────────────
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const eventType = event.event as string;

  // ── 3. Only handle relevant events ──────────────────────────────────────
  const HANDLED_EVENTS = ["payment.captured", "payment_link.paid"];
  if (!HANDLED_EVENTS.includes(eventType)) {
    return NextResponse.json({ received: true, ignored: eventType });
  }

  // ── 4. Extract payment entity ────────────────────────────────────────────
  let payment: any;
  if (eventType === "payment.captured") {
    payment = event.payload?.payment?.entity;
  } else if (eventType === "payment_link.paid") {
    payment = event.payload?.payment?.entity;
  }

  if (!payment) {
    return NextResponse.json({ error: "No payment entity in payload" }, { status: 400 });
  }

  const payment_id = payment.id as string;
  const invoice_id = payment.notes?.invoice_id as string | undefined;

  if (!invoice_id) {
    console.warn(`Webhook received for payment ${payment_id} but no invoice_id in notes`);
    return NextResponse.json({ received: true, skipped: "no invoice_id in notes" });
  }

  // ── 5. Idempotency Guard ─────────────────────────────────────────────────
  // Insert FIRST — DB unique constraint on event_id prevents race conditions
  const { error: insertError } = await supabaseAdmin
    .from("webhook_events")
    .insert({
      event_id: payment_id,
      event_type: eventType,
      invoice_id,
      payload: event,
    });

  if (insertError) {
    // Unique constraint violation = already processed
    if (insertError.code === "23505") {
      console.log(`Duplicate webhook for payment ${payment_id} — skipping`);
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("Failed to insert webhook event:", insertError);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  // ── 6. Verify invoice exists and is not already paid ─────────────────────
  const { data: invoice, error: fetchErr } = await supabaseAdmin
    .from("invoices")
    .select("id, status, total_amount, client_name_snapshot, client_email_snapshot, client_phone_snapshot, business_id, invoice_number, pdf_path")
    .eq("id", invoice_id)
    .single();

  if (fetchErr || !invoice) {
    console.error(`Invoice ${invoice_id} not found for payment ${payment_id}`);
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (invoice.status === "paid") {
    console.log(`Invoice ${invoice_id} already paid — skipping update`);
    return NextResponse.json({ received: true, already_paid: true });
  }

  // ── 7. Update Invoice ────────────────────────────────────────────────────
  const paid_at = new Date(payment.created_at * 1000).toISOString();
  const { error: updateErr } = await supabaseAdmin
    .from("invoices")
    .update({
      status: "paid",
      razorpay_payment_id: payment_id,
      razorpay_payment_method: payment.method || "unknown",
      paid_at,
    })
    .eq("id", invoice_id);

  if (updateErr) {
    console.error("Failed to update invoice:", updateErr);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }

  // ── 8. Log to activity_logs ──────────────────────────────────────────────
  await supabaseAdmin.from("activity_logs").insert({
    business_id: invoice.business_id,
    entity_type: "invoice",
    entity_id: invoice_id,
    action: "payment_received",
    message: `Payment received for invoice #${invoice.invoice_number}. Payment ID: ${payment_id}`,
    metadata: {
      payment_id,
      payment_method: payment.method,
      amount: payment.amount / 100,
      paid_at,
    },
  });

  // ── 9. Trigger paid invoice generation + notifications (async) ────────────
  // We respond 200 immediately; generation happens in background
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://billing-kitaab.vercel.app";

  // Fire-and-forget: generate paid PDF and send notifications
  fetch(`${appUrl}/api/invoice/send-paid-notification`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-internal-secret": process.env.INTERNAL_API_SECRET || "" },
    body: JSON.stringify({
      invoice_id,
      payment_id,
      payment_method: payment.method,
      paid_at,
    }),
  }).catch((err) => console.error("Failed to trigger paid notification:", err));

  console.log(`✅ Invoice ${invoice_id} marked as paid. Payment: ${payment_id}`);
  return NextResponse.json({ success: true, invoice_id, payment_id });
}
