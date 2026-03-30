"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { IoSend } from "react-icons/io5";

const Contectus = () => {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/thank-you");
  };

  return (
    <div className="h-full w-full flex items-center justify-center px-4 py-4 sm:px-6 sm:py-6 md:px-0 md:py-0 overflow-hidden">
      <div className="h-full w-full max-w-5xl bg-[#f5f6f7] rounded-3xl shadow-md flex flex-col md:flex-row items-center justify-center overflow-hidden border border-[#D4B483]">
        <div className="w-full md:w-1/2 h-full relative">
          <img
            src="/logo/contactus.png"
            alt="Contact"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/2 h-full flex items-center justify-center">
          <div className="w-full h-full px-6 py-8 sm:px-8 sm:py-10">
            <div className="h-full w-full rounded-2xl border border-[#D4B483] bg-[#f5f6f7] p-5 sm:p-6 flex flex-col justify-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2f2f33]">Send us a Message</h2>
              <p className="text-sm text-[#3a6f77] mb-1">Fill out the form below, and we&apos;ll get back to you soon.</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  className="w-full rounded-md border border-[#D4B483] bg-[#f5f6f7] px-3 py-2.5 text-sm text-[#2f2f33] outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full rounded-md border border-[#D4B483] bg-[#f5f6f7] px-3 py-2.5 text-sm text-[#2f2f33] outline-none"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  required
                  className="w-full rounded-md border border-[#D4B483] bg-[#f5f6f7] px-3 py-2.5 text-sm text-[#2f2f33] outline-none"
                />
                <textarea
                  placeholder="Message"
                  rows={5}
                  required
                  className="w-full rounded-md border border-[#D4B483] bg-[#f5f6f7] px-3 py-2.5 text-sm text-[#2f2f33] outline-none resize-none"
                />
                <button type="submit" className="w-full rounded-md border border-[#D4B483] bg-[#3a6f77] py-2.5 text-base font-semibold text-[#f5f6f7] cursor-pointer flex items-center justify-center gap-2">
                  <IoSend size={18} />
                  <span>Send Message</span>
                </button>
                <div className="flex items-center justify-end gap-2">
                  <a href="#" aria-label="Facebook" className="text-[#D4B483] bg-[#f5f6f7]/95 rounded-full p-1.5 shadow-sm border border-[#D4B483]">
                    <FaFacebookF size={14} />
                  </a>
                  <a href="#" aria-label="Instagram" className="text-[#3a6f77] bg-[#f5f6f7]/95 rounded-full p-1.5 shadow-sm border border-[#D4B483]">
                    <FaInstagram size={14} />
                  </a>
                  <a href="#" aria-label="LinkedIn" className="text-[#2f2f33] bg-[#f5f6f7]/95 rounded-full p-1.5 shadow-sm border border-[#D4B483]">
                    <FaLinkedinIn size={14} />
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contectus;
