"use client";

import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { Skeleton } from "@/components/ui/Skeleton";

export default function BookingPage() {
  return (
    <AppShell title="Book Shipment">
      <Suspense
        fallback={
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        }
      >
        <BookingWizard />
      </Suspense>
    </AppShell>
  );
}
