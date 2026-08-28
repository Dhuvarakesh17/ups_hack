"use client";

import React, { useState } from "react";
import { BookmarkCheck, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { DraftCreatePayload } from "@/types";

interface SaveDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  formData: any;
  onDraftSaved?: (draftId: string) => void;
}

export function SaveDraftModal({
  isOpen,
  onClose,
  currentStep,
  formData,
  onDraftSaved
}: SaveDraftModalProps) {
  const { success, error } = useToast();
  const [draftName, setDraftName] = useState(
    formData.product_name
      ? `Draft: ${formData.product_name}`
      : `Shipment Draft (Step ${currentStep})`
  );
  const [loading, setLoading] = useState(false);

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim()) return;

    setLoading(true);
    try {
      const payload: DraftCreatePayload = {
        name: draftName.trim(),
        current_step: currentStep,
        sender_details: {
          full_name: formData.sender_name,
          email: formData.sender_email,
          phone: formData.sender_phone,
          address: formData.sender_address,
          city: formData.sender_city,
          state: formData.sender_state,
          postal_code: formData.sender_postal_code,
          country: formData.sender_country,
          location: formData.sender_location
        },
        receiver_details: {
          full_name: formData.receiver_name,
          email: formData.receiver_email,
          phone: formData.receiver_phone,
          address: formData.receiver_address,
          city: formData.receiver_city,
          state: formData.receiver_state,
          postal_code: formData.receiver_postal_code,
          country: formData.receiver_country,
          location: formData.receiver_location
        },
        product_details: {
          product_name: formData.product_name,
          product_description: formData.product_description,
          length: formData.length,
          width: formData.width,
          height: formData.height,
          weight: formData.weight,
          product_type: formData.product_type,
          custom_product_type: formData.custom_product_type
        },
        payment_details: {
          delivery_type: formData.delivery_type,
          payment_mode: formData.payment_mode,
          billing_location: formData.billing_location
        }
      };

      const res = await api.drafts.create(payload);
      success("Draft saved successfully! You can resume booking anytime from the Drafts tab.", "Draft Saved");
      if (onDraftSaved) onDraftSaved(res.id);
      onClose();
    } catch (err: any) {
      error(err.message || "Failed to save draft.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Shipment Draft"
      description="Save your booking progress to the cloud and continue on any channel without losing your details."
    >
      <form onSubmit={handleSaveDraft} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1.5">
            Draft Name
          </label>
          <input
            type="text"
            required
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="e.g. San Francisco Lab Server Delivery"
            className="w-full px-4 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-[#17231b] dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#d9ff69]"
          />
        </div>

        <div className="p-3 rounded-xl bg-[#edf7cd]/50 dark:bg-[#25372b] dark:bg-blue-950/40 border border-amber-200 dark:border-[#2d4234] dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
          <BookmarkCheck className="w-4 h-4 text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] shrink-0 mt-0.5" />
          <span>
            Saving will preserve your inputs up to <strong>Step {currentStep}</strong>. You can resume this draft later with all pre-filled fields.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-[#9bb3a1] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !draftName.trim()}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#d9ff69] hover:bg-[#cbf748] text-slate-950 font-bold shadow-xs disabled:opacity-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkCheck className="w-4 h-4" />}
            <span>Save Draft</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

