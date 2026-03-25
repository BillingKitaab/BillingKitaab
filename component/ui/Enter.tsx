"use client";

import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import ScrollReveal from "./ScrollReveal";
import { supabase } from "@/lib/supabaseClient";
import {
  FaEnvelope,
  FaLock,
  FaBriefcase,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";

const Enter = () => {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    businessName: "",
    email: "",
    password: "",
  });
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isValid, setIsValid] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsLoggedIn(true);
    });
  }, []);

  React.useEffect(() => {
    const { businessName, email, password } = formData;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid = password.length >= 6;
    const businessValid = businessName.length >= 2 && businessName.length <= 50;
    setIsValid(emailValid && passwordValid && businessValid);
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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            business_name: formData.businessName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        router.push("/signup");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex justify-center items-start pt-12 font-sans">
      {/* Back to Landing1 Button - Top Left Corner */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-sm font-semibold border-2 transition-all duration-300 hover:scale-105"
        style={{
          backgroundColor: "#3a6f77",
          color: "#f5f6f7",
          borderColor: "#D4B483",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "#D4B483";
          (e.currentTarget as HTMLElement).style.color = "#2f2f33";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "#3a6f77";
          (e.currentTarget as HTMLElement).style.color = "#f5f6f7";
        }}
      >
        <FaArrowLeft className="text-sm" />
        <span>Back</span>
      </Link>

      <ScrollReveal>
        <div className="w-full max-w-md lg:max-w-[77vh] bg-[#F5F6F7] rounded-xl shadow-lg flex flex-col items-center justify-start py-6">
          {/* Logo */}
          <img src="/logo/smart.svg" alt="BillingKitaab Logo" className="h-20 lg:h-[10vh] w-auto object-contain mb-6 mt-6" />

          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="w-full lg:w-[50vh] flex flex-col gap-4 p-4"
          >
            {/* Dashboard Redirect Option */}
            {isLoggedIn && (
              <div className="w-full flex justify-center mb-2">
                <Link href="/dashboard" className="bg-[#e9f2f4] text-[#3a6f77] px-4 py-2 text-sm rounded-lg font-bold hover:bg-[#d1e5e8] transition-colors">
                  You are logged in. Go to Dashboard &rarr;
                </Link>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {error}
              </div>
            )}

            {/* Business Name */}
            <label className="text-[#2F2F33] font-sans">
              Enter your business name <span className="text-red-500">*</span>
            </label>
            <div
              className={`flex items-center border rounded px-2 py-1 ${
                formData.businessName &&
                (formData.businessName.length < 2 ||
                  formData.businessName.length > 50)
                  ? "border-red-500"
                  : "border-[#2F2F33]"
              }`}
            >
              <FaBriefcase className="text-2xl text-[#3a6f77] mr-2" />
              <input
                type="text"
                name="businessName"
                placeholder="Enter your business name"
                value={formData.businessName}
                onChange={handleChange}
                className="flex-1 outline-none text-[#2F2F33] bg-[#F5F6F7] font-sans"
              />
            </div>
            {formData.businessName &&
              (formData.businessName.length < 2 ||
                formData.businessName.length > 50) && (
                <p className="text-red-500 text-sm">
                  Business name must be 2-50 characters
                </p>
              )}

            {/* Email */}
            <label className="text-[#2F2F33] font-sans">
              Enter your Email <span className="text-red-500">*</span>
            </label>
            <div
              className={`flex items-center border rounded px-2 py-1 ${
                formData.email &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                  ? "border-red-500"
                  : "border-[#2F2F33]"
              }`}
            >
              <FaEnvelope className="text-2xl text-[#3a6f77] mr-2" />
              <input
                type="text"
                name="email"
                placeholder="Enter your Email"
                value={formData.email}
                onChange={handleChange}
                className="flex-1 outline-none text-[#2F2F33] bg-[#F5F6F7] font-sans"
              />
            </div>
            {formData.email &&
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                <p className="text-red-500 text-sm">Invalid email format</p>
              )}

            {/* Password */}
            <label className="text-[#2F2F33] font-sans">
              Enter your password <span className="text-red-500">*</span>
            </label>
            <div
              className={`flex items-center border rounded px-2 py-1 ${
                formData.password && formData.password.length < 6
                  ? "border-red-500"
                  : "border-[#2F2F33]"
              }`}
            >
              <FaLock className="text-xl text-[#3a6f77] mr-2" />
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className="flex-1 outline-none text-[#2F2F33] bg-[#F5F6F7] font-sans"
              />
            </div>
            {formData.password && formData.password.length < 6 && (
              <p className="text-red-500 text-sm">
                Password must be at least 6 characters
              </p>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={!isValid || loading}
              className={`flex h-12 w-full lg:w-[47vh] items-center justify-center gap-2 px-3 py-2 mt-6 border rounded transition-colors duration-300 cursor-pointer
                ${
                  isValid && !loading
                    ? "bg-[#2F2F33] text-[#F5F6F7] hover:bg-[#F5F6F7] hover:text-[#2F2F33] border-[#2F2F33]"
                    : "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                }`}
            >
              {loading ? "Registering..." : "Register now"}
              <FaArrowRight className="text-sm" />
            </button>
            
            <div className="w-full flex justify-center mt-2 text-sm text-[#2F2F33]">
              <span>Already have an account? <Link href="/signup" className="text-blue-600 font-bold hover:underline">Sign In</Link></span>
            </div>
          </form>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default Enter;
