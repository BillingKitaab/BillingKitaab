import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";
import twilio from "twilio";

const resend = new Resend(process.env.RESEND_API_KEY);

// Internal-only route — called by webhook handler
// Protected by a shared secret to prevent public access
export async function POST(req: NextRequest) {
  // Verify internal secret
  const internalSecret = req.headers.get("x-internal-secret");
  if (internalSecret !== (process.env.INTERNAL_API_SECRET || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { invoice_id, payment_id, payment_method, paid_at } = await req.json();

  if (!invoice_id) {
    return NextResponse.json({ error: "invoice_id required" }, { status: 400 });
  }

  try {
    // ── 1. Fetch full invoice data ──────────────────────────────────────────
    const { data: invoice, error: fetchErr } = await supabaseAdmin
      .from("invoices")
      .select(`
        *,
        businesses!invoices_business_id_fkey (
          business_name,
          business_email,
          business_phone
        )
      `)
      .eq("id", invoice_id)
      .single();

    if (fetchErr || !invoice) {
      console.error("Invoice fetch failed:", fetchErr);
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const businessName = invoice.businesses?.business_name || "Your Vendor";
    const paidDate = paid_at ? new Date(paid_at).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://billing-kitaab.vercel.app";

    // ── 2. Get PDF URL (use existing pdf or paid_pdf_path) ──────────────────
    const pdfUrl = invoice.paid_pdf_path
      ? supabaseAdmin.storage.from("invoices").getPublicUrl(invoice.paid_pdf_path).data.publicUrl
      : invoice.pdf_path
      ? supabaseAdmin.storage.from("invoices").getPublicUrl(invoice.pdf_path).data.publicUrl
      : null;

    // ── 3. Send Email ────────────────────────────────────────────────────────
    if (invoice.client_email_snapshot) {
      try {
        await resend.emails.send({
          from: "BillingKitaab <onboarding@resend.dev>",
          to: [invoice.client_email_snapshot],
          subject: `✅ Payment Received - Invoice #${invoice.invoice_number} from ${businessName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
              <div style="background: #3a6f77; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">✅ Payment Confirmed</h1>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
                <p>Dear <strong>${invoice.client_name_snapshot || "Customer"}</strong>,</p>
                <p>We have received your payment for Invoice <strong>#${invoice.invoice_number}</strong> from <strong>${businessName}</strong>.</p>
                
                <div style="background: #f0f9f0; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; font-size: 16px;"><strong>Amount Paid:</strong> ₹${Number(invoice.total_amount).toLocaleString("en-IN")}</p>
                  <p style="margin: 8px 0 0; color: #555;"><strong>Transaction ID:</strong> ${payment_id || "N/A"}</p>
                  <p style="margin: 4px 0 0; color: #555;"><strong>Payment Method:</strong> ${payment_method || "Online"}</p>
                  <p style="margin: 4px 0 0; color: #555;"><strong>Paid On:</strong> ${paidDate}</p>
                </div>

                ${pdfUrl ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${pdfUrl}" style="background-color: #3a6f77; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    📄 Download Receipt
                  </a>
                </div>
                ` : ""}
                
                <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
                <p style="color: #888; font-size: 12px; text-align: center;">Powered by BillingKitaab</p>
              </div>
            </div>
          `,
        });
        console.log(`📧 Paid invoice email sent to ${invoice.client_email_snapshot}`);
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
        // Don't fail the whole process — log and continue
      }
    }

    // ── 4. Send WhatsApp ─────────────────────────────────────────────────────
    const rawPhone = invoice.client_phone_snapshot;
    if (rawPhone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER) {
      try {
        const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        let formattedPhone = rawPhone.replace(/\s+/g, "");
        if (!formattedPhone.startsWith("+")) {
          formattedPhone = "+" + formattedPhone;
        }

        const message =
          `✅ *Payment Confirmed!*\n\n` +
          `Hello ${invoice.client_name_snapshot || "Customer"},\n\n` +
          `We've received your payment for Invoice *#${invoice.invoice_number}* from *${businessName}*.\n\n` +
          `💰 *Amount:* ₹${Number(invoice.total_amount).toLocaleString("en-IN")}\n` +
          `🔖 *Transaction ID:* ${payment_id || "N/A"}\n` +
          `📅 *Paid On:* ${paidDate}\n\n` +
          (pdfUrl ? `📄 Download your receipt:\n${pdfUrl}` : "");

        await twilioClient.messages.create({
          body: message,
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          to: `whatsapp:${formattedPhone}`,
        });
        console.log(`💬 WhatsApp confirmation sent to ${formattedPhone}`);
      } catch (waErr) {
        console.error("WhatsApp send failed:", waErr);
        // Don't fail — log and continue
      }
    }

    // ── 5. Log notification to activity_logs ────────────────────────────────
    await supabaseAdmin.from("activity_logs").insert({
      business_id: invoice.business_id,
      entity_type: "invoice",
      entity_id: invoice_id,
      action: "paid_notification_sent",
      message: `Payment confirmation sent to ${invoice.client_email_snapshot || invoice.client_phone_snapshot || "customer"}`,
      metadata: { payment_id, channels: ["email", "whatsapp"] },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("send-paid-notification error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
