"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { REG_SECTIONS } from "@/lib/constants/regulatory";
import { cn } from "@/lib/utils";

export function RegulatorySectionNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap gap-1 border-b border-gray-200 pb-px">
      {REG_SECTIONS.map((section) => {
        const active =
          pathname === section.href || pathname.startsWith(section.href + "/");
        return (
          <Link
            key={section.key}
            href={section.href}
            className={cn(
              "rounded-t-lg px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "border border-b-white border-gray-200 bg-white text-brand-purple -mb-px"
                : "text-gray-500 hover:text-brand-purple"
            )}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
