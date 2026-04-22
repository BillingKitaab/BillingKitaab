"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const Navbar = () => {
  const router = useRouter();
  const navigateWithFade = (href: string) => {
    document.documentElement.classList.add("page-fade-out");
    setTimeout(() => router.push(href), 200);
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { language, setLanguage } = useLanguage();

  // Language text map
  const langText: Record<string, {
    home: string;
    feature: string;
    pricing: string;
    about: string;
    contact: string;
    dashboard: string;
    login: string;
    register: string;
  }> = {
    Hinglish: {
      home: "Home",
      feature: "Feature",
      pricing: "Pricing",
      about: "About",
      contact: "Contact Us",
      dashboard: "Dashboard",
      login: "Login",
      register: "Register",
    },
    Hindi: {
      home: "होम",
      feature: "फ़ीचर",
      pricing: "मूल्य निर्धारण",
      about: "हमारे बारे में",
      contact: "संपर्क करें",
      dashboard: "डैशबोर्ड",
      login: "लॉगिन",
      register: "रजिस्टर",
    },
    English: {
      home: "Home",
      feature: "Feature",
      pricing: "Pricing",
      about: "About",
      contact: "Contact Us",
      dashboard: "Dashboard",
      login: "Login",
      register: "Register",
    },
  };

  useEffect(() => {
    // Ensure fade class is removed when arriving on a page
    document.documentElement.classList.remove("page-fade-out");

    // Check auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-17 w-full bg-linear-to-b from-[#f5f6f7] via-[#f5f6f7] to-[#2f2f33]/5 flex items-center justify-between px-4 sm:px-8 z-50">
      {/* Left side logo */}
      <div className="flex items-center space-x-4">
        <img
          src="/logo/smart.svg"
          alt="Logo"
          className="h-10 sm:h-12 w-auto object-contain animate-[slideInLeft_0.6s_ease-out_both]"
        />
        <div>
          <h1 className="text-[#D4B483] font-playfair text-xl sm:text-3xl font-bold">Billing</h1>
          <h2 className="text-[#3a6f77] font-poppins text-sm sm:text-xl font-semibold">Kitaab</h2>
        </div>
      </div>

      {/* Center nav links */}
      <div className="hidden sm:flex flex-1 items-center justify-center gap-6 sm:gap-10">
        <p
          onClick={(e) => {
            e.preventDefault();
            navigateWithFade("/");
          }}
          className="relative text-sm text-[#2f2f33] font-medium cursor-pointer 
          after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 
          after:bg-[#D4B483] after:scale-x-0 after:origin-left after:transition-transform after:duration-300 
          hover:after:scale-x-100"
        >
          {langText[language].home}
        </p>

        <p
          onClick={(e) => {
            e.preventDefault();
            navigateWithFade("/features");
          }}
          className="relative text-sm text-[#2f2f33] font-medium cursor-pointer 
          after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 
          after:bg-[#D4B483] after:scale-x-0 after:origin-left after:transition-transform after:duration-300 
          hover:after:scale-x-100"
        >
          {langText[language].feature}
        </p>

        <p
          onClick={(e) => {
            e.preventDefault();
            navigateWithFade("/pricing");
          }}
          className="relative text-sm text-[#2f2f33] font-medium cursor-pointer 
          after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 
          after:bg-[#D4B483] after:scale-x-0 after:origin-left after:transition-transform after:duration-300 
          hover:after:scale-x-100"
        >
          {langText[language].pricing}
        </p>

        <p
          onClick={(e) => {
            e.preventDefault();
            navigateWithFade("/briefaboutus");
          }}
          className="relative text-sm text-[#2f2f33] font-medium cursor-pointer 
          after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 
          after:bg-[#D4B483] after:scale-x-0 after:origin-left after:transition-transform after:duration-300 
          hover:after:scale-x-100"
        >
          {langText[language].about}
        </p>

        <p
          onClick={(e) => {
            e.preventDefault();
            navigateWithFade("/contact");
          }}
          className="relative text-sm text-[#2f2f33] font-medium cursor-pointer 
          after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 
          after:bg-[#D4B483] after:scale-x-0 after:origin-left after:transition-transform after:duration-300 
          hover:after:scale-x-100"
        >
          {langText[language].contact}
        </p>
      </div>

      {/* Language Switcher — hidden on mobile, shown in mobile menu instead */}
      <div className="hidden sm:flex items-center gap-3 sm:gap-4 cursor-pointer">
        <div className="flex items-center gap-2 mr-2">
          {(['Hinglish', 'Hindi', 'English'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2 py-1 rounded text-xs font-semibold border transition
                ${language === lang
                  ? 'bg-[#D4B483] text-[#2f2f33] border-[#3a6f77]'
                  : 'bg-[#f5f6f7] text-[#3a6f77] border-[#3a6f77] hover:bg-[#D4B483] hover:text-[#2f2f33]'}
              `}
              style={{ minWidth: 70 }}
            >
              {lang}
            </button>
          ))}
        </div>
        {/* Right side buttons */}
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault();
              navigateWithFade("/dashboard");
            }}
            className="px-3 sm:px-4 py-1 text-sm font-bold border border-[#3a6f77] bg-[#3a6f77] text-[#f5f6f7] rounded hover:bg-[#2c5359] transition cursor-pointer"
          >
            {langText[language].dashboard}
          </Link>
        ) : (
          <>
            <Link
              href="/signup"
              onClick={(e) => {
                e.preventDefault();
                navigateWithFade("/signup");
              }}
              className="px-3 sm:px-4 py-1 text-sm font-bold border border-[#3a6f77] text-[#2f2f33] rounded hover:bg-[#D4B483] hover:text-[#f5f6f7] transition cursor-pointer"
            >
              {langText[language].login}
            </Link>
            <Link
              href="/register"
              onClick={(e) => {
                e.preventDefault();
                navigateWithFade("/register");
              }}
              className="px-3 sm:px-4 py-1 text-sm font-bold border border-[#3a6f77] text-[#2f2f33] rounded hover:bg-[#3a6f77] hover:text-[#f5f6f7] transition cursor-pointer"
            >
              {langText[language].register}
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger button */}
      <button
        aria-label="Toggle menu"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((v) => !v)}
        className="sm:hidden p-2 rounded-md ml-2"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6H20"
            stroke="#2f2f33"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M4 12H20"
            stroke="#2f2f33"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M4 18H20"
            stroke="#2f2f33"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden absolute top-full right-4 mt-2 w-56 bg-[#f5f6f7] rounded-lg shadow-lg z-50">
          <div className="flex flex-col p-2">
            {/* Language Switcher Mobile */}
            <div className="flex items-center gap-2 mb-2">
              {(['Hinglish', 'Hindi', 'English'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded text-xs font-semibold border transition w-full
                    ${language === lang
                      ? 'bg-[#D4B483] text-[#2f2f33] border-[#3a6f77]'
                      : 'bg-[#f5f6f7] text-[#3a6f77] border-[#3a6f77] hover:bg-[#D4B483] hover:text-[#2f2f33]'}
                  `}
                  style={{ minWidth: 70 }}
                >
                  {lang}
                </button>
              ))}
            </div>
            {isLoggedIn ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  navigateWithFade("/dashboard");
                }}
                className="text-left px-3 py-2 rounded font-bold text-[#3a6f77] hover:bg-[#e9eceb]"
              >
                {langText[language].dashboard}
              </button>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    navigateWithFade("/signup");
                  }}
                  className="text-left px-3 py-2 rounded hover:bg-[#e9eceb]"
                >
                  {langText[language].login}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    navigateWithFade("/register");
                  }}
                  className="text-left px-3 py-2 rounded hover:bg-[#e9eceb]"
                >
                  {langText[language].register}
                </button>
              </>
            )}
            <div className="border-t my-2" />
            <button
              onClick={(e) => {
                e.preventDefault();
                setMobileOpen(false);
                navigateWithFade("/");
              }}
              className="text-left px-3 py-2 rounded hover:bg-[#e9eceb]"
            >
              {langText[language].home}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setMobileOpen(false);
                navigateWithFade("/features");
              }}
              className="text-left px-3 py-2 rounded hover:bg-[#e9eceb]"
            >
              {langText[language].feature}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setMobileOpen(false);
                navigateWithFade("/pricing");
              }}
              className="text-left px-3 py-2 rounded hover:bg-[#e9eceb]"
            >
              {langText[language].pricing}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setMobileOpen(false);
                navigateWithFade("/briefaboutus");
              }}
              className="text-left px-3 py-2 rounded hover:bg-[#e9eceb]"
            >
              {langText[language].about}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setMobileOpen(false);
                navigateWithFade("/contact");
              }}
              className="text-left px-3 py-2 rounded hover:bg-[#e9eceb]"
            >
              {langText[language].contact}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-80px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        html.page-fade-out, body.page-fade-out {
          transition: opacity 200ms ease;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Navbar;