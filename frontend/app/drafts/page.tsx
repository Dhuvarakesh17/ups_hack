"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { DraftList } from "@/components/drafts/DraftList";
import { api } from "@/lib/api";
import { Draft } from "@/types";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.drafts
      .getAll()
      .then((data) => setDrafts(data))
      .catch((e) => console.error("Error loading drafts:", e))
      .finally(() => setLoading(false));
  }, []);

  const handleDraftDeleted = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDraftUpdated = (updatedDraft: Draft) => {
    setDrafts((prev) => prev.map((d) => (d.id === updatedDraft.id ? updatedDraft : d)));
  };

  return (
    <AppShell title="Saved Drafts">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231b] dark:text-white tracking-tight">
            Cross-Channel Saved Drafts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9bb3a1] mt-0.5">
            Resume incomplete bookings on any device without losing addresses or product specifications.
          </p>
        </div>

        <Link
          href="/booking"
          className="px-4 py-2.5 rounded-xl bg-[#d9ff69] hover:bg-[#cbf748] text-slate-950 font-bold font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Shipment</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading saved drafts from cloud storage...</p>
        </div>
      ) : (
        <DraftList
          drafts={drafts}
          onDraftDeleted={handleDraftDeleted}
          onDraftUpdated={handleDraftUpdated}
        />
      )}
    </AppShell>
  );
}

