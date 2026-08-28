"use client";

import React from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { ShipmentStatus, ShipmentStatusHistory } from "@/types";
import { formatDateTime } from "@/lib/utils";

interface StatusTimelineProps {
  currentStatus: ShipmentStatus | string;
  history: ShipmentStatusHistory[];
}

const MILESTONES: { status: ShipmentStatus; label: string; desc: string }[] = [
  { status: "created", label: "Shipment Created", desc: "Shipment booked and initial shipping label generated" },
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-extrabold text-[#17231b] dark:text-white">Shipment Tracking Timeline</h3>
          <p className="text-xs text-slate-500 dark:text-[#9bb3a1]">Live checkpoint milestone logs and carrier timestamps</p>
        </div>

        {isException && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#edf7cd]/50 dark:bg-amber-950 text-[#17231b] dark:text-[#d9ff69] border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Active Notice
          </span>
        )}
      </div>

      {/* Timeline Container with Center-Aligned Line */}
      <div className="relative space-y-7 before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#e2ebd0] dark:before:bg-[#2d4234]">
        {MILESTONES.map((milestone, idx) => {
          const isPassed = currentIndex >= idx && currentIndex !== -1;
          const isCurrent = milestone.status === currentStatus;
          const matchedHistory = getHistoryForStatus(milestone.status);

          return (
            <div key={milestone.status} className="relative flex items-start gap-4 group">
              {/* Milestone Icon / Number Badge */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs transition-all shadow-xs z-10 ${
                  isPassed
                    ? isCurrent
                      ? "bg-[#d9ff69] text-[#17231b] font-black ring-4 ring-[#d9ff69]/30 dark:ring-[#d9ff69]/20"
                      : "bg-emerald-500 text-white font-bold"
                    : "bg-slate-100 dark:bg-[#25372b] text-slate-400 dark:text-[#9bb3a1] border border-[#e2ebd0] dark:border-[#2d4234]"
                }`}
              >
                {isPassed ? (
                  isCurrent ? (
                    <Clock className="w-4 h-4 animate-pulse text-[#17231b]" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )
                ) : (
                  <span className="text-xs font-extrabold">{idx + 1}</span>
                )}
              </div>

              {/* Text content with clear spacing */}
              <div className="flex-1 min-w-0 space-y-1 pt-0.5">
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
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {matchedHistory?.note || milestone.desc}
                </p>

                {matchedHistory?.location && (
                  <p className="text-[11px] text-[#17231b] dark:text-[#d9ff69] font-medium flex items-center gap-1 pt-0.5">
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
