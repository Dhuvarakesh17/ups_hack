"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  };

  if (!mounted) {
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e2ebd0] bg-white text-[#17231b] text-xs font-bold ${className}`}>
        <Sun className="w-3.5 h-3.5 text-[#17231b]" />
        <span className="text-[11px] font-bold">Light</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      type="button"
      aria-label="Toggle Theme"
      title={theme === "light" ? "Switch to Dark Mode (#17231b)" : "Switch to Light Mode"}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-black shadow-xs cursor-pointer select-none active:scale-95 ${
        theme === "dark"
          ? "border-[#2d4234] bg-[#1f2e24] text-[#d9ff69] hover:bg-[#283a2f]"
          : "border-[#e2ebd0] bg-white text-[#17231b] hover:bg-[#edf7cd] shadow-xs"
      } ${className}`}
    >
      {theme === "dark" ? (
        <>
          <Sun className="w-3.5 h-3.5 text-[#d9ff69]" />
          <span className="text-[11px] tracking-tight text-[#edf7cd]">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-[#17231b]" />
          <span className="text-[11px] tracking-tight text-[#17231b]">Dark</span>
        </>
      )}
    </button>
  );
}
