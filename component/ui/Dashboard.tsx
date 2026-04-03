"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { supabase } from "@/lib/supabaseClient";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("This Month");
  const [activeFilter, setActiveFilter] = useState("All");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [liveActivity, setLiveActivity] = useState<any[]>([]);
  const [stats, setStats] = useState({ revenue: '₹0', paid: '0', overdue: '0', customers: '0', paidAmt: '₹0', unpaidAmt: '₹0', overdueAmt: '₹0' });
  const [loading, setLoading] = useState(true);

  const tabs = ["This Month", "Quarter", "This Year", "All Time"];
  const filters = ["All", "Paid", "Unpaid", "Overdue"];

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: biz } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      if (!biz) { setLoading(false); return; }

      const { data: invData } = await supabase
        .from('invoices')
        .select('*')
        .eq('business_id', biz.id)
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false });

      const allInv = invData || [];
      const revenue = allInv.reduce((s: number, i: any) => s + Number(i.total_amount), 0);
      const paid = allInv.filter((i: any) => i.status === 'paid').length;
      const overdue = allInv.filter((i: any) => i.status === 'overdue').length;
      const unpaidAmount = allInv.filter((i: any) => i.status === 'unpaid' || i.status === 'draft').reduce((s: number, i: any) => s + Number(i.total_amount), 0);
      const overdueAmount = allInv.filter((i: any) => i.status === 'overdue').reduce((s: number, i: any) => s + Number(i.total_amount), 0);
      const paidAmount = allInv.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + Number(i.total_amount), 0);

      const { count: custCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', biz.id);

      setStats({
        revenue: '₹' + revenue.toLocaleString('en-IN'),
        paid: String(paid),
        overdue: String(overdue),
        customers: String(custCount || 0),
        paidAmt: '₹' + paidAmount.toLocaleString('en-IN'),
        unpaidAmt: '₹' + unpaidAmount.toLocaleString('en-IN'),
        overdueAmt: '₹' + overdueAmount.toLocaleString('en-IN'),
      });

      const displayInv = allInv.slice(0, 7);
      
      setInvoices(displayInv.map((inv: any) => ({
        id: '#' + inv.invoice_number,
        customer: inv.client_name_snapshot || 'Unknown',
        amount: '₹' + Number(inv.total_amount).toLocaleString('en-IN'),
        status: inv.status.charAt(0).toUpperCase() + inv.status.slice(1),
        dueDate: new Date(inv.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      })));

      const { data: actData } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false })
        .limit(4);

      setLiveActivity((actData || []).map((a: any) => {
        const colors: Record<string, string> = { payment: '#22c55e', reminder: '#D4B483', invoice: '#3a6f77', overdue: '#ef4444' };
        return {
          color: colors[a.entity_type] || '#3a6f77',
          text: a.message || `${a.action} on ${a.entity_type}`,
          sub: new Date(a.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        };
      }));

      setLoading(false);
    };
    load();
  }, []);

  const statusStyle = (status: string) => {
    if (status === "Paid") return { backgroundColor: "#22c55e22", color: "#22c55e" };
    if (status === "Overdue") return { backgroundColor: "#ef444422", color: "#ef4444" };
    return { backgroundColor: "#D4B48322", color: "#D4B483" };
  };

  const dotColor = (status: string) => {
    if (status === "Paid") return "#22c55e";
    if (status === "Overdue") return "#ef4444";
    return "#D4B483";
  };

  const filteredInvoices = activeFilter === "All"
    ? invoices
    : invoices.filter((inv) => inv.status === activeFilter);

  return (
    <div className="h-[100vh] w-full  flex flex-col overflow-hidden">

      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-8 py-3 sm:py-4 shrink-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl text-[#2f2f33] font-bold font-serif">
            Dashboard
          </h1>
          <p suppressHydrationWarning className="font-medium text-xs sm:text-sm text-[#2f2f33]/80 font-sans mt-0.5">
            {`Today ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button className="px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-[#D4B483] text-[#2f2f33] rounded-lg hover:bg-[#c9a86c] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5">
            Export
          </button>
          <Link
          href='/bill'
           className="px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold border border-[#3a6f77] text-[#3a6f77] rounded-lg hover:bg-[#3a6f77] hover:text-[#f5f6f7] transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
            New Invoice
          </Link>
        </div>
      </div>

      {/* Alert Banner */}
      {Number(stats.overdue) > 0 && (
      <div className="w-full  flex items-center gap-4 px-4 sm:px-8 py-2 flex-shrink-0">
        <p className="text-xs sm:text-sm font-medium font-sans flex items-center gap-2 truncate">
          <span className="text-red-500 flex-shrink-0">🔔 {stats.overdue} invoice{Number(stats.overdue) > 1 ? 's' : ''} overdue</span>
          <span className="text-[#2f2f33]/70 hidden sm:inline">— Auto-reminders have been sent to your customers.</span>
        </p>
        <Link href="/invoices" className="text-xs sm:text-sm text-[#3a6f77] font-medium flex items-center gap-1 cursor-pointer hover:text-[#3a6f77]/80 flex-shrink-0 ml-auto">
          View overdue
          <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5" />
        </Link>
      </div>
      )}

      {/* Tabs */}
      <div className="w-full bg-[#f5f6f7]/80 flex items-center pl-4 sm:pl-8 gap-4 sm:gap-6 py-2 flex-shrink-0 overflow-x-auto">
        {tabs.map((tab) => (
          <p
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs sm:text-sm font-sans font-medium cursor-pointer transition-all duration-150 whitespace-nowrap ${
              activeTab === tab ? "text-[#D4B483] font-bold" : "text-[#2f2f33] hover:text-[#D4B483]"
            }`}
          >
            {tab}
          </p>
        ))}
      </div>

      {/* Stat Cards - horizontal scroll on mobile */}
      <div className="flex gap-3 sm:gap-4 mt-3 mx-3 flex-shrink-0 overflow-x-auto pb-1">
        {/* Total Revenue */}
        <div className="min-w-[150px] sm:min-w-0 flex-1 bg-[#2f2f33] rounded-xl p-3 sm:p-4">
          <p className="text-xs font-medium font-sans text-[#f5f6f7]/70 pb-1">Total Revenue</p>
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-serif">{stats.revenue}</h2>
          <h3 className="text-xs sm:text-sm font-medium text-green-300 font-serif mt-1">Lifetime Invoiced</h3>
          <div className="mt-3 h-1 rounded-full bg-[#f5f6f7]/10">
            <div className="h-full rounded-full bg-[#D4B483]" style={{ width: "100%" }}></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-[#f5f6f7]/50 font-sans"></span>
            <span className="text-xs text-[#f5f6f7]/50 font-sans">All Time</span>
          </div>
        </div>

        {/* Paid Invoices */}
        <div className="min-w-[130px] sm:min-w-0 flex-1 bg-[#2f2f33] rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 pb-1">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-green-500/20 text-green-400 flex items-center justify-center text-xs">✓</div>
            <p className="text-xs font-medium font-sans text-[#f5f6f7]/70">Paid</p>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-green-400 font-serif">{stats.paid}</h2>
          <h3 className="text-xs sm:text-sm font-medium text-green-300 font-serif mt-1">Cleared</h3>
          <p className="text-xs text-[#f5f6f7]/50 font-sans mt-1">{stats.paidAmt} collected</p>
        </div>

        {/* Unpaid */}
        <div className="min-w-[130px] sm:min-w-0 flex-1 bg-[#2f2f33] rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 pb-1">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-xs" style={{ backgroundColor: "#D4B48322", color: "#D4B483" }}>⏳</div>
            <p className="text-xs font-medium font-sans text-[#f5f6f7]/70">Unpaid</p>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-serif" style={{ color: "#D4B483" }}>{invoices.filter(i => i.status === 'Unpaid' || i.status === 'Draft').length || '0'}</h2>
          <h3 className="text-xs sm:text-sm font-medium font-serif mt-1" style={{ color: "#D4B483" }}>{stats.unpaidAmt} pending</h3>
          <p className="text-xs text-[#f5f6f7]/50 font-sans mt-1">Awaiting payment</p>
        </div>

        {/* Overdue */}
        <div className="min-w-[130px] sm:min-w-0 flex-1 bg-[#2f2f33] rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 pb-1">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold">!</div>
            <p className="text-xs font-medium font-sans text-[#f5f6f7]/70">Overdue</p>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-red-400 font-serif">{stats.overdue}</h2>
          <h3 className="text-xs sm:text-sm font-medium text-red-300 font-serif mt-1">{stats.overdueAmt} at risk</h3>
          <p className="text-xs text-[#f5f6f7]/50 font-sans mt-1">Action required</p>
        </div>
      </div>

      {/* Bottom Section — desktop: side by side | mobile: stacked with Recent on top */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-3 mx-3 mb-3 flex-1 min-h-0">

        {/* Recent Invoices */}
        <div className="flex-1 bg-[#2f2f33]/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-2 flex-shrink-0">
            <h3 className="text-sm sm:text-base font-bold text-[#f5f6f7] font-serif">Recent Invoices</h3>
            <span
              className="text-xs sm:text-sm font-sans font-bold cursor-pointer px-2 py-0.5 rounded-md transition-all duration-150 hover:opacity-80"
              style={{ color: "#f5f6f7", backgroundColor: "#1a1a1d" }}
            >
              View All →
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-2 flex-shrink-0">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="px-2 sm:px-3 py-1 text-xs font-sans rounded-md cursor-pointer transition-all duration-150"
                style={{
                  border: "1px solid #f5f6f722",
                  backgroundColor: activeFilter === f ? "#f5f6f7" : "transparent",
                  color: activeFilter === f ? "#2f2f33" : "#f5f6f7aa",
                  fontWeight: activeFilter === f ? "bold" : "normal",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pb-2 mb-1 flex-shrink-0" style={{ borderBottom: "1px solid #f5f6f722" }}>
            <span className="text-xs font-sans tracking-widest text-[#f5f6f7]/50">INVOICE</span>
            <span className="text-xs font-sans tracking-widest text-[#f5f6f7]/50">CUSTOMER</span>
            <span className="text-xs font-sans tracking-widest text-[#f5f6f7]/50">STATUS</span>
            <span className="text-xs font-sans tracking-widest text-[#f5f6f7]/50 hidden sm:block">AMOUNT</span>
            <span className="text-xs font-sans tracking-widest text-[#f5f6f7]/50 hidden sm:block">DUE DATE</span>
          </div>

          {/* Invoice Rows — scrollable */}
          <div className="overflow-y-auto flex-1 pr-0.5" style={{ scrollbarWidth: "thin", scrollbarColor: "#3a3a3d transparent" }}>
            {filteredInvoices.map((inv) => (
              <div key={inv.id} className="grid grid-cols-3 sm:grid-cols-5 gap-2 py-2 sm:py-2.5 items-center" style={{ borderBottom: "1px solid #f5f6f711" }}>
                <span className="text-xs sm:text-sm font-mono" style={{ color: "#D4B483" }}>{inv.id}</span>
                <span className="text-xs sm:text-sm font-sans text-[#f5f6f7] truncate">{inv.customer}</span>
                <span
                  className="text-xs font-sans px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit"
                  style={statusStyle(inv.status)}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor(inv.status) }}></span>
                  {inv.status}
                </span>
                <span className="text-xs sm:text-sm font-sans text-[#f5f6f7] hidden sm:block">{inv.amount}</span>
                <span className="text-xs sm:text-sm font-sans text-[#f5f6f7]/50 hidden sm:block">{inv.dueDate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity — on mobile: fixed small height, on desktop: sidebar */}
        <div className="h-[180px] sm:h-auto sm:w-[28%] bg-[#2f2f33]/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-3 flex-shrink-0">
            <h3 className="text-sm sm:text-base font-bold text-[#f5f6f7] font-serif">Live Activity</h3>
            <span
              className="text-xs font-sans font-bold cursor-pointer px-2 py-0.5 rounded-md transition-all duration-150 hover:opacity-80"
              style={{ color: "#f5f6f7", backgroundColor: "#1a1a1d" }}
            >
              Clear
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 overflow-y-auto flex-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#3a3a3d transparent" }}>
            {liveActivity.map((a, i) => (
              <div key={i} className="flex gap-2 sm:gap-3 items-start">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: a.color }}></div>
                <div>
                  <p className="text-xs sm:text-sm font-sans text-[#f5f6f7] m-0 mb-0.5">{a.text}</p>
                  <p className="text-xs font-sans m-0 text-[#f5f6f7]/50">{a.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;