import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getExecutiveReportData } from "@/lib/actions/reports";
import { ExecutiveReportPdf } from "@/lib/pdf/executive-report";
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

    const buffer = await renderToBuffer(<ExecutiveReportPdf data={data} />);

    const filename = `executive-report-${data.period.from}-to-${data.period.to}.pdf`;

    if (isStorageConfigured()) {
      const key = exportKey(profile.id, `${Date.now()}-${filename}`);
      await uploadBuffer(key, Buffer.from(buffer), "application/pdf");
    }

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "PDF generation failed" },
      { status: 500 }
    );
  }
}
