'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaExclamationCircle, FaCalendarWeek, FaEnvelopeOpenText, FaChartLine, FaWhatsapp, FaCog, FaTimes, FaBars } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { supabase } from '@/lib/supabaseClient'
import { useAppContext } from '@/lib/AppContext'

interface CustomerData {
  name: string
  email: string
  phone: string
  city: string
  revenue: string
  invoices: string
  status: string
}

const StatusBadge = ({ status }: { status: string }) => {
  const isGood = status === "Good"
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isGood ? "bg-[#3a6f77]/30 text-[#4ecdc4] border border-[#3a6f77]/40" : "bg-[#D4B483]/20 text-[#D4B483] border border-[#D4B483]/40"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isGood ? "bg-[#4ecdc4]" : "bg-[#D4B483]"}`} />
      {status}
    </span>
  )
}

const Toggle = ({ defaultOn = true }) => {
  const [on, setOn] = useState(defaultOn)
  return (
    <div onClick={() => setOn(!on)} className={`w-11 h-6 rounded-full cursor-pointer transition-all duration-200 flex items-center px-1 flex-shrink-0 ${on ? "bg-[#3a6f77]" : "bg-[#f5f6f7]/20"}`}>
      <div className={`w-4 h-4 rounded-full bg-[#f5f6f7] transition-all duration-200 ${on ? "translate-x-5" : "translate-x-0"}`} />
    </div>
  )
}

const SidebarContent = ({ stats, onSendWhatsApp, isSending }: { stats: any, onSendWhatsApp?: () => void, isSending?: boolean }) => (
  <div className="flex flex-col gap-4 p-4 h-full border-l border-[#f5f6f7]/5 overflow-y-auto">
    {/* Response Rate */}
    <div className="bg-[#1e1e21] rounded-xl p-4">
      <p className="text-xs text-[#f5f6f7]/50 uppercase tracking-widest mb-2">Response Rate</p>
      <h2 className="text-4xl font-bold text-[#3a6f77] font-serif">N/A</h2>
      <p className="text-xs text-[#f5f6f7]/50 mt-1">Tracking coming soon</p>
    </div>

    {/* Bulk Action */}
    <div className="bg-[#1e1e21] rounded-xl p-4">
      <p className="text-xs text-[#D4B483] uppercase tracking-widest mb-1">Bulk Action</p>
      <h3 className="text-base font-bold text-[#f5f6f7] mb-1">Send All Reminders</h3>
      <p className="text-xs text-[#f5f6f7]/50 mb-4">Send reminders to all overdue and upcoming clients via their preferred channel.</p>
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-[#2f2f33] rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-red-400 font-serif">{stats.overdueCount}</p>
          <p className="text-xs text-[#f5f6f7]/40 mt-0.5">Overdue</p>
        </div>
        <div className="flex-1 bg-[#2f2f33] rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-[#D4B483] font-serif">{stats.weekCount}</p>
          <p className="text-xs text-[#f5f6f7]/40 mt-0.5">Due Soon</p>
        </div>
      </div>
      <button 
        onClick={onSendWhatsApp}
        disabled={isSending}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg ${isSending ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-500'} text-[#f5f6f7] text-sm font-bold transition-all duration-200 mb-2 cursor-pointer`}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.1 1.523 5.82L.057 23.5l5.806-1.523A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.724.977.995-3.63-.234-.373A9.818 9.818 0 0112 2.182c5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/></svg>
        {isSending ? 'Sending...' : 'Send via WhatsApp'}
      </button>
      <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#3a6f77] hover:bg-[#4a8f99] text-[#f5f6f7] text-sm font-bold transition-all duration-200 cursor-pointer">
        <MdEmail className="text-base" /> Send via Email
      </button>
    </div>

    {/* Auto-Reminder Settings */}
    <div className="bg-[#1e1e21] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <FaCog className="text-[#D4B483]" />
        <p className="text-sm font-bold text-[#f5f6f7]">Auto-Reminder Settings</p>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="pr-2">
          <p className="text-sm text-[#f5f6f7]">Auto-Reminders</p>
          <p className="text-xs text-[#f5f6f7]/40">Automatically send on schedule</p>
        </div>
        <Toggle defaultOn={true} />
      </div>
      <div className="flex items-center justify-between">
        <div className="pr-2">
          <p className="text-sm text-[#f5f6f7]">Before Due Date</p>
          <p className="text-xs text-[#f5f6f7]/40">Send reminder 2 days before</p>
        </div>
        <Toggle defaultOn={true} />
      </div>
    </div>
  </div>
)

const Reminder = () => {
  const [activeTab, setActiveTab] = useState("overdue")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [rawInvoices, setRawInvoices] = useState<any[]>([])
  const [business, setBusiness] = useState<any>(null)
  const [stats, setStats] = useState({ overdueCount: 0, weekCount: 0, monthCount: 0 })
  const [loading, setLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  // ✅ OPTIMIZED: bizId + business from shared context — no auth or businesses fetch
  const { bizId, business: ctxBusiness, loading: ctxLoading } = useAppContext();

  React.useEffect(() => {
    if (ctxLoading) return;
    if (!bizId) { setLoading(false); return; }

    setBusiness(ctxBusiness);

    const fetchData = async () => {
      // ✅ OPTIMIZED: Only fetch unpaid/overdue (paid invoices irrelevant for reminders)
      // ✅ OPTIMIZED: Select only fields used in UI + WhatsApp sending, not customers(*)
      const { data: invs } = await supabase
        .from('invoices')
        .select(`
          id, customer_id, status, due_date, total_amount,
          currency, pdf_path, client_name_snapshot,
          customers(id, name, email, phone, city)
        `)
        .eq('business_id', bizId)
        .in('status', ['unpaid', 'overdue'])

      if (!invs) { setLoading(false); return }
      setRawInvoices(invs)

      let overdue = 0
      let week = 0
      let month = 0
      
      const now = new Date()
      const nextWeek = new Date()
      nextWeek.setDate(now.getDate() + 7)
      const nextMonth = new Date()
      nextMonth.setMonth(now.getMonth() + 1)

      const customerMap = new Map<string, any>()

      invs.forEach((inv: any) => {
        const dDate = new Date(inv.due_date)
        if (inv.status === 'overdue' || (inv.status === 'unpaid' && dDate < now)) overdue++
        else if (inv.status === 'unpaid' && dDate >= now && dDate <= nextWeek) week++
        
        if (inv.status === 'unpaid' && dDate >= now && dDate <= nextMonth) month++

        const cId = inv.customer_id
        if (cId) {
          if (!customerMap.has(cId)) {
            customerMap.set(cId, {
              c: inv.customers,
              invCount: 0,
              totalRev: 0,
              hasOverdue: false
            })
          }
          const m = customerMap.get(cId)
          m.invCount++
          m.totalRev += Number(inv.total_amount)
          if (inv.status === 'overdue' || (inv.status === 'unpaid' && dDate < now)) {
            m.hasOverdue = true
          }
        }
      })

      setStats({ overdueCount: overdue, weekCount: week, monthCount: month })
      
      const res: CustomerData[] = Array.from(customerMap.values()).map(m => ({
        name: m.c?.name || 'Unknown',
        email: m.c?.email || '-',
        phone: m.c?.phone || '-',
        city: m.c?.city || '-',
        revenue: '₹' + m.totalRev.toLocaleString('en-IN'),
        invoices: m.invCount + (m.invCount > 1 ? ' invoices' : ' invoice'),
        status: m.hasOverdue ? 'Pending' : 'Good'
      }))
      
      setCustomers(res)
      setLoading(false)
    }
    fetchData()
  }, [bizId, ctxLoading])

  const handleBulkWhatsApp = async () => {
    if (!rawInvoices.length || !business) return;
    setIsSending(true);
    let sentCount = 0;
    
    const now = new Date();
    // Filter to only unpaid/overdue
    const dueInvoices = rawInvoices.filter(inv => {
      const dDate = new Date(inv.due_date);
      return inv.status === 'overdue' || (inv.status === 'unpaid' && dDate < now);
    });

    if (dueInvoices.length === 0) {
      alert("No overdue invoices found to send reminders for.");
      setIsSending(false);
      return;
    }

    alert(`Starting WhatsApp broadcast for ${dueInvoices.length} overdue invoices... Please wait.`);

    for (const inv of dueInvoices) {
      const c = inv.customers;
      if (!c || !c.phone || !inv.pdf_path) continue;

      const { data: publicUrlData } = supabase.storage.from('invoices').getPublicUrl(inv.pdf_path);
      const publicUrl = publicUrlData.publicUrl;

      try {
        const waRes = await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientPhone: c.phone,
            clientName: c.name,
            businessName: business.business_name || 'us',
            currency: inv.currency,
            total: inv.total_amount,
            publicUrl: publicUrl,
            isReminder: true
          })
        });
        if (waRes.ok) sentCount++;
      } catch (err) {
        console.error("WhatsApp reminder failed for", c.name, err);
      }
    }

    setIsSending(false);
    alert(`Finished! Successfully sent ${sentCount} WhatsApp reminders.`);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#f5f6f7]">

      {/* MAIN PANEL */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <div className="w-full flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl text-[#2f2f33] font-bold font-serif">Reminders</h1>
            <p suppressHydrationWarning className="text-xs sm:text-sm text-[#2f2f33]/80 font-sans mt-0.5">{`Today ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}</p>
          </div>
          <div className="flex gap-2 items-center">
            <button className="flex items-center gap-2 px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-[#D4B483] text-[#2f2f33] rounded-lg hover:bg-[#c9a86c] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5">
              <FaExclamationCircle />
              <span className="hidden sm:inline">Compose Reminder</span>
              <span className="sm:hidden">Compose</span>
            </button>
            <button className="flex items-center gap-2 px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold border border-[#3a6f77] text-[#3a6f77] rounded-lg hover:bg-[#3a6f77] hover:text-[#f5f6f7] transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
              <FaEnvelopeOpenText />
              <span className="hidden sm:inline">Send All Now</span>
              <span className="sm:hidden">Send</span>
            </button>
            {/* Mobile/Tablet sidebar toggle button — visible on all screens except xl+ */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex xl:hidden items-center justify-center w-9 h-9 rounded-lg bg-[#2f2f33] text-[#f5f6f7] hover:bg-[#3a3a3e] transition-colors cursor-pointer"
            >
              <FaBars className="text-sm" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-3 sm:gap-4 mt-3 mx-3 flex-shrink-0 overflow-x-auto pb-1">
          <div className="min-w-[130px] flex-1 bg-[#2f2f33] rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 pb-1">
              <FaExclamationCircle className="text-red-400" />
              <p className="text-xs font-medium font-sans text-[#f5f6f7]/70">OVERDUE</p>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-red-400 font-serif">{stats.overdueCount}</h2>
            <span className="text-xs text-[#f5f6f7]/50 font-sans">NEED IMMEDIATE ACTION</span>
          </div>
          <div className="min-w-[120px] flex-1 bg-[#2f2f33] rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 pb-1">
              <FaCalendarWeek className="text-green-400" />
              <p className="text-xs font-medium font-sans text-[#f5f6f7]/70">THIS WEEK</p>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-green-400 font-serif">{stats.weekCount}</h2>
            <p className="text-xs text-[#f5f6f7]/50 font-sans mt-1">UPCOMING</p>
          </div>
          <div className="min-w-[120px] flex-1 bg-[#2f2f33] rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 pb-1">
              <FaEnvelopeOpenText style={{ color: "#D4B483" }} />
              <p className="text-xs font-medium font-sans text-[#f5f6f7]/70">THIS MONTH</p>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[#D4B483]">{stats.monthCount}</h2>
            <p className="text-xs text-[#f5f6f7]/50 font-sans mt-1">ALL CHANNELS</p>
          </div>
          <div className="min-w-[120px] flex-1 bg-[#2f2f33] rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 pb-1">
              <FaChartLine className="text-blue-400" />
              <p className="text-xs font-medium font-sans text-[#f5f6f7]/70">RESPONSE</p>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#f5f6f7]/50 font-serif">N/A</h2>
            <p className="text-xs text-[#f5f6f7]/50 font-sans mt-1">COMING SOON</p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-4 overflow-x-auto px-3 pb-2 mt-4 flex-shrink-0">
          <button
            onClick={() => setActiveTab("overdue")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold cursor-pointer transition-all whitespace-nowrap ${activeTab === "overdue" ? "bg-[#D4B483] text-[#2f2f33]" : "bg-[#2f2f33] text-[#f5f6f7]"}`}
          >
            <FaExclamationCircle /> Overdue
          </button>
          <button
            onClick={() => setActiveTab("week")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold cursor-pointer transition-all whitespace-nowrap ${activeTab === "week" ? "bg-[#3a6f77] text-[#f5f6f7]" : "bg-[#2f2f33] text-[#f5f6f7]"}`}
          >
            <FaCalendarWeek /> This Week
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-3 mt-3 overflow-y-auto pb-24 xl:pb-4">
          {activeTab === "overdue" && (
            <div className="bg-[#2f2f33] rounded-xl p-4 text-[#f5f6f7]">
              <h2 className="text-lg font-bold text-red-400 flex items-center gap-2"><FaExclamationCircle /> Overdue — Action Required</h2>
              <p className="text-sm text-[#f5f6f7]/70 mt-2">{stats.overdueCount} invoice{stats.overdueCount !== 1 ? 's' : ''} overdue, immediate action needed.</p>
            </div>
          )}
          {activeTab === "week" && (
            <div className="bg-[#2f2f33] rounded-xl p-4 text-[#f5f6f7]">
              <h2 className="text-lg font-bold text-[#3a6f77] flex items-center gap-2"><FaCalendarWeek /> Upcoming — Due This Week</h2>
              <p className="text-sm text-[#f5f6f7]/70 mt-2">{stats.weekCount} invoice{stats.weekCount !== 1 ? 's' : ''} due this week, follow up required.</p>
            </div>
          )}

          {/* Customer Table — Desktop */}
          <div className="mt-4 bg-[#2f2f33] rounded-xl overflow-hidden hidden md:block">
            <div className="grid grid-cols-6 px-5 py-3 border-b border-[#f5f6f7]/10">
              {["Customer", "Email", "Phone", "City", "Revenue", "Status"].map((h, i) => (
                <span key={i} className={`text-xs font-semibold text-[#f5f6f7]/40 tracking-widest uppercase ${i === 5 ? "text-right" : ""}`}>{h}</span>
              ))}
            </div>
            {customers.map((c, i) => (
              <div key={i} className="grid grid-cols-6 items-center px-5 py-4 border-b border-[#f5f6f7]/5 hover:bg-[#f5f6f7]/5 transition-colors duration-150">
                <span className="text-sm font-bold text-[#f5f6f7]">{c.name}</span>
                <span className="text-sm text-[#f5f6f7]/50 truncate pr-2">{c.email}</span>
                <span className="text-sm text-[#f5f6f7]/50">{c.phone}</span>
                <span className="text-sm text-[#f5f6f7]/60">{c.city}</span>
                <div>
                  <p className="text-sm font-bold text-[#f5f6f7]">{c.revenue}</p>
                  <p className="text-xs text-[#f5f6f7]/40">{c.invoices}</p>
                </div>
                <div className="flex justify-end">
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
          </div>

          {/* Customer Cards — Mobile */}
          <div className="mt-4 flex flex-col gap-3 md:hidden">
            {customers.map((c, i) => (
              <div key={i} className="bg-[#2f2f33] rounded-xl px-4 py-3 text-[#f5f6f7]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold">{c.name}</span>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-xs text-[#f5f6f7]/50">{c.email}</p>
                <p className="text-xs text-[#f5f6f7]/50">{c.phone}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-[#f5f6f7]/60">{c.city}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold">{c.revenue}</p>
                    <p className="text-xs text-[#f5f6f7]/40">{c.invoices}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MOBILE FIXED BOTTOM BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 xl:hidden bg-[#1e1e21] border-t border-[#f5f6f7]/10 px-3 py-3 flex gap-2">
        <button 
          onClick={handleBulkWhatsApp}
          disabled={isSending}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl ${isSending ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-500'} text-[#f5f6f7] text-sm font-bold transition-all duration-200 cursor-pointer`}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.1 1.523 5.82L.057 23.5l5.806-1.523A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.724.977.995-3.63-.234-.373A9.818 9.818 0 0112 2.182c5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/></svg>
          {isSending ? 'Sending...' : 'Send via WhatsApp'}
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#3a6f77] hover:bg-[#4a8f99] text-[#f5f6f7] text-sm font-bold transition-all duration-200 cursor-pointer">
          <MdEmail className="text-base" /> Send via Email
        </button>
      </div>

      {/* ── DESKTOP SIDEBAR (xl+) — always visible ── */}
      <div className="hidden xl:flex w-64 flex-shrink-0 bg-[#2f2f33] flex-col border-l border-[#f5f6f7]/5">
        <SidebarContent 
          stats={stats} 
          onSendWhatsApp={handleBulkWhatsApp} 
          isSending={isSending} 
        />
      </div>

      {/* ── MOBILE / TABLET SIDEBAR — slides up from bottom ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/60 z-40 xl:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Drawer slides up from bottom */}
            <motion.div
              key="drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#2f2f33] rounded-t-2xl xl:hidden max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Drag handle + close */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
                <div className="w-10 h-1 rounded-full bg-[#f5f6f7]/20 mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
                <p className="text-sm font-bold text-[#f5f6f7]">Quick Actions</p>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f5f6f7]/10 hover:bg-[#f5f6f7]/20 text-[#f5f6f7] transition-colors cursor-pointer"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                <SidebarContent 
                  stats={stats} 
                  onSendWhatsApp={handleBulkWhatsApp} 
                  isSending={isSending} 
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Reminder