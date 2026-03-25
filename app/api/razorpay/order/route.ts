import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { planId, isYearly } = await req.json();

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { data: plan, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const amountInr = isYearly ? plan.price_inr_yearly : plan.price_inr_monthly;

    if (!amountInr || amountInr === 0) {
      return NextResponse.json({ error: 'Invalid price or free plan' }, { status: 400 });
    }

    const options = {
      amount: Math.round(Number(amountInr) * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${plan.id}`
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay order error:", error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
