'use client'

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";
import { FaArrowLeft } from "react-icons/fa";

import Link from "next/link";
import { FaUser, FaBuilding, FaCreditCard, FaPaintBrush, FaFileInvoice, FaBell, FaExclamationTriangle, FaBars, FaTimes, FaHome } from "react-icons/fa";

const Settingsidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">

      {/* Back Button — Account ke upar, normal flow mein */}
      <div className="mt-4 mb-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-sm font-semibold border-2 transition-all duration-300 hover:scale-105 w-fit"
          style={{
            backgroundColor: "#3a6f77",
            color: "#f5f6f7",
            borderColor: "#D4B483",
          }}
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
      </div>

      {/* ACCOUNT */}
      <div className="mt-6">
        <h2 className="text-[#3a6f77] font-semibold mb-2">ACCOUNT</h2>
        <ul className="space-y-2">
          <Link
          href='/profile'
          className="flex items-center gap-2 text-[#2f2f33] hover:text-[#D4B483] cursor-pointer">
            <FaUser /> Profile
          </Link>
        </ul>
      </div>

      {/* PREFERENCES */}
      <div className="mt-6">
        <h2 className="text-[#3a6f77] font-semibold mb-2">PREFERENCES</h2>
        <ul className="space-y-2">
          <Link 
          href='/Plan'
          className="flex items-center gap-2 text-[#2f2f33] hover:text-[#D4B483] cursor-pointer">
            <FaCreditCard /> Plan & Billing
          </Link>
          <li className="flex items-center gap-2 text-[#2f2f33] hover:text-[#D4B483] cursor-pointer">
            <FaPaintBrush /> Appearance
          </li>
          <li className="flex items-center gap-2 text-[#2f2f33] hover:text-[#D4B483] cursor-pointer">
            <FaBell /> Notifications
          </li>
        </ul>
      </div>

      {/* DANGER */}

      {/* Back to Home */}
      <div className="mt-auto pt-6">
        <Link
          href="/"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md bg-[#3a6f77] text-white hover:bg-[#2f5a61] transition-colors duration-200 text-sm font-medium"
        >
          <FaHome /> Back to Home
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-[#f5f6f7] text-[#2f2f33] p-2 rounded-md shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <FaBars size={18} />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-[#f5f6f7] text-[#2f2f33] p-4 z-50 transform transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="absolute top-4 right-4 text-[#2f2f33] hover:text-[#D4B483]"
          onClick={() => setIsOpen(false)}
        >
          <FaTimes size={18} />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar — always visible */}
      <aside className="hidden md:flex w-64 bg-[#f5f6f7] text-[#2f2f33] h-screen p-4 flex-col flex-shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
};

export default Settingsidebar;