"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Printer
} from "lucide-react";
import { ShipmentDetailResponse, Shipment } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatusSimulationButton } from "@/components/dashboard/StatusSimulationButton";
import { StatusTimeline } from "./StatusTimeline";
import { PredictionEngineCard } from "./PredictionEngineCard";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ShipmentDetailsViewProps {
  initialData: ShipmentDetailResponse;
}

export function ShipmentDetailsView({ initialData }: ShipmentDetailsViewProps) {
  const [data, setData] = useState<ShipmentDetailResponse>(initialData);

  const handleStatusUpdated = (updatedShipment: Shipment) => {
    setData((prev) => ({
      ...prev,
      ...updatedShipment,
      status_history: [
        {
          id: Math.random().toString(),
          shipment_id: updatedShipment.id,
          status: updatedShipment.current_status,
          location: "Carrier Checkpoint Updated",
          note: `Package moved to ${updatedShipment.current_status.replace("_", " ")}`,
          timestamp: new Date().toISOString()
        },
        ...prev.status_history
      ]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-white dark:bg-[#1f2e24] hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-[#edf7cd]/90 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-[#17231b] dark:text-white tracking-tight">
                {data.shipment_number}
              </h1>
              <StatusBadge status={data.current_status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-[#9bb3a1] mt-0.5">
              Booked on {formatDate(data.created_at)} • {data.product_name}
            </p>
          </div>
        </div>

        {/* Action Buttons & Status Simulation */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-white dark:bg-[#25372b] text-slate-700 dark:text-[#edf7cd] text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Label</span>
          </button>

          <StatusSimulationButton
            shipment={data}
            onStatusUpdated={handleStatusUpdated}
            size="md"
            showLabel={true}
          />
        </div>
      </div>

      {/* AI Prediction Engine Card */}
      <PredictionEngineCard prediction={data.prediction} />

      {/* Main Details Grid: Left Information Cards, Right Status Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Origin, Destination & Package Specs */}
        <div className="lg:col-span-1 space-y-6">
          {/* Origin & Destination Addresses */}
          <div className="rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0] dark:border-[#2d4234] p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-extrabold text-[#17231b] dark:text-white uppercase tracking-wider">
              Routing Information
            </h3>

            {/* Sender */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#edf7cd]/50 dark:bg-[#25372b] text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-[#9bb3a1] uppercase">From (Origin)</span>
                <p className="font-extrabold text-[#17231b] dark:text-white text-sm">{data.sender_name}</p>
                <p className="text-slate-600 dark:text-[#edf7cd]/90">{data.sender_address}</p>
                <p className="text-slate-600 dark:text-[#edf7cd]/90">
                  {data.sender_city}, {data.sender_state} {data.sender_postal_code}
                </p>
                <p className="text-slate-400 dark:text-[#9bb3a1] text-[11px] pt-0.5">{data.sender_email} • {data.sender_phone}</p>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-[#25372b]" />

            {/* Receiver */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-[#9bb3a1] uppercase">To (Destination)</span>
                <p className="font-extrabold text-[#17231b] dark:text-white text-sm">{data.receiver_name}</p>
                <p className="text-slate-600 dark:text-[#edf7cd]/90">{data.receiver_address}</p>
                <p className="text-slate-600 dark:text-[#edf7cd]/90">
                  {data.receiver_city}, {data.receiver_state} {data.receiver_postal_code}
                </p>
                <p className="text-slate-400 dark:text-[#9bb3a1] text-[11px] pt-0.5">{data.receiver_email} • {data.receiver_phone}</p>
              </div>
            </div>
          </div>

          {/* Product Specifications & Payment */}
          <div className="rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0] dark:border-[#2d4234] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#17231b] dark:text-white uppercase tracking-wider">
              Package & Service Level
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#25372b]/50">
                <span className="text-[10px] text-slate-400 dark:text-[#9bb3a1] block font-semibold">Service Type</span>
                <span className="font-extrabold text-[#17231b] dark:text-white capitalize">
                  {data.delivery_type} Linehaul
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#25372b]/50">
                <span className="text-[10px] text-slate-400 dark:text-[#9bb3a1] block font-semibold">Classification</span>
                <span className="font-extrabold text-[#17231b] dark:text-white capitalize">
                  {data.product_type}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#25372b]/50">
                <span className="text-[10px] text-slate-400 dark:text-[#9bb3a1] block font-semibold">Weight & Dimensions</span>
                <span className="font-extrabold text-[#17231b] dark:text-white">
                  {data.weight} kg ({data.length}×{data.width}×{data.height}cm)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#25372b]/50">
                <span className="text-[10px] text-slate-400 dark:text-[#9bb3a1] block font-semibold">Total Price</span>
                <span className="font-extrabold text-[#17231b] dark:text-[#d9ff69]">
                  {formatCurrency(data.total_amount)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#edf7cd]/50/60 dark:bg-[#25372b]/70 border border-amber-200 dark:border-[#2d4234] text-[11px] text-slate-600 dark:text-[#edf7cd]/90">
              Payment mode: <strong className="uppercase">{data.payment_mode}</strong> • Billed to{" "}
              <strong className="capitalize">{data.billing_location}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Live Tracking Timeline */}
        <div className="lg:col-span-2">
          <StatusTimeline currentStatus={data.current_status} history={data.status_history} />
        </div>
      </div>
    </div>
  );
}
