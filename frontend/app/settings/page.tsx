"use client";

import React, { useState, useEffect } from "react";
import { Save, CheckCircle2, Zap, Moon, Sun, Truck, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { UserPreferences, PaymentMode, BillingLocation } from "@/types";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const { success, error } = useToast();
  const { theme, setTheme } = useTheme();

  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    theme: "light",
    preferred_delivery_type: "express",
    preferred_payment_mode: "upi",
    preferred_payment_location: "sender"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.preferences
      .get()
      .then((res) => {
        setPreferences(res);
        if (res.theme === "dark" || res.theme === "light") {
          setTheme(res.theme);
        }
      })
      .catch((e) => console.error("Failed to load preferences:", e))
      .finally(() => setLoading(false));
  }, [setTheme]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.preferences.update(preferences);
      setPreferences(res);

      if (res.theme === "dark" || res.theme === "light") {
        setTheme(res.theme);
      }

      success("Shipping and interface preferences saved to your unified profile.", "Settings Saved");
    } catch (err: any) {
      error(err.message || "Failed to update preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title="Settings & Preferences">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231b] dark:text-[#edf7cd] tracking-tight">
            User Preferences & Shipping Defaults
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9bb3a1] mt-0.5">
            Configure your default service levels, billing location, and payment gateway for 1-click booking.
          </p>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#17231b] dark:text-[#edf7cd] mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading user preferences...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Theme Preference */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0] dark:border-[#2d4234] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#e2ebd0] dark:border-[#2d4234] pb-3">
                <Sun className="w-4 h-4 text-[#17231b] dark:text-[#edf7cd]" />
                <h3 className="text-sm font-extrabold text-[#17231b] dark:text-[#edf7cd]">Interface Theme</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setPreferences({ ...preferences, theme: "light" });
                    setTheme("light");
                  }}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                    (preferences.theme === "light" || theme === "light")
                      ? "border-[#17231b] dark:border-[#edf7cd] bg-[#edf7cd] text-[#17231b] font-black shadow-xs"
                      : "border-[#e2ebd0] dark:border-[#2d4234] text-slate-600 dark:text-[#9bb3a1]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sun className="w-5 h-5 text-[#17231b]" />
                    <div className="text-left">
                      <span className="font-bold text-xs block">Light Mode</span>
                      <span className="text-[10px] text-slate-500">Soft Cream Interface</span>
                    </div>
                  </div>
                  {(preferences.theme === "light" || theme === "light") && <CheckCircle2 className="w-4 h-4 text-[#17231b]" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPreferences({ ...preferences, theme: "dark" });
                    setTheme("dark");
                  }}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                    (preferences.theme === "dark" || theme === "dark")
                      ? "border-[#17231b] dark:border-[#edf7cd] bg-[#edf7cd] text-[#17231b] font-black shadow-xs"
                      : "border-[#e2ebd0] dark:border-[#2d4234] text-slate-600 dark:text-[#9bb3a1]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Moon className="w-5 h-5 text-[#17231b]" />
                    <div className="text-left">
                      <span className="font-bold text-xs block">Dark Mode</span>
                      <span className="text-[10px] text-slate-500">Deep Forest Dark (#17231b)</span>
                    </div>
                  </div>
                  {(preferences.theme === "dark" || theme === "dark") && <CheckCircle2 className="w-4 h-4 text-[#17231b]" />}
                </button>
              </div>
            </div>

            {/* Default Shipping & Delivery Preferences */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0] dark:border-[#2d4234] shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#e2ebd0] dark:border-[#2d4234] pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#17231b] dark:text-[#edf7cd]" />
                  <h3 className="text-sm font-extrabold text-[#17231b] dark:text-[#edf7cd]">Default Shipping Service</h3>
                </div>
                <span className="text-[11px] text-[#17231b] dark:text-[#edf7cd] font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-[#17231b] dark:text-[#edf7cd] fill-[#17231b] dark:fill-[#edf7cd]" /> Auto-fills in Step 4
                </span>
              </div>

              {/* Delivery Service */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-2">
                  Preferred Delivery Speed
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, preferred_delivery_type: "standard" })}
                    className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      preferences.preferred_delivery_type === "standard"
                        ? "border-[#17231b] dark:border-[#edf7cd] bg-[#edf7cd] text-[#17231b] shadow-xs font-black"
                        : "border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-slate-800 dark:text-[#edf7cd]"
                    }`}
                  >
                    <p className="font-extrabold">Standard Ground</p>
                    <p className="text-[10px] opacity-80 mt-0.5">3-5 business days economical</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, preferred_delivery_type: "express" })}
                    className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      preferences.preferred_delivery_type === "express"
                        ? "border-[#17231b] dark:border-[#edf7cd] bg-[#edf7cd] text-[#17231b] shadow-xs font-black"
                        : "border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-slate-800 dark:text-[#edf7cd]"
                    }`}
                  >
                    <p className="font-extrabold">Express Priority</p>
                    <p className="text-[10px] opacity-80 mt-0.5">1-2 business days expedited</p>
                  </button>
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-2">
                  Preferred Payment Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["upi", "cash"] as PaymentMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, preferred_payment_mode: mode })}
                      className={`p-3.5 rounded-2xl border text-xs font-bold capitalize transition-all text-left cursor-pointer ${
                        preferences.preferred_payment_mode === mode
                          ? "border-[#17231b] dark:border-[#edf7cd] bg-[#edf7cd] text-[#17231b] shadow-xs font-black"
                          : "border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-slate-800 dark:text-[#edf7cd]"
                      }`}
                    >
                      <p className="font-extrabold">{mode === "upi" ? "UPI / Instant Digital" : "Cash on Delivery"}</p>
                      <p className="text-[10px] opacity-80 mt-0.5">
                        {mode === "upi" ? "Instant QR / VPA transfer" : "Collected upon pickup/drop"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Billing Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-2">
                  Default Billing Location
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["sender", "receiver"] as BillingLocation[]).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, preferred_payment_location: loc })}
                      className={`p-3.5 rounded-2xl border text-xs font-bold capitalize transition-all text-left cursor-pointer ${
                        preferences.preferred_payment_location === loc
                          ? "border-[#17231b] dark:border-[#edf7cd] bg-[#edf7cd] text-[#17231b] shadow-xs font-black"
                          : "border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-slate-800 dark:text-[#edf7cd]"
                      }`}
                    >
                      <p className="font-extrabold">{loc === "sender" ? "Billed to Sender" : "Billed to Receiver"}</p>
                      <p className="text-[10px] opacity-80 mt-0.5">
                        {loc === "sender" ? "Sender pays freight fees" : "Recipient pays on arrival"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-2xl bg-[#17231b] hover:bg-[#25372b] dark:bg-[#edf7cd] dark:hover:bg-[#e4f0bf] text-[#edf7cd] dark:text-[#17231b] font-black text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save All Preferences</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
