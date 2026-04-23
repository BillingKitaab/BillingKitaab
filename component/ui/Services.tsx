"use client";
import { motion } from "framer-motion";
import React from "react";
import { useLanguage } from '@/lib/LanguageContext';
import { langText } from '@/lib/langText';

const boxes = [
  {
    title: "Inventory",
    desc: "Manage and track all your products in one place with real-time updates.",
    bg: "#3a6f77",
    text: "#f5f6f7",
    accent: "#D4B483",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="4" y="7" width="16" height="13" rx="2" />
        <path d="M4 7V5a2 2 0 012-2h12a2 2 0 012 2v2" />
        <path d="M9 10h6" />
      </svg>
    ),
  },
  {
    title: "Best Selling Recommendation",
    desc: "Get suggestions for top-selling products to maximize your profit.",
    bg: "#D4B483",
    text: "#2f2f33",
    accent: "#3a6f77",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 17l-5 3 1.9-5.7L4 10.5l6-.5L12 4l2 6 6 .5-4.9 3.8L17 20z" />
      </svg>
    ),
  },
  {
    title: "Stock Alert",
    desc: "Receive alerts when inventory is low to avoid stockouts and lost sales.",
    bg: "#2f2f33",
    text: "#f5f6f7",
    accent: "#D4B483",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4" />
        <circle cx="12" cy="16" r="1" />
      </svg>
    ),
  },
  {
    title: "Smart Invoicing",
    desc: "Create GST-ready, branded invoices in seconds. Add line items, taxes, notes — send with a single click.",
    bg: "#2f2f33",
    text: "#f5f6f7",
    accent: "#D4B483",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "Auto Reminders",
    desc: "Set it once. Invoice automatically follows up with overdue clients every morning via email and WhatsApp.",
    bg: "#f5f6f7",
    text: "#2f2f33",
    accent: "#3a6f77",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    title: "WhatsApp ",
    desc: "Send invoices as premium PDF attachments directly to your client's WhatsApp  inbox instantly.",
    bg: "#3a6f77",
    text: "#f5f6f7",
    accent: "#D4B483",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    title: "Live Dashboard",
    desc: "Track paid, unpaid, and overdue invoices at a glance. See revenue trends and top customers in real time.",
    bg: "#D4B483",
    text: "#2f2f33",
    accent: "#3a6f77",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "PDF Reports",
    desc: "Download clean monthly and yearly revenue reports as PDFs — ready for your accountant or GST filing.",
    bg: "#f5f6f7",
    text: "#2f2f33",
    accent: "#2f2f33",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "Secure & Private",
    desc: "End-to-end encrypted. Only you and your customers see your invoice data. No exceptions, ever.",
    bg: "#2f2f33",
    text: "#f5f6f7",
    accent: "#3a6f77",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

const Services = () => {
  const { language } = useLanguage();
  return (
    <div id="services" className="min-h-screen w-full bg-linear-to-b from-[#f5f6f7] via-[#f5f6f7] to-[#2f2f33]/20">
      <style>{`
        @media (min-width: 1240px) and (max-width: 1290px) and (min-height: 580px) and (max-height: 610px) {
          .services-heading-wrap {
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
          }

          .services-heading-text {
            max-width: 760px !important;
          }

          .services-cards-wrap {
            padding-top: 0.75rem !important;
          }
        }
      `}</style>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: "easeIn" }}
        className="services-heading-wrap w-full max-w-[95%] mx-auto px-6 sm:px-10 pt-10 pb-6 md:pt-12 md:pb-8 flex items-start"
      >
        <h1
          className="services-heading-text text-3xl sm:text-4xl md:text-5xl text-[#2f2f33] font-bold leading-tight max-w-4xl"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {langText[language].servicesHeading}
        </h1>
      </motion.div>

      {/* Boxes */}
      <div className="services-cards-wrap w-full px-6 sm:px-10 py-6 flex items-start justify-center min-h-[75vh]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-[95%] h-full">
          {boxes.map((box, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: i * 0.01 }}
              whileHover={{ scale: 1.08 }}
              className="rounded-xl p-5 flex flex-col justify-between shadow-sm min-h-40 cursor-pointer"
              style={{ backgroundColor: box.bg }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-8 h-1 rounded-full"
                  style={{ backgroundColor: box.accent }}
                />
                <span style={{ color: box.accent }}>{box.icon}</span>
              </div>
              <div>
                <h2
                  className="text-lg font-semibold mb-2"
                  style={{ fontFamily: "'Georgia', serif", color: box.text }}
                >
                  {box.title}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: box.text, opacity: 0.85 }}>
                  {box.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;