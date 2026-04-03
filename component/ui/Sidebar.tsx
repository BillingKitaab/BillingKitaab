"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabaseClient";

const menu = [
  {
    group: "MAIN",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", badge: null },
      { id: "invoices",  label: "Invoices",  href: "/invoice",  badge: null },
      { id: "customers", label: "Customers", href: "/customer", badge: null },
      { id: "reminders", label: "Reminders", href: "/reminder", badge: null },
      { id: "inventory", label: "Inventory", href: "/inventory", badge: null },
    ],
  },
  {
    group: "REPORTS",
    items: [
      { id: "pdf", label: "PDF Reports", href: "/pdfreport", badge: null },
    ],
  },
  {
    group: "SYSTEM",
    items: [
      { id: "settings", label: "Settings", href: "/settings", badge: null },
    ],
  },
];

const BrandIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="2" y="2" width="8" height="8" rx="2" fill="white" opacity="0.9"/>
    <rect x="12" y="2" width="8" height="8" rx="2" fill="white" opacity="0.55"/>
    <rect x="2" y="12" width="8" height="8" rx="2" fill="white" opacity="0.55"/>
    <rect x="12" y="12" width="8" height="8" rx="2" fill="white" opacity="0.3"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const HomeIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; business_name: string } | null>(null);
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: biz } = await supabase
        .from('businesses')
        .select('business_name')
        .eq('owner_user_id', authUser.id)
        .maybeSingle();

      setUser({ email: authUser.email || '', business_name: biz?.business_name || 'User' });
    };
    loadUser();
  }, []);

  useEffect(() => {
    const applyMobileOffset = () => {
      if (window.innerWidth < 768) {
        document.body.style.paddingTop = '88px';
      } else {
        document.body.style.paddingTop = '';
      }
    };

    applyMobileOffset();
    window.addEventListener('resize', applyMobileOffset);

    return () => {
      window.removeEventListener('resize', applyMobileOffset);
      document.body.style.paddingTop = '';
    };
  }, []);

  const handleNav = (id: string) => {
    setActiveId(id);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/signup");
  };

  const SidebarContent = () => (
    <div className="flex flex-col min-h-full w-full md:h-screen md:w-60 px-3 py-5 bg-[#2f2f33]">
      <div className="flex items-center justify-between px-2 mb-2">
        <img src="/logo/smart.svg" alt="Logo" className="h-12 object-contain" />
        <button
          className="md:hidden text-[rgba(245,246,247,0.45)]"
          onClick={() => setIsOpen(false)}
        >
          <CloseIcon />
        </button>
      </div>

      <Link
        href="/"
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-2 pl-6 pr-3 py-2 mb-4 rounded-lg text-sm transition-all duration-150 ${
          pathname === "/"
            ? "bg-[rgba(212,180,131,0.25)] text-[#D4B483] font-semibold"
            : "bg-transparent text-[#f5f6f7] font-normal"
        }`}
      >
        <HomeIcon />
        Home
      </Link>

      <nav className="flex-1 flex flex-col gap-5">
        {menu.map(({ group, items }) => (
          <div key={group}>
            <p className="text-xs tracking-widest px-2 mb-1 text-[rgba(245,246,247,0.45)]">
              {group}
            </p>

            {items.map(({ id, label, href, badge }) => {
              const isActive = activeId === id || (!activeId && (pathname === href || pathname.startsWith(href + "/")));

              return (
                <Link
                  key={id}
                  href={href}
                  onClick={() => handleNav(id)}
                  className={`w-full flex items-center justify-between pl-6 pr-3 py-2 rounded-lg text-sm mb-0.5 transition-all duration-150 ${
                    isActive
                      ? "bg-[rgba(212,180,131,0.25)] text-[#D4B483] font-semibold"
                      : "bg-transparent text-[#f5f6f7] font-normal"
                  }`}
                >
                  {label}

                  {badge && (
                    <span className="text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold bg-[#3a6f77] text-[#f5f6f7]">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-[rgba(58,111,119,0.2)]">
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-[#3a6f77] text-[#f5f6f7]">
          {user?.business_name ? user.business_name.charAt(0).toUpperCase() : "U"}
        </div>

        <span className="text-sm flex-1 text-[#f5f6f7]">
          {user?.business_name || "User"}
        </span>

        <button
          className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150 text-[rgba(245,246,247,0.45)] hover:text-red-400"
          title="Logout"
          onClick={handleLogout}
        >
          <LogoutIcon />
        </button>
      </div>
    </div>
  );



  return (
    <>
      <aside className="hidden md:block w-60 shrink-0 bg-[#2f2f33]">
        <SidebarContent />
      </aside>

      <div className="md:hidden fixed top-4 left-4 right-4 z-50">
        <div className="w-full rounded-3xl border border-[#D4B483]/60 bg-linear-to-r from-[#f5f6f7] via-[#f5f6f7] to-[#D4B483]/15 px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-3xl leading-none font-bold tracking-tight">
              <span className="text-[#2f2f33]">Billing</span>
              <span className="text-[#3a6f77]">Kitaab</span>
            </p>
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#3a6f77]/35 bg-[#f5f6f7] text-[#2f2f33]"
              aria-label="Toggle menu"
            >
              {isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <aside className="md:hidden fixed top-24 left-4 right-4 z-50 max-h-[78vh] overflow-y-auto rounded-2xl bg-[#2f2f33] border border-[#D4B483]/40">
            <SidebarContent />
          </aside>
        </>
      )}

    </>
  );
}