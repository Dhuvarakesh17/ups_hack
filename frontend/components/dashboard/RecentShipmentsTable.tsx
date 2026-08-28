"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Package,
  ExternalLink,
  PlusCircle,
  Truck,
  ChevronDown,
  X,
} from "lucide-react";
import { Shipment } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatusSimulationButton } from "@/components/dashboard/StatusSimulationButton";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { formatDate, formatDateTime } from "@/lib/utils";

interface RecentShipmentsTableProps {
  shipments: Shipment[];
  loading: boolean;
  onShipmentUpdated: (updated: Shipment) => void;
}

export function RecentShipmentsTable({
  shipments,
  loading,
  onShipmentUpdated,
}: RecentShipmentsTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredShipments = shipments.filter((s) => {
    const matchesSearch =
      s.shipment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.receiver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.receiver_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sender_city.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "all") return true;
    if (statusFilter === "in_progress") {
      return [
        "created",
        "picked_up",
        "in_transit",
        "out_for_delivery",
      ].includes(s.current_status);
    }
    return s.current_status === statusFilter;
  });

  return (
    <div className="rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0] dark:border-[#2d4234] shadow-xs overflow-hidden">
      {/* Table Header & Filters */}
      <div className="p-4 sm:p-6 border-b border-[#e2ebd0] dark:border-[#2d4234] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-[#17231b] dark:text-[#edf7cd]">
              Active Shipments
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#edf7cd] text-[#17231b]">
              {filteredShipments.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#9bb3a1] mt-0.5">
            Monitor real-time status and simulate carrier stage progression
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tracking, city, item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-[#17231b] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#d9ff69] sm:w-56"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-[#17231b] dark:text-[#edf7cd] focus:outline-hidden focus:ring-2 focus:ring-[#d9ff69]"
          >
            <option value="all">All Statuses</option>
            <option value="in_progress">All In Progress</option>
            <option value="in_transit">In Transit (Demo)</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="delayed">Delayed</option>
            <option value="exception">Exceptions</option>
          </select>

          {/* Book New Shipment Shortcut */}
          <Link
            href="/booking"
            className="px-3.5 py-2 text-xs font-black rounded-xl bg-[#17231b] dark:bg-[#d9ff69] hover:bg-[#223529] dark:hover:bg-[#cbf748] text-[#d9ff69] dark:text-[#17231b] flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Shipment</span>
          </Link>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="p-6">
          <TableSkeleton rows={5} />
        </div>
      ) : filteredShipments.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#edf7cd] text-[#17231b] mx-auto flex items-center justify-center mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-[#17231b] dark:text-[#edf7cd] mb-1">
            No shipments found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {searchTerm || statusFilter !== "all"
              ? "No shipments match your current search or filter criteria."
              : "You haven't placed any bookings yet. Start your first multi-channel booking journey!"}
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#17231b] dark:bg-[#d9ff69] text-[#d9ff69] dark:text-[#17231b] text-xs font-black hover:opacity-90 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Shipment</span>
          </Link>
        </div>
      ) : (
        <>
          {/* ========================================================= */}
          {/* MOBILE VIEW: Compact View + Expandable Detail Card         */}
          {/* No horizontal scrolling; shows Tracking, Page, Route, Arrow*/}
          {/* ========================================================= */}
          <div className="block md:hidden divide-y divide-[#e2ebd0] dark:divide-[#2d4234]">
            {filteredShipments.map((s) => {
              const isExpanded = expandedId === s.id;
              return (
                <div
                  key={s.id}
                  className="p-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-[#25372b]/30"
                >
                  {/* Compact Mobile Row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-[#edf7cd] text-[#17231b] flex items-center justify-center shrink-0 mt-0.5">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <Link
                            href={`/shipments/${s.id}`}
                            className="font-black text-[#17231b] dark:text-[#d9ff69] hover:underline text-xs flex items-center gap-1"
                          >
                            <span>{s.shipment_number}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </Link>
                          <StatusBadge status={s.current_status} />
                        </div>
                        <p className="text-xs font-bold text-[#17231b] dark:text-white truncate">
                          {s.product_name}
                        </p>
                        {/* Route info */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-[#9bb3a1] mt-1 truncate">
                          <span className="font-semibold">
                            {s.sender_city || "Origin"}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-extrabold text-[#17231b] dark:text-[#edf7cd]">
                            {s.receiver_city || "Destination"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Down Arrow / Expand Button */}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      aria-label={
                        isExpanded ? "Close details card" : "Open details card"
                      }
                      className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                        isExpanded
                          ? "bg-[#17231b] text-[#d9ff69] dark:bg-[#d9ff69] dark:text-[#17231b] border-transparent"
                          : "bg-slate-100 dark:bg-[#25372b] text-slate-700 dark:text-[#edf7cd] border-[#e2ebd0] dark:border-[#2d4234] hover:bg-[#edf7cd]"
                      }`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Expandable Details Card with Close Button */}
                  {isExpanded && (
                    <div className="mt-3.5 p-4 rounded-2xl bg-white dark:bg-[#25372b] border border-[#e2ebd0] dark:border-[#2d4234] shadow-md space-y-3.5 transition-all">
                      {/* Card Header & Close */}
                      <div className="flex items-center justify-between border-b border-[#e2ebd0] dark:border-[#2d4234] pb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#17231b] dark:text-[#d9ff69]">
                            Shipment Overview
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedId(null)}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-500 dark:text-[#9bb3a1] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1f2e24] flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Close</span>
                        </button>
                      </div>

                      {/* Origin & Destination Grid */}
                      <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1f2e24] border border-[#e2ebd0]/60 dark:border-[#2d4234]/60">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                            From (Sender)
                          </span>
                          <p className="font-bold text-[#17231b] dark:text-[#edf7cd] truncate">
                            {s.sender_name}
                          </p>
                          <p className="text-slate-500 dark:text-[#9bb3a1] truncate">
                            {s.sender_city}, {s.sender_state}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {s.sender_phone || s.sender_email}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1f2e24] border border-[#e2ebd0]/60 dark:border-[#2d4234]/60">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                            To (Recipient)
                          </span>
                          <p className="font-bold text-[#17231b] dark:text-[#edf7cd] truncate">
                            {s.receiver_name}
                          </p>
                          <p className="text-slate-500 dark:text-[#9bb3a1] truncate">
                            {s.receiver_city}, {s.receiver_state}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {s.receiver_phone || s.receiver_email}
                          </p>
                        </div>
                      </div>

                      {/* Package & Pricing Specs */}
                      <div className="p-3 rounded-xl bg-[#edf7cd]/40 dark:bg-[#1f2e24] border border-[#d9ff69]/30 dark:border-[#2d4234] grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-[10px] text-slate-400 block">
                            Service Level
                          </span>
                          <span className="font-extrabold capitalize text-[#17231b] dark:text-[#edf7cd]">
                            {s.delivery_type}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">
                            Weight & Type
                          </span>
                          <span className="font-extrabold text-[#17231b] dark:text-[#edf7cd]">
                            {s.weight} kg • {s.product_type}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">
                            Payment Mode
                          </span>
                          <span className="font-extrabold capitalize text-[#17231b] dark:text-[#edf7cd]">
                            {s.payment_mode} ({s.billing_location})
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">
                            Total Amount
                          </span>
                          <span className="font-extrabold text-[#17231b] dark:text-[#d9ff69]">
                            ${(s.total_amount || 0.0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Estimated Arrival */}
                      <div className="flex items-center justify-between text-[11px] px-1 py-0.5">
                        <span className="text-slate-500 dark:text-[#9bb3a1]">
                          Estimated Arrival:
                        </span>
                        <span className="font-black text-[#17231b] dark:text-[#edf7cd]">
                          {s.estimated_delivery_time
                            ? formatDateTime(s.estimated_delivery_time)
                            : "Calculating..."}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[#e2ebd0] dark:border-[#2d4234]">
                        <Link
                          href={`/shipments/${s.id}`}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#17231b] dark:bg-[#d9ff69] text-[#edf7cd] dark:text-[#17231b] text-xs font-black flex items-center justify-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity"
                        >
                          <span>Full Tracking Page</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <div
                          className="shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <StatusSimulationButton
                            shipment={s}
                            onStatusUpdated={onShipmentUpdated}
                            size="sm"
                            showLabel={true}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ========================================================= */}
          {/* DESKTOP VIEW: Standard Full Data Table                    */}
          {/* ========================================================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e2ebd0] dark:border-[#2d4234] text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-[#9bb3a1] bg-[#edf7cd]/20 dark:bg-[#25372b]/30">
                  <th className="py-3.5 px-6">Tracking & Package</th>
                  <th className="py-3.5 px-6">Route</th>
                  <th className="py-3.5 px-6">Service</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Estimated Arrival</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2ebd0] dark:divide-[#2d4234] text-xs">
                {filteredShipments.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => router.push(`/shipments/${s.id}`)}
                    className="hover:bg-[#edf7cd]/30 dark:hover:bg-[#25372b]/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#edf7cd] text-[#17231b] flex items-center justify-center shrink-0 group-hover:bg-[#d9ff69] transition-colors">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-black text-[#17231b] dark:text-[#d9ff69] group-hover:underline flex items-center gap-1">
                            {s.shipment_number}
                          </span>
                          <span className="text-[#17231b] dark:text-[#edf7cd] font-semibold block truncate max-w-[180px] sm:max-w-[240px]">
                            {s.product_name}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-[#edf7cd]/90 font-medium">
                        <span>
                          {s.sender_city}, {s.sender_state}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-extrabold text-[#17231b] dark:text-white">
                          {s.receiver_city}, {s.receiver_state}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                        To: {s.receiver_name}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-block font-extrabold capitalize text-[#17231b] dark:text-[#edf7cd]">
                        {s.delivery_type}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {s.weight} kg • {s.product_type}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={s.current_status} />
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-bold text-[#17231b] dark:text-[#edf7cd]">
                        {s.estimated_delivery_time
                          ? formatDateTime(s.estimated_delivery_time)
                          : "Calculating..."}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Booked {formatDate(s.created_at)}
                      </span>
                    </td>

                    <td
                      className="py-4 px-6 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/shipments/${s.id}`}
                          className="px-3 py-1.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-white dark:bg-[#25372b] text-[#17231b] dark:text-[#edf7cd] font-black hover:bg-[#edf7cd] text-xs transition-colors flex items-center gap-1"
                        >
                          <span>Details</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>

                        <StatusSimulationButton
                          shipment={s}
                          onStatusUpdated={onShipmentUpdated}
                          size="sm"
                          showLabel={true}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
