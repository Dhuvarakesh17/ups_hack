"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Package, Loader2 } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ShipmentDetailsView } from "@/components/shipment/ShipmentDetailsView";
import { api } from "@/lib/api";
import { ShipmentDetailResponse } from "@/types";

export default function ShipmentDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<ShipmentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.shipments
      .getById(id)
      .then((res) => setData(res))
      .catch((err) => {
        setErrorMsg(err.message || "Failed to load shipment details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AppShell title={data ? `Shipment ${data.shipment_number}` : "Shipment Details"}>
      {loading ? (
        <div className="p-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Retrieving real-time tracking timeline & predictive metrics...</p>
        </div>
      ) : errorMsg || !data ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-[#e2ebd0] dark:border-slate-800">
          <Package className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#17231b] dark:text-white mb-1">Shipment Not Found</h3>
          <p className="text-xs text-slate-500 mb-4">{errorMsg || "The requested shipment does not exist or you do not have permission to view it."}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d9ff69] text-slate-950 font-bold text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      ) : (
        <ShipmentDetailsView initialData={data} />
      )}
    </AppShell>
  );
}
