"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import {
  createDocument,
  updateDocument,
  type DocumentFormData,
  type AiDraftParams,
} from "@/lib/actions/documents";
import { DOCUMENT_STATUSES, DOCUMENT_TYPES } from "@/lib/constants/documents";
import type { Document } from "@/types/documents";
import { Sparkles, Loader2 } from "lucide-react";

type LinkOptions = {
  organizations: { id: string; name: string }[];
  deals: { id: string; name: string }[];
  partnerships: { id: string; name: string }[];
};

type DocumentLinkDefaults = {
  organization_id?: string;
  deal_id?: string;
  partnership_id?: string;
};

export function DocumentForm({
  links,
  document,
  aiMode = false,
  defaultValues,
}: {
  links: LinkOptions;
  document?: Document;
  aiMode?: boolean;
  defaultValues?: DocumentLinkDefaults;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"manual" | "ai">(aiMode ? "ai" : "manual");

  async function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const data: DocumentFormData = {
      title: fd.get("title") as string,
      document_type: fd.get("document_type") as DocumentFormData["document_type"],
      status: fd.get("status") as DocumentFormData["status"],
      organization_id: (fd.get("organization_id") as string) || undefined,
      deal_id: (fd.get("deal_id") as string) || undefined,
      partnership_id: (fd.get("partnership_id") as string) || undefined,
      effective_date: (fd.get("effective_date") as string) || undefined,
      expiration_date: (fd.get("expiration_date") as string) || undefined,
      content: (fd.get("content") as string) || undefined,
    };
    try {
      if (document) {
        await updateDocument(document.id, data);
        router.push(`/documents/${document.id}`);
      } else {
        const id = await createDocument(data);
        router.push(`/documents/${id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  async function handleAiSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const params: AiDraftParams = {
      title: fd.get("title") as string,
      document_type: fd.get("document_type") as AiDraftParams["document_type"],
      organization_id: (fd.get("organization_id") as string) || undefined,
      deal_id: (fd.get("deal_id") as string) || undefined,
      partnership_id: (fd.get("partnership_id") as string) || undefined,
      key_terms: (fd.get("key_terms") as string) || undefined,
      additional_context: (fd.get("additional_context") as string) || undefined,
    };

    try {
      // 1. Create the shell — fast, returns immediately.
      const createRes = await fetch("/api/documents/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: "create", ...params }),
      });
      const createData = await createRes.json().catch(() => ({}));
      if (!createRes.ok || !createData.documentId) {
        throw new Error(createData.error ?? "Could not start AI draft");
      }
      const documentId = createData.documentId as string;

      // 2. Kick off generation. We intentionally do NOT depend on this response:
      //    an upstream gateway can sever the ~50s request even though the
      //    function keeps running and saves the draft. The status poll below is
      //    the real source of truth.
      fetch("/api/documents/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: "generate",
          documentId,
          key_terms: params.key_terms,
          additional_context: params.additional_context,
        }),
      }).catch(() => {});

      // 3. Poll the backend status until it reaches a terminal state.
      const deadline = Date.now() + 150_000;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 3000));
        const status = await fetch(`/api/documents/${documentId}/draft-status`, {
          cache: "no-store",
        })
          .then((r) => r.json())
          .catch(() => null);
        if (!status) continue;
        if (status.status === "ready") {
          router.push(`/documents/${documentId}`);
          router.refresh();
          return;
        }
        if (status.status === "error") {
          throw new Error(status.error ?? "AI draft generation failed");
        }
      }
      throw new Error(
        "Generation is taking longer than expected. Open the document to check or retry."
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "AI draft failed";
      setError(message);
      setLoading(false);
    }
  }

  const linkFields = (
    <>
      <FormField label="Organization" htmlFor="organization_id">
        <Select id="organization_id" name="organization_id" defaultValue={document?.organization_id ?? defaultValues?.organization_id ?? ""}>
          <option value="">None</option>
          {links.organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </Select>
      </FormField>
      <FormField label="Deal" htmlFor="deal_id">
        <Select id="deal_id" name="deal_id" defaultValue={document?.deal_id ?? defaultValues?.deal_id ?? ""}>
          <option value="">None</option>
          {links.deals.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
      </FormField>
      <FormField label="Partnership" htmlFor="partnership_id">
        <Select id="partnership_id" name="partnership_id" defaultValue={document?.partnership_id ?? defaultValues?.partnership_id ?? ""}>
          <option value="">None</option>
          {links.partnerships.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </FormField>
    </>
  );

  if (document) {
    return (
      <form onSubmit={handleManualSubmit} className="space-y-6">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Title" htmlFor="title" required className="sm:col-span-2">
              <Input id="title" name="title" required defaultValue={document.title} />
            </FormField>
            <FormField label="Type" htmlFor="document_type" required>
              <Select id="document_type" name="document_type" required defaultValue={document.document_type}>
                {DOCUMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </FormField>
            <FormField label="Status" htmlFor="status" required>
              <Select id="status" name="status" required defaultValue={document.status}>
                {DOCUMENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </FormField>
            {linkFields}
          </div>
        </section>
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Changes"}</Button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={mode === "manual" ? "primary" : "outline"} size="sm" onClick={() => setMode("manual")}>
          Manual Create
        </Button>
        <Button variant={mode === "ai" ? "primary" : "outline"} size="sm" onClick={() => setMode("ai")}>
          <Sparkles className="mr-1.5 h-4 w-4" />
          AI Draft
        </Button>
      </div>

      {mode === "manual" ? (
        <form onSubmit={handleManualSubmit} className="space-y-6">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Title" htmlFor="title" required className="sm:col-span-2">
                <Input id="title" name="title" required placeholder="e.g. DRC Ministry MOU" />
              </FormField>
              <FormField label="Type" htmlFor="document_type" required>
                <Select id="document_type" name="document_type" required defaultValue="MOU">
                  {DOCUMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              </FormField>
              <FormField label="Status" htmlFor="status" required>
                <Select id="status" name="status" required defaultValue="DRAFT">
                  {DOCUMENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </FormField>
              {linkFields}
              <FormField label="Content (Markdown)" htmlFor="content" className="sm:col-span-2">
                <Textarea
                  id="content"
                  name="content"
                  rows={8}
                  placeholder="Leave blank to start from a branded template for the selected type, or paste your own markdown here."
                />
              </FormField>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Ubuntu Tribe letterhead and footer are applied automatically. Word types export as
              DOCX; Investor Decks and Government Briefs export as PPTX.
            </p>
          </section>
          <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create Document"}</Button>
        </form>
      ) : (
        <form onSubmit={handleAiSubmit} className="space-y-6">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <section className="rounded-xl border border-brand-purple/20 bg-brand-purple/5 p-6">
            <p className="mb-4 text-sm text-brand-purple">
              Claude generates a branded draft and saves it as version 1. Word documents export as
              DOCX; Investor Decks and Government Briefs export as PPTX — both with Ubuntu Tribe styling.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Title" htmlFor="title" required className="sm:col-span-2">
                <Input id="title" name="title" required placeholder="e.g. Ubuntu × Ministry of Mines MOU" />
              </FormField>
              <FormField label="Document Type" htmlFor="document_type" required>
                <Select id="document_type" name="document_type" required defaultValue="MOU">
                  {DOCUMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              </FormField>
              {linkFields}
              <FormField label="Key Terms" htmlFor="key_terms" className="sm:col-span-2">
                <Textarea id="key_terms" name="key_terms" placeholder="Revenue share, GIFT adoption, territory exclusivity…" rows={3} />
              </FormField>
              <FormField label="Additional Context" htmlFor="additional_context" className="sm:col-span-2">
                <Textarea id="additional_context" name="additional_context" placeholder="Meeting notes, regulatory context…" rows={2} />
              </FormField>
            </div>
          </section>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating draft… up to a minute
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate &amp; Save Draft
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
