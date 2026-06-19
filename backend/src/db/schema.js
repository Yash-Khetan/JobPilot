// src/db/schema.js — Drizzle table definitions
// Two tables:
//   1. users      — id, name, email (unique), password (hashed), createdAt
//   2. trackedJobs — id, role, company, location, stipend, description, link, source, status, notes, userId (FK), createdAt

import { pgTable, serial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Users ────────────────────────────────────────────────────────────────────
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  resumeText: text("resumeText"),
  structuredResume: jsonb("structuredResume"),
  embedding: jsonb("embedding", { dimensions: 1536 }),
});

// ── Tracked Jobs ─────────────────────────────────────────────────────────────
export const trackedJobsTable = pgTable("tracked_jobs", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  stipend: text("stipend"),
  description: text("description"),
  link: text("link").notNull(),
  source: text("source").notNull(),
  status: text("status").default("bookmarked"),
  notes: text("notes"),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Relations (for Drizzle relational queries) ───────────────────────────────
export const usersRelations = relations(usersTable, ({ many }) => ({
  trackedJobs: many(trackedJobsTable),
}));

export const trackedJobsRelations = relations(trackedJobsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [trackedJobsTable.userId],
    references: [usersTable.id],
  }),
}));