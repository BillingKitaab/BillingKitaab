'use client'

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaPhone, FaEnvelope, FaBuilding, FaHome, FaPen, FaUpload, FaUser, FaLink, FaSignOutAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import SignatureCanvas from "react-signature-canvas";

const Setting = () => {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [businessLogoPreview, setBusinessLogoPreview] = useState<string>('');
  const [sigMode, setSigMode] = useState<'draw' | 'upload'>('draw');
  const [viewMode, setViewMode] = useState(false);
  const sigCanvasRef = React.useRef<SignatureCanvas>(null);

  const [initialValues, setInitialValues] = useState({
    businessName: "",
    businessAddress: "",
    gstNumber: "",
    panNumber: "",
    businessPhone: "",
    businessEmail: "",
    defaultCurrency: "INR",
    businessLogo: null as File | null,
    signatureImage: null as File | null,
    signatureUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const [profileInitialValues, setProfileInitialValues] = useState({
    name: "",
    email: "",
    phone: "",
    social: "",
  });
  const profileSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadBusiness = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        setProfileLoading(false);
        return;
      }

      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      if (data) {
        setBusinessId(data.id);
        setInitialValues({
          businessName: data.business_name || "",
          businessAddress: data.business_address || "",
          gstNumber: data.gst_number || "",
          panNumber: data.pan_number || "",
          businessPhone: data.business_phone || "",
          businessEmail: data.business_email || "",
          defaultCurrency: data.default_currency || "INR",
          businessLogo: null,
          signatureImage: null,
          signatureUrl: data.signature_url || "",
        });
        // Auto-show summary page when data exists
        setViewMode(true);
      }

      const savedLogo = localStorage.getItem('businessLogo');
      if (savedLogo) {
        setBusinessLogoPreview(savedLogo);
      }

      setLoading(false);

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfileId(profileData.id);
        setHasProfile(true);
        setProfileInitialValues({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          social: profileData.social_url || "",
        });
      } else {
        setHasProfile(false);
      }

      setProfileLoading(false);
    };
    loadBusiness();
  }, []);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      businessName: Yup.string().required("Business name is required"),
      businessAddress: Yup.string().required("Business address is required"),
      gstNumber: Yup.string().required("GST number is required"),
      panNumber: Yup.string().required("PAN number is required"),
      businessPhone: Yup.string().required("Phone number is required"),
      businessEmail: Yup.string().email("Invalid email").required("Email is required"),
    }),
    onSubmit: async (values) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let finalSignatureUrl = values.signatureUrl;

      if (sigMode === 'draw' && sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
          finalSignatureUrl = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
      } else if (values.signatureImage && sigMode === 'upload') {
        const reader = new FileReader();
        reader.readAsDataURL(values.signatureImage);
        finalSignatureUrl = await new Promise((resolve) => {
           reader.onloadend = () => resolve(reader.result as string);
        });
      }

      const businessData = {
        owner_user_id: user.id,
        business_name: values.businessName,
        business_address: values.businessAddress,
        gst_number: values.gstNumber,
        pan_number: values.panNumber,
        business_phone: values.businessPhone,
        business_email: values.businessEmail,
        default_currency: values.defaultCurrency,
        signature_url: finalSignatureUrl,
      };

      let result;
      if (businessId) {
        result = await supabase
          .from('businesses')
          .update(businessData)
          .eq('id', businessId);
      } else {
        result = await supabase
          .from('businesses')
          .insert(businessData)
          .select()
          .single();
        if (result.data) {
          setBusinessId(result.data.id);
        }
      }

      if (result.error) {
        alert('Error saving: ' + result.error.message);
        return;
      }

      if (values.businessLogo) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const logoData = reader.result as string;
          localStorage.setItem("businessLogo", logoData);
          setBusinessLogoPreview(logoData);
        };
        reader.readAsDataURL(values.businessLogo);
      }

      setShowSuccess(true);
      setViewMode(true);
      setTimeout(() => setShowSuccess(false), 2500);
    },
  });

  const profileFormik = useFormik({
    initialValues: profileInitialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      phone: Yup.string()
        .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
        .required("Phone number is required"),
      social: Yup.string().url("Invalid URL").required("Social media link is required"),
    }),
    onSubmit: async (values) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profileData = {
        user_id: user.id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        social_url: values.social,
      };

      let result;
      if (profileId) {
        result = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('id', profileId);
      } else {
        result = await supabase
          .from('user_profiles')
          .insert(profileData)
          .select()
          .single();

        if (result.data) {
          setProfileId(result.data.id);
        }
      }

      if (result.error) {
        alert('Error saving profile: ' + result.error.message);
        return;
      }

      setHasProfile(true);
      setShowSuccess(true);
      setViewMode(true);
      setTimeout(() => setShowSuccess(false), 2500);
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="h-dvh w-full flex flex-col overflow-hidden">

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-4"
            >
              <motion.svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#22c55e"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
                <motion.path
                  d="M24 41L35 52L56 30"
                  stroke="#22c55e"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.35, delay: 0.4, ease: "easeOut" }}
                />
              </motion.svg>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="text-gray-800 font-semibold text-base"
              >
                Settings saved successfully!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-6 max-w-sm"
            >
              <div className="text-4xl text-[#3a6f77]">
                ⚠️
              </div>

              <div className="text-center">
                <motion.h3
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-800 font-bold text-lg mb-2"
                >
                  Confirm Logout
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-600 text-sm"
                >
                  Are you sure you want to logout? You'll need to sign in again to access your account.
                </motion.p>
              </div>

              <div className="flex gap-3 w-full">
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all cursor-pointer"
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 shrink-0 bg-gray-50 border-b">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl text-[#2f2f33] font-bold font-serif truncate">
            {hasProfile ? 'Profile' : 'Settings'}
          </h1>
          <p className="font-medium text-xs sm:text-sm text-[#2f2f33]/80 font-sans mt-0.5">
            Today 8 March 2026
          </p>
        </div>

        <div className="flex gap-2 shrink-0 ml-2 pr-12 md:pr-0">
      
          

          {!viewMode && (
            <button 
              type="button"
              onClick={() => {
                formik.resetForm();
                profileFormik.resetForm();
                setViewMode(true);
              }}
              className="px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-[#D4B483] text-[#2f2f33] rounded-lg hover:bg-[#c9a86c] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap">
              Discard
            </button>
          )}
          {!viewMode && (
            <button
              type="submit"
              form="businessForm"
              className="px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold border border-[#3a6f77] text-[#3a6f77] rounded-lg hover:bg-[#3a6f77] hover:text-[#f5f6f7] transition-all duration-200 cursor-pointer hover:-translate-y-0.5 whitespace-nowrap"
            >
              Save Changes
            </button>
          )}
          {viewMode && (
            <button
              type="button"
              onClick={() => {
                formik.resetForm();
                profileFormik.resetForm();
                setViewMode(false);
              }}
              className="px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold border border-[#3a6f77] text-[#3a6f77] rounded-lg hover:bg-[#3a6f77] hover:text-[#f5f6f7] transition-all duration-200 cursor-pointer hover:-translate-y-0.5 whitespace-nowrap"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Alert Banner */}
      <div className="w-full flex items-center justify-between px-4 sm:px-8 py-2 shrink-0 bg-gray-50">
        <p className="text-xs sm:text-sm font-medium font-sans flex items-center gap-2 truncate">
          <span className="text-green-500 shrink-0">✓ All settings saved</span>
          <span className="text-[#2f2f33]/70 hidden sm:inline">— Your business information is up to date</span>
        </p>
      </div>

      {/* Content Area - View Mode or Edit Mode */}
      <div className="flex-1 min-h-0 px-3 sm:px-8 py-4 bg-gray-100 flex items-start justify-center overflow-y-auto">
        {viewMode ? (
          // VIEW MODE - Summary of Saved Details
          <div className="w-full max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-[#2f2f33]/10 bg-white/95 p-6 sm:p-8"
            >
              <div className="text-center mb-10">
                <div className="h-22 w-22 mx-auto mb-4 overflow-hidden rounded-3xl border-2 border-[#D4B483]/70 bg-[#f5f6f7] flex items-center justify-center">
                  {businessLogoPreview ? (
                    <img
                      src={businessLogoPreview}
                      alt="Business Logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-[#3a6f77]">
                      {formik.values.businessName ? formik.values.businessName.charAt(0).toUpperCase() : 'B'}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-[#2f2f33] mb-2">{formik.values.businessName}</h2>
                <p className="text-sm font-medium text-[#2f2f33]/70">{formik.values.businessEmail}</p>
              </div>

              {/* Business Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="rounded-2xl p-4 border border-[#D4B483]/30 bg-linear-to-br from-[#f5f6f7] to-gray-50">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#3a6f77] mb-2">Business Address</p>
                    <p className="text-sm text-[#2f2f33] whitespace-pre-wrap">{formik.values.businessAddress}</p>
                  </div>

                  <div className="rounded-2xl p-4 border border-[#D4B483]/30 bg-linear-to-br from-[#f5f6f7] to-gray-50">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#3a6f77] mb-2">Phone</p>
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-[#3a6f77]" />
                      <p className="text-sm text-[#2f2f33]">{formik.values.businessPhone}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 border border-[#D4B483]/30 bg-linear-to-br from-[#f5f6f7] to-gray-50">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#3a6f77] mb-2">Email</p>
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-[#3a6f77]" />
                      <p className="text-sm text-[#2f2f33]">{formik.values.businessEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="rounded-2xl p-4 border border-[#D4B483]/30 bg-linear-to-br from-[#f5f6f7] to-gray-50">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#3a6f77] mb-2">GST Number</p>
                    <p className="text-sm text-[#2f2f33] font-mono">{formik.values.gstNumber}</p>
                  </div>

                  <div className="rounded-2xl p-4 border border-[#D4B483]/30 bg-linear-to-br from-[#f5f6f7] to-gray-50">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#3a6f77] mb-2">Currency</p>
                    <p className="text-sm text-[#2f2f33]">{formik.values.defaultCurrency}</p>
                  </div>

                  <div className="rounded-2xl p-4 border border-[#D4B483]/30 bg-linear-to-br from-[#f5f6f7] to-gray-50">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#3a6f77] mb-2">Signature</p>
                    {formik.values.signatureUrl ? (
                      <img src={formik.values.signatureUrl} alt="Signature" className="h-12 object-contain" />
                    ) : (
                      <p className="text-xs text-gray-400 italic">No signature added</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Section */}
              {hasProfile && (
                <div className="border-t border-gray-200 pt-8 mt-8">
                  <h3 className="text-xl font-bold text-[#2f2f33] mb-6">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="rounded-2xl p-4 border border-[#D4B483]/30 bg-linear-to-br from-[#f5f6f7] to-gray-50">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#3a6f77] mb-2">Name</p>
                      <p className="text-sm text-[#2f2f33]">{profileFormik.values.name}</p>
                    </div>

                    <div className="rounded-2xl p-4 border border-[#D4B483]/30 bg-linear-to-br from-[#f5f6f7] to-gray-50">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#3a6f77] mb-2">Email</p>
                      <p className="text-sm text-[#2f2f33]">{profileFormik.values.email}</p>
                    </div>

                    <div className="rounded-2xl p-4 border border-[#D4B483]/30 bg-linear-to-br from-[#f5f6f7] to-gray-50">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#3a6f77] mb-2">Phone</p>
                      <p className="text-sm text-[#2f2f33]">{profileFormik.values.phone}</p>
                    </div>

                    <div className="rounded-2xl p-4 border border-[#D4B483]/30 bg-linear-to-br from-[#f5f6f7] to-gray-50">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#3a6f77] mb-2">Social Media</p>
                      <a href={profileFormik.values.social} target="_blank" rel="noopener noreferrer" className="text-sm text-[#3a6f77] hover:underline break-all">
                        {profileFormik.values.social}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => {
                    formik.resetForm();
                    profileFormik.resetForm();
                    setViewMode(false);
                  }}
                  className="px-6 py-3 bg-[#3a6f77] text-white font-bold rounded-xl hover:bg-[#2c5359] transition-all duration-200 hover:-translate-y-0.5"
                >
                  Edit Details
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          // EDIT MODE - Form
          
        <div className="w-full max-w-4xl p-4 sm:p-6 bg-white shadow-md rounded-lg">
          <div className="mb-6 rounded-2xl border border-[#D4B483]/40 bg-[#f5f6f7] p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-[#D4B483]/50 bg-white flex items-center justify-center">
                  {businessLogoPreview ? (
                    <img
                      src={businessLogoPreview}
                      alt="Business Logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-[#3a6f77]">
                      {formik.values.businessName ? formik.values.businessName.charAt(0).toUpperCase() : 'B'}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3a6f77]/70">Profile Summary</p>
                  <h2 className="truncate text-xl font-bold text-[#2f2f33]">
                    {hasProfile ? profileFormik.values.name || 'Profile' : formik.values.businessName || 'Business Profile'}
                  </h2>
                  <p className="truncate text-sm text-[#2f2f33]/70">
                    {formik.values.businessEmail || profileFormik.values.email || 'No email added yet'}
                  </p>
                  <button
                    type="button"
                    onClick={() => profileSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="mt-3 inline-flex w-fit items-center justify-center rounded-xl border border-[#3a6f77] px-4 py-2 text-sm font-semibold text-[#3a6f77] transition-colors hover:bg-[#3a6f77] hover:text-[#f5f6f7]"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:min-w-[320px]">
                <div className="rounded-xl bg-white px-3 py-2 border border-[#2f2f33]/10">
                  <p className="text-[10px] uppercase tracking-widest text-[#2f2f33]/45">Business</p>
                  <p className="truncate text-sm font-semibold text-[#2f2f33]">{formik.values.businessName || 'Not set'}</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-2 border border-[#2f2f33]/10">
                  <p className="text-[10px] uppercase tracking-widest text-[#2f2f33]/45">Phone</p>
                  <p className="truncate text-sm font-semibold text-[#2f2f33]">{profileFormik.values.phone || formik.values.businessPhone || 'Not set'}</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-2 border border-[#2f2f33]/10">
                  <p className="text-[10px] uppercase tracking-widest text-[#2f2f33]/45">Social</p>
                  <p className="truncate text-sm font-semibold text-[#2f2f33]">{profileFormik.values.social ? 'Added' : 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold mb-4">Business Information</h2>
          <form id="businessForm" onSubmit={formik.handleSubmit}>

            {/* Row 1: Logo + Business Name */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium">Business Logo</label>

                <input
                  type="file"
                  name="businessLogo"
                  accept="image/*"
                  onChange={(e) =>
                    formik.setFieldValue("businessLogo", e.currentTarget.files?.[0] || null)
                  }
                  className="mt-1 w-full border rounded-md p-2 text-sm"
                />
                {formik.values.businessLogo && (
                  <div className="mt-1 flex items-center gap-2">
                    <img
                      src={URL.createObjectURL(formik.values.businessLogo)}
                      alt="Business Logo Preview"
                      className="h-10 w-10 object-cover rounded-full border shrink-0"
                    />
                    <p className="text-xs text-gray-600 truncate">
                      {formik.values.businessLogo.name}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  onChange={formik.handleChange}
                  value={formik.values.businessName}
                  className="mt-1 w-full border rounded-md p-2 text-sm"
                  placeholder="InvoiceLux Solutions"
                />
                {formik.errors.businessName && <p className="text-red-500 text-xs mt-1">{formik.errors.businessName}</p>}
              </div>
            </div>

            {/* Row 2: Business Address + Currency */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium">Business Address</label>
                <textarea
                  name="businessAddress"
                  onChange={formik.handleChange}
                  value={formik.values.businessAddress}
                  className="mt-1 w-full border rounded-md p-2 text-sm resize-none"
                  rows={2}
                  placeholder="12 Brigade Road, Bengaluru, Karnataka – 560025"
                />
                {formik.errors.businessAddress && <p className="text-red-500 text-xs mt-1">{formik.errors.businessAddress}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Default Currency</label>
                <div className="flex items-center gap-2 mt-1">
                  <FaBuilding className="text-gray-500 shrink-0" />
                  <select
                    name="defaultCurrency"
                    onChange={formik.handleChange}
                    value={formik.values.defaultCurrency}
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    <option value="INR">INR — Indian Rupee (₹)</option>
                    <option value="USD">USD — US Dollar ($)</option>
                    <option value="EUR">EUR — Euro (€)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 3: GST & PAN */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium">GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  onChange={formik.handleChange}
                  value={formik.values.gstNumber}
                  className="mt-1 w-full border rounded-md p-2 text-sm"
                  placeholder="29AAPFI1234B1ZV"
                />
                {formik.errors.gstNumber && <p className="text-red-500 text-xs mt-1">{formik.errors.gstNumber}</p>}
              </div>
              {/* <div>
                <label className="block text-sm font-medium">PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  onChange={formik.handleChange}
                  value={formik.values.panNumber}
                  className="mt-1 w-full border rounded-md p-2 text-sm"
                  placeholder="AAPFI1234B"
                />
                {formik.errors.panNumber && <p className="text-red-500 text-xs mt-1">{formik.errors.panNumber}</p>}
              </div> */}
            </div>

            {/* Row 4: Phone + Email */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <div className="flex items-center gap-2">
                  <FaPhone className="text-gray-500 shrink-0" />
                  <input
                    type="tel"
                    name="businessPhone"
                    onChange={formik.handleChange}
                    value={formik.values.businessPhone}
                    className="w-full border rounded-md p-2 text-sm"
                    placeholder="+91 80 4567 8901"
                  />
                </div>
                {formik.errors.businessPhone && <p className="text-red-500 text-xs mt-1">{formik.errors.businessPhone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-gray-500 shrink-0" />
                  <input
                    type="email"
                    name="businessEmail"
                    onChange={formik.handleChange}
                    value={formik.values.businessEmail}
                    className="w-full border rounded-md p-2 text-sm"
                    placeholder="billing@invoicelux.in"
                  />
                </div>
                {formik.errors.businessEmail && <p className="text-red-500 text-xs mt-1">{formik.errors.businessEmail}</p>}
              </div>
            </div>

            {/* Signature Block */}
            <div className="mt-8 pt-6 border-t border-gray-200">
               <h3 className="text-md sm:text-lg font-bold mb-4 text-[#2f2f33]">Authorized Signature</h3>
               <div className="flex items-center gap-4 mb-4">
                  <button 
                     type="button"
                     onClick={() => setSigMode('draw')}
                     className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all ${sigMode === 'draw' ? 'bg-[#3a6f77] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                     <FaPen className="text-xs" /> Draw Signature
                  </button>
                  <button 
                     type="button"
                     onClick={() => setSigMode('upload')}
                     className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all ${sigMode === 'upload' ? 'bg-[#3a6f77] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                     <FaUpload className="text-xs" /> Upload Image
                  </button>
               </div>
               
               <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {sigMode === 'draw' ? (
                     <div>
                        <div className="border border-dashed border-gray-300 bg-white rounded-lg flex items-center justify-center relative overflow-hidden h-40">
                          <SignatureCanvas
                              ref={sigCanvasRef}
                              penColor="black"
                              canvasProps={{ width: 500, height: 158, className: "cursor-crosshair w-full h-full" }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-gray-400 italic">Draw your signature smoothly in the box above.</p>
                          <button type="button" onClick={() => sigCanvasRef.current?.clear()} className="text-xs font-semibold text-red-500 cursor-pointer hover:underline">Clear Canvas</button>
                        </div>
                     </div>
                  ) : (
                     <div className="border border-dashed border-gray-300 bg-white rounded-lg flex flex-col items-center justify-center p-6 h-40 relative">
                        <input
                           type="file"
                           accept="image/*"
                           onChange={(e) => formik.setFieldValue("signatureImage", e.currentTarget.files?.[0] || null)}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="text-center">
                           <FaUpload className="text-2xl text-gray-400 mx-auto mb-2" />
                           <p className="text-sm font-medium text-gray-600">Click or drag a signature image here</p>
                           <p className="text-xs text-gray-400 mt-1">PNG or JPG with transparent background recommended</p>
                        </div>
                        {formik.values.signatureImage && (
                           <div className="absolute inset-x-2 bottom-2 bg-green-50 text-green-700 text-xs font-semibold py-1 px-2 rounded-md border border-green-200 text-center truncate">
                              ✓ {formik.values.signatureImage.name} selected
                           </div>
                        )}
                     </div>
                  )}

                  {/* Previous DB Signature Preview */}
                  {formik.values.signatureUrl && !formik.values.signatureImage && sigMode === 'upload' && (
                     <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Current Saved Signature</p>
                        <img src={formik.values.signatureUrl} alt="Signature" className="h-16 object-contain border rounded-md px-2 py-1 bg-white" />
                     </div>
                  )}
               </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full bg-[#3a6f77] text-white font-bold py-3 rounded-md hover:bg-[#2c5359] transition shadow-md sm:text-base cursor-pointer hover:-translate-y-0.5"
            >
              Save Information
            </button>
          </form>

          <div ref={profileSectionRef} id="profile" className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Profile Information</h2>
            <p className="mb-4 text-sm text-[#2f2f33]/70">
              Edit logo, name, email, phone, or social link below.
            </p>

            {profileLoading ? (
              <p className="text-sm text-gray-500">Loading profile...</p>
            ) : (
              <form onSubmit={profileFormik.handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="flex items-center text-sm font-medium mb-1">
                      <FaUser className="mr-2" /> Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      onChange={profileFormik.handleChange}
                      value={profileFormik.values.name}
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Your full name"
                    />
                    {profileFormik.errors.name && <p className="text-red-500 text-xs mt-1">{profileFormik.errors.name}</p>}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium mb-1">
                      <FaEnvelope className="mr-2" /> Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      onChange={profileFormik.handleChange}
                      value={profileFormik.values.email}
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="you@example.com"
                    />
                    {profileFormik.errors.email && <p className="text-red-500 text-xs mt-1">{profileFormik.errors.email}</p>}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium mb-1">
                      <FaPhone className="mr-2" /> Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      onChange={profileFormik.handleChange}
                      value={profileFormik.values.phone}
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="10 digit phone number"
                    />
                    {profileFormik.errors.phone && <p className="text-red-500 text-xs mt-1">{profileFormik.errors.phone}</p>}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium mb-1">
                      <FaLink className="mr-2" /> Social Media Link
                    </label>
                    <input
                      type="text"
                      name="social"
                      onChange={profileFormik.handleChange}
                      value={profileFormik.values.social}
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="https://..."
                    />
                    {profileFormik.errors.social && <p className="text-red-500 text-xs mt-1">{profileFormik.errors.social}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#3a6f77] text-white py-2 rounded hover:bg-[#2f2f33] transition"
                >
                  Save Profile
                </button>
              </form>
            )}
          </div>

          {/* Logout Section */}
          <div className="mt-12 pt-8 border-t border-gray-200 bg-white rounded-lg p-6 max-w-4xl mx-auto w-full">
            <h2 className="text-lg font-bold text-[#2f2f33] mb-2">Account</h2>
            <p className="text-sm text-[#2f2f33]/70 mb-6">
              Sign out of your account and secure your session.
            </p>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="px-6 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5"
            >
              <FaSignOutAlt size={16} />
              Logout
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Setting;