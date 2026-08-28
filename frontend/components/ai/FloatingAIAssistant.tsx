"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  Zap,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { ChatMessage, StructuredRecommendation } from "@/types";

export function FloatingAIAssistant() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your **One Logistics AI Copilot** powered by **Groq**.\n\nAsk me about your active shipments, transit milestones, carrier routes, or describe cargo to receive an instant service recommendation with 1-click booking pre-fill!"
    }
  ]);
  const [latestRecommendation, setLatestRecommendation] = useState<StructuredRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: textToSend }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.ai.chat(newMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: res.message }]);
      if (res.recommendation) {
        setLatestRecommendation(res.recommendation);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble connecting to the logistics assistant engine. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToShipment = (rec: StructuredRecommendation) => {
    const params = new URLSearchParams();
    if (rec.delivery_type) params.append("delivery_type", rec.delivery_type);
    if (rec.product_type) params.append("product_type", rec.product_type);
    if (rec.payment_mode) params.append("payment_mode", rec.payment_mode);
    if (rec.billing_location) params.append("billing_location", rec.billing_location);
    if (rec.product_name) params.append("product_name", rec.product_name);
    if (rec.weight) params.append("weight", rec.weight.toString());

    setIsOpen(false);
    router.push(`/booking?${params.toString()}`);
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I am your **One Logistics AI Copilot** powered by **Groq**.\n\nAsk me about your active shipments, transit milestones, carrier routes, or describe cargo to receive an instant service recommendation with 1-click booking pre-fill!"
      }
    ]);
    setLatestRecommendation(null);
  };

  const quickPrompts = [
    "Where is my latest shipment?",
    "Recommend shipping for 5kg fragile camera",
    "How does Express linehaul work?",
    "Show active package statuses"
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#17231b] dark:bg-[#d9ff69] text-[#edf7cd] dark:text-[#17231b] shadow-xl hover:opacity-90 transition-all font-extrabold text-sm border border-[#d9ff69]/40 cursor-pointer"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-[#d9ff69] dark:text-[#17231b]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#d9ff69] dark:bg-[#17231b] animate-ping" />
          </div>
          <span className="hidden sm:inline font-bold">AI Logistics Assistant</span>
        </motion.button>
      </div>

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-22 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[82vh] rounded-3xl bg-white dark:bg-[#17231b] border border-[#e2ebd0] dark:border-[#2d4234] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Window Header */}
            <div className="px-5 py-4 bg-[#17231b] text-white flex items-center justify-between border-b border-[#2d4234]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#d9ff69] text-[#17231b] flex items-center justify-center font-black">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold leading-tight text-[#edf7cd]">One AI Copilot</h3>
                  <p className="text-[10px] text-[#d9ff69] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d9ff69] animate-pulse" /> Live • Groq LLM Engine
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  className="p-1.5 rounded-lg text-[#edf7cd]/70 hover:text-[#edf7cd] hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-[#edf7cd]/70 hover:text-[#edf7cd] hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70 dark:bg-[#17231b]">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.role === "user"
                        ? "bg-[#17231b] dark:bg-[#d9ff69] text-[#edf7cd] dark:text-[#17231b]"
                        : "bg-[#edf7cd] text-[#17231b] dark:bg-[#25372b] dark:text-[#edf7cd]"
                    }`}
                  >
                    {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed max-w-[82%] ${
                      msg.role === "user"
                        ? "bg-[#17231b] text-[#edf7cd] dark:bg-[#d9ff69] dark:text-[#17231b] font-medium rounded-tr-xs"
                        : "bg-white dark:bg-[#1f2e24] text-[#17231b] dark:text-[#edf7cd] border border-[#e2ebd0] dark:border-[#2d4234] shadow-xs rounded-tl-xs"
                    }`}
                  >
                    <div className="whitespace-pre-line space-y-1">{msg.content}</div>
                  </div>
                </div>
              ))}

              {/* Structured Recommendation Card */}
              {latestRecommendation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-2xl bg-[#edf7cd]/70 dark:bg-[#1f2e24] border border-[#17231b]/20 dark:border-[#d9ff69]/30 shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[#17231b] dark:text-[#d9ff69] text-xs font-extrabold uppercase tracking-wide">
                      <Zap className="w-4 h-4 text-[#17231b] dark:text-[#d9ff69]" />
                      Recommended Shipment Plan
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#17231b] text-[#edf7cd] dark:bg-[#d9ff69] dark:text-[#17231b]">
                      {latestRecommendation.delivery_type.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-white dark:bg-[#25372b] border border-[#e2ebd0] dark:border-[#2d4234]">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Service Level</span>
                      <span className="font-bold text-[#17231b] dark:text-[#edf7cd] capitalize">
                        {latestRecommendation.delivery_type} ({latestRecommendation.estimated_days || "1-2 days"})
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#25372b] border border-[#e2ebd0] dark:border-[#2d4234]">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Classification</span>
                      <span className="font-bold text-[#17231b] dark:text-[#edf7cd] capitalize">
                        {latestRecommendation.product_type}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#25372b] border border-[#e2ebd0] dark:border-[#2d4234]">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Payment / Billing</span>
                      <span className="font-bold text-[#17231b] dark:text-[#edf7cd] uppercase">
                        {latestRecommendation.payment_mode} ({latestRecommendation.billing_location})
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#25372b] border border-[#e2ebd0] dark:border-[#2d4234]">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Estimated Rate</span>
                      <span className="font-bold text-[#17231b] dark:text-[#d9ff69]">
                        ${latestRecommendation.estimated_cost?.toFixed(2) || "45.00"}
                      </span>
                    </div>
                  </div>

                  {latestRecommendation.handling_notes && (
                    <p className="text-[11px] text-slate-600 dark:text-[#edf7cd]/90 italic flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#17231b] dark:text-[#d9ff69] shrink-0" />
                      {latestRecommendation.handling_notes}
                    </p>
                  )}

                  <button
                    onClick={() => handleProceedToShipment(latestRecommendation)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#17231b] dark:bg-[#d9ff69] text-[#edf7cd] dark:text-[#17231b] font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs hover:opacity-90 transition-all cursor-pointer"
                  >
                    <span>Proceed to Shipment Booking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}

              {loading && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-[#edf7cd]/70 text-xs py-2">
                  <Bot className="w-4 h-4 animate-spin text-[#17231b] dark:text-[#d9ff69]" />
                  <span>Groq AI is analyzing logistics routing & records...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-3 py-2 border-t border-[#e2ebd0] dark:border-[#2d4234] bg-white dark:bg-[#1f2e24] flex gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(qp)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#edf7cd] text-[#17231b] dark:bg-[#25372b] dark:text-[#edf7cd] hover:bg-[#17231b] hover:text-[#edf7cd] dark:hover:bg-[#d9ff69] dark:hover:text-[#17231b] transition-colors cursor-pointer"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-[#e2ebd0] dark:border-[#2d4234] bg-white dark:bg-[#1f2e24]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about packages or describe cargo..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] bg-slate-50 dark:bg-[#25372b] text-[#17231b] dark:text-white placeholder:text-slate-400 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#17231b] dark:focus:ring-[#d9ff69]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl bg-[#17231b] dark:bg-[#d9ff69] text-[#edf7cd] dark:text-[#17231b] font-bold disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
