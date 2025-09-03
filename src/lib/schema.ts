import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  docNumber: text("doc_number"),
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

export const googleTokens = pgTable("google_tokens", {
  // solo si haces Fase 2 (OAuth)
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiryDateMs: text("expiry_date_ms").notNull()
});
