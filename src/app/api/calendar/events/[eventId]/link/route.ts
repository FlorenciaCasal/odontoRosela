import { NextRequest, NextResponse } from "next/server";
import { getCalendarEventLinkByEventId } from "@/lib/calendar-events";
import { getCalendarEventCleanLink, requireIntegrationToken } from "@/lib/integrations";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  if (!requireIntegrationToken(req)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { eventId } = await params;
  const link = await getCalendarEventLinkByEventId(eventId);
  const cleanLink = getCalendarEventCleanLink(req, eventId);

  return NextResponse.json(
    {
      ok: true,
      eventId,
      cleanLink,
      status: link?.status ?? "unlinked",
      patientId: link?.status === "linked" ? link.patientId : null,
      needsManualReview: link?.manualReviewRequired ?? true,
      lastSyncedAt: link?.lastSyncedAt?.toISOString() ?? null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
