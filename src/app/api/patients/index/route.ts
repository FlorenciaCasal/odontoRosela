import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { patients } from "@/lib/schema";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const legacyKey = url.searchParams.get("k");
  const auth = req.headers.get("authorization");
  const bearerToken =
    auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : null;
  const integrationToken = process.env.INTEGRATION_TOKEN;
  const hasLegacyKey = !!legacyKey && legacyKey === process.env.ACCESS_KEY2;
  const hasIntegrationToken = !!integrationToken && bearerToken === integrationToken;

  // Compatibilidad temporal: ACCESS_KEY legacy o INTEGRATION_TOKEN nuevo.
  if (!hasLegacyKey && !hasIntegrationToken) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: patients.id,
      fullName: patients.fullName,
      docNumber: patients.docNumber,
    })
    .from(patients);

  return NextResponse.json({ ok: true, patients: rows }, { status: 200 });
}
