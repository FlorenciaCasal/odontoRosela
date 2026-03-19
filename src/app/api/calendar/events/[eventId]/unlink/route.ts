import { NextRequest, NextResponse } from "next/server";
import { getCurrentAuthenticatedUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { normalizeGoogleEventId, unlinkCalendarEvent } from "@/lib/calendar-events";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const auth = await getCurrentAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { eventId: rawEventId } = await params;
  const eventId = normalizeGoogleEventId(rawEventId);
  const link = await unlinkCalendarEvent(eventId, auth.user.id);

  if (!link) {
    return NextResponse.json({ ok: false, error: "Evento no encontrado" }, { status: 404 });
  }

  await logAudit({
    actorUserId: auth.user.id,
    action: "calendar_event_unlinked",
    entityType: "calendar_event",
    entityId: eventId,
    calendarEventLinkId: link.id,
  });

  return NextResponse.json({ ok: true, status: link.status });
}
