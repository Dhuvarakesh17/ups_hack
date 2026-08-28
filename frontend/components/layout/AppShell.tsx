"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { FloatingAIAssistant } from "../ai/FloatingAIAssistant";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";

interface AppShellProps {
  children: ReactNode;
  title?: string;
}

export function AppShell({ children, title = "Dashboard" }: AppShellProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const localToken =
      localStorage.getItem("session_token") ||
      localStorage.getItem("better-auth.session_token");
    const localEmail = localStorage.getItem("current_user_email");

    // If Better Auth has a Google / credentials session, sync Google data to profile
    if (session?.user) {
      const googleUser = session.user;
      if (googleUser.email)
        localStorage.setItem("current_user_email", googleUser.email);
      if (googleUser.id) localStorage.setItem("current_user_id", googleUser.id);
      if (googleUser.name)
        localStorage.setItem("current_user_name", googleUser.name);
      if (googleUser.image)
        localStorage.setItem("current_user_image", googleUser.image);

      // Sync Google Name & Avatar to database profile
      api.profile
        .update({
          name: googleUser.name || undefined,
          image: googleUser.image || undefined,
        })
        .catch(() => {});

      setAuthorized(true);
      return;
    }

    if (!isPending) {
      if (localToken || localEmail) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
        router.push("/login");
      }
    }
  }, [session, isPending, router]);

  if (authorized === false || (isPending && authorized === null)) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#17231b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#d9ff69] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 dark:text-[#9bb3a1]">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#17231b] overflow-hidden text-[#17231b] dark:text-[#edf7cd]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay & Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#17231b]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-[#17231b] shadow-2xl z-10">
            <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          title={title}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white dark:bg-[#17231b]">
          <div className="max-w-7xl mx-auto space-y-6 pb-20">{children}</div>
        </main>
      </div>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
    </div>
  );
}
