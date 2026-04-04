import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Razorpay Payment Links maximum: ₹5,00,000 (500000 rupees = 50,000,000 paise)
const RAZORPAY_MAX_AMOUNT_RUPEES = 500000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      invoice_id,
      amount,
      currency = "INR",
      customer_name,
      customer_email,
      customer_phone,
      invoice_number,
      business_name,
    } = body;

    if (!invoice_id || !amount) {
      return NextResponse.json(
        { error: "invoice_id and amount are required" },
        { status: 400 }
      );
    }

    const keyId = (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "").replace(/"/g, "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").replace(/"/g, "").trim();

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay keys not configured" }, { status: 500 });
    }

    // Convert and validate amount
    const amountInRupees = Number(amount);

    // Debug log — visible in terminal
    console.log(`[Payment Link] Invoice: ${invoice_number}, Amount (rupees): ${amountInRupees}`);

    if (isNaN(amountInRupees) || amountInRupees <= 0) {
      return NextResponse.json({ error: `Invalid amount: ${amount}` }, { status: 400 });
    }

    if (amountInRupees > RAZORPAY_MAX_AMOUNT_RUPEES) {
      return NextResponse.json({
        error: `Amount ₹${amountInRupees.toLocaleString("en-IN")} exceeds Razorpay payment link limit of ₹5,00,000. For larger invoices, please collect payment manually.`,
      }, { status: 400 });
    }

    // Convert to paise — Razorpay always works in smallest currency unit
    const amountInPaise = Math.round(amountInRupees * 100);
    console.log(`[Payment Link] Amount in paise: ${amountInPaise}`);

    // Clean phone number — Razorpay needs exactly 10 digits for India (no country code)
    let cleanPhone: string | undefined;
    if (customer_phone) {
      let p = String(customer_phone).replace(/\s+/g, "").replace(/[^0-9+]/g, "");
      if (p.startsWith("+91") && p.length === 13) p = p.slice(3);
      else if (p.startsWith("91") && p.length === 12) p = p.slice(2);
      if (p.length >= 10) cleanPhone = p.slice(-10);
    }

    // Build Razorpay payload
    const payload: any = {
      amount: amountInPaise,
      currency,
      description: `Invoice #${invoice_number || invoice_id}${business_name ? ` from ${business_name}` : ""}`,
      customer: {
        name: customer_name || "Customer",
      },
      notify: {
        sms: false,
        email: false,
      },
      reminder_enable: false,
      notes: {
        invoice_id,
        invoice_number: invoice_number || "",
        business_name: business_name || "",
      },
      callback_url: `${(process.env.NEXT_PUBLIC_APP_URL || "https://billing-kitaab.vercel.app").trim()}/thank-you`,
      callback_method: "get",
    };

    if (customer_email) payload.customer.email = customer_email;
    if (cleanPhone) payload.customer.contact = cleanPhone;

    console.log(`[Payment Link] Sending to Razorpay:`, JSON.stringify({ amount: payload.amount, currency, customer: payload.customer }));

    // Call Razorpay REST API directly
    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const razorpayRes = await fetch("https://api.razorpay.com/v1/payment_links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${credentials}`,
      },
      body: JSON.stringify(payload),
    });

    const razorpayData = await razorpayRes.json();

    if (!razorpayRes.ok) {
      const errMsg = razorpayData?.error?.description
        || razorpayData?.error?.reason
        || razorpayData?.error?.code
        || "Razorpay API error";
      console.error(`[Payment Link] Razorpay error (${razorpayRes.status}):`, JSON.stringify(razorpayData));
      return NextResponse.json({ error: errMsg }, { status: razorpayRes.status });
    }

    const shortUrl = razorpayData.short_url;
    const qr_url = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(shortUrl)}&size=300x300&margin=10`;

    // Save back to invoice
    await supabaseAdmin
      .from("invoices")
      .update({
        razorpay_payment_link_id: razorpayData.id,
        razorpay_payment_link_url: shortUrl,
        payment_qr_url: qr_url,
      })
      .eq("id", invoice_id);

    console.log(`[Payment Link] ✅ Created: ${shortUrl}`);

    return NextResponse.json({
      success: true,
      payment_link_id: razorpayData.id,
      payment_link_url: shortUrl,
      qr_url,
    });
  } catch (err: any) {
    console.error("[Payment Link] Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Failed to create payment link" }, { status: 500 });
  }
}
