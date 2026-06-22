import type { Profile } from "@/types/database";
import { GlobalSearch } from "@/components/layout/global-search";
import { MobileMenuButton } from "@/components/layout/mobile-menu-button";
import { MobileGlobalSearch } from "@/components/layout/mobile-global-search";

export function Header({ profile, title }: { profile: Profile; title: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-white/90 sm:px-6 sm:py-0 sm:pt-[env(safe-area-inset-top)]">
      <div className="flex min-h-14 items-center gap-3 sm:min-h-16 sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <MobileMenuButton />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-gray-900 sm:text-lg">{title}</h1>
            <p className="hidden truncate text-xs text-gray-500 sm:block">
              Real value. Digital access. Shared opportunity.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <GlobalSearch />
          <MobileGlobalSearch />
          <span className="hidden text-sm text-gray-500 md:inline">
            {profile.title ?? "Commercial Director"}
          </span>
          <a
            href="https://utribe.one/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg px-2 py-1.5 text-xs font-medium text-brand-purple hover:bg-brand-purple/5 sm:text-sm"
          >
            <span className="hidden sm:inline">utribe.one ↗</span>
            <span className="sm:hidden">↗</span>
          </a>
        </div>
      </div>
    </header>
  );
}
