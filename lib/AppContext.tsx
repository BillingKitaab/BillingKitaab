"use client";

/**
 * AppContext — Single source of truth for auth + business data.
 *
 * PROBLEM SOLVED:
 *   Before: Every component (Sidebar, Dashboard, Invoices, Invoicebill, Reminder...)
 *   called supabase.auth.getUser() + businesses query independently.
 *   Network showed 4× auth calls + 4× business calls on one page load.
 *
 * SOLUTION:
 *   Fetch once at the Provider level. All children consume via useAppContext().
 *   Zero duplicate requests. Instant access for every component.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Business {
  id: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  signature_url: string | null;
}

interface AppContextValue {
  userId: string | null;
  userEmail: string | null;
  business: Business | null;
  bizId: string | null;
  loading: boolean;
  /** Call after updating business fields to refresh context */
  refreshBusiness: () => Promise<void>;
}

const AppContext = createContext<AppContextValue>({
  userId: null,
  userEmail: null,
  business: null,
  bizId: null,
  loading: true,
  refreshBusiness: async () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId]       = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [business, setBusiness]   = useState<Business | null>(null);
  const [loading, setLoading]     = useState(true);

  const fetchBusiness = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("businesses")
      .select("id, business_name, business_email, business_phone, business_address, signature_url")
      .eq("owner_user_id", uid)
      .maybeSingle();
    setBusiness(data ?? null);
  }, []);

  useEffect(() => {
    // ✅ Single auth call at app level — all components share this result
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email ?? null);
        fetchBusiness(user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Keep in sync if auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email ?? null);
        fetchBusiness(session.user.id);
      } else {
        setUserId(null);
        setUserEmail(null);
        setBusiness(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchBusiness]);

  const refreshBusiness = useCallback(async () => {
    if (userId) await fetchBusiness(userId);
  }, [userId, fetchBusiness]);

  return (
    <AppContext.Provider value={{
      userId,
      userEmail,
      business,
      bizId: business?.id ?? null,
      loading,
      refreshBusiness,
    }}>
      {children}
    </AppContext.Provider>
  );
}

/** Hook — use anywhere instead of calling supabase.auth.getUser() + businesses query */
export function useAppContext() {
  return useContext(AppContext);
}
