"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ScrollReveal from "./ScrollReveal";
import { supabase } from "@/lib/supabaseClient";
import {
  FaEnvelope,
  FaLock,
  FaBriefcase,
  FaArrowRight,
  FaArrowLeft,
  FaGoogle,
  FaMobileAlt,
} from "react-icons/fa";

type AuthTab = "email" | "phone";

const Enter = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AuthTab>("email");

  // Email form
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Phone OTP form
  const [phoneBizName, setPhoneBizName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsLoggedIn(true);
    });
  }, []);

  const isValid = React.useMemo(() => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const passwordValid = formData.password.length >= 6;
    const businessValid = formData.businessName.length >= 2 && formData.businessName.length <= 50;
    return emailValid && passwordValid && businessValid;
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Email Signup
  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { business_name: formData.businessName } },
      });
      if (signUpError) { setError(signUpError.message); setLoading(false); return; }
      if (data.user) router.push("/signup");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  // Google OAuth
  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthError) setError(oauthError.message);
    } catch (err: any) {
      setError(err.message || "Google sign-up failed");
    } finally { setLoading(false); }
  };

  // Phone OTP - Send
  const handleSendOtp = async () => {
    if (phoneBizName.length < 2) { setError("Business name must be at least 2 characters"); return; }
    const fullPhone = phone.startsWith("+") ? phone : `${countryCode}${phone.replace(/^\s+/, "")}`;
    if (fullPhone.length < 10) { setError("Please enter a valid phone number"); return; }
    setOtpLoading(true);
    setError("");
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
        options: { data: { business_name: phoneBizName } },
      });
      if (otpError) { setError(otpError.message); setOtpLoading(false); return; }
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally { setOtpLoading(false); }
  };

  // Phone OTP - Verify
  const handleVerifyOtp = async () => {
    const fullPhone = phone.startsWith("+") ? phone : `${countryCode}${phone.replace(/^\s+/, "")}`;
    if (otpCode.length < 6) { setError("Enter a valid 6-digit OTP"); return; }
    setOtpLoading(true);
    setError("");
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otpCode,
        type: "sms",
      });
      if (verifyError) { setError(verifyError.message); setOtpLoading(false); return; }
      if (data.user) router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "OTP verification failed");
    } finally { setOtpLoading(false); }
  };

  return (
    <div className="min-h-screen w-full bg-white flex justify-center items-start pt-12 sm:pt-16 mb-10 sm:mb-0 font-sans">
      {/* Back Button */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-sm font-semibold border-2 transition-all duration-300 hover:scale-105"
        style={{ backgroundColor: "#3a6f77", color: "#f5f6f7", borderColor: "#D4B483" }}
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

      <ScrollReveal className="w-full flex justify-center px-4 sm:px-6">
        <div className="w-full max-w-[440px] sm:max-w-[600px] md:max-w-[650px] lg:max-w-[650px] bg-[#F5F6F7] rounded-2xl shadow-xl flex flex-col items-center justify-start px-6 sm:px-10 py-8">
          {/* Logo */}
          <img src="/logo/smart.svg" alt="BillingKitaab Logo" className="h-16 sm:h-20 w-auto object-contain mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#2f2f33] mb-1">Create Account</h2>
          <p className="text-sm text-gray-500 mb-6">Start managing your invoices today</p>

          {/* Dashboard Redirect */}
          {isLoggedIn && (
            <div className="w-full flex justify-center mb-4">
              <Link href="/dashboard" className="bg-[#e9f2f4] text-[#3a6f77] px-4 py-2 text-sm rounded-lg font-bold hover:bg-[#d1e5e8] transition-colors text-center">
                You are logged in. Go to Dashboard &rarr;
              </Link>
            </div>
          )}

          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-[#2f2f33] hover:bg-gray-50 hover:shadow-md transition-all duration-200 mb-5"
          >
            <FaGoogle className="text-lg text-red-500" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="w-full flex items-center gap-3 mb-5">
            <div className="flex-1 border-t border-gray-300" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">or sign up with</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {/* Tabs */}
          <div className="w-full flex bg-gray-200 rounded-xl p-1 mb-5">
            <button
              onClick={() => { setActiveTab("email"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === "email" ? "bg-white text-[#3a6f77] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <FaEnvelope className="text-xs" /> Email
            </button>
            <button
              onClick={() => { setActiveTab("phone"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === "phone" ? "bg-white text-[#3a6f77] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <FaMobileAlt className="text-xs" /> Phone
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* ===== EMAIL TAB ===== */}
          {activeTab === "email" && (
            <form onSubmit={onEmailSubmit} className="w-full flex flex-col gap-4">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-[#2F2F33] mb-1.5">Business Name</label>
                <div className={`flex items-center border rounded-xl px-3 py-2.5 bg-white transition-all ${formData.businessName && (formData.businessName.length < 2 || formData.businessName.length > 50) ? "border-red-400" : "border-gray-300 focus-within:border-[#3a6f77] focus-within:ring-1 focus-within:ring-[#3a6f77]"}`}>
                  <FaBriefcase className="text-sm text-[#3a6f77] mr-2.5" />
                  <input
                    type="text" name="businessName" placeholder="Your business name"
                    value={formData.businessName} onChange={handleChange}
                    className="flex-1 outline-none text-[#2F2F33] bg-transparent text-sm"
                  />
                </div>
                {formData.businessName && (formData.businessName.length < 2 || formData.businessName.length > 50) && (
                  <p className="text-red-500 text-xs mt-1">Business name must be 2-50 characters</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#2F2F33] mb-1.5">Email</label>
                <div className={`flex items-center border rounded-xl px-3 py-2.5 bg-white transition-all ${formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? "border-red-400" : "border-gray-300 focus-within:border-[#3a6f77] focus-within:ring-1 focus-within:ring-[#3a6f77]"}`}>
                  <FaEnvelope className="text-sm text-[#3a6f77] mr-2.5" />
                  <input
                    type="email" name="email" placeholder="you@example.com"
                    value={formData.email} onChange={handleChange}
                    className="flex-1 outline-none text-[#2F2F33] bg-transparent text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#2F2F33] mb-1.5">Password</label>
                <div className={`flex items-center border rounded-xl px-3 py-2.5 bg-white transition-all ${formData.password && formData.password.length < 6 ? "border-red-400" : "border-gray-300 focus-within:border-[#3a6f77] focus-within:ring-1 focus-within:ring-[#3a6f77]"}`}>
                  <FaLock className="text-sm text-[#3a6f77] mr-2.5" />
                  <input
                    type="password" name="password" placeholder="Min. 6 characters"
                    value={formData.password} onChange={handleChange}
                    className="flex-1 outline-none text-[#2F2F33] bg-transparent text-sm"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={!isValid || loading}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${isValid && !loading ? "bg-[#2F2F33] text-white hover:bg-[#3a6f77]" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
              >
                {loading ? "Registering..." : "Register now"} <FaArrowRight className="text-xs" />
              </button>
            </form>
          )}

          {/* ===== PHONE TAB ===== */}
          {activeTab === "phone" && (
            <div className="w-full flex flex-col gap-4">
              {!otpSent ? (
                <>
                  {/* Business Name for Phone */}
                  <div>
                    <label className="block text-sm font-medium text-[#2F2F33] mb-1.5">Business Name</label>
                    <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2.5 bg-white focus-within:border-[#3a6f77] focus-within:ring-1 focus-within:ring-[#3a6f77] transition-all">
                      <FaBriefcase className="text-sm text-[#3a6f77] mr-2.5" />
                      <input
                        type="text" placeholder="Your business name"
                        value={phoneBizName} onChange={e => { setPhoneBizName(e.target.value); setError(""); }}
                        className="flex-1 outline-none text-[#2F2F33] bg-transparent text-sm"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-[#2F2F33] mb-1.5">Phone Number</label>
                    <div className="flex border border-gray-300 rounded-xl bg-white focus-within:border-[#3a6f77] focus-within:ring-1 focus-within:ring-[#3a6f77] transition-all">
                      <select
                        value={countryCode} onChange={e => setCountryCode(e.target.value)}
                        className="bg-gray-50 text-gray-700 px-2 py-2.5 border-r border-gray-300 outline-none cursor-pointer text-sm font-medium rounded-l-xl"
                      >
                        <option value="+91">IN +91</option>
                        <option value="+1">US +1</option>
                        <option value="+44">UK +44</option>
                        <option value="+971">UAE +971</option>
                        <option value="+61">AU +61</option>
                        <option value="+65">SG +65</option>
                      </select>
                      <div className="flex items-center flex-1 px-3">
                        <FaMobileAlt className="text-sm text-[#3a6f77] mr-2.5" />
                        <input
                          type="tel" placeholder="9876543210"
                          value={phone} onChange={e => { setPhone(e.target.value); setError(""); }}
                          className="flex-1 outline-none text-[#2F2F33] bg-transparent text-sm py-2.5"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSendOtp} disabled={otpLoading || phone.length < 6 || phoneBizName.length < 2}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${phone.length >= 6 && phoneBizName.length >= 2 && !otpLoading ? "bg-[#2F2F33] text-white hover:bg-[#3a6f77]" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                  >
                    {otpLoading ? "Sending OTP..." : "Send OTP"} <FaArrowRight className="text-xs" />
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      OTP sent to <span className="font-bold text-[#3a6f77]">{countryCode}{phone}</span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2F2F33] mb-1.5">Enter OTP</label>
                    <input
                      type="text" maxLength={6} placeholder="Enter 6-digit OTP"
                      value={otpCode} onChange={e => { setOtpCode(e.target.value.replace(/\D/g, "")); setError(""); }}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-lg font-bold tracking-[0.5em] outline-none focus:border-[#3a6f77] focus:ring-1 focus:ring-[#3a6f77] transition-all bg-white"
                    />
                  </div>
                  <button
                    onClick={handleVerifyOtp} disabled={otpLoading || otpCode.length < 6}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${otpCode.length >= 6 && !otpLoading ? "bg-[#2F2F33] text-white hover:bg-[#3a6f77]" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                  >
                    {otpLoading ? "Verifying..." : "Verify & Register"} <FaArrowRight className="text-xs" />
                  </button>
                  <button
                    onClick={() => { setOtpSent(false); setOtpCode(""); setError(""); }}
                    className="text-sm text-[#3a6f77] font-semibold hover:underline text-center"
                  >
                    ← Change number
                  </button>
                </>
              )}
            </div>
          )}

          {/* Login Note */}
          <div className="w-full flex justify-center mt-6 mb-2 text-sm text-[#2F2F33] font-sans">
            <span>Already have an account? <Link href="/signup" className="text-[#3a6f77] font-bold hover:underline">Sign In</Link></span>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default Enter;
