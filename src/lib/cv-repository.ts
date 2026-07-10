import { promises as fs } from "fs";
import path from "path";
import { and, eq } from "drizzle-orm";
import type { AuthUser } from "@/lib/auth";
import {
  DEFAULT_PERSONAL_INFO,
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTIONS,
  DEFAULT_THEME,
  type CVData,
  type SectionKey,
} from "@/lib/cv-types";
import type { CVPayload, CVRecord } from "@/lib/cv-record";
import { nanoid } from "@/lib/nanoid";

const LOCAL_DATA_DIR = path.join(process.cwd(), ".data");
const LOCAL_CV_FILE = path.join(LOCAL_DATA_DIR, "cvs.json");
const VALID_SECTION_KEYS = new Set<SectionKey>(DEFAULT_SECTION_ORDER);

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function toIsoDate(value: unknown, fallback = new Date()) {
  if (!value) return fallback.toISOString();
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? fallback.toISOString() : date.toISOString();
}

function normalizeSectionOrder(value: unknown): SectionKey[] {
  if (!Array.isArray(value)) return [...DEFAULT_SECTION_ORDER];
  const filtered = value.filter((key): key is SectionKey => VALID_SECTION_KEYS.has(key as SectionKey));
  return filtered.length ? filtered : [...DEFAULT_SECTION_ORDER];
}

function normalizeCV(input: Partial<CVRecord> & Partial<CVData>, userId: string): CVRecord {
  const now = new Date();

  return {
    id: input.id || nanoid(),
    userId,
    title: input.title || "Benim CV'm",
    templateId: input.templateId || "modern",
    personalInfo: { ...DEFAULT_PERSONAL_INFO, ...(input.personalInfo ?? {}) },
    sections: {
      experience: [...(input.sections?.experience ?? DEFAULT_SECTIONS.experience)],
      education: [...(input.sections?.education ?? DEFAULT_SECTIONS.education)],
      skills: [...(input.sections?.skills ?? DEFAULT_SECTIONS.skills)],
      languages: [...(input.sections?.languages ?? DEFAULT_SECTIONS.languages)],
      projects: [...(input.sections?.projects ?? DEFAULT_SECTIONS.projects)],
      references: [...(input.sections?.references ?? DEFAULT_SECTIONS.references)],
      certificates: [...(input.sections?.certificates ?? DEFAULT_SECTIONS.certificates)],
    },
    sectionOrder: normalizeSectionOrder(input.sectionOrder),
    theme: { ...DEFAULT_THEME, ...(input.theme ?? {}) },
    createdAt: toIsoDate(input.createdAt, now),
    updatedAt: toIsoDate(input.updatedAt, now),
  };
}

async function readLocalCVs(): Promise<CVRecord[]> {
  try {
    const raw = await fs.readFile(LOCAL_CV_FILE, "utf-8");
    const data = JSON.parse(raw) as Array<Partial<CVRecord>>;
    return data.map((cv) => normalizeCV(cv, cv.userId || "2"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocalCVs(cvs: CVRecord[]) {
  await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
  await fs.writeFile(LOCAL_CV_FILE, JSON.stringify(cvs, null, 2), "utf-8");
}

async function getDbDeps() {
  const [{ db }, { cvs }] = await Promise.all([import("@/db"), import("@/db/schema")]);
  return { db, cvs };
}

function canAccess(user: AuthUser, cv: CVRecord) {
  return user.role === "admin" || cv.userId === user.id;
}

export async function listCVs(user: AuthUser): Promise<CVRecord[]> {
  if (hasDatabase()) {
    const { db, cvs } = await getDbDeps();
    const rows = user.role === "admin"
      ? await db.select().from(cvs)
      : await db.select().from(cvs).where(eq(cvs.userId, user.id));

    return rows.map((row) => normalizeCV(row as unknown as Partial<CVRecord>, row.userId));
  }

  const cvs = await readLocalCVs();
  return (user.role === "admin" ? cvs : cvs.filter((cv) => cv.userId === user.id))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getCV(user: AuthUser, id: string): Promise<CVRecord | null> {
  if (hasDatabase()) {
    const { db, cvs } = await getDbDeps();
    const condition = user.role === "admin"
      ? eq(cvs.id, id)
      : and(eq(cvs.id, id), eq(cvs.userId, user.id));
    const [row] = await db.select().from(cvs).where(condition);
    return row ? normalizeCV(row as unknown as Partial<CVRecord>, row.userId) : null;
  }

  const cv = (await readLocalCVs()).find((item) => item.id === id);
  return cv && canAccess(user, cv) ? cv : null;
}

export async function createCV(user: AuthUser, payload: Partial<CVPayload>): Promise<CVRecord> {
  const record = normalizeCV(payload, user.id);

  if (hasDatabase()) {
    const { db, cvs } = await getDbDeps();
    const [row] = await db
      .insert(cvs)
      .values({
        userId: user.id,
        title: record.title,
        templateId: record.templateId,
        personalInfo: record.personalInfo,
        sections: record.sections,
        sectionOrder: record.sectionOrder,
        theme: record.theme,
      })
      .returning();

    return normalizeCV(row as unknown as Partial<CVRecord>, row.userId);
  }

  const cvs = await readLocalCVs();
  cvs.unshift(record);
  await writeLocalCVs(cvs);
  return record;
}

export async function updateCV(user: AuthUser, id: string, payload: Partial<CVPayload>): Promise<CVRecord | null> {
  if (hasDatabase()) {
    const { db, cvs } = await getDbDeps();
    const condition = user.role === "admin"
      ? eq(cvs.id, id)
      : and(eq(cvs.id, id), eq(cvs.userId, user.id));

    const [row] = await db
      .update(cvs)
      .set({ ...payload, updatedAt: new Date() })
      .where(condition)
      .returning();

    return row ? normalizeCV(row as unknown as Partial<CVRecord>, row.userId) : null;
  }

  const cvs = await readLocalCVs();
  const index = cvs.findIndex((cv) => cv.id === id && canAccess(user, cv));
  if (index === -1) return null;

  const updated = normalizeCV(
    {
      ...cvs[index],
      ...payload,
      id,
      userId: cvs[index].userId,
      createdAt: cvs[index].createdAt,
      updatedAt: new Date().toISOString(),
    },
    cvs[index].userId,
  );

  cvs[index] = updated;
  await writeLocalCVs(cvs);
  return updated;
}

export async function deleteCV(user: AuthUser, id: string): Promise<boolean> {
  if (hasDatabase()) {
    const { db, cvs } = await getDbDeps();
    const condition = user.role === "admin"
      ? eq(cvs.id, id)
      : and(eq(cvs.id, id), eq(cvs.userId, user.id));
    await db.delete(cvs).where(condition);
    return true;
  }

  const cvs = await readLocalCVs();
  const next = cvs.filter((cv) => !(cv.id === id && canAccess(user, cv)));
  if (next.length === cvs.length) return false;
  await writeLocalCVs(next);
  return true;
}
