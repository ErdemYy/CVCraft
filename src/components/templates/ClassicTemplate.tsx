"use client";

import React from "react";
import { CVData } from "@/lib/cv-types";
import { getColumnSide, getCustomSection, getLayoutBlocksForColumn, getSectionsForColumn, getSectionTitle, hasSidebarLayoutContent, isBuiltInSectionId, isSidebarRight } from "@/lib/section-utils";
import { resolveFontFamily } from "@/lib/font-options";
import { ColumnDropZone, DraggableSection, EditableText } from "@/components/templates/PreviewEditContext";
import CompactSidebarSection from "@/components/templates/CompactSidebarSection";
import PersonalLayoutBlock from "@/components/templates/PersonalLayoutBlock";

interface Props {
  cv: CVData;
  scale?: number;
}

export default function ClassicTemplate({ cv, scale = 1 }: Props) {
  const { sections, theme } = cv;
  const primary = theme.primaryColor || "#1A3A5C";
  const mainSections = getSectionsForColumn(cv, "main");
  const sidebarSections = getSectionsForColumn(cv, "sidebar");
  const mainLayoutBlocks = getLayoutBlocksForColumn(cv, "main");
  const sidebarLayoutBlocks = getLayoutBlocksForColumn(cv, "sidebar");
  const showSidebar = hasSidebarLayoutContent(cv);
  const sidebarOnRight = isSidebarRight(cv);

  return (
    <div
      className="cv-document"
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: sidebarOnRight ? "row-reverse" : "row",
        fontFamily: resolveFontFamily(theme.fontFamily === "inter" ? "georgia" : theme.fontFamily),
        fontSize: theme.fontSize === "small" ? "11px" : theme.fontSize === "large" ? "14px" : "12px",
        color: "#2B2A28",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        boxSizing: "border-box",
      }}
    >
      {showSidebar && (
        <ColumnDropZone
          as="aside"
          column="sidebar"
          dropLabel={`${getColumnSide(cv, "sidebar") === "left" ? "Sol" : "Sağ"} sütuna bırak`}
          style={{ width: "230px", minHeight: "1123px", flexShrink: 0, padding: "48px 24px", backgroundColor: `${primary}0D`, borderRight: sidebarOnRight ? "0" : `1px solid ${primary}24`, borderLeft: sidebarOnRight ? `1px solid ${primary}24` : "0" }}
        >
          {sidebarLayoutBlocks.map((blockId) => (
            <PersonalLayoutBlock
              key={blockId}
              cv={cv}
              blockId={blockId}
              column="sidebar"
              accentColor={primary}
              titleColor={primary}
              textColor="#2B2A28"
              mutedColor="#666666"
              headingFont="Georgia, serif"
              align="left"
              summaryTitle="Özet"
            />
          ))}
          {sidebarSections.map((sectionId) => (
            <CompactSidebarSection
              key={sectionId}
              cv={cv}
              sectionId={sectionId}
              titleColor={primary}
              textColor="#2B2A28"
              mutedColor="#666666"
              accentColor={primary}
            />
          ))}
        </ColumnDropZone>
      )}

      <ColumnDropZone
        as="main"
        column="main"
        dropLabel={`${getColumnSide(cv, "main") === "left" ? "Sol" : "Sağ"} sütuna bırak`}
        style={{ flex: 1, minWidth: 0, padding: showSidebar ? "52px 44px" : "60px 64px" }}
      >
      {mainLayoutBlocks.map((blockId) => (
        <PersonalLayoutBlock
          key={blockId}
          cv={cv}
          blockId={blockId}
          column="main"
          accentColor={primary}
          titleColor={primary}
          textColor="#2B2A28"
          mutedColor="#555555"
          headingFont="Georgia, serif"
          align={blockId === "identity" && !showSidebar ? "center" : "left"}
          summaryTitle="Özet"
        />
      ))}

      {/* Dynamic sections */}
      {mainSections.map((sectionId) => {
        if (!isBuiltInSectionId(sectionId)) {
          const customSection = getCustomSection(cv, sectionId);
          if (!customSection) return null;

          return (
            <DraggableSection key={sectionId} sectionId={sectionId}>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px", color: primary, borderBottom: `1px solid ${primary}`, paddingBottom: "4px", marginBottom: "12px" }}>
                <EditableText fieldId={`sectionTitle:${sectionId}`} value={getSectionTitle(cv, sectionId)} singleLine />
              </h2>
              {customSection.items.map((item) => (
                <div key={item.id} style={{ marginBottom: "12px" }}>
                  {item.title && <strong style={{ fontSize: "12px" }}>{item.title}</strong>}
                  {item.description && <EditableText fieldId={`custom:${sectionId}:item:${item.id}:field:description`} value={item.description} as="p" multiline style={{ fontSize: "10px", marginTop: item.title ? "4px" : 0, lineHeight: "1.6", color: "#555", whiteSpace: "pre-line" }} />}
                </div>
              ))}
            </div>
            </DraggableSection>
          );
        }

        const key = sectionId;

        return (
          <DraggableSection key={key} sectionId={key}>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px", color: primary, borderBottom: `1px solid ${primary}`, paddingBottom: "4px", marginBottom: "12px" }}>
              <EditableText fieldId={`sectionTitle:${key}`} value={getSectionTitle(cv, key)} singleLine />
            </h2>

            {key === "experience" &&
              sections.experience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <strong style={{ fontSize: "12px" }}><EditableText fieldId={`section:experience:item:${exp.id}:field:position`} value={exp.position} singleLine /></strong>
                      <span style={{ color: "#666", fontSize: "11px" }}> · {exp.company}</span>
                      {exp.location && <span style={{ color: "#888", fontSize: "10px" }}> · {exp.location}</span>}
                    </div>
                    <div style={{ fontSize: "10px", color: "#888", whiteSpace: "nowrap" }}>
                      {exp.startDate} — {exp.current ? "Devam ediyor" : exp.endDate}
                    </div>
                  </div>
                  {exp.description && <EditableText fieldId={`section:experience:item:${exp.id}:field:description`} value={exp.description} as="p" multiline style={{ fontSize: "10px", marginTop: "5px", lineHeight: "1.6", color: "#555" }} />}
                </div>
              ))}

            {key === "education" &&
              sections.education.map((edu) => (
                <div key={edu.id} style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <strong style={{ fontSize: "12px" }}>{edu.degree} {edu.field && `· ${edu.field}`}</strong>
                      <span style={{ color: "#666", fontSize: "11px" }}> — {edu.school}</span>
                    </div>
                    <div style={{ fontSize: "10px", color: "#888", whiteSpace: "nowrap" }}>
                      {edu.startDate} — {edu.current ? "Devam ediyor" : edu.endDate}
                    </div>
                  </div>
                  {edu.gpa && <div style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>GPA: {edu.gpa}</div>}
                  {edu.description && <EditableText fieldId={`section:education:item:${edu.id}:field:description`} value={edu.description} as="p" multiline style={{ fontSize: "10px", marginTop: "5px", lineHeight: "1.6", color: "#555" }} />}
                </div>
              ))}

            {key === "skills" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {sections.skills.map((skill) => (
                  <span key={skill.id} style={{
                    padding: "3px 10px",
                    border: `1px solid ${primary}`,
                    borderRadius: "2px",
                    fontSize: "10px",
                    color: primary,
                  }}>
                    {skill.name}
                  </span>
                ))}
              </div>
            )}

            {key === "languages" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                {sections.languages.map((lang) => (
                  <span key={lang.id} style={{ fontSize: "11px" }}>
                    <strong>{lang.name}</strong> <span style={{ color: "#666" }}>({lang.level})</span>
                  </span>
                ))}
              </div>
            )}

            {key === "interests" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px" }}>
                {sections.interests.map((interest) => (
                  <span key={interest.id} style={{ fontSize: "11px", color: "#444" }}>
                    • {interest.name}
                  </span>
                ))}
              </div>
            )}

            {key === "projects" &&
              sections.projects.map((proj) => (
                <div key={proj.id} style={{ marginBottom: "12px" }}>
                  <strong style={{ fontSize: "12px" }}>{proj.name}</strong>
                  {proj.technologies && <span style={{ fontSize: "10px", color: "#666" }}> — {proj.technologies}</span>}
                  {proj.description && <EditableText fieldId={`section:projects:item:${proj.id}:field:description`} value={proj.description} as="p" multiline style={{ fontSize: "10px", marginTop: "4px", lineHeight: "1.6", color: "#555" }} />}
                  {proj.url && <div style={{ fontSize: "10px", color: "#888" }}>🔗 {proj.url}</div>}
                </div>
              ))}

            {key === "certificates" &&
              sections.certificates.map((cert) => (
                <div key={cert.id} style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <strong style={{ fontSize: "12px" }}>{cert.name}</strong>
                    <span style={{ fontSize: "10px", color: "#666" }}> — {cert.issuer}</span>
                  </div>
                  {cert.date && <span style={{ fontSize: "10px", color: "#888" }}>{cert.date}</span>}
                </div>
              ))}

            {key === "references" &&
              sections.references.map((ref) => (
                <div key={ref.id} style={{ marginBottom: "12px" }}>
                  <strong style={{ fontSize: "12px" }}>{ref.name}</strong>
                  <div style={{ fontSize: "10px", color: "#666" }}>{ref.title} {ref.company && `· ${ref.company}`}</div>
                  <div style={{ fontSize: "10px", color: "#888" }}>{ref.email} {ref.phone && `· ${ref.phone}`}</div>
                </div>
              ))}
          </div>
          </DraggableSection>
        );
      })}
      </ColumnDropZone>
    </div>
  );
}
