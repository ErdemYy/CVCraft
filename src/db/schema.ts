import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

export const cvs = pgTable("cvs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  templateId: text("template_id").notNull().default("modern"),
  title: text("title").notNull().default("Benim CV'm"),
  personalInfo: jsonb("personal_info").notNull().default({}),
  sections: jsonb("sections").notNull().default({}),
  sectionOrder: jsonb("section_order").notNull().default([]),
  theme: jsonb("theme").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CV = typeof cvs.$inferSelect;
export type NewCV = typeof cvs.$inferInsert;
