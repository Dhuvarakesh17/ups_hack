"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  MapPin,
  Package,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  Zap,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { SaveDraftModal } from "./SaveDraftModal";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { estimateRate, formatCurrency } from "@/lib/utils";
import {
  ShipmentCreatePayload,
  DeliveryType,
  PaymentMode,
  BillingLocation,
  ProductType,
} from "@/types";

export function BookingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error, info } = useToast();

  const [step, setStep] = useState(1);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    sender_name: "Alex Morgan",
    sender_email: "demo@onelogistics.com",
    sender_phone: "+1 (312) 555-0182",
    sender_address: "450 N Michigan Ave, Suite 1200",
    sender_city: "Chicago",
    sender_state: "IL",
    sender_postal_code: "60611",
    sender_country: "United States",
    sender_location: "Main Office",

    receiver_name: "",
    receiver_email: "",
    receiver_phone: "",
    receiver_address: "",
    receiver_city: "",
    receiver_state: "",
    receiver_postal_code: "",
    receiver_country: "United States",
    receiver_location: "Delivery Bay",

    product_name: "",
    product_description: "",
    length: 25.0,
    width: 20.0,
    height: 15.0,
    weight: 2.5,
    product_type: "standard" as ProductType,
    custom_product_type: "",

    delivery_type: "standard" as DeliveryType,
    payment_mode: "cash" as PaymentMode,
    billing_location: "sender" as BillingLocation,

    terms_confirmed: false,
  });

  useEffect(() => {
    const draftId = searchParams.get("draftId");
    if (draftId) {
      setActiveDraftId(draftId);
      api.drafts
        .getById(draftId)
        .then((draft) => {
          setFormData((prev) => ({
            ...prev,
            sender_name: draft.sender_details?.full_name || prev.sender_name,
            sender_email: draft.sender_details?.email || prev.sender_email,
            sender_phone: draft.sender_details?.phone || prev.sender_phone,
            sender_address:
              draft.sender_details?.address || prev.sender_address,
            sender_city: draft.sender_details?.city || prev.sender_city,
            sender_state: draft.sender_details?.state || prev.sender_state,
            sender_postal_code:
              draft.sender_details?.postal_code || prev.sender_postal_code,
            sender_country:
              draft.sender_details?.country || prev.sender_country,

            receiver_name:
              draft.receiver_details?.full_name || prev.receiver_name,
            receiver_email:
              draft.receiver_details?.email || prev.receiver_email,
            receiver_phone:
              draft.receiver_details?.phone || prev.receiver_phone,
            receiver_address:
              draft.receiver_details?.address || prev.receiver_address,
            receiver_city: draft.receiver_details?.city || prev.receiver_city,
            receiver_state:
              draft.receiver_details?.state || prev.receiver_state,
            receiver_postal_code:
              draft.receiver_details?.postal_code || prev.receiver_postal_code,
            receiver_country:
              draft.receiver_details?.country || prev.receiver_country,

            product_name:
              draft.product_details?.product_name || prev.product_name,
            product_description:
              draft.product_details?.product_description ||
              prev.product_description,
            length: draft.product_details?.length || prev.length,
            width: draft.product_details?.width || prev.width,
            height: draft.product_details?.height || prev.height,
            weight: draft.product_details?.weight || prev.weight,
            product_type:
              (draft.product_details?.product_type as ProductType) ||
              prev.product_type,

            delivery_type:
              (draft.payment_details?.delivery_type as DeliveryType) ||
              prev.delivery_type,
            payment_mode:
              (draft.payment_details?.payment_mode as PaymentMode) ||
              prev.payment_mode,
            billing_location:
              (draft.payment_details?.billing_location as BillingLocation) ||
              prev.billing_location,
          }));
          if (
            draft.current_step &&
            draft.current_step >= 1 &&
            draft.current_step <= 5
          ) {
            setStep(draft.current_step);
          }
          info(
            `Resumed saved draft "${draft.name}" at Step ${draft.current_step || 1}.`,
            "Draft Resumed",
          );
        })
        .catch((e) => {
          console.error("Failed to load draft:", e);
        });
    }

    const dt = searchParams.get("delivery_type") as DeliveryType | null;
    const pt = searchParams.get("product_type") as ProductType | null;
    const pm = searchParams.get("payment_mode") as PaymentMode | null;
    const bl = searchParams.get("billing_location") as BillingLocation | null;
    const pname = searchParams.get("product_name");
    const w = searchParams.get("weight");

    if (dt || pt || pm || bl || pname || w) {
      setFormData((prev) => ({
        ...prev,
        delivery_type: dt || prev.delivery_type,
        product_type: pt || prev.product_type,
        payment_mode: pm || prev.payment_mode,
        billing_location: bl || prev.billing_location,
        product_name: pname || prev.product_name,
        weight: w ? parseFloat(w) : prev.weight,
      }));
      info(
        "Applied AI assistant's tailored shipment recommendations to your booking flow.",
        "AI Plan Applied",
      );
    }
  }, [searchParams, info]);

  const handleUsePreferences = async () => {
    try {
      const prefs = await api.preferences.get();
      setFormData((prev) => ({
        ...prev,
        delivery_type: prefs.preferred_delivery_type || prev.delivery_type,
        payment_mode: prefs.preferred_payment_mode || prev.payment_mode,
        billing_location:
          prefs.preferred_payment_location || prev.billing_location,
      }));
      success(
        `Applied saved preferences: ${prefs.preferred_delivery_type.toUpperCase()} • ${prefs.preferred_payment_mode.toUpperCase()} • ${prefs.preferred_payment_location.toUpperCase()}`,
        "Preferences Applied",
      );
    } catch {
      info(
        "No saved preferences found. You can configure defaults in Settings.",
        "No Preferences Found",
      );
    }
  };

  const calculatedRate = estimateRate(
    formData.weight,
    formData.length,
    formData.width,
    formData.height,
    formData.delivery_type,
    formData.product_type,
  );

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!formData.sender_name.trim()) {
        error("Please provide the sender's full name.");
        return false;
      }
      if (!formData.sender_email.includes("@")) {
        error("Please provide a valid sender email address.");
        return false;
      }
      if (
        !formData.sender_address.trim() ||
        !formData.sender_city.trim() ||
        !formData.sender_state.trim()
      ) {
        error("Please complete the sender address details.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.receiver_name.trim()) {
        error("Please provide the receiver's full name.");
        return false;
      }
      if (!formData.receiver_email.includes("@")) {
        error("Please provide a valid receiver email address.");
        return false;
      }
      if (
        !formData.receiver_address.trim() ||
        !formData.receiver_city.trim() ||
        !formData.receiver_state.trim()
      ) {
        error("Please complete the receiver address details.");
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.product_name.trim()) {
        error("Please enter the package product name.");
        return false;
      }
      if (formData.weight <= 0) {
        error("Package weight must be greater than 0 kg.");
        return false;
      }
      if (formData.length <= 0 || formData.width <= 0 || formData.height <= 0) {
        error("Package dimensions must be positive values.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(5, s + 1));
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handlePlaceBooking = async () => {
    if (!formData.terms_confirmed) {
      error(
        "Please accept the shipment terms & verification to confirm your booking.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload: ShipmentCreatePayload = {
        sender_name: formData.sender_name,
        sender_email: formData.sender_email,
        sender_phone: formData.sender_phone,
        sender_address: formData.sender_address,
        sender_city: formData.sender_city,
        sender_state: formData.sender_state,
        sender_postal_code: formData.sender_postal_code,
        sender_country: formData.sender_country,

        receiver_name: formData.receiver_name,
        receiver_email: formData.receiver_email,
        receiver_phone: formData.receiver_phone,
        receiver_address: formData.receiver_address,
        receiver_city: formData.receiver_city,
        receiver_state: formData.receiver_state,
        receiver_postal_code: formData.receiver_postal_code,
        receiver_country: formData.receiver_country,

        product_name: formData.product_name,
        product_description: formData.product_description,
        length: Number(formData.length),
        width: Number(formData.width),
        height: Number(formData.height),
        weight: Number(formData.weight),
        product_type: formData.product_type,

        delivery_type: formData.delivery_type,
        payment_mode: formData.payment_mode,
        billing_location: formData.billing_location,
        total_amount: calculatedRate,
        draft_id: activeDraftId || undefined,
      };

      const newShipment = await api.shipments.create(payload);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });

      success(
        `Shipment ${newShipment.shipment_number} confirmed! Label generated and notification email sent to ${newShipment.sender_email}.`,
        "Booking Confirmed!",
      );

      router.push(`/shipments/${newShipment.id}`);
    } catch (err: any) {
      error(err.message || "Failed to place shipment booking.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: "Sender", desc: "Origin details", icon: User },
    { num: 2, title: "Receiver", desc: "Destination", icon: MapPin },
    { num: 3, title: "Product", desc: "Dimensions & weight", icon: Package },
    {
      num: 4,
      title: "Payment & Service",
      desc: "Rates & preferences",
      icon: CreditCard,
    },
    {
      num: 5,
      title: "Review & Confirm",
      desc: "Final verification",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Save Draft Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#17231b] dark:text-white tracking-tight">
            Multi-Channel Shipment Booking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9bb3a1] mt-1">
            Complete your shipment in 5 seamless steps or save as a draft to
            resume on any channel.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDraftModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-white dark:bg-[#25372b] hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-[#edf7cd] font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <BookmarkCheck className="w-4 h-4 text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] dark:text-[#d9ff69]" />
          <span>Save Progress as Draft</span>
        </button>
      </div>

      {/* 5-Step Progress Indicator Bar */}
      <div className="grid grid-cols-5 gap-2 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0]/80 dark:border-[#2d4234] shadow-xs">
        {stepsList.map((s) => {
          const Icon = s.icon;
          const isDone = step > s.num;
          const isCurrent = step === s.num;

          return (
            <button
              key={s.num}
              onClick={() => {
                if (s.num < step || validateStep(step)) {
                  setStep(s.num);
                }
              }}
              className={`flex flex-col items-center text-center p-2 rounded-xl transition-all cursor-pointer ${
                isCurrent
                  ? "bg-[#edf7cd]/50 dark:bg-[#25372b] dark:bg-blue-950/50 border border-[#d9ff69] dark:border-[#2d4234] dark:border-blue-800"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-black transition-colors ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                      ? "bg-[#d9ff69] text-slate-950 font-bold shadow-md shadow-amber-500/15"
                      : "bg-slate-100 dark:bg-[#25372b] text-slate-400"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-[11px] sm:text-xs font-bold mt-1.5 line-clamp-1 ${
                  isCurrent
                    ? "text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] dark:text-[#d9ff69]"
                    : "text-slate-700 dark:text-[#edf7cd]/90"
                }`}
              >
                {s.title}
              </span>
              <span className="hidden md:block text-[10px] text-slate-400 leading-tight">
                {s.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Wizard Form Body */}
      <div className="rounded-3xl bg-white dark:bg-[#1f2e24] border border-[#e2ebd0]/80 dark:border-[#2d4234] shadow-xs p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: SENDER DETAILS */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 dark:border-[#2d4234] pb-4">
                <h3 className="text-base font-bold text-[#17231b] dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]" />
                  Step 1: Origin & Sender Details
                </h3>
                <p className="text-xs text-slate-500">
                  Where should the carrier pick up the package?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Sender Full Name / Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sender_name}
                    onChange={(e) =>
                      setFormData({ ...formData, sender_name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="e.g. Alex Morgan (Apex BioLab)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Sender Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.sender_email}
                    onChange={(e) =>
                      setFormData({ ...formData, sender_email: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="demo@onelogistics.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Sender Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.sender_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, sender_phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="+1 (312) 555-0182"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Pickup Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sender_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sender_address: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="450 N Michigan Ave, Suite 1200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sender_city}
                    onChange={(e) =>
                      setFormData({ ...formData, sender_city: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="Chicago"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    State / Province *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sender_state}
                    onChange={(e) =>
                      setFormData({ ...formData, sender_state: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="IL"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Postal / ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sender_postal_code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sender_postal_code: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="60611"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.sender_country}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sender_country: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="United States"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: RECEIVER DETAILS */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 dark:border-[#2d4234] pb-4">
                <h3 className="text-base font-bold text-[#17231b] dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]" />
                  Step 2: Recipient & Destination Details
                </h3>
                <p className="text-xs text-slate-500">
                  Where should the shipment be delivered?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Recipient Full Name / Attention *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.receiver_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        receiver_name: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="e.g. Dr. Elena Vance (Mount Sinai)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.receiver_email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        receiver_email: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="elena.vance@mountsinai.org"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Recipient Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.receiver_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        receiver_phone: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="+1 (212) 555-0199"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Delivery Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.receiver_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        receiver_address: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="1425 Madison Ave, Floor 8"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.receiver_city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        receiver_city: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    State / Province *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.receiver_state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        receiver_state: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="NY"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Postal / ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.receiver_postal_code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        receiver_postal_code: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="10029"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.receiver_country}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        receiver_country: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="United States"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PRODUCT DETAILS */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 dark:border-[#2d4234] pb-4">
                <h3 className="text-base font-bold text-[#17231b] dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]" />
                  Step 3: Package & Product Specifications
                </h3>
                <p className="text-xs text-slate-500">
                  Specify dimensions, weight, and handling classifications
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Product / Package Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.product_name}
                    onChange={(e) =>
                      setFormData({ ...formData, product_name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="e.g. Biomedical Sensor Kit or High-Density Storage"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Product Type Classification *
                  </label>
                  <select
                    value={formData.product_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        product_type: e.target.value as ProductType,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white font-medium focus:ring-2 focus:ring-[#d9ff69]"
                  >
                    <option value="standard">Standard Parcel</option>
                    <option value="fragile">Fragile (Special Handling)</option>
                    <option value="electronics">Electronics & Hardware</option>
                    <option value="documents">Confidential Documents</option>
                    <option value="other">Other (Custom Classification)</option>
                  </select>
                </div>

                {formData.product_type === "other" && (
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                      Specify Custom Product Classification
                    </label>
                    <input
                      type="text"
                      value={formData.custom_product_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          custom_product_type: e.target.value,
                        })
                      }
                      placeholder="e.g. Perishable Botanical Culture"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    />
                  </div>
                )}

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Description & Contents
                  </label>
                  <textarea
                    rows={2}
                    value={formData.product_description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        product_description: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                    placeholder="Brief description for customs declaration and transit handling..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: parseFloat(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Length (cm) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={formData.length}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        length: parseFloat(e.target.value) || 10,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Width (cm) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={formData.width}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        width: parseFloat(e.target.value) || 10,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1">
                    Height (cm) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        height: parseFloat(e.target.value) || 10,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-xs text-[#17231b] dark:text-white focus:ring-2 focus:ring-[#d9ff69]"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center p-3 rounded-xl bg-slate-100 dark:bg-[#25372b]/60 border border-[#e2ebd0] dark:border-[#2d4234]/60 text-xs text-slate-600 dark:text-[#edf7cd]/90">
                  <span>
                    Volumetric weight:{" "}
                    <strong>
                      {(
                        (formData.length * formData.width * formData.height) /
                        5000
                      ).toFixed(2)}{" "}
                      kg
                    </strong>{" "}
                    (Billable weight:{" "}
                    <strong>
                      {Math.max(
                        formData.weight,
                        (formData.length * formData.width * formData.height) /
                          5000,
                      ).toFixed(2)}{" "}
                      kg
                    </strong>
                    )
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: PAYMENT AND DELIVERY */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#2d4234] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[#17231b] dark:text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69]" />
                    Step 4: Service Level & Payment Mode
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select delivery speed, billing location, and payment gateway
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleUsePreferences}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/60 dark:to-indigo-950/40 border border-[#d9ff69] dark:border-[#2d4234] dark:border-blue-800 text-amber-800 dark:text-[#d9ff69] dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition-colors shadow-xs cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#d9ff69] fill-amber-500" />
                  <span>Use My Preferences</span>
                </button>
              </div>

              {/* Delivery Service Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90">
                  Select Delivery Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() =>
                      setFormData({ ...formData, delivery_type: "standard" })
                    }
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.delivery_type === "standard"
                        ? "border-[#d9ff69] bg-[#edf7cd]/50 dark:bg-[#25372b]/40 dark:bg-blue-950/30"
                        : "border-[#e2ebd0] dark:border-[#2d4234] hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-[#17231b] dark:text-white">
                        Standard Ground Linehaul
                      </span>
                      <span className="text-xs font-extrabold text-slate-600 dark:text-[#edf7cd]/90">
                        {formatCurrency(
                          calculatedRate *
                            (formData.delivery_type === "express"
                              ? 1 / 1.6
                              : 1),
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Economical 3-5 business days ground freight with
                      door-to-door tracking.
                    </p>
                  </div>

                  <div
                    onClick={() =>
                      setFormData({ ...formData, delivery_type: "express" })
                    }
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.delivery_type === "express"
                        ? "border-[#d9ff69] bg-[#edf7cd]/50 dark:bg-[#25372b]/40 dark:bg-blue-950/30"
                        : "border-[#e2ebd0] dark:border-[#2d4234] hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-[#17231b] dark:text-white flex items-center gap-1.5">
                        Express Next-Flight Priority
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          FASTEST
                        </span>
                      </span>
                      <span className="text-xs font-extrabold text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] dark:text-[#d9ff69]">
                        {formatCurrency(
                          calculatedRate *
                            (formData.delivery_type === "standard" ? 1.6 : 1),
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      1-2 business days priority air linehaul with guaranteed
                      delivery estimate.
                    </p>
                  </div>
                </div>
              </div>

              {/* Billing Location & Payment Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1.5">
                    Billing Location
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, billing_location: "sender" })
                      }
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        formData.billing_location === "sender"
                          ? "border-[#d9ff69] bg-[#d9ff69] text-slate-950 font-bold shadow-xs"
                          : "border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-slate-700 dark:text-[#edf7cd]/90"
                      }`}
                    >
                      Sender Pays
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          billing_location: "receiver",
                        })
                      }
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        formData.billing_location === "receiver"
                          ? "border-[#d9ff69] bg-[#d9ff69] text-slate-950 font-bold shadow-xs"
                          : "border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-slate-700 dark:text-[#edf7cd]/90"
                      }`}
                    >
                      Receiver / COD
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 mb-1.5">
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, payment_mode: "cash" })
                      }
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        formData.payment_mode === "cash"
                          ? "border-[#d9ff69] bg-[#d9ff69] text-slate-950 font-bold shadow-xs"
                          : "border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-slate-700 dark:text-[#edf7cd]/90"
                      }`}
                    >
                      Cash / Invoice
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, payment_mode: "upi" })
                      }
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        formData.payment_mode === "upi"
                          ? "border-[#d9ff69] bg-[#d9ff69] text-slate-950 font-bold shadow-xs"
                          : "border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-slate-700 dark:text-[#edf7cd]/90"
                      }`}
                    >
                      UPI / Instant Pay
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: REVIEW AND CONFIRM */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 dark:border-[#2d4234] pb-4">
                <h3 className="text-base font-bold text-[#17231b] dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Step 5: Review Summary & Place Booking
                </h3>
                <p className="text-xs text-slate-500">
                  Verify all shipment parameters before dispatching label and
                  initial status
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#25372b]/60 border border-[#e2ebd0]/80 dark:border-[#2d4234]/60 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Origin / Sender
                    </span>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm font-extrabold text-[#17231b] dark:text-white">
                    {formData.sender_name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-[#edf7cd]/90">
                    {formData.sender_address}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-[#edf7cd]/90">
                    {formData.sender_city}, {formData.sender_state}{" "}
                    {formData.sender_postal_code}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {formData.sender_email} • {formData.sender_phone}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#25372b]/60 border border-[#e2ebd0]/80 dark:border-[#2d4234]/60 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Destination / Receiver
                    </span>
                    <button
                      onClick={() => setStep(2)}
                      className="text-xs font-bold text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm font-extrabold text-[#17231b] dark:text-white">
                    {formData.receiver_name || "N/A"}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-[#edf7cd]/90">
                    {formData.receiver_address || "N/A"}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-[#edf7cd]/90">
                    {formData.receiver_city}, {formData.receiver_state}{" "}
                    {formData.receiver_postal_code}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {formData.receiver_email} • {formData.receiver_phone}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#25372b]/60 border border-[#e2ebd0]/80 dark:border-[#2d4234]/60 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Package Specifications
                    </span>
                    <button
                      onClick={() => setStep(3)}
                      className="text-xs font-bold text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm font-extrabold text-[#17231b] dark:text-white">
                    {formData.product_name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-[#edf7cd]/90 capitalize">
                    Classification: {formData.product_type}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-[#edf7cd]/90">
                    Dimensions: {formData.length} × {formData.width} ×{" "}
                    {formData.height} cm ({formData.weight} kg)
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/20 border border-[#d9ff69] dark:border-[#2d4234] dark:border-blue-800 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-800 dark:text-[#d9ff69] dark:text-blue-300 uppercase tracking-wide">
                      Service & Total Amount
                    </span>
                    <button
                      onClick={() => setStep(4)}
                      className="text-xs font-bold text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-[#edf7cd]/90 capitalize">
                      {formData.delivery_type} Delivery
                    </span>
                    <span className="text-xl font-black text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] dark:text-[#d9ff69]">
                      {formatCurrency(calculatedRate)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 uppercase">
                    Payment: {formData.payment_mode} • Billed to{" "}
                    {formData.billing_location}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50/50 dark:bg-[#25372b]/30 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.terms_confirmed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      terms_confirmed: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-[#17231b] dark:text-[#d9ff69] dark:text-[#d9ff69] focus:ring-[#d9ff69] mt-0.5 cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-slate-600 dark:text-[#edf7cd]/90 cursor-pointer"
                >
                  I confirm that all package dimensions, contents, and
                  destination addresses are accurate. I authorize One Logistics
                  to initiate priority carrier tracking and send status updates
                  to the sender email.
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-8 mt-6 border-t border-slate-100 dark:border-[#2d4234]">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-white dark:bg-[#25372b] text-slate-700 dark:text-[#edf7cd]/90 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDraftModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Save as Draft</span>
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2.5 rounded-2xl bg-[#17231b] dark:bg-[#d9ff69] hover:bg-[#223529] dark:hover:bg-[#cbf748] text-[#d9ff69] dark:text-[#17231b] font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Continue to Step {step + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting || !formData.terms_confirmed}
                onClick={handlePlaceBooking}
                className="px-8 py-3 rounded-2xl bg-[#17231b] dark:bg-[#d9ff69] hover:bg-[#223529] dark:hover:bg-[#cbf748] text-[#d9ff69] dark:text-[#17231b] font-black text-sm flex items-center gap-2 shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#d9ff69] dark:text-[#17231b]" />
                    <span>Processing Booking...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#d9ff69] dark:text-[#17231b]" />
                    <span>Place booking</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <SaveDraftModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        currentStep={step}
        formData={formData}
        onDraftSaved={(id) => setActiveDraftId(id)}
      />
    </div>
  );
}
