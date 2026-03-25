'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaUser, FaPhone, FaEnvelope, FaLink, FaEdit, FaArrowLeft } from "react-icons/fa";
import { supabase } from "@/lib/supabaseClient";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  social: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .required("Phone number is required"),
  social: Yup.string().url("Invalid URL").required("Social media link is required"),
});

const ProfileForm = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [dbProfileId, setDbProfileId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingProfile(false); return; }

      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setDbProfileId(data.id);
        setProfile({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          social: data.social_url || '',
        });
      }
      setLoadingProfile(false);
    };
    loadProfile();
  }, []);

  const handleProfileSubmit = async (values: ProfileData) => {
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
    if (dbProfileId) {
      result = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', dbProfileId);
    } else {
      result = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();
      if (result.data) setDbProfileId(result.data.id);
    }

    if (result.error) {
      alert('Error: ' + result.error.message);
      return;
    }
    setProfile(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6f7] px-4 py-8">

      {/* Back Button */}
      <Link
        href="/settings"
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

      <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 w-full max-w-md border border-[#D4B483]">
        {!profile ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6 text-[#2f2f33]">
              User Profile Form
            </h2>

            <Formik
              initialValues={{ name: "", email: "", phone: "", social: "" }}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                handleProfileSubmit(values as ProfileData);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="flex items-center text-[#3a6f77] font-medium mb-1">
                      <FaUser className="mr-2" /> Name
                    </label>
                    <Field
                      type="text"
                      name="name"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#3a6f77]"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center text-[#3a6f77] font-medium mb-1">
                      <FaEnvelope className="mr-2" /> Email
                    </label>
                    <Field
                      type="email"
                      name="email"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#3a6f77]"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center text-[#3a6f77] font-medium mb-1">
                      <FaPhone className="mr-2" /> Phone Number
                    </label>
                    <Field
                      type="text"
                      name="phone"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#3a6f77]"
                    />
                    <ErrorMessage
                      name="phone"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Social Media Link */}
                  <div>
                    <label className="flex items-center text-[#3a6f77] font-medium mb-1">
                      <FaLink className="mr-2" /> Social Media Link
                    </label>
                    <Field
                      type="text"
                      name="social"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#3a6f77]"
                    />
                    <ErrorMessage
                      name="social"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#3a6f77] text-white py-2 rounded hover:bg-[#2f2f33] transition"
                  >
                    Submit
                  </button>
                </Form>
              )}
            </Formik>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-6 text-[#2f2f33]">
              Profile
            </h2>

            {/* Avatar Circle */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#3a6f77] flex items-center justify-center text-white text-2xl font-bold uppercase">
                {profile.name.charAt(0)}
              </div>
            </div>

            {/* Profile Info Cards */}
            <div className="space-y-3">
              {/* Name */}
              <div className="flex items-center gap-3 bg-[#f5f6f7] rounded-lg px-4 py-3 border border-[#D4B483]">
                <FaUser className="text-[#3a6f77] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Name</p>
                  <p className="text-[#2f2f33] font-semibold truncate">{profile.name}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 bg-[#f5f6f7] rounded-lg px-4 py-3 border border-[#D4B483]">
                <FaEnvelope className="text-[#3a6f77] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Email</p>
                  <p className="text-[#2f2f33] font-semibold truncate">{profile.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 bg-[#f5f6f7] rounded-lg px-4 py-3 border border-[#D4B483]">
                <FaPhone className="text-[#3a6f77] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Phone</p>
                  <p className="text-[#2f2f33] font-semibold truncate">{profile.phone}</p>
                </div>
              </div>

              {/* Social Media Link — Clickable */}
              <div className="flex items-center gap-3 bg-[#f5f6f7] rounded-lg px-4 py-3 border border-[#D4B483]">
                <FaLink className="text-[#3a6f77] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Social</p>
                  <a
                    href={profile.social}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3a6f77] font-semibold underline hover:text-[#2f2f33] transition truncate block"
                  >
                    {profile.social}
                  </a>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setProfile(null)}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-[#3a6f77] text-white py-2 rounded hover:bg-[#2f2f33] transition"
            >
              <FaEdit /> Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileForm;