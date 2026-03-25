"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Supabase implicit flow: tokens are in the URL hash fragment
        // The Supabase client automatically picks them up and sets the session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          setStatus("Authentication failed. Redirecting...");
          setTimeout(() => router.push("/signup?error=auth_failed"), 1500);
          return;
        }

        if (session) {
          setStatus("Success! Redirecting to dashboard...");
          setTimeout(() => router.push("/dashboard"), 500);
        } else {
          // Session might not be ready yet, listen for auth state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
              if (event === "SIGNED_IN" && session) {
                setStatus("Success! Redirecting to dashboard...");
                setTimeout(() => router.push("/dashboard"), 500);
                subscription.unsubscribe();
              }
            }
          );

          // Timeout fallback - if no session after 5 seconds, redirect to login
          setTimeout(() => {
            subscription.unsubscribe();
            setStatus("Authentication timed out. Redirecting...");
            setTimeout(() => router.push("/signup?error=auth_timeout"), 1000);
          }, 5000);
        }
      } catch (err) {
        console.error("Auth callback exception:", err);
        setStatus("Something went wrong. Redirecting...");
        setTimeout(() => router.push("/signup?error=unknown"), 1500);
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center font-sans">
      {/* Spinner */}
      <div className="w-10 h-10 border-4 border-gray-200 border-t-[#3a6f77] rounded-full animate-spin mb-6" />
      <p className="text-lg font-semibold text-[#2f2f33]">{status}</p>
      <p className="text-sm text-gray-400 mt-2">Please wait...</p>
    </div>
  );
}
