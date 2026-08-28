"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  FileText,
  Settings,
  User,
  Package,
  Truck,
  Sparkles,
  LogOut,
  Box
} from "lucide-react";
import { signOut } from "@/lib/auth-client";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "New booking", href: "/booking", icon: PlusCircle },
    { name: "Shipments", href: "/shipments", icon: Package },
    { name: "Drafts", href: "/drafts", icon: FileText },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Profile", href: "/profile", icon: User }
  ];

  const handleSignOut = async () => {
    try {
      localStorage.clear();
      document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "better-auth.session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      await signOut();
    } catch {
      window.location.href = "/login";
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <aside className="w-64 flex flex-col h-full bg-white dark:bg-[#17231b] border-r border-[#e2ebd0] dark:border-[#2d4234] select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#e2ebd0] dark:border-[#2d4234]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#17231b] text-[#edf7cd] flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-[#17231b] dark:text-[#edf7cd] flex items-center gap-1">
              One Logistics
            </span>
            <span className="text-[10px] text-slate-400 dark:text-[#9bb3a1] block -mt-1 font-semibold uppercase tracking-wider">
              Experience ↗
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9bb3a1]">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
                isActive
                  ? "bg-[#edf7cd] text-[#17231b] shadow-xs font-black"
                  : "text-slate-600 dark:text-[#edf7cd]/80 hover:bg-[#edf7cd]/60 dark:hover:bg-[#25372b] hover:text-[#17231b] dark:hover:text-[#edf7cd]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#17231b]" : "text-slate-500 dark:text-[#9bb3a1]"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* AI Highlight Section (ONE ASSIST) */}
        <div className="pt-4 mt-4 border-t border-[#e2ebd0] dark:border-[#2d4234]">
          <div className="p-3.5 rounded-2xl bg-[#17231b] text-[#edf7cd] border border-[#2d4234]">
            <div className="flex items-center gap-2 text-[#edf7cd] text-[11px] font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#edf7cd]" />
              ONE ASSIST
            </div>
            <p className="text-xs text-white font-bold leading-tight mb-1.5">
              Need help choosing a service?
            </p>
            <p className="text-[11px] text-[#edf7cd]/70 leading-relaxed flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#283a2f] text-[#edf7cd] inline-flex items-center justify-center text-[9px] font-black">N</span>
              AI assistant arrives in phase 9.
            </p>
          </div>
        </div>
      </div>

      {/* User / Sign Out Footer */}
      <div className="p-4 border-t border-[#e2ebd0] dark:border-[#2d4234]">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
