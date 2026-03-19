import "server-only";
import { desc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "@/lib/drizzle";
import { calendarEventLinks, patients } from "@/lib/schema";

function decodeGoogleEventId(value: string) {
  let current = value.trim();

  for (let i = 0; i < 3; i += 1) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) break;
      current = decoded;
    } catch {
      break;
    }
  }

  return current;
}

export function normalizeGoogleEventId(eventId: string) {
  return decodeGoogleEventId(eventId);
}

function buildGoogleEventIdCandidates(eventId: string) {
  const trimmed = eventId.trim();
  const normalized = normalizeGoogleEventId(trimmed);
  const candidates = new Set<string>([trimmed, normalized]);

  let current = trimmed;
  for (let i = 0; i < 3; i += 1) {
    try {
      const decoded = decodeURIComponent(current);
      candidates.add(decoded);
      if (decoded === current) break;
      current = decoded;
    } catch {
      break;
    }
  }

  candidates.add(encodeURIComponent(normalized));

  return Array.from(candidates).filter(Boolean);
}

export async function getCalendarEventLinkByEventId(eventId: string) {
  const candidates = buildGoogleEventIdCandidates(eventId);
  const [row] = await db
    .select()
    .from(calendarEventLinks)
    .where(inArray(calendarEventLinks.googleEventId, candidates))
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
  const normalizedEventId = normalizeGoogleEventId(input.eventId);
  const existing = await getCalendarEventLinkByEventId(normalizedEventId);
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
      googleEventId: normalizedEventId,
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
  const existing = await getCalendarEventLinkByEventId(normalizeGoogleEventId(eventId));
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
  const normalizedEventId = normalizeGoogleEventId(input.eventId);
  const existing = await getCalendarEventLinkByEventId(normalizedEventId);
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
      googleEventId: normalizedEventId,
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

export async function getStrongCalendarEventPatientSuggestion(eventTitle: string) {
  const title = eventTitle.trim();
  if (!title) return null;

  const exactDocMatch = title.match(/\b\d{7,10}\b/);
  if (exactDocMatch) {
    const [patient] = await db
      .select({
        id: patients.id,
        fullName: patients.fullName,
        docNumber: patients.docNumber,
        phone: patients.phone,
        email: patients.email,
      })
      .from(patients)
      .where(eq(patients.docNumber, exactDocMatch[0]))
      .limit(1);

    if (patient) {
      return { patient, reason: "dni_exact" as const };
    }
  }

  const narrowed = title
    .replace(/\b\d{7,10}\b/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!narrowed || narrowed.length < 5) {
    return null;
  }

  const candidates = await db
    .select({
      id: patients.id,
      fullName: patients.fullName,
      docNumber: patients.docNumber,
      phone: patients.phone,
      email: patients.email,
    })
    .from(patients)
    .where(ilike(patients.fullName, `%${narrowed}%`))
    .limit(2);

  if (candidates.length === 1) {
    return { patient: candidates[0], reason: "title_exactish" as const };
  }

  return null;
}
