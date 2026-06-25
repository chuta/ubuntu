import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient, getProfile } from "@/lib/supabase/server";
import {
  createAiDocumentShell,
  generateAiContent,
  regenerateAiDocument,
  type AiDocumentInput,
} from "@/lib/documents/document-service";
import { isAiConfigured } from "@/lib/documents/draft-core";
import type { DocumentType } from "@/types/documents";

// Synchronous generation; kept under the platform's 60s function budget.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

function str(v: unknown) {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function parseInput(body: Record<string, unknown>): AiDocumentInput {
  const title = str(body.title);
  const documentType = str(body.document_type);
  if (!title) throw new Error("Title is required");
  if (!documentType) throw new Error("Document type is required");

  return {
    title,
    document_type: documentType as DocumentType,
    organization_id: str(body.organization_id),
    deal_id: str(body.deal_id),
    partnership_id: str(body.partnership_id),
    key_terms: str(body.key_terms),
    additional_context: str(body.additional_context),
  };
}

function errorStatus(message: string): number {
  if (message === "Not authorized") return 403;
  if (message === "Document not found") return 404;
  if (message.includes("not configured")) return 503;
  return 500;
}

export async function POST(request: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "Anthropic API key not configured. Add ANTHROPIC_API_KEY to .env" },
      { status: 503 }
    );
  }

  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const phase = body.phase === "retry" ? "retry" : "create";
  const supabase = await createClient();

  try {
    if (phase === "retry") {
      const documentId = str(body.documentId);
      if (!documentId) {
        return NextResponse.json({ error: "documentId is required" }, { status: 400 });
      }
      await regenerateAiDocument(supabase, profile.id, documentId, {
        key_terms: str(body.key_terms),
        additional_context: str(body.additional_context),
      });
      revalidatePath("/documents");
      revalidatePath(`/documents/${documentId}`);
      revalidatePath("/dashboard");
      return NextResponse.json({ documentId, status: "ready" });
    }

    // Create the shell first so a generation failure still leaves a recoverable
    // record (the document page offers a retry).
    const input = parseInput(body);
    const documentId = await createAiDocumentShell(supabase, profile.id, input);

    try {
      await generateAiContent(supabase, profile.id, documentId, input);
    } catch (genErr) {
      const message = genErr instanceof Error ? genErr.message : "AI draft generation failed";
      // Shell exists + status is ERROR; client navigates and can retry.
      return NextResponse.json({ documentId, status: "error", error: message }, { status: 200 });
    }

    revalidatePath("/documents");
    revalidatePath(`/documents/${documentId}`);
    revalidatePath("/dashboard");
    return NextResponse.json({ documentId, status: "ready" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI draft failed";
    return NextResponse.json({ error: message }, { status: errorStatus(message) });
  }
}
