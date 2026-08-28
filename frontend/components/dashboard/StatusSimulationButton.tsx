"use client";

import React, { useState } from "react";
import { Play, Loader2, ArrowRight, Lock } from "lucide-react";
import confetti from "canvas-confetti";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { getStatusConfig } from "@/lib/utils";
import { Shipment, ShipmentStatus } from "@/types";

interface StatusSimulationButtonProps {
  shipment: Shipment;
  onStatusUpdated?: (updatedShipment: Shipment) => void;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function StatusSimulationButton({
  shipment,
  onStatusUpdated,
  size = "sm",
  showLabel = true,
  className = "",
}: StatusSimulationButtonProps) {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const isSimulationEnabled =
    process.env.NEXT_PUBLIC_ENABLE_SHIPMENT_SIMULATION !== "false";
  if (!isSimulationEnabled) return null;

  const currentStatus = shipment.current_status;
  const config = getStatusConfig(currentStatus);
  const nextStatus = config.nextStatus as ShipmentStatus | null;
  const nextLabel = config.nextLabel;

  const isTerminal = ["delivered", "failed", "exception"].includes(
    currentStatus,
  );

  const handleSimulate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTerminal || loading) return;

    setLoading(true);
    try {
      const res = await api.shipments.simulateNextStatus(shipment.id);

      const newStatusReadable = res.new_status.replace("_", " ").toUpperCase();
      success(
        `Shipment ${shipment.shipment_number} transitioned from ${res.previous_status.replace("_", " ")} to ${newStatusReadable}.`,
        "Simulation Successful!",
      );

      if (res.new_status === "delivered") {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      if (onStatusUpdated) {
        onStatusUpdated(res.shipment);
      }
    } catch (err: any) {
      error(
        err.message || "Failed to simulate status transition.",
        "Simulation Error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (isTerminal) {
    return (
      <button
        disabled
        title="Shipment already completed. No further transitions available."
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#edf7cd]/40 dark:bg-[#25372b] text-slate-400 dark:text-[#9bb3a1] cursor-not-allowed border border-[#e2ebd0] dark:border-[#2d4234] ${className}`}
      >
        <Lock className="w-3.5 h-3.5" />
        <span>Completed</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleSimulate}
      disabled={loading}
      className={`group relative inline-flex items-center justify-center gap-1.5 font-black rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-60 cursor-pointer ${
        size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
      } bg-[#17231b] dark:bg-[#d9ff69] hover:bg-[#223529] dark:hover:bg-[#cbf748] text-[#d9ff69] dark:text-[#17231b] ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d9ff69] dark:text-[#17231b]" />
          <span>Simulating...</span>
        </>
      ) : (
        <>
          <Play className="w-3.5 h-3.5 fill-[#d9ff69] dark:fill-[#17231b] text-[#d9ff69] dark:text-[#17231b] group-hover:scale-110 transition-transform shrink-0" />
          {showLabel ? (
            <span className="flex items-center gap-1 truncate text-[11px] sm:text-xs">
              Simulate: <span className="opacity-80">{config.label}</span>{" "}
              <ArrowRight className="w-3 h-3 shrink-0" />{" "}
              <span className="underline font-black">{nextLabel}</span>
            </span>
          ) : (
            <span>Simulate</span>
          )}
        </>
      )}
    </button>
  );
}
