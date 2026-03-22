"use client";

import React, { useEffect, useState } from "react";
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
    <div className="fixed top-0 left-0 right-0 h-17 w-full bg-gradient-to-b from-[#f5f6f7] via-[#f5f6f7] to-[#2f2f33]/5 flex items-center justify-between px-4 sm:px-8 z-50">
      {/* Left side logo */}
      <img
        src="/logo/smart.png"
        alt="Logo"
        className="h-14 sm:h-full w-auto animate-[slideInLeft_0.6s_ease-out_both]"
      />

      {/* Center nav links */}
      <div className="hidden sm:flex items-center ml-[10vh] gap-6 sm:gap-10">
        <p
          onClick={(e) => {
            e.preventDefault();
            navigateWithFade("/#services");
          }}
          className="relative text-sm text-[#2f2f33] font-medium cursor-pointer 
          after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 
          after:bg-[#D4B483] after:scale-x-0 after:origin-left after:transition-transform after:duration-300 
          hover:after:scale-x-100"
        >
          Services
        </p>

        <p
          onClick={(e) => {
            e.preventDefault();
            navigateWithFade("/#pricing");
          }}
          className="relative text-sm text-[#2f2f33] font-medium cursor-pointer 
          after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 
          after:bg-[#D4B483] after:scale-x-0 after:origin-left after:transition-transform after:duration-300 
          hover:after:scale-x-100"
        >
          Pricing
        </p>

        <p
          onClick={(e) => {
            e.preventDefault();
            navigateWithFade("/#about");
          }}
          className="relative text-sm text-[#2f2f33] font-medium cursor-pointer 
          after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 
          after:bg-[#D4B483] after:scale-x-0 after:origin-left after:transition-transform after:duration-300 
          hover:after:scale-x-100"
        >
          About us
        </p>
      </div>

      {/* Right side buttons */}
      <div className="hidden sm:flex items-center gap-3 sm:gap-4 cursor-pointer">
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault();
              navigateWithFade("/dashboard");
            }}
            className="px-3 sm:px-4 py-1 text-sm font-bold border border-[#3a6f77] bg-[#3a6f77] text-[#f5f6f7] rounded hover:bg-[#2c5359] transition cursor-pointer"
          >
            Dashboard
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
              Login
            </Link>
            <Link
              href="/register"
              onClick={(e) => {
                e.preventDefault();
                navigateWithFade("/register");
              }}
              className="px-3 sm:px-4 py-1 text-sm font-bold border border-[#3a6f77] text-[#2f2f33] rounded hover:bg-[#3a6f77] hover:text-[#f5f6f7] transition cursor-pointer"
            >
              Register
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
        <div className="sm:hidden absolute top-full right-4 mt-2 w-48 bg-[#f5f6f7] rounded-lg shadow-lg z-50">
          <div className="flex flex-col p-2">
            {isLoggedIn ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  navigateWithFade("/dashboard");
                }}
                className="text-left px-3 py-2 rounded font-bold text-[#3a6f77] hover:bg-[#e9eceb]"
              >
                Dashboard
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
                  Login
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    navigateWithFade("/register");
                  }}
                  className="text-left px-3 py-2 rounded hover:bg-[#e9eceb]"
                >
                  Register
                </button>
              </>
            )}
            <div className="border-t my-2" />
            <button
              onClick={(e) => {
                e.preventDefault();
                setMobileOpen(false);
                navigateWithFade("/#services");
              }}
              className="text-left px-3 py-2 rounded hover:bg-[#e9eceb]"
            >
              Services
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setMobileOpen(false);
                navigateWithFade("/#pricing");
              }}
              className="text-left px-3 py-2 rounded hover:bg-[#e9eceb]"
            >
              Pricing
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setMobileOpen(false);
                navigateWithFade("/#about");
              }}
              className="text-left px-3 py-2 rounded hover:bg-[#e9eceb]"
            >
              About us
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