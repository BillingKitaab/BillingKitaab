"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";


const GOLD = "#C9A96E";
const GOLD_LIGHT = "#E8C98A";
const TEAL = "#2D6A6A";
const TEAL_LIGHT = "#4A9B9B";
const DARK = "#1A1A2E";

export default function SmartBillingHero() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);
    
    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      router.push("/dashboard"); 
    } else {
      router.push("/register"); 
    }
  };


  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif", background: "#F5F2EC", color: DARK }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-0 { animation: fadeSlideUp 0.6s ease 0.1s both; }
        .fade-1 { animation: fadeSlideUp 0.6s ease 0.2s both; }
        .fade-2 { animation: fadeSlideUp 0.6s ease 0.3s both; }
        .fade-3 { animation: fadeSlideUp 0.6s ease 0.4s both; }
        .fade-4 { animation: fadeSlideUp 0.6s ease 0.5s both; }
        .fade-5 { animation: fadeSlideUp 0.6s ease 0.6s both; }
        .grid-bg {
          background-image:
            linear-gradient(rgba(201,169,110,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,169,110,0.07) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }
        .playfair { font-family: 'Playfair Display', serif; }
        .dm-sans  { font-family: 'DM Sans', sans-serif; }
        .cta-primary-btn { transition: all 0.25s; }
        .cta-primary-btn:hover { transform: translateY(-3px); box-shadow: 0 14px 40px rgba(201,169,110,0.5) !important; }
        .cta-secondary-btn:hover { border-color: #2D6A6A !important; color: #2D6A6A !important; }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .trust-strip { flex-wrap: wrap !important; gap: 16px !important; justify-content: center !important; }
          .hero-content { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Orbs - hide some on mobile */}
        <div className="absolute rounded-full hidden md:block" style={{ width: 500, height: 500, background: GOLD, top: -100, left: -150, filter: "blur(80px)", opacity: 0.18 }} />
        <div className="absolute rounded-full hidden md:block" style={{ width: 400, height: 400, background: TEAL, top: 200, right: -100, filter: "blur(80px)", opacity: 0.18 }} />
        <div className="absolute rounded-full hidden md:block" style={{ width: 300, height: 300, background: GOLD_LIGHT, bottom: -50, left: "40%", filter: "blur(80px)", opacity: 0.18 }} />

        {/* Grid */}
        <div className="grid-bg absolute inset-0" />

        {/* Invoice watermark - hide on mobile */}
        <svg className="absolute hidden md:block" style={{ right: -60, top: "50%", transform: "translateY(-50%) rotate(6deg)", width: 480, opacity: 0.04 }} viewBox="0 0 400 520" fill="none">
          <rect x="20" y="20" width="360" height="480" rx="16" stroke="#C9A96E" strokeWidth="3"/>
          <rect x="50" y="60" width="200" height="14" rx="4" fill="#C9A96E"/>
          <rect x="50" y="84" width="130" height="8" rx="3" fill="#C9A96E"/>
          <line x1="50" y1="120" x2="350" y2="120" stroke="#C9A96E" strokeWidth="1.5"/>
          <rect x="50" y="140" width="260" height="8" rx="3" fill="#C9A96E"/>
          <rect x="50" y="158" width="220" height="8" rx="3" fill="#C9A96E"/>
          <rect x="50" y="176" width="240" height="8" rx="3" fill="#C9A96E"/>
          <rect x="50" y="194" width="180" height="8" rx="3" fill="#C9A96E"/>
          <line x1="50" y1="220" x2="350" y2="220" stroke="#C9A96E" strokeWidth="1.5"/>
          <rect x="50" y="240" width="260" height="8" rx="3" fill="#C9A96E"/>
          <rect x="50" y="258" width="220" height="8" rx="3" fill="#C9A96E"/>
          <rect x="50" y="276" width="200" height="8" rx="3" fill="#C9A96E"/>
          <line x1="50" y1="310" x2="350" y2="310" stroke="#C9A96E" strokeWidth="2"/>
          <rect x="200" y="330" width="120" height="18" rx="5" fill="#C9A96E"/>
          <rect x="100" y="400" width="200" height="40" rx="10" fill="#C9A96E"/>
          <text x="200" y="426" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="serif">PAID</text>
        </svg>
      </div>

      {/* ── HERO ── */}
      <section className="hero-content relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-4 md:px-10 pt-16 pb-20">
        {/* Eyebrow pill */}
        <div className="fade-0 inline-flex items-center gap-2 bg-white border rounded-lg px-3 py-1.5 mb-5 md:mb-7 text-xs font-medium"
          style={{ borderColor: "rgba(201,169,110,0.3)", color: TEAL, letterSpacing: "0.5px" }}>
          <span className="rounded-full inline-block" style={{ width: 6, height: 6, background: GOLD }} />
          <span className="whitespace-nowrap">BillingKitaab · Built for Modern India</span>
        </div>

        <p className="fade-1 dm-sans text-base md:text-lg font-medium mb-3" style={{ color: TEAL, letterSpacing: "1px" }}>
          India’s Smart {" "}
          <span style={{ color: GOLD, textDecoration: "underline", textDecorationColor: "rgba(201,169,110,0.4)" }}>Billing Platform</span>{" "}
        </p>

        <h1 className="fade-2 playfair font-black mb-3 md:mb-1.5" style={{ fontSize: "clamp(32px,6vw,72px)", lineHeight: 1.1, color: GOLD }}>
          From invoice to income simplified.
        </h1>

        <h2 className="fade-3 playfair font-bold mb-5 md:mb-7" style={{ fontSize: "clamp(26px,5vw,62px)", lineHeight: 1.15, color: DARK }}>
          Manage your <span style={{ color: TEAL }}>billing</span> the smart way.
        </h2>

        <p className="fade-4 text-sm md:text-base max-w-lg mb-8 md:mb-10 leading-relaxed" style={{ color: "#888" }}>
          Create polished invoices, Automate client reminders,<br className="hidden md:block" />
          Collect payments faster — from one intelligent, beautifully designed dashboard.
        </p>

        <div className="fade-5 flex flex-col sm:flex-row gap-3 md:gap-4 items-center w-full max-w-md">
    <button
      onClick={handleClick}
      className="cta-primary-btn w-full sm:w-[240px] h-[52px] md:h-[56px] px-6 md:px-9 rounded-xl text-sm font-semibold text-white cursor-pointer border-none"
      style={{
        background: `linear-gradient(135deg, ${GOLD}, #B8914A)`,
        boxShadow: "0 8px 30px rgba(201,169,110,0.4)",
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.2px",
      }}
    >
      Start Free Now
    </button>

          <button className="cta-secondary-btn flex items-center justify-center gap-2.5 w-full sm:w-[240px] h-[52px] md:h-[56px] px-6 md:px-8 border rounded-xl text-sm font-semibold cursor-pointer bg-white transition-all duration-200"
            style={{ borderColor: "rgba(201,169,110,0.35)", color: DARK, fontFamily: "'DM Sans', sans-serif" }}>
            <span className="rounded-full flex items-center justify-center" style={{ width: 28, height: 28, background: TEAL }}>
              <svg width="10" height="12" viewBox="0 0 10 12" fill="white"><polygon points="0,0 10,6 0,12"/></svg>
            </span>
            Demo Video
          </button>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div className="trust-strip relative z-10 flex justify-center gap-6 md:gap-10 px-4 md:px-16 py-5 bg-white border-t border-b"
        style={{ borderColor: "rgba(201,169,110,0.15)" }}>
        {[
          {
            color: GOLD, label: "50,000+", sub: "Indian businesses",
            icon: <svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" width="14" height="14"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          },
          {
            color: TEAL, label: "₹200 Cr+", sub: "invoiced monthly",
            icon: <svg viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" width="14" height="14"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          },
          {
            color: GOLD, label: "GST", sub: "compliant",
            icon: <svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
          },
          {
            color: TEAL, label: "Bank-grade", sub: "security",
            icon: <svg viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          },
        ].map((t) => (
          <div key={t.label} className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
            <div className="flex items-center justify-center rounded-lg" style={{ width: 28, height: 28, background: "rgba(201,169,110,0.1)" }}>
              {t.icon}
            </div>
            <span><span className="font-bold" style={{ color: DARK }}>{t.label}</span> {t.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

