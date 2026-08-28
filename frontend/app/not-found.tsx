"use client";

import React from "react";
import Link from "next/link";
import { Truck, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0] dark:border-[#2d4234] shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#edf7cd]/50 dark:bg-[#25372b] dark:bg-blue-950 text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] flex items-center justify-center mx-auto shadow-md">
          <Truck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[#d9ff69]xl font-black text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] dark:text-[#d9ff69]">404</span>
          <h2 className="text-xl font-bold text-[#17231b] dark:text-white">Route Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The shipment dispatch terminal or logistics page you are looking for does not exist or has been relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#d9ff69] hover:bg-[#cbf748] text-slate-950 font-bold font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-[#edf7cd]/90 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

