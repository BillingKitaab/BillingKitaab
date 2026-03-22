"use client";
import { motion } from "framer-motion";
import React from "react";

const boxes = [
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
    desc: "Set it once. InvoiceLux automatically follows up with overdue clients every morning via email and WhatsApp.",
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
    title: "WhatsApp & Gmail",
    desc: "Send invoices as premium PDF attachments directly to your client's WhatsApp or Gmail inbox instantly.",
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
  return (
    <div id="services" className="min-h-screen w-full bg-gradient-to-b from-[#f5f6f7] via-[#f5f6f7] to-[#2f2f33]/20">

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: "easeIn" }}
        className="w-full px-6 sm:px-10 pt-10 pb-6 md:pt-0 md:pb-0 md:h-[20vh] md:w-[50vw] md:ml-10 flex items-end"
      >
        <h1
          className="text-3xl sm:text-4xl md:text-5xl md:ml-3 text-[#2f2f33] font-bold leading-tight"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Everything your{" "}
          <span className="text-[#3a6f77] bg-[#D4B483] px-1"> billing </span>{" "}
          should already do
        </h1>
      </motion.div>

      {/* Boxes */}
      <div className="w-full px-6 sm:px-10 py-6 flex items-center justify-center min-h-[75vh]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-[95%] h-full">
          {boxes.map((box, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: i * 0.01 }}
              whileHover={{ scale: 1.08 }}
              className="rounded-xl p-5 flex flex-col justify-between shadow-sm min-h-[160px] cursor-pointer"
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