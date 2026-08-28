"use client";

import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { api } from "@/lib/api";
import { AnalyticsFullResponse } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsFullResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.analytics.getFull();
      setData(res);
    } catch (e) {
      console.error("Failed to load analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <AppShell title="Analytics & Performance">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231b] dark:text-white tracking-tight">
            Logistics Intelligence & Insights
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9bb3a1] mt-0.5">
            Aggregated PostgreSQL metrics covering lane spend, service tier velocity, and reliability indices.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-3.5 py-2 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-white dark:bg-[#25372b] hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-[#edf7cd] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {loading || !data ? (
        <div className="p-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Aggregating database shipping records and lane trends...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Performance Stat Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0]/80 dark:border-[#2d4234] shadow-xs">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Total Volume</span>
              <h3 className="text-2xl font-black text-[#17231b] dark:text-white">{data.kpis.total_shipments}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{data.kpis.completed_shipments} completed deliveries</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0]/80 dark:border-[#2d4234] shadow-xs">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Total Logistics Spend</span>
              <h3 className="text-2xl font-black text-[#17231b] dark:text-white">{formatCurrency(data.kpis.total_spent)}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Average {formatCurrency(data.kpis.average_spent)} / package</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0]/80 dark:border-[#2d4234] shadow-xs">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Delivery Success Rate</span>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{data.kpis.success_rate}%</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Calculated from terminal statuses</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0]/80 dark:border-[#2d4234] shadow-xs">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Active Pipeline</span>
              <h3 className="text-2xl font-black text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] dark:text-[#d9ff69]">{data.kpis.in_progress_shipments}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Packages currently en route</p>
            </div>
          </div>

          {/* Detailed Recharts Visualizations */}
          <AnalyticsCharts data={data} />
        </div>
      )}
    </AppShell>
  );
}

