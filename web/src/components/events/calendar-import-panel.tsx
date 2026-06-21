"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, CheckCircle2, RefreshCw, Search, XCircle } from "lucide-react";

type CalendarStatus = {
  configured: boolean;
  connected: boolean;
  connectedAt: string | null;
};

type PreviewEvent = {
  google_event_id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  description: string | null;
  alreadyImported: boolean;
};

function formatConnectedAt(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function formatEventDate(start: string, end: string | null) {
  const startLabel = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(start)
  );
  if (!end || end === start) return startLabel;
  const endLabel = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(end)
  );
  return `${startLabel} – ${endLabel}`;
}

export function CalendarImportPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CalendarStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [previewEvents, setPreviewEvents] = useState<PreviewEvent[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setStatusLoading(true);
      try {
        const res = await fetch("/api/calendar/status");
        const data = await res.json();
        if (!cancelled) setStatus(data);

        if (searchParams.get("calendar") === "connected") {
          if (!cancelled) {
            setMessage("Google Calendar connected successfully.");
          }
          router.replace("/events", { scroll: false });
        }
      } catch {
        if (!cancelled) setStatus({ configured: false, connected: false, connectedAt: null });
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return previewEvents;
    return previewEvents.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q) ||
        e.start_date.includes(q)
    );
  }, [previewEvents, search]);

  async function handleConnect() {
    window.location.href = "/api/calendar/auth";
  }

  async function handleBrowse() {
    setPreviewLoading(true);
    setMessage(null);
    setPickerOpen(true);
    setSearch("");
    setSelectedIds(new Set());

    try {
      const res = await fetch("/api/calendar/preview");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load calendar events");
      setPreviewEvents(data.events ?? []);
    } catch (err) {
      setPickerOpen(false);
      setMessage(err instanceof Error ? err.message : "Failed to load calendar events");
    } finally {
      setPreviewLoading(false);
    }
  }

  function toggleEvent(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelectedIds(new Set(filteredEvents.map((e) => e.google_event_id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function handleImportSelected() {
    if (selectedIds.size === 0) return;

    setImportLoading(true);
    setMessage(null);
    const selectedEvents = previewEvents.filter((e) => selectedIds.has(e.google_event_id));

    try {
      const res = await fetch("/api/calendar/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: selectedEvents }),
        signal: AbortSignal.timeout(120_000),
      });
      let data: { error?: string; imported?: number; updated?: number; total?: number };
      try {
        data = await res.json();
      } catch {
        throw new Error("Import timed out or returned an invalid response");
      }
      if (!res.ok) throw new Error(data.error ?? "Import failed");

      setMessage(
        `Imported ${data.imported ?? 0} new events (${data.updated ?? 0} updated, ${data.total ?? 0} total)`
      );
      setPickerOpen(false);
      setPreviewEvents([]);
      setSelectedIds(new Set());
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImportLoading(false);
    }
  }

  const canBrowse = status?.configured && status.connected && !previewLoading && !importLoading;

  return (
    <div className="rounded-xl border border-brand-purple/20 bg-brand-purple/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-brand-purple" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-gray-900">Google Calendar Import</p>
              {statusLoading ? (
                <Badge variant="default">Checking…</Badge>
              ) : status?.connected ? (
                <Badge variant="green" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Connected
                </Badge>
              ) : status?.configured ? (
                <Badge variant="default" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Not connected
                </Badge>
              ) : (
                <Badge variant="red">Not configured</Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              Browse your calendar and import only Ubuntu-relevant events
            </p>
            {status?.connected && status.connectedAt && (
              <p className="mt-1 text-xs text-green-700">
                Linked {formatConnectedAt(status.connectedAt)}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!status?.connected && (
            <Button size="sm" variant="outline" onClick={handleConnect} disabled={!status?.configured}>
              Connect Google
            </Button>
          )}
          {status?.connected && (
            <Button size="sm" variant="outline" onClick={handleConnect}>
              Reconnect
            </Button>
          )}
          <Button size="sm" onClick={handleBrowse} disabled={!canBrowse}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${previewLoading ? "animate-spin" : ""}`} />
            {previewLoading ? "Loading…" : "Browse Calendar"}
          </Button>
        </div>
      </div>

      {pickerOpen && (
        <div className="mt-4 border-t border-brand-purple/15 pt-4">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, location, or date…"
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button type="button" onClick={selectAllVisible} className="text-brand-purple hover:underline">
                Select visible
              </button>
              <span className="text-gray-300">|</span>
              <button type="button" onClick={clearSelection} className="text-gray-500 hover:underline">
                Clear
              </button>
              <span className="text-gray-400">
                {selectedIds.size} of {previewEvents.length} selected
              </span>
            </div>
          </div>

          {previewEvents.length === 0 ? (
            <p className="text-sm text-gray-500">No events found in the last 3 months or next 3 months.</p>
          ) : filteredEvents.length === 0 ? (
            <p className="text-sm text-gray-500">No events match your search.</p>
          ) : (
            <ul className="max-h-80 space-y-1 overflow-y-auto rounded-lg border border-gray-200 bg-white">
              {filteredEvents.map((event) => {
                const checked = selectedIds.has(event.google_event_id);
                return (
                  <li key={event.google_event_id}>
                    <label
                      className={`flex cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-gray-50 ${
                        checked ? "bg-brand-purple/5" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleEvent(event.google_event_id)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{event.name}</span>
                          {event.alreadyImported && (
                            <Badge variant="blue">In GrowthOS</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatEventDate(event.start_date, event.end_date)}
                          {event.location ? ` · ${event.location}` : ""}
                        </p>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={handleImportSelected}
              disabled={selectedIds.size === 0 || importLoading}
            >
              {importLoading
                ? "Importing…"
                : `Import ${selectedIds.size} selected event${selectedIds.size === 1 ? "" : "s"}`}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setPickerOpen(false);
                setPreviewEvents([]);
                setSelectedIds(new Set());
                setSearch("");
              }}
              disabled={importLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {message && (
        <p
          className={`mt-2 text-xs ${
            message.includes("successfully") || message.includes("Imported")
              ? "text-green-700"
              : "text-gray-700"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
