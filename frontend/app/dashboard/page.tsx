"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PlusCircle,
  FileText,
  Sparkles
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KPICards } from "@/components/dashboard/KPICards";
import { RecentShipmentsTable } from "@/components/dashboard/RecentShipmentsTable";
import { api } from "@/lib/api";
import { DashboardKPIs, Shipment } from "@/types";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [kpisRes, shipmentsRes] = await Promise.all([
        api.analytics.getDashboardKPIs(),
        api.shipments.getAll({ limit: 20 })
      ]);
      setKpis(kpisRes);
      setShipments(shipmentsRes);
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleShipmentUpdated = (updated: Shipment) => {
    setShipments((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    api.analytics.getDashboardKPIs().then((res) => setKpis(res));
  };

  return (
    <AppShell title="Operations Dashboard">
      {/* Top Banner / Welcome Action */}
      <div className="rounded-3xl bg-white dark:bg-[#1f2e24] text-[#17231b] dark:text-white p-6 sm:p-8 shadow-xs border border-[#e2ebd0] dark:border-[#2d4234] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf7cd]/50 dark:bg-[#25372b] text-amber-800 dark:text-[#d9ff69] border border-amber-200 dark:border-[#2d4234] text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5 text-[#d9ff69]" />
            <span>Multi-Channel Logistics Platform</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome to One Logistics
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9bb3a1] leading-relaxed">
            All your shipment bookings, saved cross-channel drafts, predictive estimated arrivals, and real-time carrier stage simulations in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <Link
            href="/booking"
            className="px-5 py-3 rounded-2xl bg-[#d9ff69] hover:bg-[#cbf748] text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Book New Shipment</span>
          </Link>

          <Link
            href="/drafts"
            className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-[#25372b] dark:hover:bg-zinc-700 text-slate-800 dark:text-[#edf7cd] font-bold text-xs border border-[#e2ebd0] dark:border-[#2d4234] transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-slate-600 dark:text-[#9bb3a1]" />
            <span>Resume Drafts</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards kpis={kpis} loading={loading} />

      {/* Recent Shipments with Live Simulation Buttons */}
      <RecentShipmentsTable
        shipments={shipments}
        loading={loading}
        onShipmentUpdated={handleShipmentUpdated}
      />
    </AppShell>
  );
}
