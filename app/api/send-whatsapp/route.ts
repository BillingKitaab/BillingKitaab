import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientPhone,
      clientName,
      businessName,
      currency,
      total,
      publicUrl,
      isReminder,
      payment_link_url,
      invoice_number,
      due_date,
    } = body;

    if (!clientPhone || !publicUrl) {
      return NextResponse.json(
        { error: "Missing required fields (clientPhone, publicUrl)" },
        { status: 400 }
      );
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json(
        { error: "Twilio credentials are not configured in environment variables." },
        { status: 500 }
      );
    }

    const client = twilio(accountSid, authToken);

    let formattedPhone = clientPhone.replace(/\s+/g, "");
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone;
    }

    // Build message
    let messageBody: string;

    if (isReminder) {
      messageBody =
        `🔔 *Payment Reminder*\n\n` +
        `Hello ${clientName || "Customer"},\n\n` +
        `This is a gentle reminder for your invoice${invoice_number ? ` *#${invoice_number}*` : ""} from *${businessName || "us"}*.`;
    } else {
      messageBody =
        `🧾 *New Invoice*\n\n` +
        `Hello ${clientName || "Customer"},\n\n` +
        `You have a new invoice${invoice_number ? ` *#${invoice_number}*` : ""} from *${businessName || "us"}*.`;
    }

    if (total) {
      messageBody += `\n\n💰 *Amount Due:* ${currency || "INR"} ${Number(total).toLocaleString("en-IN")}`;
    }

    if (due_date) {
      messageBody += `\n📅 *Due Date:* ${new Date(due_date).toLocaleDateString("en-IN")}`;
    }

    // Payment link — primary CTA
    if (payment_link_url) {
      messageBody += `\n\n💳 *Pay Now:*\n${payment_link_url}`;
    }

    // Invoice PDF link
    messageBody += `\n\n📄 *View Invoice:*\n${publicUrl}`;

    const message = await client.messages.create({
      body: messageBody,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${formattedPhone}`,
    });

    return NextResponse.json({ success: true, messageSid: message.sid });
  } catch (err: any) {
    console.error("Twilio WhatsApp Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
