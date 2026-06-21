"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { globalSearch, type SearchResult } from "@/lib/actions/search";
import { Search, Building2, GitBranch, User } from "lucide-react";

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await globalSearch(query));
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const total =
    (results?.organizations.length ?? 0) +
    (results?.deals.length ?? 0) +
    (results?.contacts.length ?? 0);

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={ref} className="relative hidden md:block">
      <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
        <Search className="mr-2 h-4 w-4 text-gray-400" />
        <input
          type="search"
          placeholder="Search orgs, deals, contacts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
        {loading && <span className="text-xs text-gray-400">…</span>}
      </div>

      {open && results && total > 0 && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
          {results.organizations.length > 0 && (
            <div className="px-3 py-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Organizations</p>
              {results.organizations.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => navigate(o.href)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50"
                >
                  <Building2 className="h-3.5 w-3.5 text-brand-purple" />
                  <span className="truncate">{o.name}</span>
                </button>
              ))}
            </div>
          )}
          {results.deals.length > 0 && (
            <div className="px-3 py-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Deals</p>
              {results.deals.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => navigate(d.href)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50"
                >
                  <GitBranch className="h-3.5 w-3.5 text-brand-gold" />
                  <span className="truncate">{d.name}</span>
                  <span className="ml-auto text-xs text-gray-400">{d.stage}</span>
                </button>
              ))}
            </div>
          )}
          {results.contacts.length > 0 && (
            <div className="px-3 py-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Contacts</p>
              {results.contacts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate(c.href)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50"
                >
                  <User className="h-3.5 w-3.5 text-gray-500" />
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {open && results && total === 0 && query.length >= 2 && !loading && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-400 shadow-lg">
          No results for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
