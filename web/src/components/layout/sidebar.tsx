"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { mainNavigation, secondaryNavigation } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";
import { LogOut, X } from "lucide-react";
import { signOutUser } from "@/lib/session/sign-out";

export function Sidebar({
  profile,
  onNavigate,
  showClose,
  className,
}: {
  profile: Profile;
  onNavigate?: () => void;
  showClose?: boolean;
  className?: string;
}) {
  const pathname = usePathname();

  async function handleSignOut() {
    onNavigate?.();
    await signOutUser();
  }

  function handleLinkClick() {
    onNavigate?.();
  }

  return (
    <aside
      className={cn(
        "relative flex h-full w-full flex-col bg-brand-purple text-white",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between gap-3 border-b border-white/10 px-5 pt-[env(safe-area-inset-top)]">
        <Image
          src="/logo.svg"
          alt="Ubuntu Tribe"
          width={120}
          height={26}
          priority
          style={{ height: "auto" }}
        />
        {showClose && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wider text-white/50">GrowthOS</p>
        <p className="mt-1 text-xs text-white/70">Commercial Intelligence Platform</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 overscroll-contain">
        {mainNavigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="my-3 border-t border-white/10" />

        {secondaryNavigation.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="mb-3 rounded-lg bg-white/10 px-3 py-2">
          <p className="truncate text-sm font-medium">{profile.full_name}</p>
          <p className="truncate text-xs text-white/60">{profile.role}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/75 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
