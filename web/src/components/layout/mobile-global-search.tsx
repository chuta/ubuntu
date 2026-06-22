"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { globalSearch, type SearchResult } from "@/lib/actions/search";
import { Building2, GitBranch, Search, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileGlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await globalSearch(query));
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const total =
    (results?.organizations.length ?? 0) +
    (results?.deals.length ?? 0) +
    (results?.contacts.length ?? 0);

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    setResults(null);
    router.push(href);
  }

  function close() {
    setOpen(false);
    setQuery("");
    setResults(null);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm hover:border-brand-purple/30 hover:text-brand-purple md:hidden"
      >
        <Search className="h-4 w-4" />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-[60] md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close search"
          onClick={close}
          className={cn(
            "absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={cn(
            "absolute inset-x-0 top-0 border-b border-gray-200 bg-white p-4 pt-[calc(1rem+env(safe-area-inset-top))] shadow-lg transition-transform duration-200",
            open ? "translate-y-0" : "-translate-y-full"
          )}
        >
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
              <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                type="search"
                placeholder="Search orgs, deals, contacts…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
              {loading && <span className="text-xs text-gray-400">…</span>}
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 max-h-[min(60vh,420px)] overflow-y-auto rounded-xl border border-gray-100 bg-white">
            {results && total > 0 ? (
              <>
                {results.organizations.length > 0 && (
                  <div className="px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Organizations
                    </p>
                    {results.organizations.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => navigate(o.href)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-sm hover:bg-gray-50"
                      >
                        <Building2 className="h-3.5 w-3.5 text-brand-purple" />
                        <span className="truncate">{o.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {results.deals.length > 0 && (
                  <div className="px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Deals
                    </p>
                    {results.deals.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => navigate(d.href)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-sm hover:bg-gray-50"
                      >
                        <GitBranch className="h-3.5 w-3.5 text-brand-gold" />
                        <span className="truncate">{d.name}</span>
                        <span className="ml-auto text-xs text-gray-400">{d.stage}</span>
                      </button>
                    ))}
                  </div>
                )}
                {results.contacts.length > 0 && (
                  <div className="px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Contacts
                    </p>
                    {results.contacts.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => navigate(c.href)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-sm hover:bg-gray-50"
                      >
                        <User className="h-3.5 w-3.5 text-gray-500" />
                        <span className="truncate">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : query.length >= 2 && !loading ? (
              <p className="p-4 text-sm text-gray-400">No results for &ldquo;{query}&rdquo;</p>
            ) : (
              <p className="p-4 text-sm text-gray-400">Type at least 2 characters to search.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
