"use client";

import React from "react";
import { Sparkles, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Cpu } from "lucide-react";
import { PredictionDetails } from "@/types";
import { formatDateTime } from "@/lib/utils";

interface PredictionEngineCardProps {
  prediction: PredictionDetails;
}

export function PredictionEngineCard({ prediction }: PredictionEngineCardProps) {
  const isCompleted = prediction.prediction_state === "completed";
  const isIndeterminate = prediction.prediction_state === "indeterminate";

  return (
    <div className="rounded-3xl bg-white dark:bg-[#1f2e24] text-[#17231b] dark:text-[#edf7cd] p-6 sm:p-8 shadow-xs border border-[#e2ebd0] dark:border-[#2d4234] relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#17231b] dark:text-[#d9ff69]">
          <Cpu className="w-4 h-4 text-[#17231b] dark:text-[#d9ff69]" />
          <span>Predictive AI Delivery Engine</span>
        </div>

        {prediction.confidence_score !== null && prediction.confidence_score !== undefined && !isIndeterminate && (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-[#d9ff69] text-[#17231b] flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            {Math.round(prediction.confidence_score * 100)}% Confidence
          </span>
        )}
      </div>

      {/* Primary ETA Display */}
      <div className="mb-6">
        <span className="text-xs text-slate-400 dark:text-[#9bb3a1] block mb-1 font-semibold">Estimated Delivery Time</span>
        {isCompleted ? (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-[#d9ff69]">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <span className="text-xl sm:text-2xl font-black">Package Successfully Delivered</span>
          </div>
        ) : isIndeterminate ? (
          <div className="flex items-center gap-2 text-[#17231b] dark:text-[#d9ff69] dark:text-amber-400">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <span className="text-lg sm:text-xl font-bold">
              Estimated delivery cannot be determined right now.
            </span>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#17231b] dark:text-white tracking-tight">
              {prediction.estimated_delivery_time
                ? formatDateTime(prediction.estimated_delivery_time)
                : "Calculating ETA..."}
            </h2>
            {prediction.estimated_hours_remaining !== undefined && prediction.estimated_hours_remaining !== null && (
              <p className="text-xs text-[#17231b] dark:text-[#d9ff69] mt-1 flex items-center gap-1.5 font-bold">
                <Clock className="w-3.5 h-3.5" />
                Approximately <strong>{prediction.estimated_hours_remaining} hours</strong> remaining in transit
              </p>
            )}
          </div>
        )}
      </div>

      {/* Model Factors & Explanations */}
      {prediction.explanation_factors && prediction.explanation_factors.length > 0 && (
        <div className="pt-4 border-t border-[#e2ebd0] dark:border-[#2d4234] space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9bb3a1] block">
            Algorithmic Prediction Factors
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {prediction.explanation_factors.map((factor, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-2xl bg-[#edf7cd]/40 dark:bg-[#25372b]/60 border border-[#e2ebd0] dark:border-[#2d4234] text-xs text-[#17231b] dark:text-[#edf7cd]"
              >
                <ShieldCheck className="w-4 h-4 text-[#17231b] dark:text-[#d9ff69] shrink-0 mt-0.5" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
