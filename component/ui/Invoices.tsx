"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const Invoices = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest First");
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New states for tracking limits
  const [planName, setPlanName] = useState<string>("Starter");
  const [invoiceLimit, setInvoiceLimit] = useState<number | null>(10);
  const [monthUsage, setMonthUsage] = useState<number>(0);

  useEffect(() => {
    const loadInvoices = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: biz } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      if (!biz) { setLoading(false); return; }

      // 1. Resolve Subscription limits & current usage
      const { data: sub } = await supabase
        .from('subscriptions')
        .select(`plan_id, status, plans(name, invoice_limit)`)
        .eq('business_id', biz.id)
        .eq('status', 'active')
        .maybeSingle();

      let pLimit: number | null = 10;
      let pName = "Starter";

      if (sub && sub.plans) {
        const pInfo: any = Array.isArray(sub.plans) ? sub.plans[0] : sub.plans;
        pLimit = pInfo.invoice_limit;
        pName = pInfo.name;
      } else {
        const { data: freeP } = await supabase.from('plans').select('invoice_limit, name').eq('id', 'free').maybeSingle();
        if (freeP) {
          pLimit = freeP.invoice_limit;
          pName = freeP.name;
        }
      }

      setInvoiceLimit(pLimit);
      setPlanName(pName);

      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', biz.id)
        .gte('created_at', startOfMonth);
        
      setMonthUsage(count || 0);

      // 2. Fetch all invoices for grid

      const { data } = await supabase
        .from('invoices')
        .select('*, customers(name), invoice_items(description, quantity)')
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false });

      const mapped = (data || []).map((inv: any) => ({
        rawId: inv.id,
        id: '#' + inv.invoice_number,
        customer: inv.client_name_snapshot || inv.customers?.name || 'Unknown',
        amount: '₹' + Number(inv.total_amount).toLocaleString('en-IN'),
        status: inv.status.charAt(0).toUpperCase() + inv.status.slice(1),
        dueDate: new Date(inv.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        issued: new Date(inv.issue_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        rawAmount: Number(inv.total_amount),
        rawStatus: inv.status,
        pdfUrl: inv.pdf_path ? supabase.storage.from('invoices').getPublicUrl(inv.pdf_path).data.publicUrl : null,
        items: inv.invoice_items || [],
      }));

      setInvoices(mapped);
      setLoading(false);
    };
    loadInvoices();
  }, []);

  const updateStatus = async (invoiceId: string, newStatus: string) => {
    const lowerStatus = newStatus.toLowerCase();
    const { error } = await supabase
      .from('invoices')
      .update({ status: lowerStatus })
      .eq('id', invoiceId);
      
    if (error) {
      alert("Failed to update status: " + error.message);
      return;
    }
    
    setInvoices(prev => prev.map(inv => {
      if (inv.rawId === invoiceId) {
        return {
          ...inv,
          rawStatus: lowerStatus,
          status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
        };
      }
      return inv;
    }));
  };

const statusStyle = (status: string) => {
  if (status === "Paid") return { backgroundColor: "#22c55e22", color: "#22c55e" };
  if (status === "Overdue") return { backgroundColor: "#ef444422", color: "#ef4444" };
  if (status === "Draft") return { backgroundColor: "#94a3b822", color: "#94a3b8" };
  return { backgroundColor: "#D4B48322", color: "#D4B483" };
};

const dotColor = (status: string) => {
  if (status === "Paid") return "#22c55e";
  if (status === "Overdue") return "#ef4444";
  if (status === "Draft") return "#94a3b8";
  return "#D4B483";
};


  const filters = [
    { label: "All", count: invoices.length },
    { label: "Paid", count: invoices.filter(i => i.rawStatus === 'paid').length },
    { label: "Unpaid", count: invoices.filter(i => i.rawStatus === 'unpaid').length },
    { label: "Overdue", count: invoices.filter(i => i.rawStatus === 'overdue').length },
    { label: "Draft", count: invoices.filter(i => i.rawStatus === 'draft').length },
  ];

  const filtered = invoices
    .filter((inv) => activeFilter === "All" || inv.status === activeFilter)
    .filter((inv) =>
      (inv.customer || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv.id || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "Newest First"
        ? b.id.localeCompare(a.id)
        : a.id.localeCompare(b.id)
    );

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.rawAmount, 0);
  const totalInvoicesCount = invoices.length;

  const collected = invoices.filter(i => i.rawStatus === 'paid').reduce((sum, inv) => sum + inv.rawAmount, 0);
  const collectedCount = invoices.filter(i => i.rawStatus === 'paid').length;

  const pending = invoices.filter(i => i.rawStatus === 'unpaid' || i.rawStatus === 'draft').reduce((sum, inv) => sum + inv.rawAmount, 0);
  const pendingCount = invoices.filter(i => i.rawStatus === 'unpaid' || i.rawStatus === 'draft').length;

  const overdueAmount = invoices.filter(i => i.rawStatus === 'overdue').reduce((sum, inv) => sum + inv.rawAmount, 0);
  const overdueCount = invoices.filter(i => i.rawStatus === 'overdue').length;

  return (
    <div className="h-[100vh] w-full flex flex-col overflow-hidden">

      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl text-[#2f2f33] font-bold font-serif">Invoices</h1>
          <p suppressHydrationWarning className="font-medium text-xs sm:text-sm text-[#2f2f33]/80 font-sans mt-0.5">{`Today ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}</p>
        </div>
        <div className="flex gap-2 items-center">
          {invoiceLimit !== null && (
            <span className="text-xs text-[#2f2f33]/60 hidden sm:block font-medium">
              {monthUsage} / {invoiceLimit} Invoices ({planName})
            </span>
          )}
          <button className="px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-[#D4B483] text-[#2f2f33] rounded-lg hover:bg-[#c9a86c] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5">
            Export
          </button>
          
          {invoiceLimit !== null && monthUsage >= invoiceLimit ? (
            <button 
              onClick={() => alert(`You have reached the ${invoiceLimit} invoice limit for your ${planName} Plan this month. Please go to Pricing to upgrade your account and unlock more limits!`)}
              className="px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold border border-red-400 text-red-500 rounded-lg hover:bg-red-50 transition-all duration-200 cursor-not-allowed">
              Limit Reached
            </button>
          ) : (
            <Link 
              href='/bill'
              className="px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold border border-[#3a6f77] text-[#3a6f77] rounded-lg hover:bg-[#3a6f77] hover:text-[#f5f6f7] transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
              New Invoice
            </Link>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="flex gap-3 sm:gap-4 mx-3 flex-shrink-0 overflow-x-auto pb-1">
        <div className="min-w-[150px] sm:min-w-0 flex-1 bg-[#2f2f33] rounded-xl p-3 sm:p-4">
          <p className="text-xs font-medium font-sans text-[#f5f6f7]/70 pb-1">TOTAL INVOICED</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">₹{totalInvoiced.toLocaleString('en-IN')}</h2>
          <h3 className="text-xs font-medium text-green-300 font-serif mt-3">{totalInvoicesCount} INVOICE{totalInvoicesCount !== 1 ? 'S' : ''}</h3>
        </div>
        <div className="min-w-[130px] sm:min-w-0 flex-1 bg-[#2f2f33] rounded-xl p-3 sm:p-4">
          <p className="text-xs font-medium font-sans text-[#f5f6f7]/70 pb-1">COLLECTED</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-green-400 font-serif">₹{collected.toLocaleString('en-IN')}</h2>
          <p className="text-xs text-[#f5f6f7]/50 font-sans mt-3">{collectedCount} PAID</p>
        </div>
        <div className="min-w-[130px] sm:min-w-0 flex-1 bg-[#2f2f33] rounded-xl p-3 sm:p-4">
          <p className="text-xs font-medium font-sans text-[#f5f6f7]/70 pb-1">PENDING</p>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif" style={{ color: "#D4B483" }}>₹{pending.toLocaleString('en-IN')}</h2>
          <p className="text-xs text-[#f5f6f7]/50 font-sans mt-3">{pendingCount} UNPAID</p>
        </div>
        <div className="min-w-[130px] sm:min-w-0 flex-1 bg-[#2f2f33] rounded-xl p-3 sm:p-4">
          <p className="text-xs font-medium font-sans text-[#f5f6f7]/70 pb-1">OVERDUE</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-red-400 font-serif">₹{overdueAmount.toLocaleString('en-IN')}</h2>
          <p className="text-xs text-[#f5f6f7]/50 font-sans mt-3">{overdueCount} OVERDUE</p>
        </div>
      </div>

      {/* Search + Filter + Sort */}
      <div className="flex items-center justify-between mx-3 mt-4 gap-3 flex-shrink-0 flex-wrap">
        <div className="flex items-center bg-[#2f2f33] rounded-md px-3 py-1.5 gap-2 w-full sm:w-56">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#f5f6f7]/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
          </svg>
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#f5f6f7] placeholder-[#f5f6f7]/50 focus:outline-none"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(f.label)}
              className="px-3 py-1 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer"
              style={{
                backgroundColor: activeFilter === f.label ? "#D4B483" : "#2f2f33",
                color: activeFilter === f.label ? "#2f2f33" : "#f5f6f7",
              }}
            >
              {f.label} {f.count}
            </button>
          ))}
        </div>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-4 py-1.5 rounded-md bg-[#D4B483] text-[#2f2f33] font-semibold text-sm cursor-pointer"
        >
          <option>Newest First</option>
          <option>Oldest First</option>
        </select>
      </div>

      {/* Table */}
      <div className="mx-3 mt-4 mb-3 bg-[#2f2f33] rounded-xl flex flex-col flex-1 min-h-0 overflow-x-auto">

        <div className="min-w-[760px] flex flex-col flex-1 min-h-0">

        {/* Table Header */}
        <div className="grid grid-cols-[1fr_1.5fr_2fr_1.2fr_1fr_1fr_40px] gap-2 px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid #f5f6f722" }}>
          <span className="text-xs font-sans tracking-widest text-[#f5f6f7]/50">INVOICE</span>
          <span className="text-xs font-sans tracking-widest text-[#f5f6f7]/50">CUSTOMER</span>
          <span className="text-xs font-sans tracking-widest text-[#f5f6f7]/50">ITEMS</span>
          <span className="text-xs font-sans tracking-widest text-[#f5f6f7]/50">STATUS</span>
          <span className="text-xs font-sans tracking-widest text-[#f5f6f7]/50">AMOUNT</span>
          <span className="text-xs font-sans tracking-widest text-[#f5f6f7]/50">DUE DATE</span>
          <span className="text-xs font-sans tracking-widest text-[#f5f6f7]/50 text-center">PDF</span>
        </div>

        {/* Scrollable Rows */}
        <div className="overflow-y-auto flex-1 px-4" style={{ scrollbarWidth: "thin", scrollbarColor: "#3a3a3d transparent" }}>
          {filtered.length === 0 ? (
            <p className="text-sm text-[#f5f6f7]/40 text-center py-10">No invoices found</p>
          ) : (
            filtered.map((inv) => (
              <div
                key={inv.id}
                className="grid grid-cols-[1fr_1.5fr_2fr_1.2fr_1fr_1fr_40px] gap-2 py-3 items-center hover:bg-[#f5f6f7]/5 rounded-lg transition-colors duration-100"
                style={{ borderBottom: "1px solid #f5f6f711" }}
              >
                <span className="text-sm font-mono" style={{ color: "#D4B483" }}>{inv.id}</span>
                <span className="text-sm font-sans text-[#f5f6f7] truncate">{inv.customer}</span>
                
                {/* Items Column */}
                <div 
                  className="flex flex-col min-w-0 justify-center cursor-help"
                  title={inv.items && inv.items.length > 0 ? inv.items.map((i: any) => `${i.quantity}x ${i.description}`).join('\n') : "No items"}
                >
                  {inv.items && inv.items.length > 0 ? (
                    <>
                      <span className="text-[13px] font-sans text-[#f5f6f7]/90 truncate">
                        &#x2022; {inv.items[0].description}
                      </span>
                      {inv.items.length > 1 && (
                        <span className="text-[11px] text-[#D4B483] truncate mt-0.5">
                          + {inv.items.length - 1} more item{inv.items.length - 1 > 1 ? 's' : ''}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm font-sans text-[#f5f6f7]/40 italic">Empty</span>
                  )}
                </div>
                <div className="relative w-fit">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor(inv.status) }}></span>
                  <select
                    value={inv.status}
                    onChange={(e) => updateStatus(inv.rawId, e.target.value)}
                    className="text-xs font-sans pl-5 pr-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit outline-none cursor-pointer appearance-none text-center"
                    style={statusStyle(inv.status)}
                  >
                    <option value="Paid" className="bg-[#2f2f33] text-white">Paid</option>
                    <option value="Unpaid" className="bg-[#2f2f33] text-white">Unpaid</option>
                    <option value="Overdue" className="bg-[#2f2f33] text-white">Overdue</option>
                    <option value="Draft" className="bg-[#2f2f33] text-white">Draft</option>
                  </select>
                </div>
                <span className="text-sm font-medium font-serif" style={{ color: "#D4B483" }}>{inv.amount}</span>
                <span className="text-sm font-sans text-[#f5f6f7]/50">{inv.dueDate}</span>
                <div className="flex justify-center">
                  {inv.pdfUrl ? (
                    <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-[#3a6f77] hover:text-[#D4B483] transition-colors" title="Download PDF">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-[#f5f6f7]/20" title="No PDF saved">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        </div>
      </div>

    </div>
  );
};

export default Invoices;