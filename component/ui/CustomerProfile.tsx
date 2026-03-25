'use client';

import React from "react";

const CustomerProfile = () => {
  const customer = {
    name: "Meera Kapoor",
    since: "Aug 2024",
    email: "meera@kapoordesigns.com",
    phone: "+91 99887 76655",
    city: "Delhi, India",
    gst: "07AAIPM4321A1Z9",
    totalBilled: "₹38,500",
    status: "Pending",
  };

  const invoices = [
    { id: "#INV-0042", date: "Feb 10, 2026", amount: "₹12,500", status: "Overdue" },
    { id: "#INV-0034", date: "Jan 5, 2026", amount: "₹14,000", status: "Paid" },
    { id: "#INV-0027", date: "Nov 20, 2025", amount: "₹12,000", status: "Paid" },
  ];

  const statusClass = (status: string) => {
    if (status === "Paid") return "bg-[#3a6f77] text-[#f5f6f7]";
    if (status === "Overdue") return "bg-red-500 text-white";
    return "bg-[#D4B483] text-[#2f2f33]";
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f6f7] p-4 sm:p-6 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2f2f33] font-serif">
          {customer.name}
        </h1>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs sm:text-sm font-bold bg-[#D4B483] text-[#2f2f33] rounded-lg hover:bg-[#c9a86c] transition-all">
            New Invoice
          </button>
          <button className="px-3 py-1.5 text-xs sm:text-sm font-bold border border-[#3a6f77] text-[#3a6f77] rounded-lg hover:bg-[#3a6f77] hover:text-[#f5f6f7] transition-all">
            Edit
          </button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <p className="text-sm text-[#2f2f33]/70">Customer since {customer.since}</p>
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          <div>
            <p className="text-xs text-[#2f2f33]/60">Email</p>
            <p className="text-sm font-medium text-[#2f2f33]">{customer.email}</p>
          </div>
          <div>
            <p className="text-xs text-[#2f2f33]/60">Phone</p>
            <p className="text-sm font-medium text-[#2f2f33]">{customer.phone}</p>
          </div>
          <div>
            <p className="text-xs text-[#2f2f33]/60">Location</p>
            <p className="text-sm font-medium text-[#2f2f33]">{customer.city}</p>
          </div>
          <div>
            <p className="text-xs text-[#2f2f33]/60">GST No.</p>
            <p className="text-sm font-medium text-[#2f2f33]">{customer.gst}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-xs text-[#2f2f33]/60">Total Billed</p>
            <p className="text-lg font-bold text-[#3a6f77]">{customer.totalBilled}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass(customer.status)}`}>
            {customer.status}
          </span>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-bold text-[#2f2f33] mb-3">Recent Invoices</h2>
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center justify-between py-2 border-b border-[#2f2f33]/10 last:border-none"
          >
            <div>
              <p className="text-sm font-mono text-[#D4B483]">{inv.id}</p>
              <p className="text-xs text-[#2f2f33]/70">{inv.date}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-[#2f2f33]">{inv.amount}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusClass(inv.status)}`}>
                {inv.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerProfile;

