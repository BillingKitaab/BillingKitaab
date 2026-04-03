"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Zap, Palette, Headphones, MapPin } from "lucide-react";

const About = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <div id="about" className="min-h-screen w-full bg-gradient-to-b from-[#f5f6f7] via-[#f5f6f7] to-[#2f2f33]/30 p-6 sm:p-10">

      <div className="flex flex-col sm:flex-row sm:items-start">

        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0, ease: "easeOut" }}
          className="flex flex-col items-start ml-4 sm:ml-16 mt-8 sm:mt-16 gap-4 sm:w-1/2"
        >

          {/* Cards Container */}
          <div
            className="relative w-[280px] sm:w-[340px] cursor-pointer"
            style={{ height: "300px" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* Card 2 - Upcoming Due */}
            <motion.div
              animate={hovered ? { x: 0, y: 160, rotate: 0, scale: 1 } : { x: 0, y: 60, rotate: -2, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="absolute left-0 top-0 w-[220px] sm:w-[240px] bg-[#252530] rounded-2xl p-4 sm:p-5 flex flex-col gap-2 border border-white/5"
              style={{ zIndex: 1 }}
            >
              <p className="text-[9px] tracking-[0em] text-[#D4B483]/70 uppercase font-medium">Upcoming Due</p>
              <div>
                <h2 className="text-lg sm:text-xl font-serif text-[#f5f6f7]">Priya Nair</h2>
                <p className="text-xs text-[#f5f6f7]/40 mt-1">Due in 5 days · ₹5,200</p>
              </div>
            </motion.div>

            {/* Card 1 - Latest Payment */}
            <motion.div
              animate={hovered ? { x: 0, y: 0, rotate: 0, scale: 1 } : { x: 60, y: 0, rotate: 2, scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="absolute left-0 top-0 w-[240px] sm:w-[260px] bg-[#2f2f33] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 border border-white/10"
              style={{ zIndex: 2 }}
            >
              <p className="text-[9px] tracking-[0em] text-[#D4B483]/70 uppercase font-medium">Latest Payment</p>
              <div>
                <h2 className="text-lg sm:text-xl font-serif text-[#f5f6f7]">Arjun Mehta</h2>
                <p className="text-xs text-[#f5f6f7]/40 mt-1">Invoice #INV-0041</p>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-[#3a6f77]/30 border border-[#3a6f77]/50 text-[#3a6f77] text-[10px] font-semibold px-3 py-1 rounded-full w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3a6f77]"></span>
                PAID · ₹8,000
              </span>
            </motion.div>
          </div>

          {/* Pricing Box */}
          <motion.div
            animate={{ y: hovered ? 5 : 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="w-[260px] sm:w-[320px] bg-[#2f2f33] rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col gap-4 -translate-y-9"
          >
            <p className="text-[9px] tracking-[0em] text-[#D4B483]/70 uppercase font-medium">This Month</p>
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#f5f6f7]">₹4,20,000</h2>
              <p className="text-xs text-[#3a6f77] mt-1">Total revenue collected</p>
            </div>
            <div className="border-t border-white/5 pt-3 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <p className="text-xs text-[#f5f6f7]/50">24 Paid</p>
                <p className="text-xs text-[#f5f6f7]/60">+18% ↑</p>
              </div>
              <div className="flex justify-between items-center"> d
                <p className="text-xs text-[#f5f6f7]/50">3 Overdue</p>
                <p className="text-xs text-[#f5f6f7]/60">Reminders sent</p>
              </div>
            </div>
          </motion.div>

        </motion.div>

        {/* Right Section */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="sm:w-1/2 mt-4 sm:mt-16 pr-4 sm:pr-16"
        >

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-[#2f2f33] leading-tight">
            Built by people <br /> who hated{" "}
            <span className="bg-[#3a6f77] text-[#f5f6f7] px-2 py-0.5 rounded-lg italic">
              billing
            </span>
          </h1>

          <p className="text-[#2f2f33]/60 text-sm sm:text-base leading-relaxed max-w-lg mt-6 mb-8">
            We were freelancers and small business owners first. Hours lost chasing payments, sending awkward follow-ups, losing track of who paid what. InvoiceLux was born from that frustration — a billing tool as refined and serious as the work you deliver.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">

            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.09 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0, delay: 0 }}
              className="bg-[#2f2f33] rounded-2xl p-4 border border-white/10 flex flex-col gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#D4B483]/20 flex items-center justify-center">
                <MapPin size={16} className="text-[#D4B483]" />
              </div>
              <h3 className="text-sm font-semibold text-[#f5f6f7]">Made for India</h3>
              <p className="text-xs text-[#f5f6f7]/40">GST-ready, UPI-friendly, WhatsApp-first</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.09 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0, delay: 0 }}
              className="bg-[#2f2f33] rounded-2xl p-4 border border-white/10 flex flex-col gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#3a6f77]/20 flex items-center justify-center">
                <Zap size={16} className="text-[#3a6f77]" />
              </div>
              <h3 className="text-sm font-semibold text-[#f5f6f7]">Instant Setup</h3>
              <p className="text-xs text-[#f5f6f7]/40">First invoice sent in under 3 minutes</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.09 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0, delay: 0 }}
              className="bg-[#2f2f33] rounded-2xl p-4 border border-white/10 flex flex-col gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#D4B483]/20 flex items-center justify-center">
                <Palette size={16} className="text-[#D4B483]" />
              </div>
              <h3 className="text-sm font-semibold text-[#f5f6f7]">Premium Design</h3>
              <p className="text-xs text-[#f5f6f7]/40">Invoices your clients will remember</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.09 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0, delay: 0 }}
              className="bg-[#2f2f33] rounded-2xl p-4 border border-white/10 flex flex-col gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#3a6f77]/20 flex items-center justify-center">
                <Headphones size={16} className="text-[#3a6f77]" />
              </div>
              <h3 className="text-sm font-semibold text-[#f5f6f7]">Real Support</h3>
              <p className="text-xs text-[#f5f6f7]/40">Humans who actually respond, fast</p>
            </motion.div>

          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default About;