"use client";

import React from "react";
import { Package, Clock, CheckCircle2, FileText, DollarSign, TrendingUp } from "lucide-react";
import { DashboardKPIs } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface KPICardsProps {
  kpis: DashboardKPIs | null;
  loading?: boolean;
}

export function KPICards({ kpis, loading }: KPICardsProps) {
  const cards = [
    {
      title: "Total Shipments",
      value: kpis ? kpis.total_shipments : 0,
      subtext: "All-time bookings",
      icon: Package,
      textColor: "text-[#17231b] dark:text-[#d9ff69]",
      bgLight: "bg-[#edf7cd] dark:bg-[#25372b]"
    },
    {
      title: "In Progress",
      value: kpis ? kpis.in_progress_shipments : 0,
      subtext: "Live active transit",
      icon: Clock,
      textColor: "text-amber-700 dark:text-amber-400",
      bgLight: "bg-amber-50 dark:bg-amber-950/40"
    },
    {
      title: "Delivered",
      value: kpis ? kpis.completed_shipments : 0,
      subtext: "Completed journeys",
      icon: CheckCircle2,
      textColor: "text-emerald-700 dark:text-[#d9ff69]",
      bgLight: "bg-emerald-50 dark:bg-emerald-950/40"
    },
    {
      title: "Saved Drafts",
      value: kpis ? kpis.drafts_count : 0,
      subtext: "Ready to resume",
      icon: FileText,
      textColor: "text-[#17231b] dark:text-[#d9ff69]",
      bgLight: "bg-[#edf7cd] dark:bg-[#25372b]"
    },
    {
      title: "Total Logistics Spend",
      value: kpis ? formatCurrency(kpis.total_spent) : "$0.00",
      subtext: kpis ? `Avg ${formatCurrency(kpis.average_spent)} / shipment` : "$0.00 avg",
      icon: DollarSign,
      textColor: "text-slate-700 dark:text-[#edf7cd]/90",
      bgLight: "bg-slate-100 dark:bg-[#25372b]/40"
    },
    {
      title: "Delivery Success Rate",
      value: kpis ? `${kpis.success_rate}%` : "100%",
      subtext: "On-time reliability",
      icon: TrendingUp,
      textColor: "text-emerald-700 dark:text-[#d9ff69]",
      bgLight: "bg-emerald-50 dark:bg-emerald-950/40"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0] dark:border-[#2d4234] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-[#9bb3a1] leading-tight">
                {c.title}
              </span>
              <div className={`w-8 h-8 rounded-xl ${c.bgLight} ${c.textColor} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              {loading ? (
                <div className="h-7 w-16 bg-[#edf7cd]/60 dark:bg-[#25372b] animate-pulse rounded-md mb-1" />
              ) : (
                <h3 className="text-xl sm:text-2xl font-black text-[#17231b] dark:text-[#edf7cd] tracking-tight">
                  {c.value}
                </h3>
              )}
              <p className="text-[11px] text-slate-400 dark:text-[#9bb3a1] font-medium">{c.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
