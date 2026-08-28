"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Truck,
  Sparkles,
  ArrowRight,
  Zap,
  BookmarkCheck,
  Cpu,
  BarChart3,
  CheckCircle2,
  RotateCcw,
  Globe,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { estimateRate, formatCurrency } from "@/lib/utils";

export default function LandingPage() {
  const [calcWeight, setCalcWeight] = useState(3.5);
  const [calcType, setCalcType] = useState<"standard" | "express">("express");
  const [calcProduct, setCalcProduct] = useState("fragile");

  const previewRate = estimateRate(
    calcWeight,
    30,
    20,
    15,
    calcType,
    calcProduct,
  );

  const features = [
    {
      title: "Unified Customer Profile",
      desc: "Single identity managing all shipment routes, default addresses, billing rules, and real-time history.",
      icon: Globe,
      color: "text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]",
      bg: "bg-[#edf7cd]/50 dark:bg-[#25372b]",
    },
    {
      title: "AI Shipment Assistant",
      desc: "Intelligent conversational assistant powered by Groq LLM providing structured recommendations and instant booking prefill.",
      icon: Sparkles,
      color: "text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]",
      bg: "bg-[#edf7cd]/50 dark:bg-[#25372b]",
    },
    {
      title: "Cross-Channel Saved Drafts",
      desc: "Start booking on mobile, save progress at any step, and seamlessly finish on desktop without data loss.",
      icon: BookmarkCheck,
      color: "text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]",
      bg: "bg-[#edf7cd]/50 dark:bg-[#25372b]",
    },
    {
      title: "Predictive Delivery Engine",
      desc: "Continuous algorithmic delivery forecasting utilizing stage duration velocities, service tier multipliers, and freight characteristics.",
      icon: Cpu,
      color: "text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]",
      bg: "bg-[#edf7cd]/50 dark:bg-[#25372b]",
    },
    {
      title: "Real-Time Tracking & Simulation",
      desc: "Interactive checkpoint progression simulation enabling live state machine transitions and instant email notifications.",
      icon: Truck,
      color: "text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]",
      bg: "bg-[#edf7cd]/50 dark:bg-[#25372b]",
    },
    {
      title: "Deep Logistics Analytics",
      desc: "Live PostgreSQL aggregation measuring spending trends, monthly volume velocity, and service reliability metrics.",
      icon: BarChart3,
      color: "text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]",
      bg: "bg-[#edf7cd]/50 dark:bg-[#25372b]",
    },
  ];

  const workflowSteps = [
    {
      num: 1,
      title: "Start Booking",
      desc: "Enter origin and destination addresses with instant postal validation.",
    },
    {
      num: 2,
      title: "Save Draft / Continue",
      desc: "Pause at any moment; state is preserved in cloud storage.",
    },
    {
      num: 3,
      title: "Smart Recommendation",
      desc: "AI calculates fastest linehaul & optimal packaging classifications.",
    },
    {
      num: 4,
      title: "1-Click Preferences",
      desc: "Auto-fill payment mode and billing location from saved user profile.",
    },
    {
      num: 5,
      title: "Confirmation & Label",
      desc: "Instant label generation with tracking number and dispatch dispatch.",
    },
    {
      num: 6,
      title: "Real-Time Tracking",
      desc: "Automated email alerts and predictive delivery recalculation.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#17231b] flex flex-col selection:bg-[#d9ff69] selection:text-white">
      {/* Top Fixed Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Pitch */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-[#e2ebd0] text-slate-800 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]" />
                <span>Next-Generation Logistics Architecture</span>
              </div>

              <h1 className="text-[#d9ff69]xl sm:text-5xl lg:text-6xl font-black text-[#17231b] tracking-tight leading-[1.1]">
                Ship smarter. <br />
                <span className="text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]">Continue anywhere.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                One seamless shipment booking experience across every channel.
                Start booking on your phone, save progress as drafts, and finish
                on desktop with predictive delivery estimates and AI
                recommendations.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#d9ff69] hover:bg-[#cbf748] text-slate-950 font-bold font-extrabold text-sm shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Sign In / Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white border border-[#e2ebd0] hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4 text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]" />
                  <span>Book a Shipment</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Zero
                  Data Loss Cross-Channel
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Groq AI
                  Recommendations
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />{" "}
                  Real-Time Stage Simulation
                </span>
              </div>
            </div>

            {/* Right Hero Showcase: Interactive Live Rate & AI Preview Widget */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-white border border-[#e2ebd0] shadow-xl p-6 sm:p-7 space-y-5 relative">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#d9ff69] text-slate-950 font-bold flex items-center justify-center text-xs font-bold">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-[#17231b] uppercase tracking-wider">
                        Instant Rate Engine Preview
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        Live multi-variable pricing algorithm
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700">
                    REAL-TIME
                  </span>
                </div>

                {/* Interactive Controls */}
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Package Weight</span>
                      <span className="text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] font-extrabold">
                        {calcWeight} kg
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="25"
                      step="0.5"
                      value={calcWeight}
                      onChange={(e) =>
                        setCalcWeight(parseFloat(e.target.value))
                      }
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#d9ff69]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Service Level
                      </label>
                      <select
                        value={calcType}
                        onChange={(e) => setCalcType(e.target.value as any)}
                        className="w-full p-2 text-xs rounded-xl border border-[#e2ebd0] bg-white text-slate-800 font-semibold"
                      >
                        <option value="express">Express Priority</option>
                        <option value="standard">Standard Ground</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Cargo Type
                      </label>
                      <select
                        value={calcProduct}
                        onChange={(e) => setCalcProduct(e.target.value)}
                        className="w-full p-2 text-xs rounded-xl border border-[#e2ebd0] bg-white text-slate-800 font-semibold"
                      >
                        <option value="fragile">Fragile Sensors</option>
                        <option value="electronics">Electronics</option>
                        <option value="standard">Standard Goods</option>
                        <option value="documents">Documents</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Output Rate & CTA */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-[#e2ebd0] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Estimated Freight Rate
                    </span>
                    <span className="text-2xl font-black text-[#17231b]">
                      {formatCurrency(previewRate)}
                    </span>
                  </div>

                  <Link
                    href={`/booking?delivery_type=${calcType}&product_type=${calcProduct}&weight=${calcWeight}`}
                    className="px-4 py-2.5 rounded-xl bg-[#d9ff69] hover:bg-[#cbf748] text-slate-950 font-bold font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <p className="text-[11px] text-slate-400 text-center">
                  Calculated using volumetric dimension matrices & historical
                  carrier lane data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution Section */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]">
              The Multi-Channel Challenge
            </h2>
            <h3 className="text-3xl sm:text-[#d9ff69]xl font-black text-[#17231b] tracking-tight">
              Why traditional shipping experiences feel fragmented
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Modern shippers start bookings on one channel and often lose
              progress, face ambiguous delivery dates, and must repeatedly
              re-enter payment credentials. One Logistics solves this at the
              architectural core.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-[#e2ebd0] space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-[#17231b]">
                The Fragmented Experience
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span> Lost
                  booking progress when switching between mobile and web
                  browsers.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span> Opaque
                  estimated delivery times without explanatory confidence
                  factors.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span> Manual
                  repetitive entry of sender addresses, payment types, and
                  recipient specs.
                </li>
              </ul>
            </div>

            {/* The One Logistics Way */}
            <div className="p-8 rounded-3xl bg-[#edf7cd]/50 dark:bg-[#25372b]/50 border border-[#d9ff69] dark:border-[#2d4234] space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-[#d9ff69] text-slate-950 font-bold flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-[#17231b]">
                The One Logistics Experience
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>{" "}
                  Universal saved drafts with 1-click resumption on any device
                  at any step.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>{" "}
                  Groq-powered AI Assistant recommending fastest linehauls and
                  pre-filling forms.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>{" "}
                  Real-time status simulation engine and automated email
                  updates.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section
        id="features"
        className="py-20 lg:py-28 bg-white border-b border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]">
              Enterprise Feature Matrix
            </h2>
            <h3 className="text-3xl sm:text-[#d9ff69]xl font-black text-[#17231b] tracking-tight">
              Engineered for seamless multi-channel logistics
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-7 rounded-3xl bg-white border border-[#e2ebd0] shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-3"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center border border-slate-100`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-[#17231b]">
                    {f.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Workflow */}
      <section
        id="how-it-works"
        className="py-20 bg-slate-50 border-b border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]">
              End-To-End Architecture
            </h2>
            <h3 className="text-3xl sm:text-[#d9ff69]xl font-black text-[#17231b] tracking-tight">
              How the unified booking journey operates
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowSteps.map((ws) => (
              <div
                key={ws.num}
                className="p-6 rounded-3xl bg-white border border-[#e2ebd0] shadow-xs relative"
              >
                <span className="text-3xl font-black text-slate-200 absolute top-4 right-5">
                  0{ws.num}
                </span>
                <h4 className="text-sm font-extrabold text-[#17231b] mb-2">
                  {ws.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {ws.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call To Action */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="w-16 h-16 rounded-3xl bg-[#d9ff69] text-slate-950 font-bold flex items-center justify-center mx-auto shadow-md">
            <Truck className="w-8 h-8" />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-[#17231b] tracking-tight">
              Ready for the unified logistics standard?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Launch the live application, test the status progression
              simulation, and book shipments with AI assistance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl bg-[#d9ff69] hover:bg-[#cbf748] text-slate-950 font-bold font-extrabold text-sm shadow-md shadow-amber-500/10 transition-all flex items-center gap-2"
            >
              <span>Sign In to Access Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl bg-white border border-[#e2ebd0] hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xs transition-colors"
            >
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#e2ebd0] bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Truck className="w-4 h-4 text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]" />
            <span>ONE LOGISTICS EXPERIENCE</span>
          </div>
          <p>© 2026 One Logistics Experience. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
