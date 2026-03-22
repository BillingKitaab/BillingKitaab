import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientPhone, clientName, businessName, currency, total, publicUrl, isReminder } = body;

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

    // Ensure phone number starts with + 
    // (Assuming user might enter "919876543210" or "+919876543210")
    let formattedPhone = clientPhone.replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+')) {
      // For India as default if missing, though it's best to have the full country code
      // We will blindly prepend '+' if it looks like they included country code without it.
      formattedPhone = '+' + formattedPhone; 
    }

    let messageBody = `Hello ${clientName || "Customer"},\n\nYou have a new invoice from ${businessName || "us"}.`;
    if (isReminder) {
      messageBody = `🔔 Reminder: Hello ${clientName || "Customer"},\n\nThis is a gentle reminder regarding your invoice from ${businessName || "us"}.`;
    }

    if (total) {
      messageBody += `\nAmount Due: ${currency || "INR"} ${total}`;
    }
    
    messageBody += `\n\nView or download your invoice here:\n${publicUrl}`;
    
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
