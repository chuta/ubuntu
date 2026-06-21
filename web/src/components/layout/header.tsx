import type { Profile } from "@/types/database";
import { GlobalSearch } from "@/components/layout/global-search";

export function Header({ profile, title }: { profile: Profile; title: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-500">
          Real value. Digital access. Shared opportunity.
        </p>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <GlobalSearch />
        <span className="hidden sm:inline">{profile.title ?? "Commercial Director"}</span>
        <a
          href="https://utribe.one/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-purple hover:underline"
        >
          utribe.one ↗
        </a>
      </div>
    </header>
  );
}
