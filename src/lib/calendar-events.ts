import "server-only";
import { desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/drizzle";
import { calendarEventLinks, patients } from "@/lib/schema";

export async function getCalendarEventLinkByEventId(eventId: string) {
  const [row] = await db
    .select()
    .from(calendarEventLinks)
    .where(eq(calendarEventLinks.googleEventId, eventId))
    .orderBy(desc(calendarEventLinks.updatedAt))
    .limit(1);

  return row ?? null;
}

export async function searchPatientsForResolution(q: string) {
  const term = q.trim();
  if (!term) return [];

  return db
    .select({
      id: patients.id,
      fullName: patients.fullName,
      docNumber: patients.docNumber,
      phone: patients.phone,
      email: patients.email,
    })
    .from(patients)
    .where(
      or(
        ilike(patients.fullName, `%${term}%`),
        ilike(patients.docNumber, `%${term}%`)
      )
    )
    .limit(10);
}

export async function upsertCalendarEventResolution(input: {
  eventId: string;
  patientId?: string | null;
  actorUserId: string;
  status: "linked" | "ignored" | "unlinked";
}) {
  const existing = await getCalendarEventLinkByEventId(input.eventId);
  const now = new Date();

  if (existing) {
    const [updated] = await db
      .update(calendarEventLinks)
      .set({
        patientId: input.status === "linked" ? input.patientId ?? null : null,
        status: input.status,
        manualReviewRequired: input.status !== "linked",
        linkedByUserId: input.status === "linked" ? input.actorUserId : existing.linkedByUserId,
        unlinkedByUserId: input.status !== "linked" ? input.actorUserId : null,
        updatedAt: now,
      })
      .where(eq(calendarEventLinks.id, existing.id))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(calendarEventLinks)
    .values({
      googleEventId: input.eventId,
      googleCalendarId: "primary",
      patientId: input.status === "linked" ? input.patientId ?? null : null,
      status: input.status,
      source: "manual_resolution",
      manualReviewRequired: input.status !== "linked",
      linkedByUserId: input.status === "linked" ? input.actorUserId : null,
      unlinkedByUserId: input.status !== "linked" ? input.actorUserId : null,
      updatedAt: now,
    })
    .returning();

  return created;
}

export async function unlinkCalendarEvent(eventId: string, actorUserId: string) {
  const existing = await getCalendarEventLinkByEventId(eventId);
  if (!existing) return null;

  const [updated] = await db
    .update(calendarEventLinks)
    .set({
      patientId: null,
      status: "unlinked",
      manualReviewRequired: true,
      unlinkedByUserId: actorUserId,
      updatedAt: new Date(),
    })
    .where(eq(calendarEventLinks.id, existing.id))
    .returning();

  return updated;
}

export async function upsertCalendarEventFromIntegration(input: {
  eventId: string;
  calendarId: string;
  eventTitleSnapshot?: string | null;
  eventStartAt?: Date | null;
  eventEndAt?: Date | null;
  source?: string | null;
  status?: "pending_review" | "ambiguous" | "unlinked" | "ignored";
  matchMethod?: string | null;
  matchConfidence?: number | null;
  manualReviewRequired?: boolean;
}) {
  const existing = await getCalendarEventLinkByEventId(input.eventId);
  const now = new Date();

  const nextValues = {
    googleCalendarId: input.calendarId,
    eventTitleSnapshot: input.eventTitleSnapshot ?? existing?.eventTitleSnapshot ?? null,
    eventStartAt: input.eventStartAt ?? existing?.eventStartAt ?? null,
    eventEndAt: input.eventEndAt ?? existing?.eventEndAt ?? null,
    source: input.source ?? existing?.source ?? "apps_script",
    matchMethod: input.matchMethod ?? existing?.matchMethod ?? null,
    matchConfidence: input.matchConfidence ?? existing?.matchConfidence ?? null,
    lastSyncedAt: now,
    updatedAt: now,
  };

  if (existing) {
    const [updated] = await db
      .update(calendarEventLinks)
      .set({
        ...nextValues,
        status: existing.status === "linked" ? existing.status : input.status ?? existing.status,
        manualReviewRequired:
          existing.status === "linked" ? false : input.manualReviewRequired ?? existing.manualReviewRequired,
      })
      .where(eq(calendarEventLinks.id, existing.id))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(calendarEventLinks)
    .values({
      googleEventId: input.eventId,
      googleCalendarId: input.calendarId,
      status: input.status ?? "pending_review",
      eventTitleSnapshot: input.eventTitleSnapshot ?? null,
      eventStartAt: input.eventStartAt ?? null,
      eventEndAt: input.eventEndAt ?? null,
      source: input.source ?? "apps_script",
      matchMethod: input.matchMethod ?? null,
      matchConfidence: input.matchConfidence ?? null,
      manualReviewRequired: input.manualReviewRequired ?? true,
      lastSyncedAt: now,
      updatedAt: now,
    })
    .returning();

  return created;
}
