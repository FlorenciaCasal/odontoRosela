import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/drizzle";
import { patients } from "@/lib/schema";
import { logAudit } from "@/lib/audit";
import { upsertCalendarEventResolution } from "@/lib/calendar-events";

export const runtime = "nodejs";

const ResolveSchema = z.discriminatedUnion("resolution", [
  z.object({
    resolution: z.literal("link_existing"),
    patientId: z.string().uuid(),
  }),
  z.object({
    resolution: z.literal("ignore"),
  }),
]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const auth = await getCurrentAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const { eventId } = await params;
    const body = ResolveSchema.parse(await req.json());

    if (body.resolution === "link_existing") {
      const [patient] = await db
        .select({ id: patients.id })
        .from(patients)
        .where(eq(patients.id, body.patientId))
        .limit(1);

      if (!patient) {
        return NextResponse.json({ ok: false, error: "Paciente no existe" }, { status: 404 });
      }

      const link = await upsertCalendarEventResolution({
        eventId,
        patientId: body.patientId,
        actorUserId: auth.user.id,
        status: "linked",
      });

      await logAudit({
        actorUserId: auth.user.id,
        action: "calendar_event_resolved",
        entityType: "calendar_event",
        entityId: eventId,
        patientId: body.patientId,
        calendarEventLinkId: link.id,
        metadata: { resolution: body.resolution },
      });

      return NextResponse.json({
        ok: true,
        status: "linked",
        patientId: body.patientId,
        redirectTo: `/patients/${body.patientId}`,
      });
    }

    const link = await upsertCalendarEventResolution({
      eventId,
      actorUserId: auth.user.id,
      status: "ignored",
    });

    await logAudit({
      actorUserId: auth.user.id,
      action: "calendar_event_ignored",
      entityType: "calendar_event",
      entityId: eventId,
      calendarEventLinkId: link.id,
      metadata: { resolution: body.resolution },
    });

    return NextResponse.json({ ok: true, status: "ignored" });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "invalid_request" },
      { status: 400 }
    );
  }
}
