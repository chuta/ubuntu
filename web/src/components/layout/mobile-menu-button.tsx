"use client";

import { Menu, X } from "lucide-react";
import { useMobileNav } from "@/components/layout/mobile-nav-context";
import { cn } from "@/lib/utils";

export function MobileMenuButton({ className }: { className?: string }) {
  const { open, toggle } = useMobileNav();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={open}
      aria-label={open ? "Close navigation menu" : "Open navigation menu"}
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:border-brand-purple/30 hover:text-brand-purple lg:hidden",
        className
      )}
    >
      {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  );
}
