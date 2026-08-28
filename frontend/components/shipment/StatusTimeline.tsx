"use client";

import React from "react";
import { CheckCircle2, Clock, Truck, Package, AlertCircle } from "lucide-react";
import { ShipmentStatus, ShipmentStatusHistory } from "@/types";
import { formatDateTime } from "@/lib/utils";

interface StatusTimelineProps {
  currentStatus: ShipmentStatus | string;
  history: ShipmentStatusHistory[];
}

const MILESTONES: { status: ShipmentStatus; label: string; desc: string }[] = [
  { status: "created", label: "Shipment Created", desc: "Digital label and manifest generated" },
  { status: "picked_up", label: "Picked Up by Courier", desc: "Cargo picked up from origin facility" },
  { status: "in_transit", label: "In Transit Linehaul", desc: "Dispatched to regional distribution hub" },
  { status: "out_for_delivery", label: "Out for Delivery", desc: "Loaded onto local final-mile vehicle" },
  { status: "delivered", label: "Delivered", desc: "Received and signed at destination address" }
];

export function StatusTimeline({ currentStatus, history }: StatusTimelineProps) {
  const isException = currentStatus === "delayed" || currentStatus === "exception" || currentStatus === "failed";

  const getStatusIndex = (st: string) => {
    return MILESTONES.findIndex((m) => m.status === st);
  };

  const currentIndex = getStatusIndex(currentStatus);

  const getHistoryForStatus = (st: string) => {
    return history.find((h) => h.status === st);
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0] dark:border-[#2d4234] p-6 sm:p-8 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-extrabold text-[#17231b] dark:text-white">Shipment Tracking Timeline</h3>
          <p className="text-xs text-slate-500 dark:text-[#9bb3a1]">Live checkpoint milestone logs and carrier timestamps</p>
        </div>

        {isException && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#edf7cd]/50 dark:bg-amber-950 text-[#17231b] dark:text-[#d9ff69] dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Active Notice
          </span>
        )}
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800">
        {MILESTONES.map((milestone, idx) => {
          const isPassed = currentIndex >= idx && currentIndex !== -1;
          const isCurrent = milestone.status === currentStatus;
          const matchedHistory = getHistoryForStatus(milestone.status);

          return (
            <div key={milestone.status} className="relative group">
              {/* Dot / Icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-0.5 w-6 sm:w-7 h-6 sm:h-7 rounded-full flex items-center justify-center text-xs transition-all shadow-xs ${
                  isPassed
                    ? isCurrent
                      ? "bg-[#d9ff69] text-slate-950 font-bold ring-4 ring-blue-100 dark:ring-blue-950"
                      : "bg-emerald-500 text-white"
                    : "bg-slate-100 dark:bg-[#25372b] text-slate-400 border border-slate-300 dark:border-[#2d4234]"
                }`}
              >
                {isPassed ? (
                  isCurrent ? (
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )
                ) : (
                  <span className="text-[10px] font-bold">{idx + 1}</span>
                )}
              </div>

              {/* Text content */}
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4
                    className={`text-sm font-extrabold ${
                      isPassed
                        ? "text-[#17231b] dark:text-white"
                        : "text-slate-400 dark:text-[#9bb3a1] font-medium"
                    }`}
                  >
                    {milestone.label}
                  </h4>

                  {matchedHistory && (
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-[#9bb3a1]">
                      {formatDateTime(matchedHistory.timestamp)}
                    </span>
                  )}
                </div>

                <p
                  className={`text-xs ${
                    isPassed
                      ? "text-slate-600 dark:text-[#edf7cd]/90"
                      : "text-slate-400 dark:text-slate-600"
                  }`}
                >
                  {matchedHistory?.note || milestone.desc}
                </p>

                {matchedHistory?.location && (
                  <p className="text-[11px] text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] dark:text-[#d9ff69] font-medium flex items-center gap-1 pt-0.5">
                    <span>Location:</span>
                    <strong>{matchedHistory.location}</strong>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

