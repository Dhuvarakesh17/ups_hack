import React from "react";
import { getStatusConfig } from "@/lib/utils";
import { ShipmentStatus } from "@/types";

interface StatusBadgeProps {
  status: ShipmentStatus | string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className = "", showDot = true }: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.badgeClass} ${className}`}
    >
      {showDot && <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />}
      {config.label}
    </span>
  );
}
