"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  ArrowRight,
  Trash2,
  Edit2,
  Clock,
  MapPin,
  Package,
  PlusCircle,
  Play
} from "lucide-react";
import { Draft } from "@/types";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { formatDateTime } from "@/lib/utils";

interface DraftListProps {
  drafts: Draft[];
  onDraftDeleted: (id: string) => void;
  onDraftUpdated: (draft: Draft) => void;
}

export function DraftList({ drafts, onDraftDeleted, onDraftUpdated }: DraftListProps) {
  const router = useRouter();
  const { success, error } = useToast();

  const [selectedDraftForDelete, setSelectedDraftForDelete] = useState<Draft | null>(null);
  const [selectedDraftForEdit, setSelectedDraftForEdit] = useState<Draft | null>(null);
  const [editName, setEditName] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);

  const handleDelete = async () => {
    if (!selectedDraftForDelete) return;
    setLoadingAction(true);
    try {
      await api.drafts.delete(selectedDraftForDelete.id);
      success(`Draft "${selectedDraftForDelete.name}" deleted.`, "Draft Deleted");
      onDraftDeleted(selectedDraftForDelete.id);
      setSelectedDraftForDelete(null);
    } catch (err: any) {
      error(err.message || "Failed to delete draft.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDraftForEdit || !editName.trim()) return;
    setLoadingAction(true);
    try {
      const updated = await api.drafts.update(selectedDraftForEdit.id, { name: editName.trim() });
      success("Draft name updated successfully.", "Draft Updated");
      onDraftUpdated(updated);
      setSelectedDraftForEdit(null);
    } catch (err: any) {
      error(err.message || "Failed to update draft.");
    } finally {
      setLoadingAction(false);
    }
  };

  if (drafts.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0]/80 dark:border-[#2d4234] shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-[#edf7cd]/50 dark:bg-[#25372b] dark:bg-blue-950 text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] mx-auto flex items-center justify-center mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#17231b] dark:text-white mb-1">No saved drafts</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          Save your booking at any stage to continue later across your devices without losing progress.
        </p>
        <Link
          href="/booking"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d9ff69] hover:bg-[#cbf748] text-slate-950 font-bold font-bold text-xs shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Start Booking</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {drafts.map((draft) => {
          const senderCity = draft.sender_details?.city;
          const receiverCity = draft.receiver_details?.city;
          const productName = draft.product_details?.product_name || "Unspecified item";

          return (
            <div
              key={draft.id}
              className="rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0]/80 dark:border-[#2d4234] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Draft Card Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#17231b] dark:text-white leading-tight">
                      {draft.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                      <Clock className="w-3 h-3" />
                      Updated {formatDateTime(draft.updated_at)}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#edf7cd]/50 dark:bg-[#25372b] dark:bg-blue-950 text-amber-800 dark:text-[#d9ff69] dark:text-blue-300 border border-[#d9ff69] dark:border-[#2d4234] dark:border-blue-800 shrink-0">
                    Step {draft.current_step} of 5
                  </span>
                </div>

                {/* Draft Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-[#25372b] rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-[#d9ff69] rounded-full transition-all"
                    style={{ width: `${(draft.current_step / 5) * 100}%` }}
                  />
                </div>

                {/* Route / Details Snippet */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#25372b]/50 border border-slate-100 dark:border-[#2d4234] text-xs space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-[#edf7cd]/90">
                    <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold truncate">{productName}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-[#9bb3a1] text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {senderCity ? senderCity : "Origin"} <ArrowRight className="w-2.5 h-2.5 inline mx-0.5" />{" "}
                      {receiverCity ? receiverCity : "Destination"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-[#2d4234]">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedDraftForEdit(draft);
                      setEditName(draft.name);
                    }}
                    title="Rename draft"
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setSelectedDraftForDelete(draft)}
                    title="Delete draft"
                    className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => router.push(`/booking?draftId=${draft.id}`)}
                  className="px-4 py-2 rounded-xl bg-[#d9ff69] hover:bg-[#cbf748] text-slate-950 font-bold font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Resume Booking</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedDraftForDelete)}
        onClose={() => setSelectedDraftForDelete(null)}
        title="Delete Saved Draft"
        description="Are you sure you want to remove this saved booking draft? This action cannot be undone."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-[#edf7cd]/90">
            Draft: <strong>{selectedDraftForDelete?.name}</strong>
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setSelectedDraftForDelete(null)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-[#9bb3a1] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loadingAction}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              {loadingAction ? "Deleting..." : "Delete Draft"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Draft Name Modal */}
      <Modal
        isOpen={Boolean(selectedDraftForEdit)}
        onClose={() => setSelectedDraftForEdit(null)}
        title="Rename Draft"
        description="Update the title of your saved shipment draft."
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">Draft Name</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedDraftForEdit(null)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-[#9bb3a1] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loadingAction || !editName.trim()}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#d9ff69] hover:bg-[#cbf748] text-slate-950 font-bold shadow-xs transition-colors cursor-pointer"
            >
              {loadingAction ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

