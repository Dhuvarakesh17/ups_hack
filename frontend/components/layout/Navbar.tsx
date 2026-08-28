"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  LogIn,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  User
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useSession } from "@/lib/auth-client";

export function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const token = localStorage.getItem("session_token") || localStorage.getItem("current_user_email");
    setIsLoggedIn(Boolean(token || session?.user));

    return () => window.removeEventListener("scroll", handleScroll);
  }, [session]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-white/95 backdrop-blur-md border-b border-[#e2ebd0]/80 shadow-xs ${
        scrolled ? "py-3" : "py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-[#d9ff69] flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-[#17231b] flex items-center gap-1">
              ONE <span className="text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]">LOGISTICS</span>
            </span>
            <span className="text-[10px] text-slate-500 block -mt-1 font-medium">
              Enterprise Unified Booking
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
          <a href="#features" className="hover:text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] transition-colors">
            How It Works
          </a>
          <a href="#features" className="hover:text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] transition-colors flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#d9ff69] dark:text-[#d9ff69]" />
            AI Assistant
          </a>
        </div>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-[#d9ff69] hover:bg-[#cbf748] text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>

              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-[#d9ff69] hover:bg-[#cbf748] text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl border border-[#e2ebd0] text-slate-700"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden px-4 pt-3 pb-6 bg-white border-b border-[#e2ebd0] space-y-3">
          <a
            href="#features"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700"
          >
            How It Works
          </a>
          <div className="pt-2 flex flex-col gap-2">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#d9ff69] text-slate-950 font-extrabold text-xs text-center"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#d9ff69] text-slate-950 font-extrabold text-xs text-center"
              >
                Sign In / Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
