import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/drizzle";
import { auditLog } from "@/lib/schema";

type AuditInput = {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  patientId?: string | null;
  calendarEventLinkId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logAudit(input: AuditInput) {
  const h = await headers();

  await db.insert(auditLog).values({
    actorUserId: input.actorUserId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    patientId: input.patientId ?? null,
    calendarEventLinkId: input.calendarEventLinkId ?? null,
    metadataJson: JSON.stringify({
      ...input.metadata,
      userAgent: h.get("user-agent") ?? null,
    }),
  });
}
