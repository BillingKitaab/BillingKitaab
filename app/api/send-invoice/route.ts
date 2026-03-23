import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientEmail, clientName, businessName, currency, total, publicUrl } = body;

    if (!clientEmail || !publicUrl) {
      return NextResponse.json(
        { error: "Missing required fields (clientEmail, publicUrl)" },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "BillingKitaab <onboarding@resend.dev>", // Safe default testing email for Resend
      to: [clientEmail],
      subject: `New Invoice from ${businessName || "us"}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${clientName || "Customer"},</h2>
          <p>You have received a new invoice from <strong>${businessName || "us"}</strong>.</p>
          ${
            total
              ? `<p><strong>Amount Due:</strong> ${currency || "INR"} ${total}</p>`
              : ""
          }
          <div style="margin: 30px 0;">
            <a href="${publicUrl}" style="background-color: #3a6f77; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View / Download Invoice
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${publicUrl}">${publicUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p style="color: #888; font-size: 12px;">Powered by BillingKitaab</p>
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
