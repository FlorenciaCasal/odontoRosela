import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { normalizeGoogleEventId, upsertCalendarEventFromIntegration } from "@/lib/calendar-events";
import { getCalendarEventCleanLink, requireIntegrationToken } from "@/lib/integrations";

export const runtime = "nodejs";

const UpsertLinkSchema = z.object({
  googleEventId: z.string().min(1),
  googleCalendarId: z.string().min(1).default("primary"),
  eventTitleSnapshot: z.string().trim().optional().nullable(),
  eventStartAt: z.string().datetime().optional().nullable(),
  eventEndAt: z.string().datetime().optional().nullable(),
  source: z.string().trim().optional().nullable(),
  status: z.enum(["pending_review", "ambiguous", "unlinked", "ignored"]).optional(),
  matchMethod: z.string().trim().optional().nullable(),
  matchConfidence: z.number().int().min(0).max(100).optional().nullable(),
  manualReviewRequired: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  if (!requireIntegrationToken(req)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const body = UpsertLinkSchema.parse(await req.json());
    const eventId = normalizeGoogleEventId(body.googleEventId);

    const link = await upsertCalendarEventFromIntegration({
      eventId,
      calendarId: body.googleCalendarId,
      eventTitleSnapshot: body.eventTitleSnapshot ?? null,
      eventStartAt: body.eventStartAt ? new Date(body.eventStartAt) : null,
      eventEndAt: body.eventEndAt ? new Date(body.eventEndAt) : null,
      source: body.source ?? "apps_script",
      status: body.status,
      matchMethod: body.matchMethod ?? null,
      matchConfidence: body.matchConfidence ?? null,
      manualReviewRequired: body.manualReviewRequired,
    });

    await logAudit({
      action: "calendar_event_upserted_by_integration",
      entityType: "calendar_event",
      entityId: eventId,
      patientId: link.patientId ?? null,
      calendarEventLinkId: link.id,
      metadata: {
        status: link.status,
        source: body.source ?? "apps_script",
        matchMethod: body.matchMethod ?? null,
        matchConfidence: body.matchConfidence ?? null,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        eventId,
        status: link.status,
        patientId: link.status === "linked" ? link.patientId : null,
        cleanLink: getCalendarEventCleanLink(req, eventId),
        manualReviewRequired: link.manualReviewRequired,
        lastSyncedAt: link.lastSyncedAt?.toISOString() ?? null,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "invalid_request" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
}
