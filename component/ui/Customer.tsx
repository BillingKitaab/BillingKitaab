'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const FiSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const SELECTED_CUSTOMER_STORAGE_KEY = 'billingkitaab:selectedCustomerId';
const APP_TIME_ZONE = 'Asia/Kolkata';

import { useLanguage } from '@/lib/LanguageContext';
import { langText } from '@/lib/langText';

const Customer = () => {
  const { language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', city: '', gst_number: '', status: 'good' });
  const [customerStats, setCustomerStats] = useState({ total: 0, thisMonth: 0, revenue: 0, good: 0, overdue: 0, pending: 0 });

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) || null,
    [customers, selectedCustomerId]
  );
  // ...existing code...

  const getDateKeyInAppTimeZone = (date: Date) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: APP_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);

  const dateKeyToUtcDayTimestamp = (dateKey: string) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
  };

  const getDateOffsetInDays = (targetDate: Date, baseDate = new Date()) => {
    const targetKey = getDateKeyInAppTimeZone(targetDate);
    const baseKey = getDateKeyInAppTimeZone(baseDate);
    return Math.round((dateKeyToUtcDayTimestamp(targetKey) - dateKeyToUtcDayTimestamp(baseKey)) / 86400000);
  };

  const formatRelativeDate = (value: string | Date | null | undefined) => {
    if (!value) return 'N/A';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';

    const offset = getDateOffsetInDays(date, new Date());
    const prettyDate = date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: APP_TIME_ZONE,
    });

    if (offset === 0) return `Today, ${prettyDate}`;
    if (offset === 1) return `Today, ${prettyDate}`;
    return prettyDate;
  };

  const updateCustomerInQuery = (customerId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (customerId) {
      params.set('customerId', customerId);
    } else {
      params.delete('customerId');
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  useEffect(() => {
    const loadCustomers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: biz } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      if (!biz) { setLoading(false); return; }
      setBusinessId(biz.id);

      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false });

      const { data: invData } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('business_id', biz.id);

      const allCust = data || [];
      const now = new Date();
      const thisMonthCount = allCust.filter(c => new Date(c.created_at).getMonth() === now.getMonth() && new Date(c.created_at).getFullYear() === now.getFullYear()).length;
      const totalBilled = (invData || []).reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
      
      setCustomerStats({
        total: allCust.length,
        thisMonth: thisMonthCount,
        revenue: totalBilled,
        good: allCust.filter(c => c.status === 'good').length,
        overdue: allCust.filter(c => c.status === 'overdue').length,
        pending: allCust.filter(c => c.status === 'pending').length,
      });

      setCustomers(allCust);
      setLoading(false);
    };
    loadCustomers();
  }, []);

  useEffect(() => {
    setCurrentDate(new Date());

    const timer = window.setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const customerIdFromUrl = searchParams.get('customerId');
    const customerIdFromStorage = typeof window !== 'undefined'
      ? window.sessionStorage.getItem(SELECTED_CUSTOMER_STORAGE_KEY)
      : null;
    const resolvedCustomerId = customerIdFromUrl || customerIdFromStorage;

    if (!resolvedCustomerId) {
      setSelectedCustomerId(null);
      return;
    }

    if (customers.length > 0) {
      const exists = customers.some((c) => c.id === resolvedCustomerId);
      if (!exists) {
        setSelectedCustomerId(null);
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem(SELECTED_CUSTOMER_STORAGE_KEY);
        }
        updateCustomerInQuery(null);
        return;
      }
    }

    setSelectedCustomerId(resolvedCustomerId);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(SELECTED_CUSTOMER_STORAGE_KEY, resolvedCustomerId);
    }
    if (!customerIdFromUrl) {
      updateCustomerInQuery(resolvedCustomerId);
    }
  }, [searchParams, customers]);

  const handleSaveCustomer = async () => {
    if (!businessId || !newCustomer.name || !newCustomer.email) return;

    if (editingCustomerId) {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone || null,
          city: newCustomer.city || null,
          gst_number: newCustomer.gst_number || null,
          status: newCustomer.status,
        })
        .eq('id', editingCustomerId)
        .select()
        .single();

      if (error) { alert('Error: ' + error.message); return; }
      if (data) {
        setCustomers(prev => prev.map(c => c.id === editingCustomerId ? data : c));
        if (selectedCustomer?.id === editingCustomerId) setSelectedCustomerId(data.id);
      }
    } else {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          business_id: businessId,
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone || null,
          city: newCustomer.city || null,
          gst_number: newCustomer.gst_number || null,
          status: newCustomer.status,
        })
        .select()
        .single();

      if (error) { alert('Error: ' + error.message); return; }
      if (data) setCustomers(prev => [data, ...prev]);
    }

    setNewCustomer({ name: '', email: '', phone: '', city: '', gst_number: '', status: 'good' });
    setEditingCustomerId(null);
    setShowAddModal(false);
  };

  const handleDeleteCustomer = async (customer: any) => {
    if (!businessId) return;

    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('customer_id', customer.id);

    if ((count || 0) > 0) {
      alert('This customer cannot be deleted because invoices already exist for them. Delete the invoices first.');
      return;
    }

    const shouldDelete = window.confirm('Delete this customer?');
    if (!shouldDelete) return;

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customer.id)
      .eq('business_id', businessId);

    if (error) {
      alert('Failed to delete customer: ' + error.message);
      return;
    }

    setCustomers(prev => prev.filter(c => c.id !== customer.id));
    if (selectedCustomerId === customer.id) {
      setSelectedCustomerId(null);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(SELECTED_CUSTOMER_STORAGE_KEY);
      }
      updateCustomerInQuery(null);
    }
  };

  const statusClass = (status: string) => {
    if (status === 'good') return 'bg-[#3a6f77] text-[#f5f6f7]';
    if (status === 'overdue') return 'bg-red-500 text-white';
    return 'bg-[#D4B483] text-[#2f2f33]';
  };

  const dotClass = (status: string) => {
    if (status === 'good') return 'bg-[#a8f0b0]';
    if (status === 'overdue') return 'bg-red-300';
    return 'bg-[#a0622a]';
  };

  const handleExportCSV = () => {
    const rows = filtered.map((customer) => ({
      Name: customer.name || '',
      Email: customer.email || '',
      Phone: customer.phone || '',
      City: customer.city || '',
      Revenue: customer.revenue || '',
      Status: customer.status || '',
    }));

    if (rows.length === 0) {
      alert('No customers to export.');
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        headers.map((header) => `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customers.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const filtered = customers
    .filter(c => {
      if (activeTab === 'good') return c.status === 'good';
      if (activeTab === 'overdue') return c.status === 'overdue';
      if (activeTab === 'pending') return c.status === 'pending';
      return true;
    })
    .filter(c =>
      searchQuery === '' ||
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a: any, b: any) => {
      if (sortOption === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  const CustomerProfile = ({ cust, onClose }: { cust: any; onClose: () => void }) => (
    <div className="h-full flex flex-col bg-[#f5f6f7]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2f2f33]/10 shrink-0">
        <h2 className="text-sm font-bold text-[#2f2f33] font-serif m-0">Customer Profile</h2>
        <button
          onClick={onClose}
          className="text-[#2f2f33]/50 hover:text-[#2f2f33] text-lg leading-none cursor-pointer bg-transparent border-none"
        >✕</button>
      </div>

      <div className="flex flex-col items-center px-5 py-5 border-b border-[#2f2f33]/10 shrink-0">
        <div className="w-14 h-14 rounded-full bg-[#D4B483] text-[#2f2f33] flex items-center justify-center font-bold text-2xl font-serif mb-3">
          {cust.name.charAt(0)}
        </div>
        <span className="text-base font-bold text-[#2f2f33] font-serif">{cust.name}</span>
        <span className="text-xs text-[#2f2f33]/50 mt-0.5">{cust.city}</span>
        <span className={`mt-2 text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 ${statusClass(cust.status)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dotClass(cust.status)}`}></span>
          {cust.status}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {[
          { label: 'Email', value: cust.email },
          { label: 'Phone', value: cust.phone },
          { label: 'City', value: cust.city },
          { label: 'Joined', value: formatRelativeDate(cust.created_at) },
          { label: 'Revenue', value: cust.revenue },
          { label: 'Invoices', value: `${cust.invoices} invoices` },
        ].map((row, i) => (
          <div key={i}>
            <p className="text-[9px] font-semibold text-[#2f2f33]/40 uppercase tracking-widest mb-0.5">{row.label}</p>
            <p className="text-sm text-[#2f2f33] font-medium m-0 break-all">{row.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 px-5 py-4 border-t border-[#2f2f33]/10 shrink-0">
        <button className="flex-1 py-2 text-xs font-bold bg-[#D4B483] text-[#2f2f33] rounded-lg border-none cursor-pointer hover:bg-[#c9a86c] transition-all duration-200">
          Send Invoice
        </button>
        <button 
          onClick={() => {
            setEditingCustomerId(cust.id);
            setNewCustomer({
              name: cust.name,
              email: cust.email,
              phone: cust.phone || '',
              city: cust.city || '',
              gst_number: cust.gst_number || '',
              status: cust.status || 'good'
            });
            setShowAddModal(true);
            onClose();
          }}
          className="flex-1 py-2 text-xs font-bold border border-[#3a6f77] text-[#3a6f77] rounded-lg bg-transparent cursor-pointer hover:bg-[#3a6f77] hover:text-[#f5f6f7] transition-all duration-200"
        >
          Edit
        </button>
        <button
          onClick={() => handleDeleteCustomer(cust)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-400/40 text-red-400 bg-transparent cursor-pointer hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          aria-label="Delete customer"
          title="Delete customer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full min-w-0 flex flex-col bg-[#f5f6f7] font-sans overflow-hidden">
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="w-full flex items-center justify-between px-4 py-3 shrink-0 flex-wrap gap-2 bg-[#f5f6f7]">
            <div>
              <h1 className="text-xl sm:text-2xl text-[#2f2f33] font-bold font-serif m-0">Customers</h1>
              <p suppressHydrationWarning className="font-medium text-xs text-[#2f2f33]/80 mt-0.5 m-0">{currentDate ? formatRelativeDate(currentDate) : ''}</p>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="flex items-center bg-[#2f2f33] rounded-md px-3 py-1.5 gap-2 w-full sm:w-60">
                <span className="text-[#f5f6f7]/50 flex"><FiSearch /></span>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-xs font-medium text-[#f5f6f7] placeholder-[#f5f6f7]/50 bg-transparent border-none min-w-0"
                />
              </div>
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                className="px-4 py-1.5 rounded-md bg-[#D4B483] text-[#2f2f33] font-semibold text-sm cursor-pointer"
              >
                <option value="highest">Sort: Highest Revenue</option>
                <option value="lowest">Sort: Lowest Revenue</option>
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
              </select>
              <button onClick={handleExportCSV} className="px-3 py-1.5 text-xs font-bold bg-[#D4B483] text-[#2f2f33] rounded-lg border-none cursor-pointer hover:bg-[#c9a86c] transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                Export CSV
              </button>
              <button
                onClick={() => {
                  setEditingCustomerId(null);
                  setNewCustomer({ name: '', email: '', phone: '', city: '', gst_number: '', status: 'good' });
                  setShowAddModal(true);
                }}
                className="px-3 py-1.5 text-xs font-bold border border-[#3a6f77] text-[#3a6f77] rounded-lg bg-transparent cursor-pointer hover:bg-[#3a6f77] hover:text-[#f5f6f7] transition-all duration-200 hover:-translate-y-0.5">
                Add Customer
              </button>
            </div>
          </div>

          <div className="flex gap-2 mx-3 mb-2 shrink-0 overflow-x-auto pb-1">
            {[
              { label: 'TOTAL CUSTOMERS', value: String(customerStats.total), sub: `↑ ${customerStats.thisMonth} added this month`, subClass: 'text-green-300', valueClass: 'text-white' },
              { label: 'TOTAL BILLED', value: `₹${customerStats.revenue.toLocaleString('en-IN')}`, sub: '↑ Lifetime revenue', subClass: 'text-green-300', valueClass: 'text-green-400' },
              { label: 'GOOD STANDING', value: String(customerStats.good), sub: 'All paid on time', subClass: 'text-[#f5f6f7]/50', valueClass: 'text-[#D4B483]' },
              { label: 'NEED ATTENTION', value: String(customerStats.overdue), sub: 'Overdue invoices', subClass: 'text-[#f5f6f7]/50', valueClass: 'text-red-400' },
            ].map((card, i) => (
              <div key={i} className="flex-1 bg-[#2f2f33] rounded-xl p-2.5 sm:p-3" style={{ minWidth: "100px" }}>
                <p className="text-[9px] font-medium text-[#f5f6f7]/70 mb-1 m-0">{card.label}</p>
                <h2 className={`text-xl sm:text-3xl font-bold font-serif mb-0.5 m-0 ${card.valueClass}`}>{card.value}</h2>
                <p className={`text-[10px] font-medium m-0 ${card.subClass}`}>{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-[#f5f6f7] border-b border-[#2f2f33]/10 shrink-0 flex-wrap gap-2">
            <div className="flex gap-1.5 flex-wrap">
              {[
                { key: 'all', label: `All (${customerStats.total})`, activeClass: 'bg-[#D4B483] text-[#2f2f33] border-transparent', inactiveClass: 'border-[#D4B483] text-[#D4B483] bg-transparent' },
                { key: 'good', label: `Good Standing (${customerStats.good})`, activeClass: 'bg-[#3a6f77] text-[#f5f6f7] border-transparent', inactiveClass: 'border-[#3a6f77] text-[#3a6f77] bg-transparent' },
                { key: 'pending', label: `Pending (${customerStats.pending})`, activeClass: 'bg-[#D4B483] text-[#2f2f33] border-transparent', inactiveClass: 'border-[#D4B483] text-[#D4B483] bg-transparent' },
                { key: 'overdue', label: `Overdue (${customerStats.overdue})`, activeClass: 'bg-[#2f2f33] text-[#f5f6f7] border-transparent', inactiveClass: 'border-[#2f2f33]/40 text-[#2f2f33]/70 bg-transparent' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-2 py-0.5 text-xs font-semibold rounded-md border cursor-pointer transition-all duration-200 ${activeTab === tab.key ? tab.activeClass : tab.inactiveClass}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 mx-3 my-3 bg-[#2f2f33] rounded-xl flex flex-col overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-[1.2fr_1.5fr_1.3fr_0.7fr_0.8fr_0.7fr_40px] gap-x-3 px-5 py-3 shrink-0 border-b border-[#f5f6f7]/10">
              {['CUSTOMER', 'EMAIL', 'PHONE', 'CITY', 'REVENUE', 'STATUS', ''].map((h, i) => (
                <span key={i} className="text-[10px] font-semibold text-[#f5f6f7]/40 uppercase tracking-widest">{h}</span>
              ))}
            </div>

            <div className="grid grid-cols-[1fr_1fr_80px] sm:hidden gap-x-3 px-4 py-2.5 shrink-0 border-b border-[#f5f6f7]/10">
              {['CUSTOMER', 'CONTACT', 'STATUS'].map((h, i) => (
                <span key={i} className="text-[9px] font-semibold text-[#f5f6f7]/40 uppercase tracking-widest">{h}</span>
              ))}
            </div>

            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 ? (
                <div className="text-center text-[#f5f6f7]/40 py-10 text-sm">No customers found</div>
              ) : (
                filtered.map((cust) => (
                  <div
                    key={cust.id}
                    onClick={() => {
                      const nextSelectedId = selectedCustomerId === cust.id ? null : cust.id;
                      setSelectedCustomerId(nextSelectedId);
                      if (typeof window !== 'undefined') {
                        if (nextSelectedId) {
                          window.sessionStorage.setItem(SELECTED_CUSTOMER_STORAGE_KEY, nextSelectedId);
                        } else {
                          window.sessionStorage.removeItem(SELECTED_CUSTOMER_STORAGE_KEY);
                        }
                      }
                      updateCustomerInQuery(nextSelectedId);
                    }}
                    className={`border-b border-[#f5f6f7]/[0.07] transition-colors duration-150 cursor-pointer ${selectedCustomerId === cust.id ? 'bg-[#f5f6f7]/10' : 'hover:bg-[#f5f6f7]/5'}`}
                  >
                    <div className="hidden sm:grid sm:grid-cols-[1.2fr_1.5fr_1.3fr_0.7fr_0.8fr_0.7fr_40px] gap-x-3 px-5 py-3.5 items-center">
                      <span className="text-sm text-[#f5f6f7] font-medium truncate">{cust.name}</span>
                      <span className="text-sm text-[#f5f6f7]/60 truncate">{cust.email}</span>
                      <span className="text-sm text-[#f5f6f7]/60 truncate">{cust.phone}</span>
                      <span className="text-sm text-[#f5f6f7]/60 truncate">{cust.city}</span>
                      <div className="flex flex-col">
                        <span className="text-sm text-[#f5f6f7] font-medium">{cust.revenue}</span>
                        <span className="text-[10px] text-[#f5f6f7]/40">{cust.invoices} invoices</span>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-1.5 w-fit whitespace-nowrap ${statusClass(cust.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass(cust.status)}`}></span>
                        {cust.status}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomer(cust);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-red-400/40 text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
                        aria-label="Delete customer"
                        title="Delete customer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-[1fr_1fr_80px_32px] sm:hidden gap-x-3 px-4 py-3 items-center">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-[#f5f6f7] font-medium truncate">{cust.name}</span>
                        <span className="text-[10px] text-[#f5f6f7]/45 truncate">{cust.city}</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-[#f5f6f7]/60 truncate">{cust.email}</span>
                        <span className="text-[10px] text-[#f5f6f7]/45 truncate">{cust.phone}</span>
                      </div>
                      <div className="flex flex-col items-start gap-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 w-fit whitespace-nowrap ${statusClass(cust.status)}`}>
                          <span className={`w-1 h-1 rounded-full shrink-0 ${dotClass(cust.status)}`}></span>
                          {cust.status}
                        </span>
                        <span className="text-[10px] text-[#f5f6f7]/50">{cust.revenue}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomer(cust);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-red-400/40 text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
                        aria-label="Delete customer"
                        title="Delete customer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {selectedCustomer && (
          <>
            <div className="hidden sm:flex shrink-0 border-l border-[#2f2f33]/10 flex-col overflow-hidden" style={{ width: "300px", maxWidth: "340px" }}>
              <CustomerProfile
                cust={selectedCustomer}
                onClose={() => {
                  setSelectedCustomerId(null);
                  if (typeof window !== 'undefined') {
                    window.sessionStorage.removeItem(SELECTED_CUSTOMER_STORAGE_KEY);
                  }
                  updateCustomerInQuery(null);
                }}
              />
            </div>

            <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => {
                  setSelectedCustomerId(null);
                  if (typeof window !== 'undefined') {
                    window.sessionStorage.removeItem(SELECTED_CUSTOMER_STORAGE_KEY);
                  }
                  updateCustomerInQuery(null);
                }}
              />
              <div className="relative bg-[#f5f6f7] rounded-t-2xl max-h-[75vh] flex flex-col overflow-hidden">
                <CustomerProfile
                  cust={selectedCustomer}
                  onClose={() => {
                    setSelectedCustomerId(null);
                    if (typeof window !== 'undefined') {
                      window.sessionStorage.removeItem(SELECTED_CUSTOMER_STORAGE_KEY);
                    }
                    updateCustomerInQuery(null);
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-lg font-bold text-[#2f2f33] mb-4">{editingCustomerId ? 'Edit Customer' : 'Add Customer'}</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Name *" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a6f77]" />
              <input type="email" placeholder="Email *" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a6f77]" />
              <input type="text" placeholder="Phone" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a6f77]" />
              <input type="text" placeholder="City" value={newCustomer.city} onChange={e => setNewCustomer({...newCustomer, city: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a6f77]" />
              <input type="text" placeholder="GST Number" value={newCustomer.gst_number} onChange={e => setNewCustomer({...newCustomer, gst_number: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a6f77]" />
              <select value={newCustomer.status} onChange={e => setNewCustomer({...newCustomer, status: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a6f77]">
                <option value="good">Good</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer">Cancel</button>
              <button onClick={handleSaveCustomer} className="flex-1 py-2 text-sm font-semibold bg-[#3a6f77] text-white rounded-lg hover:bg-[#2f5f66] transition cursor-pointer">{editingCustomerId ? 'Save' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customer;

