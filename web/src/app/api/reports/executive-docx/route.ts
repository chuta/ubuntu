import { NextResponse } from "next/server";
import { getExecutiveReportData } from "@/lib/actions/reports";
import { buildExecutiveReportDocx } from "@/lib/docx/executive-report";
import { getProfile } from "@/lib/supabase/server";
import { exportKey, isStorageConfigured, uploadBuffer } from "@/lib/s3/storage";

export async function POST(request: Request) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const data = await getExecutiveReportData({
      preset: body.preset,
      from: body.from,
      to: body.to,
    });

    const buffer = await buildExecutiveReportDocx(data);
    const filename = `executive-report-${data.period.from}-to-${data.period.to}.docx`;

    if (isStorageConfigured()) {
      const key = exportKey(profile.id, `${Date.now()}-${filename}`);
      await uploadBuffer(
        key,
        buffer,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "DOCX generation failed" },
      { status: 500 }
    );
  }
}
