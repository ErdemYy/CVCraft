"use client";

import React from "react";
import { CVData, DEFAULT_THEME, type SectionId } from "@/lib/cv-types";
import { getContactItems, getPersonalDetailItems } from "@/lib/personal-info";
import { getColumnSide, getCustomSection, getLayoutBlocksForColumn, getOrderedSectionIds, getSectionsForColumn, getSectionTitle, hasSidebarLayoutContent, isBuiltInSectionId, isSidebarRight } from "@/lib/section-utils";
import { resolveFontFamily } from "@/lib/font-options";
import { ColumnDropZone, DraggableLayoutBlock, DraggableSection, EditableText } from "@/components/templates/PreviewEditContext";
import CompactSidebarSection from "@/components/templates/CompactSidebarSection";
import PersonalLayoutBlock from "@/components/templates/PersonalLayoutBlock";

interface Props {
  cv: CVData;
  scale?: number;
}

type VariantId = "ats-pro" | "executive" | "corporate" | "consultant" | "editorial" | "tech-focus";

interface Variant {
  id: VariantId;
  label: string;
  layout: "single" | "split" | "editorial";
  primary: string;
  secondary: string;
  accent: string;
  paper: string;
  muted: string;
  headingFont: string;
  bodyFont: string;
  sidebarBg?: string;
}

const VARIANTS: Record<VariantId, Variant> = {
  "ats-pro": {
    id: "ats-pro",
    label: "ATS Pro",
    layout: "single",
    primary: "#24515A",
    secondary: "#111827",
    accent: "#E6EEF0",
    paper: "#FFFFFF",
    muted: "#5B6470",
    headingFont: "Inter, Arial, sans-serif",
    bodyFont: "Inter, Arial, sans-serif",
  },
  executive: {
    id: "executive",
    label: "Executive",
    layout: "single",
    primary: "#1E3A5F",
    secondary: "#1E293B",
    accent: "#C39A5F",
    paper: "#FDFCF9",
    muted: "#596273",
    headingFont: "Georgia, serif",
    bodyFont: "Inter, Arial, sans-serif",
  },
  corporate: {
    id: "corporate",
    label: "Corporate",
    layout: "split",
    primary: "#2F4858",
    secondary: "#24313A",
    accent: "#86A8A8",
    paper: "#FFFFFF",
    muted: "#66727B",
    headingFont: "Inter, Arial, sans-serif",
    bodyFont: "Inter, Arial, sans-serif",
    sidebarBg: "#EEF3F3",
  },
  consultant: {
    id: "consultant",
    label: "Consultant",
    layout: "split",
    primary: "#7A4E2D",
    secondary: "#2B2722",
    accent: "#D6B98C",
    paper: "#FFFCF6",
    muted: "#6F665B",
    headingFont: "Georgia, serif",
    bodyFont: "Inter, Arial, sans-serif",
    sidebarBg: "#F3E9D9",
  },
  editorial: {
    id: "editorial",
    label: "Editorial",
    layout: "editorial",
    primary: "#6B3F5F",
    secondary: "#2B2730",
    accent: "#D8A7B1",
    paper: "#FFF9FB",
    muted: "#6F6370",
    headingFont: "Georgia, serif",
    bodyFont: "Inter, Arial, sans-serif",
    sidebarBg: "#F3E5EB",
  },
  "tech-focus": {
    id: "tech-focus",
    label: "Tech Focus",
    layout: "split",
    primary: "#124E66",
    secondary: "#102A36",
    accent: "#2E8A99",
    paper: "#F8FCFD",
    muted: "#53666E",
    headingFont: "Inter, Arial, sans-serif",
    bodyFont: "Inter, Arial, sans-serif",
    sidebarBg: "#E9F5F8",
  },
};

function getVariant(templateId: string): Variant {
  return VARIANTS[templateId as VariantId] ?? VARIANTS["ats-pro"];
}

function getColors(cv: CVData, variant: Variant) {
  const usesDefaultTheme = cv.theme.primaryColor === DEFAULT_THEME.primaryColor
    && cv.theme.secondaryColor === DEFAULT_THEME.secondaryColor;

  return {
    primary: usesDefaultTheme ? variant.primary : cv.theme.primaryColor,
    secondary: usesDefaultTheme ? variant.secondary : cv.theme.secondaryColor,
    accent: usesDefaultTheme ? variant.accent : cv.theme.primaryColor,
    muted: variant.muted,
  };
}

function getFontSize(size: string) {
  if (size === "small") return { body: "10.5px", small: "9px", title: "12px", h1: "29px" };
  if (size === "large") return { body: "12.5px", small: "10.5px", title: "14px", h1: "34px" };
  return { body: "11.5px", small: "9.8px", title: "13px", h1: "31px" };
}

function compactDate(start: string, end: string, current: boolean) {
  if (!start && !end && !current) return "";
  return `${start}${start ? " - " : ""}${current ? "Günümüz" : end}`;
}

export default function ProfessionalTemplate({ cv, scale = 1 }: Props) {
  const variant = getVariant(cv.templateId);
  const colors = getColors(cv, variant);

  if (variant.layout === "split") {
    return <SplitLayout cv={cv} scale={scale} variant={variant} colors={colors} />;
  }

  if (variant.layout === "editorial") {
    return <EditorialLayout cv={cv} scale={scale} variant={variant} colors={colors} />;
  }

  if (variant.layout === "single" && hasSidebarLayoutContent(cv)) {
    return <SplitLayout cv={cv} scale={scale} variant={variant} colors={colors} />;
  }

  return <SingleLayout cv={cv} scale={scale} variant={variant} colors={colors} />;
}

function PageShell({
  cv,
  scale,
  variant,
  children,
}: {
  cv: CVData;
  scale: number;
  variant: Variant;
  children: React.ReactNode;
}) {
  return (
    <div
      className="cv-document"
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: variant.paper,
        color: variant.secondary,
        fontFamily: cv.theme.fontFamily === DEFAULT_THEME.fontFamily ? variant.bodyFont : resolveFontFamily(cv.theme.fontFamily),
        fontSize: getFontSize(cv.theme.fontSize).body,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

function SingleLayout({
  cv,
  scale,
  variant,
  colors,
}: {
  cv: CVData;
  scale: number;
  variant: Variant;
  colors: ReturnType<typeof getColors>;
}) {
  const { personalInfo: p } = cv;
  const font = getFontSize(cv.theme.fontSize);
  const executive = variant.id === "executive";
  const mainLayoutBlocks = new Set(getLayoutBlocksForColumn(cv, "main"));

  return (
    <PageShell cv={cv} scale={scale} variant={variant}>
      <div style={{ padding: executive ? "58px 66px 52px" : "54px 66px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 220px",
            gap: "28px",
            alignItems: "end",
            borderBottom: executive ? `4px solid ${colors.accent}` : `2px solid ${colors.primary}`,
            paddingBottom: "22px",
            marginBottom: "24px",
          }}
        >
          <DraggableLayoutBlock blockId="identity">
            <div style={{ borderLeft: executive ? `8px solid ${colors.primary}` : "0", paddingLeft: executive ? "18px" : "0" }}>
              <div style={{ fontSize: font.small, fontWeight: 800, letterSpacing: "2.5px", color: colors.primary, textTransform: "uppercase", marginBottom: "7px" }}>
                {variant.label}
              </div>
              <h1 style={{ margin: 0, fontFamily: variant.headingFont, fontSize: font.h1, lineHeight: 1.04, color: colors.secondary }}>
                <EditableText fieldId="personal.fullName" value={[p.firstName, p.lastName].filter(Boolean).join(" ")} singleLine placeholder="Ad Soyad" />
              </h1>
              {p.title && (
                <div style={{ marginTop: "8px", color: colors.muted ?? variant.muted, fontSize: "14px", fontWeight: 600 }}>
                  <EditableText fieldId="personal.title" value={p.title} singleLine />
                </div>
              )}
            </div>
          </DraggableLayoutBlock>

          <div>
            {mainLayoutBlocks.has("photo") && (
              <PersonalLayoutBlock
                cv={cv}
                blockId="photo"
                column="main"
                accentColor={colors.accent}
                textColor={colors.secondary}
                mutedColor={colors.muted}
                photoBorder={`3px solid ${colors.accent}`}
                align="right"
              />
            )}
            {mainLayoutBlocks.has("contact") && (
              <DraggableLayoutBlock blockId="contact">
                <ContactBlock cv={cv} colors={colors} compact align="right" />
              </DraggableLayoutBlock>
            )}
            {mainLayoutBlocks.has("personalDetails") && (
              <DraggableLayoutBlock blockId="personalDetails">
                <PersonalDetailsBlock cv={cv} colors={colors} compact align="right" />
              </DraggableLayoutBlock>
            )}
          </div>
        </div>

        {mainLayoutBlocks.has("summary") && p.summary && (
          <DraggableLayoutBlock blockId="summary">
            <div style={{ marginBottom: "22px", padding: executive ? "14px 18px" : "0", backgroundColor: executive ? `${colors.accent}22` : "transparent" }}>
              <p style={{ margin: 0, lineHeight: 1.68, color: colors.secondary }}>
                <EditableText fieldId="personal.summary" value={p.summary} multiline />
              </p>
            </div>
          </DraggableLayoutBlock>
        )}

        {getOrderedSectionIds(cv).map((sectionId) => (
          <MainSection key={sectionId} sectionId={sectionId} cv={cv} colors={colors} variant={variant} />
        ))}
      </div>
    </PageShell>
  );
}

function SplitLayout({
  cv,
  scale,
  variant,
  colors,
}: {
  cv: CVData;
  scale: number;
  variant: Variant;
  colors: ReturnType<typeof getColors>;
}) {
  const mainSections = getSectionsForColumn(cv, "main");
  const sidebarSectionIds = getSectionsForColumn(cv, "sidebar");
  const sidebarLayoutBlocks = getLayoutBlocksForColumn(cv, "sidebar");
  const mainLayoutBlocks = getLayoutBlocksForColumn(cv, "main");
  const sidebarOnRight = isSidebarRight(cv);

  return (
    <PageShell cv={cv} scale={scale} variant={variant}>
      <div style={{ display: "grid", gridTemplateColumns: sidebarOnRight ? "1fr 252px" : "252px 1fr", gridTemplateAreas: sidebarOnRight ? '"main sidebar"' : '"sidebar main"', minHeight: "1123px" }}>
        <ColumnDropZone
          as="aside"
          column="sidebar"
          dropLabel={`${getColumnSide(cv, "sidebar") === "left" ? "Sol" : "Sağ"} sütuna bırak`}
          style={{ gridArea: "sidebar", backgroundColor: variant.sidebarBg ?? `${colors.accent}24`, padding: "44px 26px", borderRight: sidebarOnRight ? "0" : `1px solid ${colors.accent}88`, borderLeft: sidebarOnRight ? `1px solid ${colors.accent}88` : "0" }}
        >
          <div style={{ width: "38px", height: "5px", backgroundColor: colors.primary, marginBottom: "28px" }} />
          {sidebarLayoutBlocks.map((blockId) => (
            <PersonalLayoutBlock
              key={blockId}
              cv={cv}
              blockId={blockId}
              column="sidebar"
              accentColor={colors.accent}
              titleColor={colors.primary}
              textColor={colors.secondary}
              mutedColor={colors.muted}
              headingFont={variant.headingFont}
              photoBorder={`3px solid ${colors.accent}`}
              align="left"
              summaryTitle="Profesyonel Profil"
            />
          ))}

          {sidebarSectionIds.map((sectionId) => (
            <CompactSidebarSection
              key={sectionId}
              cv={cv}
              sectionId={sectionId}
              titleColor={colors.primary}
              textColor={colors.secondary}
              mutedColor={colors.muted}
              accentColor={colors.accent}
            />
          ))}
        </ColumnDropZone>

        <ColumnDropZone
          as="main"
          column="main"
          dropLabel={`${getColumnSide(cv, "main") === "left" ? "Sol" : "Sağ"} sütuna bırak`}
          style={{ gridArea: "main", padding: "46px 44px 42px" }}
        >
          {mainLayoutBlocks.map((blockId) => (
            <PersonalLayoutBlock
              key={blockId}
              cv={cv}
              blockId={blockId}
              column="main"
              accentColor={colors.accent}
              titleColor={colors.primary}
              textColor={colors.secondary}
              mutedColor={colors.muted}
              headingFont={variant.headingFont}
              photoBorder={`3px solid ${colors.accent}`}
              align="left"
              summaryTitle="Profesyonel Profil"
            />
          ))}

          {mainSections.map((sectionId) => (
            <MainSection key={sectionId} sectionId={sectionId} cv={cv} colors={colors} variant={variant} />
          ))}
        </ColumnDropZone>
      </div>
    </PageShell>
  );
}

function EditorialLayout({
  cv,
  scale,
  variant,
  colors,
}: {
  cv: CVData;
  scale: number;
  variant: Variant;
  colors: ReturnType<typeof getColors>;
}) {
  const mainSections = getSectionsForColumn(cv, "main");
  const sidebarSectionIds = getSectionsForColumn(cv, "sidebar");
  const mainLayoutBlocks = getLayoutBlocksForColumn(cv, "main");
  const sidebarLayoutBlocks = getLayoutBlocksForColumn(cv, "sidebar");
  const headerBlockIds = new Set(["photo", "identity", "summary"]);
  const mainHeaderBlocks = mainLayoutBlocks.filter((blockId) => headerBlockIds.has(blockId));
  const sidebarHeaderBlocks = sidebarLayoutBlocks.filter((blockId) => headerBlockIds.has(blockId));
  const mainBodyBlocks = mainLayoutBlocks.filter((blockId) => !headerBlockIds.has(blockId));
  const sidebarBodyBlocks = sidebarLayoutBlocks.filter((blockId) => !headerBlockIds.has(blockId));
  const sidebarOnRight = isSidebarRight(cv, true);

  return (
    <PageShell cv={cv} scale={scale} variant={variant}>
      <div style={{ minHeight: "1123px", display: "grid", gridTemplateRows: "285px 1fr" }}>
        <header
          style={{
            display: "grid",
            gridTemplateColumns: sidebarOnRight ? "1fr 220px" : "220px 1fr",
            gridTemplateAreas: sidebarOnRight ? '"main sidebar"' : '"sidebar main"',
            backgroundColor: variant.sidebarBg,
          }}
        >
          <ColumnDropZone
            column="main"
            dropLabel={`${getColumnSide(cv, "main") === "left" ? "Sol" : "Sağ"} sütuna bırak`}
            style={{ gridArea: "main", padding: "38px 34px 24px 54px" }}
          >
            <div style={{ color: colors.primary, fontSize: "10px", fontWeight: 900, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px" }}>
              Editorial Portfolio CV
            </div>
            {mainHeaderBlocks.map((blockId) => (
              <PersonalLayoutBlock
                key={blockId}
                cv={cv}
                blockId={blockId}
                column="main"
                accentColor={colors.accent}
                titleColor={colors.primary}
                textColor={colors.secondary}
                mutedColor={colors.muted}
                headingFont={variant.headingFont}
                photoBorder={`4px solid ${variant.paper}`}
                align="left"
                summaryTitle="Profil"
              />
            ))}
          </ColumnDropZone>
          <ColumnDropZone
            column="sidebar"
            dropLabel={`${getColumnSide(cv, "sidebar") === "left" ? "Sol" : "Sağ"} sütuna bırak`}
            style={{ gridArea: "sidebar", padding: "38px 34px 24px" }}
          >
            {sidebarHeaderBlocks.map((blockId) => (
              <PersonalLayoutBlock
                key={blockId}
                cv={cv}
                blockId={blockId}
                column="sidebar"
                accentColor={colors.accent}
                titleColor={colors.primary}
                textColor={colors.secondary}
                mutedColor={colors.muted}
                headingFont={variant.headingFont}
                photoBorder={`4px solid ${variant.paper}`}
                align="center"
                summaryTitle="Profil"
              />
            ))}
          </ColumnDropZone>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: sidebarOnRight ? "1fr 225px" : "225px 1fr", gridTemplateAreas: sidebarOnRight ? '"main sidebar"' : '"sidebar main"', gap: "34px", padding: "36px 54px 44px" }}>
          <ColumnDropZone
            as="main"
            column="main"
            dropLabel={`${getColumnSide(cv, "main") === "left" ? "Sol" : "Sağ"} sütuna bırak`}
            style={{ gridArea: "main" }}
          >
            {mainBodyBlocks.map((blockId) => (
              <PersonalLayoutBlock
                key={blockId}
                cv={cv}
                blockId={blockId}
                column="main"
                accentColor={colors.accent}
                titleColor={colors.primary}
                textColor={colors.secondary}
                mutedColor={colors.muted}
                headingFont={variant.headingFont}
                align="left"
              />
            ))}
            {mainSections.map((key) => (
              <MainSection key={key} sectionId={key} cv={cv} colors={colors} variant={variant} />
            ))}
          </ColumnDropZone>

          <ColumnDropZone
            as="aside"
            column="sidebar"
            dropLabel={`${getColumnSide(cv, "sidebar") === "left" ? "Sol" : "Sağ"} sütuna bırak`}
            style={{ gridArea: "sidebar" }}
          >
            {sidebarBodyBlocks.map((blockId) => (
              <PersonalLayoutBlock
                key={blockId}
                cv={cv}
                blockId={blockId}
                column="sidebar"
                accentColor={colors.accent}
                titleColor={colors.primary}
                textColor={colors.secondary}
                mutedColor={colors.muted}
                headingFont={variant.headingFont}
                align="left"
              />
            ))}

            {sidebarSectionIds.map((sectionId) => (
              <CompactSidebarSection
                key={sectionId}
                cv={cv}
                sectionId={sectionId}
                titleColor={colors.primary}
                textColor={colors.secondary}
                mutedColor={colors.muted}
                accentColor={colors.accent}
              />
            ))}
          </ColumnDropZone>
        </div>
      </div>
    </PageShell>
  );
}

function ContactBlock({
  cv,
  colors,
  compact = false,
  align = "left",
}: {
  cv: CVData;
  colors: ReturnType<typeof getColors>;
  compact?: boolean;
  align?: "left" | "right";
}) {
  const items = getContactItems(cv.personalInfo);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? "6px" : "8px", textAlign: align, color: colors.muted ?? "#667085" }}>
      {items.map((item) => (
        <div key={item.label} style={{ fontSize: compact ? "10px" : "11px", lineHeight: 1.35, wordBreak: "break-word" }}>
          <EditableText fieldId={`personal.${item.field}`} value={item.value} singleLine />
        </div>
      ))}
    </div>
  );
}

function PersonalDetailsBlock({
  cv,
  colors,
  compact = false,
  align = "left",
}: {
  cv: CVData;
  colors: ReturnType<typeof getColors>;
  compact?: boolean;
  align?: "left" | "right";
}) {
  const items = getPersonalDetailItems(cv.personalInfo);
  if (items.length === 0) return null;

  return (
    <div style={{ marginTop: "12px", textAlign: align, color: colors.muted ?? "#667085" }}>
      {items.map((item) => (
        <div key={item.label} style={{ fontSize: compact ? "9.6px" : "10.5px", lineHeight: 1.42, marginBottom: "4px" }}>
          <span style={{ color: colors.primary, fontWeight: 800 }}>{item.label}: </span>
          <EditableText fieldId={`personal.${item.field}`} value={item.value} singleLine />
        </div>
      ))}
    </div>
  );
}

function SkillList({ cv, colors, mode }: { cv: CVData; colors: ReturnType<typeof getColors>; mode: "bars" | "chips" }) {
  if (mode === "chips") {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {cv.sections.skills.map((skill) => (
          <span key={skill.id} style={{ fontSize: "9.5px", padding: "5px 7px", border: `1px solid ${colors.accent}`, color: colors.secondary }}>
            <EditableText fieldId={`section:skills:item:${skill.id}:field:name`} value={skill.name} singleLine />
          </span>
        ))}
      </div>
    );
  }

  return (
    <div>
      {cv.sections.skills.map((skill) => (
        <div key={skill.id} style={{ marginBottom: "9px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: colors.secondary, marginBottom: "4px" }}>
            <EditableText fieldId={`section:skills:item:${skill.id}:field:name`} value={skill.name} singleLine />
            <span style={{ color: colors.primary }}>{skill.level}/5</span>
          </div>
          <div style={{ height: "3px", backgroundColor: `${colors.accent}66` }}>
            <div style={{ height: "3px", width: `${(skill.level / 5) * 100}%`, backgroundColor: colors.primary }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LanguageList({ cv, colors }: { cv: CVData; colors: ReturnType<typeof getColors> }) {
  return (
    <div>
      {cv.sections.languages.map((language) => (
        <div key={language.id} style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "10px", color: colors.secondary, marginBottom: "7px" }}>
          <EditableText fieldId={`section:languages:item:${language.id}:field:name`} value={language.name} singleLine />
          <EditableText fieldId={`section:languages:item:${language.id}:field:level`} value={language.level} singleLine style={{ color: colors.primary, whiteSpace: "nowrap" }} />
        </div>
      ))}
    </div>
  );
}

function MainSection({
  sectionId,
  cv,
  colors,
  variant,
}: {
  sectionId: SectionId;
  cv: CVData;
  colors: ReturnType<typeof getColors>;
  variant: Variant;
}) {
  if (!isBuiltInSectionId(sectionId)) {
    const customSection = getCustomSection(cv, sectionId);
    if (!customSection || customSection.items.length === 0) return null;

    return (
      <DraggableSection sectionId={sectionId}>
      <section style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px", marginBottom: "10px" }}>
          <h2 style={{ margin: 0, color: colors.primary, fontSize: "10px", fontWeight: 900, letterSpacing: "2.1px", textTransform: "uppercase" }}>
            <EditableText fieldId={`sectionTitle:${sectionId}`} value={getSectionTitle(cv, sectionId)} singleLine />
          </h2>
          <div style={{ flex: 1, height: "1px", backgroundColor: colors.accent, opacity: 0.85 }} />
        </div>

        {customSection.items.map((item) => (
          <TimelineItem
            key={item.id}
            title={item.title}
            description={item.description}
            fieldId={`custom:${sectionId}:item:${item.id}:field:description`}
            colors={colors}
            variant={variant}
          />
        ))}
      </section>
      </DraggableSection>
    );
  }

  const items = cv.sections[sectionId];
  if (!items || items.length === 0) return null;

  return (
    <DraggableSection sectionId={sectionId}>
    <section style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "11px", marginBottom: "10px" }}>
        <h2 style={{ margin: 0, color: colors.primary, fontSize: "10px", fontWeight: 900, letterSpacing: "2.1px", textTransform: "uppercase" }}>
          <EditableText fieldId={`sectionTitle:${sectionId}`} value={getSectionTitle(cv, sectionId)} singleLine />
        </h2>
        <div style={{ flex: 1, height: "1px", backgroundColor: colors.accent, opacity: 0.85 }} />
      </div>

      {sectionId === "experience" && cv.sections.experience.map((item) => (
        <TimelineItem
          key={item.id}
          title={item.position}
          subtitle={[item.company, item.location].filter(Boolean).join(" · ")}
          date={compactDate(item.startDate, item.endDate, item.current)}
          description={item.description}
          fieldId={`section:experience:item:${item.id}:field:description`}
          colors={colors}
          variant={variant}
        />
      ))}

      {sectionId === "education" && cv.sections.education.map((item) => (
        <TimelineItem
          key={item.id}
          title={[item.degree, item.field].filter(Boolean).join(" · ")}
          subtitle={item.school}
          date={compactDate(item.startDate, item.endDate, item.current)}
          description={[item.gpa ? `GPA: ${item.gpa}` : "", item.description].filter(Boolean).join("\n")}
          fieldId={`section:education:item:${item.id}:field:description`}
          colors={colors}
          variant={variant}
        />
      ))}

      {sectionId === "skills" && <SkillList cv={cv} colors={colors} mode="chips" />}
      {sectionId === "languages" && <LanguageList cv={cv} colors={colors} />}

      {sectionId === "projects" && cv.sections.projects.map((item) => (
        <TimelineItem
          key={item.id}
          title={item.name}
          subtitle={[item.technologies, item.url].filter(Boolean).join(" · ")}
          description={item.description}
          fieldId={`section:projects:item:${item.id}:field:description`}
          colors={colors}
          variant={variant}
        />
      ))}

      {sectionId === "certificates" && cv.sections.certificates.map((item) => (
        <TimelineItem
          key={item.id}
          title={item.name}
          subtitle={[item.issuer, item.url].filter(Boolean).join(" · ")}
          date={item.date}
          colors={colors}
          variant={variant}
        />
      ))}

      {sectionId === "references" && cv.sections.references.map((item) => (
        <TimelineItem
          key={item.id}
          title={item.name}
          subtitle={[item.title, item.company].filter(Boolean).join(" · ")}
          description={[item.email, item.phone].filter(Boolean).join(" · ")}
          fieldId={`section:references:item:${item.id}:field:description`}
          colors={colors}
          variant={variant}
        />
      ))}

      {sectionId === "interests" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {cv.sections.interests.map((item) => (
            <span key={item.id} style={{ fontSize: "9.8px", padding: "5px 7px", border: `1px solid ${colors.accent}`, color: colors.secondary }}>
              {item.name}
            </span>
          ))}
        </div>
      )}
    </section>
    </DraggableSection>
  );
}

function TimelineItem({
  title,
  subtitle,
  date,
  description,
  fieldId,
  colors,
  variant,
}: {
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  fieldId?: string;
  colors: ReturnType<typeof getColors>;
  variant: Variant;
}) {
  const hasDate = Boolean(date);
  return (
    <div style={{ marginBottom: "13px", paddingLeft: variant.id === "consultant" ? "12px" : "0", borderLeft: variant.id === "consultant" ? `3px solid ${colors.accent}` : "0" }}>
      <div style={{ display: "grid", gridTemplateColumns: hasDate ? "1fr auto" : "1fr", gap: "14px", alignItems: "baseline" }}>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 800, color: colors.secondary, lineHeight: 1.35 }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ marginTop: "2px", fontSize: "10.5px", fontWeight: 700, color: colors.primary, lineHeight: 1.35 }}>
              {subtitle}
            </div>
          )}
        </div>
        {date && <div style={{ fontSize: "9.5px", color: colors.muted ?? "#667085", whiteSpace: "nowrap" }}>{date}</div>}
      </div>
      {description && (
        <EditableText
          fieldId={fieldId ?? "timeline.description"}
          value={description}
          as="p"
          multiline
          style={{ margin: "5px 0 0", whiteSpace: "pre-line", fontSize: "10.4px", lineHeight: 1.62, color: colors.muted ?? "#4B5563" }}
        />
      )}
    </div>
  );
}
