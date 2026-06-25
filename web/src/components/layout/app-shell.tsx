"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNavProvider, useMobileNav } from "@/components/layout/mobile-nav-context";
import { SessionManager } from "@/components/auth/session-manager";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";

function MobileNavDrawer({ profile }: { profile: Profile }) {
  const { open, close } = useMobileNav();
  const pathname = usePathname();

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={close}
        className={cn(
          "fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[min(288px,88vw)] shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar profile={profile} onNavigate={close} showClose />
      </aside>
    </>
  );
}

function AppShellFrame({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-surface">
      <div className="hidden h-full w-64 shrink-0 lg:block">
        <Sidebar profile={profile} />
      </div>

      <MobileNavDrawer profile={profile} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {children}
        <SessionManager />
      </div>
    </div>
  );
}

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  return (
    <MobileNavProvider>
      <AppShellFrame profile={profile}>{children}</AppShellFrame>
    </MobileNavProvider>
  );
}
