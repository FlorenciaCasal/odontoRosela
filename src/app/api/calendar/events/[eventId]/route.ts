import { NextRequest, NextResponse } from "next/server";
import { getCurrentAuthenticatedUser } from "@/lib/auth/session";
import { getCalendarEventLinkByEventId, normalizeGoogleEventId } from "@/lib/calendar-events";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const auth = await getCurrentAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { eventId: rawEventId } = await params;
  const eventId = normalizeGoogleEventId(rawEventId);
  const link = await getCalendarEventLinkByEventId(eventId);

  return NextResponse.json({
    ok: true,
    eventId,
    link: link
      ? {
          id: link.id,
          status: link.status,
          patientId: link.patientId,
          eventTitleSnapshot: link.eventTitleSnapshot,
          eventStartAt: link.eventStartAt?.toISOString() ?? null,
          eventEndAt: link.eventEndAt?.toISOString() ?? null,
          manualReviewRequired: link.manualReviewRequired,
        }
      : null,
  });
}
