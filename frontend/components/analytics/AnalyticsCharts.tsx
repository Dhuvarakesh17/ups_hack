"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { AnalyticsFullResponse } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface AnalyticsChartsProps {
  data: AnalyticsFullResponse;
}

const STATUS_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#f43f5e", "#8b5cf6"];
const DELIVERY_COLORS = ["#2563eb", "#f59e0b"];

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  return (
    <div className="space-y-6">
      {/* 2-Column Grid: Monthly Shipments & Monthly Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Monthly Shipment Volume (Bar Chart) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0]/80 dark:border-[#2d4234] shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#17231b] dark:text-white">Monthly Shipment Volume</h3>
            <p className="text-xs text-slate-500">Volume distribution of packages booked and delivered</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly_shipments}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    color: "#fff",
                    borderRadius: "12px",
                    fontSize: "12px",
                    border: "none"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="delivered" name="Delivered" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="in_transit" name="In Transit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Amount Spent Per Month (Area Chart) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0]/80 dark:border-[#2d4234] shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#17231b] dark:text-white">Monthly Logistics Spend</h3>
            <p className="text-xs text-slate-500">Total freight spend trends across monthly billing cycles</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_spending}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), "Spent"]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    color: "#fff",
                    borderRadius: "12px",
                    fontSize: "12px",
                    border: "none"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name="Total Spend"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#spendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3-Column Grid: Distributions & Success Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 3. Shipment Status Distribution (Donut Chart) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0]/80 dark:border-[#2d4234] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#17231b] dark:text-white">Status Breakdown</h3>
            <p className="text-xs text-slate-500">Current state of active & completed shipments</p>
          </div>
          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.status_distribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {data.status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} shipments`, name]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    color: "#fff",
                    borderRadius: "12px",
                    fontSize: "12px",
                    border: "none"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-100 dark:border-[#2d4234] text-[11px]">
            {data.status_distribution.map((s, i) => (
              <span key={s.name} className="flex items-center gap-1 text-slate-600 dark:text-[#9bb3a1] font-medium">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length] }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>

        {/* 4. Delivery Type Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0]/80 dark:border-[#2d4234] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#17231b] dark:text-white">Service Level Share</h3>
            <p className="text-xs text-slate-500">Standard Ground vs Express Air Priority</p>
          </div>
          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.delivery_type_distribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={(entry: any) => `${entry.name} ${entry.percentage || Math.round((entry.percent || 0) * 100)}%`}
                >
                  {data.delivery_type_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DELIVERY_COLORS[index % DELIVERY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} shipments`, name]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    color: "#fff",
                    borderRadius: "12px",
                    fontSize: "12px",
                    border: "none"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-100 dark:border-[#2d4234] text-[11px]">
            {data.delivery_type_distribution.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-[#edf7cd]/90">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DELIVERY_COLORS[i % DELIVERY_COLORS.length] }} />
                {d.name}: {d.percentage}%
              </span>
            ))}
          </div>
        </div>

        {/* 5. Monthly Success Rate (Line Chart) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0]/80 dark:border-[#2d4234] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#17231b] dark:text-white">Delivery Reliability Trend</h3>
            <p className="text-xs text-slate-500">Historical delivery success rate over time</p>
          </div>
          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthly_success_rate}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, "Success Rate"]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    color: "#fff",
                    borderRadius: "12px",
                    fontSize: "12px",
                    border: "none"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="success_rate"
                  name="Success Rate"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-center text-xs font-bold text-emerald-800 dark:text-emerald-300">
            Overall Reliability: {data.kpis.success_rate}%
          </div>
        </div>
      </div>
    </div>
  );
}

