import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, isYearly, businessId } = await req.json();

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ success: false, message: "Keys not configured." }, { status: 500 });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Upsert into subscriptions table
      const startsAt = new Date();
      const endsAt = new Date();
      if (isYearly) endsAt.setFullYear(endsAt.getFullYear() + 1);
      else endsAt.setMonth(endsAt.getMonth() + 1);

      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          business_id: businessId,
          plan_id: planId,
          status: 'active',
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          renews_at: endsAt.toISOString()
        });
        
      if (error) {
        throw error;
      }
      
      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    } else {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
