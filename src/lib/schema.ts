import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  docNumber: text("doc_number"),
  insuranceName: text("insurance_name"),
  insuranceNumber: text("insurance_number"),
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

export const visits = pgTable("visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  date: timestamp("date", { withTimezone: true }).defaultNow(),
  notes: text("notes")
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  visitId: uuid("visit_id").references(() => visits.id, { onDelete: "set null" }),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  contentType: text("content_type"),
  size: integer("size").default(0),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow()
});

export const googleTokens = pgTable(
  "google_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token").notNull(),
    expiryDateMs: text("expiry_date_ms").notNull(),
  },
  (t) => ({
    emailUnique: uniqueIndex("google_tokens_email_unique").on(t.email),
  })
);

export const calendarEventLinkStatusEnum = pgEnum("calendar_event_link_status", [
  "linked",
  "pending_review",
  "ambiguous",
  "unlinked",
  "ignored",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    fullName: text("full_name"),
    googleSub: text("google_sub").notNull(),
    pictureUrl: text("picture_url"),
    role: text("role").notNull().default("owner"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailUnique: uniqueIndex("users_email_unique").on(t.email),
    googleSubUnique: uniqueIndex("users_google_sub_unique").on(t.googleSub),
  })
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    sessionTokenHash: text("session_token_hash").notNull(),
    refreshTokenHash: text("refresh_token_hash").notNull(),
    userAgent: text("user_agent"),
    ipHash: text("ip_hash"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    refreshExpiresAt: timestamp("refresh_expires_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    replacedBySessionId: uuid("replaced_by_session_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    sessionTokenHashUnique: uniqueIndex("sessions_session_token_hash_unique").on(t.sessionTokenHash),
    refreshTokenHashUnique: uniqueIndex("sessions_refresh_token_hash_unique").on(t.refreshTokenHash),
  })
);

export const authStates = pgTable(
  "auth_states",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stateHash: text("state_hash").notNull(),
    redirectTo: text("redirect_to").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    stateHashUnique: uniqueIndex("auth_states_state_hash_unique").on(t.stateHash),
  })
);

export const calendarEventLinks = pgTable(
  "calendar_event_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    googleEventId: text("google_event_id").notNull(),
    googleCalendarId: text("google_calendar_id").notNull(),
    patientId: uuid("patient_id").references(() => patients.id, { onDelete: "set null" }),
    status: calendarEventLinkStatusEnum("status").notNull().default("pending_review"),
    eventTitleSnapshot: text("event_title_snapshot"),
    eventStartAt: timestamp("event_start_at", { withTimezone: true }),
    eventEndAt: timestamp("event_end_at", { withTimezone: true }),
    source: text("source").notNull().default("apps_script"),
    matchMethod: text("match_method"),
    matchConfidence: integer("match_confidence"),
    manualReviewRequired: boolean("manual_review_required").notNull().default(true),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    linkedByUserId: uuid("linked_by_user_id").references(() => users.id, { onDelete: "set null" }),
    unlinkedByUserId: uuid("unlinked_by_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    googleEventUnique: uniqueIndex("calendar_event_links_calendar_event_unique").on(
      t.googleCalendarId,
      t.googleEventId
    ),
    patientIdx: index("calendar_event_links_patient_idx").on(t.patientId),
    statusIdx: index("calendar_event_links_status_idx").on(t.status),
    linkedRequiresPatient: check(
      "calendar_event_links_linked_requires_patient_chk",
      sql`(${t.status} <> 'linked'::calendar_event_link_status) OR (${t.patientId} IS NOT NULL)`
    ),
    ignoredWithoutPatient: check(
      "calendar_event_links_ignored_without_patient_chk",
      sql`(${t.status} <> 'ignored'::calendar_event_link_status) OR (${t.patientId} IS NULL)`
    ),
  })
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    patientId: uuid("patient_id").references(() => patients.id, { onDelete: "set null" }),
    calendarEventLinkId: uuid("calendar_event_link_id").references(() => calendarEventLinks.id, {
      onDelete: "set null",
    }),
    metadataJson: text("metadata_json").notNull().default("{}"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    actionIdx: index("audit_log_action_idx").on(t.action),
    entityIdx: index("audit_log_entity_idx").on(t.entityType, t.entityId),
    patientIdx: index("audit_log_patient_idx").on(t.patientId),
  })
);
