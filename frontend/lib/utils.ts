import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ShipmentStatus, DeliveryType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getStatusConfig(status: ShipmentStatus | string) {
  switch (status) {
    case "created":
      return {
        label: "Created",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
        dotClass: "bg-slate-500",
        nextStatus: "picked_up",
        nextLabel: "Picked Up"
      };
    case "picked_up":
      return {
        label: "Picked Up",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
        dotClass: "bg-blue-500",
        nextStatus: "in_transit",
        nextLabel: "In Transit"
      };
    case "in_transit":
      return {
        label: "In Transit",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
        dotClass: "bg-amber-500 animate-pulse",
        nextStatus: "out_for_delivery",
        nextLabel: "Out for Delivery"
      };
    case "out_for_delivery":
      return {
        label: "Out for Delivery",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
        dotClass: "bg-indigo-500 animate-pulse",
        nextStatus: "delivered",
        nextLabel: "Delivered"
      };
    case "delivered":
      return {
        label: "Delivered",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
        dotClass: "bg-emerald-500",
        nextStatus: null,
        nextLabel: "Completed"
      };
    case "delayed":
      return {
        label: "Delayed",
        badgeClass: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
        dotClass: "bg-orange-500",
        nextStatus: "in_transit",
        nextLabel: "Resume Transit"
      };
    case "exception":
      return {
        label: "Exception",
        badgeClass: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
        dotClass: "bg-red-500",
        nextStatus: null,
        nextLabel: "Exception"
      };
    case "failed":
      return {
        label: "Failed",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
        dotClass: "bg-rose-500",
        nextStatus: null,
        nextLabel: "Failed"
      };
    default:
      return {
        label: status ? status.replace("_", " ") : "Unknown",
        badgeClass: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
        dotClass: "bg-gray-400",
        nextStatus: null,
        nextLabel: ""
      };
  }
}

export function estimateRate(
  weight: number,
  length: number,
  width: number,
  height: number,
  deliveryType: DeliveryType | string,
  productType: string
): number {
  const volWeight = (length * width * height) / 5000.0;
  const billableWeight = Math.max(weight || 1, volWeight || 1);
  const baseRate = 25.0;
  const weightRate = billableWeight * 8.5;

  let multiplier = 1.0;
  if (deliveryType === "express") multiplier *= 1.6;
  if (productType === "fragile") multiplier *= 1.25;
  if (productType === "electronics") multiplier *= 1.15;

  return Math.round((baseRate + weightRate) * multiplier * 100) / 100;
}

