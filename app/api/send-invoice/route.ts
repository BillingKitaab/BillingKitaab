import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientEmail,
      clientName,
      businessName,
      currency,
      total,
      publicUrl,
      qr_url,
      payment_link_url,
      invoice_number,
      due_date,
    } = body;

    if (!clientEmail || !publicUrl) {
      return NextResponse.json(
        { error: "Missing required fields (clientEmail, publicUrl)" },
        { status: 400 }
      );
    }

    const hasPaymentLink = !!payment_link_url;

    const { data, error } = await resend.emails.send({
      from: "BillingKitaab <onboarding@resend.dev>",
      to: [clientEmail],
      subject: `Invoice${invoice_number ? ` #${invoice_number}` : ""} from ${businessName || "us"} — Action Required`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
          <div style="background: #3a6f77; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Invoice</h1>
            ${invoice_number ? `<p style="margin: 8px 0 0; opacity: 0.85;">Invoice #${invoice_number}</p>` : ""}
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hello <strong>${clientName || "Customer"}</strong>,</p>
            <p>You have received a new invoice from <strong>${businessName || "us"}</strong>.</p>

            ${total ? `
            <div style="background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; font-size: 18px; font-weight: bold;">Amount Due: ${currency || "INR"} ${Number(total).toLocaleString("en-IN")}</p>
              ${due_date ? `<p style="margin: 6px 0 0; color: #888; font-size: 14px;">Due by: ${new Date(due_date).toLocaleDateString("en-IN")}</p>` : ""}
            </div>
            ` : ""}

            ${hasPaymentLink ? `
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-weight: bold; font-size: 16px; margin-bottom: 12px;">📱 Scan to Pay Instantly</p>
              ${qr_url ? `<img src="${qr_url}" alt="Payment QR Code" style="width: 200px; height: 200px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px;" />` : ""}
              <div style="margin-top: 20px;">
                <a href="${payment_link_url}" style="background-color: #22c55e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                  💳 Pay Now
                </a>
              </div>
            </div>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
            ` : ""}

            <div style="text-align: center; margin: 20px 0;">
              <a href="${publicUrl}" style="background-color: #3a6f77; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                📄 View / Download Invoice
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              If the button doesn't work, copy and paste this link:<br/>
              <a href="${publicUrl}">${publicUrl}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
            <p style="color: #888; font-size: 12px; text-align: center;">Powered by BillingKitaab</p>
          </div>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Resend Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
