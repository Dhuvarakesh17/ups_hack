"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { ThemeToggle } from "./ThemeToggle";
import { api } from "@/lib/api";
import { User as UserType } from "@/types";

interface HeaderProps {
  title?: string;
  onOpenMobileMenu: () => void;
}

export function Header({ title = "Dashboard", onOpenMobileMenu }: HeaderProps) {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    api.profile
      .get()
      .then((u) => setUser(u))
      .catch(() => {
        setUser({
          id: "usr_demo",
          name: "Nitheesh Kumar",
          email: "nitheeshkumar@gmail.com",
          email_verified: true,
          created_at: new Date().toISOString()
        });
      });
  }, []);

  return (
    <header className="h-16 shrink-0 bg-white/95 dark:bg-[#17231b]/95 backdrop-blur-md border-b border-[#e2ebd0] dark:border-[#2d4234] px-4 sm:px-8 flex items-center justify-between z-30 sticky top-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] text-[#17231b] dark:text-[#edf7cd] hover:bg-[#edf7cd] dark:hover:bg-[#1f2e24] cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#9bb3a1] block leading-tight">
            One Workspace
          </span>
          <h1 className="text-base sm:text-lg font-black text-[#17231b] dark:text-[#edf7cd] tracking-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* In-App Notification Center */}
        <NotificationDropdown />

        {/* Light / Dark Mode Toggle */}
        <ThemeToggle />

        <div className="h-5 w-px bg-[#e2ebd0] dark:bg-[#2d4234] mx-1" />

        {/* User Profile Pill */}
        <Link
          href="/profile"
          className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#e2ebd0] dark:border-[#2d4234] hover:bg-[#edf7cd]/50 dark:hover:bg-[#1f2e24] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#17231b] dark:bg-[#d9ff69] text-[#d9ff69] dark:text-[#17231b] font-black flex items-center justify-center text-xs overflow-hidden shadow-xs">
            {user?.image ? (
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || "N"
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-[#17231b] dark:text-[#edf7cd] leading-tight truncate max-w-[120px]">
              {user?.name || "Nitheesh Kumar"}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-[#9bb3a1] leading-tight truncate max-w-[120px]">
              {user?.email || "nitheeshkumar@gmail.com"}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
