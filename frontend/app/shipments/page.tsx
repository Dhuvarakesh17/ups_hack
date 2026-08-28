"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RecentShipmentsTable } from "@/components/dashboard/RecentShipmentsTable";
import { api } from "@/lib/api";
import { Shipment } from "@/types";

export default function ShipmentsListPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.shipments
      .getAll({ limit: 50 })
      .then((data) => setShipments(data))
      .catch((e) => console.error("Error fetching shipments:", e))
      .finally(() => setLoading(false));
  }, []);

  const handleShipmentUpdated = (updated: Shipment) => {
    setShipments((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  return (
    <AppShell title="All Shipments">
      <RecentShipmentsTable
        shipments={shipments}
        loading={loading}
        onShipmentUpdated={handleShipmentUpdated}
      />
    </AppShell>
  );
}
