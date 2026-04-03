'use client'

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────────────────────────

type BadgeVariant = "free" | "popular" | null;
type CtaStyle    = "primary" | "outline" | "default";

interface Plan {
  id:           string;
  name:         string;
  priceMonthly: number | null;
  priceYearly:  number | null;
  invoiceLimit: number | null;
  profiles:     number | string;
  features:     string[];
  badge:        BadgeVariant;
  isFeatured:   boolean;
  ctaLabel:     string;
  ctaStyle:     CtaStyle;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FALLBACK_PLANS: Plan[] = [
  { id: "free", name: "Starter", priceMonthly: null, priceYearly: null, invoiceLimit: 10, profiles: 1, features: ["Basic templates", "Watermark on PDF", "Community support"], badge: "free", isFeatured: false, ctaLabel: "Get started", ctaStyle: "outline" },
  { id: "basic", name: "Basic", priceMonthly: 199, priceYearly: 1999, invoiceLimit: 100, profiles: 1, features: ["Custom templates", "No watermark", "Email support"], badge: null, isFeatured: false, ctaLabel: "Get Basic", ctaStyle: "default" },
  { id: "standard", name: "Standard", priceMonthly: 399, priceYearly: 3999, invoiceLimit: 500, profiles: 1, features: ["GST reports", "Basic analytics", "Priority email support"], badge: "popular", isFeatured: true, ctaLabel: "Get Standard", ctaStyle: "primary" },
  { id: "pro", name: "Pro", priceMonthly: 799, priceYearly: 7999, invoiceLimit: null, profiles: "Unlimited", features: ["Advanced analytics", "Automated reminders", "WhatsApp + Email support", "API access"], badge: null, isFeatured: false, ctaLabel: "Get Pro", ctaStyle: "default" },
  { id: "enterprise", name: "Enterprise", priceMonthly: 1999, priceYearly: 19999, invoiceLimit: null, profiles: "Unlimited", features: ["Dedicated manager", "Custom integrations", "SLA support", "Team access & roles"], badge: null, isFeatured: false, ctaLabel: "Contact sales", ctaStyle: "default" },
];

// ─── Responsive Breakpoints ───────────────────────────────────────────────────
//
//  Mobile   (< 640px)   → 1 column  — full-width cards, large tap targets
//  Tablet   (640–1023)  → 2 columns — side-by-side pairs
//  Laptop   (1024–1279) → 3 columns — first row of 3, second row of 2
//  Desktop  (≥ 1280px)  → 5 columns — all plans in a single row
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ variant }: { variant: BadgeVariant }) {
  if (!variant) return null;

  const styleMap: Record<NonNullable<BadgeVariant>, string> = {
    free:    "bg-blue-50 text-blue-700",
    popular: "bg-teal-50 text-teal-700",
  };

  const labelMap: Record<NonNullable<BadgeVariant>, string> = {
    free:    "Free",
    popular: "Most popular",
  };

  return (
    <span className={`inline-block self-start text-xs font-medium px-2.5 py-1 mb-2 rounded-md ${styleMap[variant]}`}>
      {labelMap[variant]}
    </span>
  );
}

// ─── CheckIcon ────────────────────────────────────────────────────────────────

function CheckIcon({ isFree }: { isFree: boolean }) {
  const bg     = isFree ? "#E6F1FB" : "#E1F5EE";
  const stroke = isFree ? "#185FA5" : "#0F6E56";

  return (
    <svg
      className="w-4 h-4 flex-shrink-0 mt-0.5"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="6.5" fill={bg} />
      <path
        d="M4 7l2 2 4-4"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Feature Rows ─────────────────────────────────────────────────────────────

// Shared row wrapper — consistent layout for every feature line
function FeatureRow({ isFree, children }: { isFree: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 py-1 text-sm sm:text-xs leading-snug">
      <CheckIcon isFree={isFree} />
      {children}
    </li>
  );
}

function InvoiceFeature({ limit, isFree }: { limit: number | null; isFree: boolean }) {
  return (
    <FeatureRow isFree={isFree}>
      <span className="text-gray-600">
        <span className="font-medium text-gray-900">
          {limit === null ? "Unlimited" : limit}
        </span>{" "}
        {limit === null ? "invoices" : "invoices / month"}
      </span>
    </FeatureRow>
  );
}

function ProfileFeature({ profiles, isFree }: { profiles: number | string; isFree: boolean }) {
  const isSingular = typeof profiles === "number" && profiles === 1;

  return (
    <FeatureRow isFree={isFree}>
      <span className="text-gray-600">
        <span className="font-medium text-gray-900">{profiles}</span>{" "}
        business {isSingular ? "profile" : "profiles"}
      </span>
    </FeatureRow>
  );
}

function GeneralFeature({ text, isFree }: { text: string; isFree: boolean }) {
  return (
    <FeatureRow isFree={isFree}>
      <span className="text-gray-500">{text}</span>
    </FeatureRow>
  );
}

// ─── CTA Button ───────────────────────────────────────────────────────────────

function CtaButton({
  label,
  style,
  disabled,
  onClick,
}: {
  label:    string;
  style:    CtaStyle;
  disabled: boolean;
  onClick:  () => void;
}) {
  // py-3 on mobile for a comfortable touch target; py-2 on sm+ for density
  const base = `
    w-full py-3 sm:py-2
    text-sm sm:text-xs font-medium
    rounded-lg
    transition-colors duration-150
    cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  `;

  const styleMap: Record<CtaStyle, string> = {
    primary: `${base} bg-teal-600 text-white border border-teal-600
              hover:bg-teal-700 focus-visible:ring-teal-500`,

    outline: `${base} border border-blue-400 text-blue-700
              hover:bg-blue-50 focus-visible:ring-blue-400`,

    default: `${base} border border-gray-200 text-gray-700
              hover:bg-gray-50 focus-visible:ring-gray-300`,
  };

  return (
    <button className={styleMap[style]} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  isYearly,
  isCurrentPlan,
  isLoading,
  onSelect,
}: {
  plan:          Plan;
  isYearly:      boolean;
  isCurrentPlan: boolean;
  isLoading:     boolean;
  onSelect:      (plan: Plan) => void;
}) {
  const isFree = plan.priceMonthly === null && plan.priceYearly === null;
  const displayPrice = isYearly ? plan.priceYearly : plan.priceMonthly;

  // Featured plan gets a prominent teal border; others get a subtle gray one
  const cardBorder = plan.isFeatured
    ? "border-2 border-teal-500"
    : "border border-gray-200";

  return (
    <div className={`relative flex flex-col bg-white rounded-xl ${cardBorder} p-5 sm:p-4`}>

      {/* Badge — "Free" or "Most popular" */}
      <Badge variant={plan.badge} />

      {/* Plan name */}
      <h3 className="text-base sm:text-sm font-medium text-gray-900 mb-2">
        {plan.name}
      </h3>

      {/* Price — larger on mobile for quick scanning */}
      <div className="flex items-baseline gap-1 mb-1">
        {isFree ? (
          <span className="text-3xl sm:text-2xl font-semibold text-gray-900">₹0</span>
        ) : (
          <>
            <span className="text-3xl sm:text-2xl font-semibold text-gray-900">
              ₹{displayPrice!.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-gray-400">/{isYearly ? "yr" : "mo"}</span>
          </>
        )}
      </div>

      {/* Billing cycle */}
      <p className="text-xs text-gray-400 mb-4 h-4">
        {isFree ? "Forever free" : (isYearly ? "Billed annually" : "Billed monthly")}
      </p>

      {/* Divider */}
      <hr className="border-gray-100 mb-4" />

      {/* Feature list — flex-1 pushes the CTA to the bottom of the card */}
      <ul className="flex flex-col gap-0.5 mb-5 flex-1">
        <InvoiceFeature  limit={plan.invoiceLimit} isFree={isFree} />
        <ProfileFeature  profiles={plan.profiles}  isFree={isFree} />
        {plan.features.map((feature) => (
          <GeneralFeature key={feature} text={feature} isFree={isFree} />
        ))}
      </ul>

      {/* CTA — label and style change when the plan is already active */}
      <CtaButton
        label={isLoading ? "Processing..." : (isCurrentPlan ? "Current plan" : plan.ctaLabel)}
        style={isCurrentPlan ? "outline" : plan.ctaStyle}
        disabled={isLoading || isCurrentPlan}
        onClick={() => onSelect(plan)}
      />
    </div>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────

function PageHeader({ isYearly, setIsYearly }: { isYearly: boolean, setIsYearly: (y: boolean) => void }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-200 pb-4">
      <div>
        <h2 className="text-xl sm:text-lg font-medium text-gray-900">
          Plan &amp; Billing
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Upgrade or downgrade anytime
        </p>
      </div>

      <div className="mt-4 sm:mt-0 flex items-center bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setIsYearly(false)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${!isYearly ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setIsYearly(true)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${isYearly ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Yearly <span className="text-[10px] text-teal-600 font-bold ml-1 border border-teal-200 bg-teal-50 px-1 rounded">SAVE 15%</span>
        </button>
      </div>
    </div>
  );
}

// ─── Active Plan Banner ───────────────────────────────────────────────────────
// Shown only on mobile (hidden on sm+) so the user always knows their active plan
// without having to scroll through all the stacked cards.

function ActivePlanBanner({ planName }: { planName: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 px-4 py-3 text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-lg sm:hidden">
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7" fill="#E1F5EE" />
        <path d="M5 8l2 2 4-4" stroke="#0F6E56" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>
        Current plan: <span className="font-medium">{planName}</span>
      </span>
    </div>
  );
}

// ─── Footer Note ──────────────────────────────────────────────────────────────

function FooterNote() {
  return (
    <p className="mt-6 text-center text-xs text-gray-400">
      All prices in Indian Rupees (₹) · GST applicable as per prevailing rates ·{" "}
      <a href="#" className="underline hover:text-gray-600 transition-colors">
        Terms of service
      </a>
    </p>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PlanBilling({
  showBackButton = false,
  backHref = '/landing#pricing',
}: {
  showBackButton?: boolean;
  backHref?: string;
} = {}) {
  const [currentPlanId, setCurrentPlanId] = useState<string>("free");
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [isYearly, setIsYearly] = useState<boolean>(true);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadPlans = async () => {
      const { data } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true);
        
      if (data && data.length > 0) {
        // Order manually based on expected tiers
        const orderMap: Record<string, number> = { 'free': 1, 'basic': 2, 'standard': 3, 'pro': 4, 'enterprise': 5 };
        const sortedData = data.sort((a, b) => (orderMap[a.id] || 99) - (orderMap[b.id] || 99));

        setPlans(sortedData.map((p: any) => ({
          id: p.id,
          name: p.name,
          priceMonthly: p.price_inr_monthly ? Number(p.price_inr_monthly) : null,
          priceYearly: p.price_inr_yearly ? Number(p.price_inr_yearly) : null,
          invoiceLimit: p.invoice_limit,
          profiles: p.profiles_limit ?? 'Unlimited',
          features: p.features || [],
          badge: p.badge,
          isFeatured: p.is_featured,
          ctaLabel: p.cta_label || 'Select',
          ctaStyle: p.cta_style || 'default',
        })));
      }
    };
    loadPlans();
    
    // Attempt to load current user subscription
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('businesses').select('id').eq('owner_user_id', user.id).single()
          .then(({ data: businessData }) => {
            if (businessData) {
              supabase.from('subscriptions').select('plan_id').eq('business_id', businessData.id).eq('status', 'active').single()
                .then(({ data: subData }) => {
                  if (subData) setCurrentPlanId(subData.plan_id);
                });
            }
          });
      }
    });

  }, []);

  const handleSelectPlan = async (plan: Plan) => {
    const isFree = plan.priceMonthly === null && plan.priceYearly === null;
    if (isFree) {
      alert("You have selected the free plan.");
      setCurrentPlanId(plan.id);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/register');
      return;
    }

    const { data: business } = await supabase.from('businesses').select('id, business_name, business_email, business_phone').eq('owner_user_id', user.id).single();
    if (!business) {
      alert("Please complete your business profile in Settings first.");
      router.push('/settings');
      return;
    }

    setLoadingPlanId(plan.id);
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, isYearly })
      });
      const order = await res.json();
      
      if (!order.id) {
         alert(order.error || "Failed to initiate payment");
         setLoadingPlanId(null);
         return;
      }
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency,
        name: "InvoiceLux",
        description: `${plan.name} Plan - ${isYearly ? 'Yearly' : 'Monthly'}`,
        order_id: order.id, 
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
              isYearly,
              businessId: business.id
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment successful! Your subscription is now active.");
            setCurrentPlanId(plan.id);
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: business.business_name || "",
          email: business.business_email || user.email || "",
          contact: business.business_phone || ""
        },
        theme: {
          color: "#0F6E56"
        }
      };
      
      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        alert(response.error.description);
      });
      rzp1.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong with the payment gateway.");
    } finally {
      setLoadingPlanId(null);
    }
  };

  const currentPlan = plans.find((p) => p.id === currentPlanId) || plans[0];

  return (
    /*
     * Page shell:
     *   - bg-gray-50    subtle page background
     *   - Responsive horizontal padding (px-4 → sm:px-6 → lg:px-8 → xl:px-12)
     *   - max-w-screen-xl keeps content from stretching on ultra-wide screens
     */
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8 xl:px-12 font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-screen-xl mx-auto">

        {showBackButton && (
          <Link
            href={backHref}
            className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-sm font-semibold border-2 transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: "#3a6f77", color: "#f5f6f7", borderColor: "#D4B483" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#D4B483";
              (e.currentTarget as HTMLElement).style.color = "#2f2f33";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#3a6f77";
              (e.currentTarget as HTMLElement).style.color = "#f5f6f7";
            }}
          >
            <FaArrowLeft className="text-sm" />
            <span>Back</span>
          </Link>
        )}

        <PageHeader isYearly={isYearly} setIsYearly={setIsYearly} />

        {/* Mobile-only active plan banner */}
        {currentPlan && (
          <ActivePlanBanner planName={currentPlan.name} />
        )}

        {/*
         * Plan grid — responsive column count:
         *   grid-cols-1        → mobile   (< 640px)
         *   sm:grid-cols-2     → tablet   (640–1023px)
         *   lg:grid-cols-3     → laptop   (1024–1279px)
         *   xl:grid-cols-5     → desktop  (≥ 1280px)
         */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isYearly={isYearly}
              isCurrentPlan={currentPlanId === plan.id}
              isLoading={loadingPlanId === plan.id}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>

        <FooterNote />

      </div>
    </div>
  );
}