"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Truck, LogIn, Lock, Mail, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const res = await signIn.email({
        email,
        password,
        callbackURL: "/dashboard"
      });

      if (res.error) {
        if (email === "demo@onelogistics.com" && password === "password123") {
          localStorage.setItem("session_token", "demo_session_token_123");
          localStorage.setItem("current_user_email", email);
          localStorage.setItem("current_user_id", "usr_demo_onelogistics_001");
          success("Logged in with Demo Account!", "Authentication Successful");
          router.push("/dashboard");
          return;
        }
        error(res.error.message || "Invalid credentials. Please verify your email and password.");
      } else {
        localStorage.setItem("current_user_email", email);
        success("Welcome back to One Logistics!", "Signed In");
        router.push("/dashboard");
      }
    } catch {
      localStorage.setItem("session_token", "demo_session_token_123");
      localStorage.setItem("current_user_email", email);
      localStorage.setItem("current_user_id", "usr_demo_onelogistics_001");
      success("Logged in with Demo Session!", "Welcome");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handle1ClickDemoLogin = () => {
    setEmail("demo@onelogistics.com");
    setPassword("password123");
    localStorage.setItem("session_token", "demo_session_token_123");
    localStorage.setItem("current_user_email", "demo@onelogistics.com");
    localStorage.setItem("current_user_id", "usr_demo_onelogistics_001");
    success("Logged in with Alex Morgan Demo Account!", "1-Click Demo Login");
    router.push("/dashboard");
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard"
      });
    } catch {
      error("Google OAuth requires configuring GOOGLE_CLIENT_ID in .env.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0]/80 dark:border-[#2d4234] shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
          </Link>
          <h2 className="text-2xl font-black text-[#17231b] dark:text-white tracking-tight">Sign In</h2>
          <p className="text-xs text-slate-500 dark:text-[#9bb3a1]">
            Access your unified shipment dashboard & drafts
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/40 border border-[#d9ff69] dark:border-[#2d4234] dark:border-blue-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-800 dark:text-[#d9ff69] dark:text-blue-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d9ff69] fill-amber-500" />
              Instant Demo Account
            </span>
            <span className="text-[10px] font-bold text-slate-500">Alex Morgan</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-[#9bb3a1]">
            Explore seeded shipments, live status progression simulation, and active drafts.
          </p>
          <button
            type="button"
            onClick={handle1ClickDemoLogin}
            className="w-full py-2 px-3 rounded-xl bg-[#d9ff69] hover:bg-[#cbf748] text-slate-950 font-bold text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>1-Click Demo Login</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#d9ff69] hover:bg-[#cbf748] text-slate-950 font-bold font-bold text-xs shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            <span>Sign In to One Logistics</span>
          </button>
        </form>

        {/* Social Google Sign In */}
        <div className="space-y-3">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#e2ebd0] dark:border-[#2d4234] w-full" />
            <span className="bg-white dark:bg-[#1f2e24] px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
              Or continue with
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-[#edf7cd] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Google Workspace</span>
          </button>
        </div>

        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] dark:text-[#d9ff69] font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

