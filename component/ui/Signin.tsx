"use client";
import React, { useState } from "react";
import { FaEnvelope, FaLock, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const Signin = () => {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsLoggedIn(true);
    });
  }, []);

  const isValid = React.useMemo(() => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const passwordValid = formData.password.length >= 6;
    return emailValid && passwordValid;
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError("");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        setTransitioning(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 600);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Page transition overlay */}
      <div
        className="fixed inset-0 z-[100] pointer-events-none transition-opacity duration-500"
        style={{
          backgroundColor: "#2f2f33",
          opacity: transitioning ? 1 : 0,
        }}
      />

      <div className="min-h-screen w-full bg-white flex justify-center items-start pt-33 mb-10 sm:mb-0 font-sans">

        {/* Back Button */}
        <Link
          href="/"
          className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-sm font-semibold border-2 transition-all duration-300 hover:scale-105"
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

        {/* Main Card */}
        <div className="w-full max-w-[280px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[420px] bg-[#F5F6F7] rounded-xl shadow-lg flex flex-col items-center justify-start px-3 sm:px-5 lg:px-5 py-6">

          {/* Logo */}
          <img src="/logo/smart.svg" alt="BillingKitaab Logo" className="h-16 sm:h-20 w-auto object-contain mb-6 mt-6" />

          <form onSubmit={onSubmit} className="w-full flex flex-col">

            {/* Dashboard Redirect Option */}
            {isLoggedIn && (
              <div className="w-full flex justify-center mb-4">
                <Link href="/dashboard" className="bg-[#e9f2f4] text-[#3a6f77] px-4 py-2 text-sm rounded-lg font-bold hover:bg-[#d1e5e8] transition-colors text-center">
                  You are logged in. Go to Dashboard &rarr;
                </Link>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="w-full mb-4">
              <label className="block text-[#2F2F33] font-sans mb-1">
                Enter your Email <span className="text-red-500">*</span>
              </label>
              <div className={`flex items-center border rounded px-2 py-1 ${
                formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                  ? "border-red-500" 
                  : "border-[#2F2F33]"
              }`}>
                <FaEnvelope className="text-base sm:text-lg text-[#3a6f77] mr-2" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="flex-1 outline-none text-[#2F2F33] bg-[#F5F6F7] font-sans text-sm sm:text-base lg:text-sm"
                />
              </div>
              {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                <p className="text-red-500 text-xs mt-1">Invalid email format</p>
              )}
            </div>

            {/* Password */}
            <div className="w-full mb-6">
              <label className="block text-[#2F2F33] font-sans mb-1">
                Enter your password <span className="text-red-500">*</span>
              </label>
              <div className={`flex items-center border rounded px-2 py-1 ${
                formData.password && formData.password.length < 6
                  ? "border-red-500" 
                  : "border-[#2F2F33]"
              }`}>
                <FaLock className="text-base sm:text-lg text-[#3a6f77] mr-2" />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  className="flex-1 outline-none text-[#2F2F33] bg-[#F5F6F7] font-sans text-sm sm:text-base lg:text-sm"
                />
              </div>
              {formData.password && formData.password.length < 6 && (
                <p className="text-red-500 text-xs mt-1">Password must be at least 6 characters</p>
              )}
            </div>

            {/* Login Button */}
            <div className="flex justify-center w-full">
              <button
                type="submit"
                disabled={!isValid || loading}
                className={`flex h-9 sm:h-11 lg:h-11 w-full items-center justify-center gap-2 px-3 py-2 text-sm sm:text-base lg:text-sm font-sans border rounded transition-colors duration-300 cursor-pointer
                  ${isValid && !loading
                    ? "bg-[#2F2F33] text-[#F5F6F7] border-[#2F2F33] hover:bg-[#F5F6F7] hover:text-[#2F2F33]"
                    : "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                  }`}
              >
                {loading ? "Logging in..." : "Login"}
                <FaArrowRight className="text-sm sm:text-base lg:text-sm" />
              </button>
            </div>

          </form>

          {/* Register Note */}
          <div className="w-full flex justify-center mt-6 mb-2 text-sm text-[#2F2F33] font-sans">
            <span>Don't have an account? <Link href="/register" className="text-blue-600 font-bold hover:underline">Sign Up</Link></span>
          </div>

        </div>
      </div>
    </>
  );
};

export default Signin;
