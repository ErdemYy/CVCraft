"use client";

import React from "react";
import { CVData } from "@/lib/cv-types";
import { getColumnSide, getCustomSection, getLayoutBlocksForColumn, getSectionsForColumn, getSectionTitle, isBuiltInSectionId, isSidebarRight } from "@/lib/section-utils";
import { resolveFontFamily } from "@/lib/font-options";
import { ColumnDropZone, DraggableSection, EditableText } from "@/components/templates/PreviewEditContext";
import CompactSidebarSection from "@/components/templates/CompactSidebarSection";
import PersonalLayoutBlock from "@/components/templates/PersonalLayoutBlock";

interface Props {
  cv: CVData;
  scale?: number;
}

export default function CreativeTemplate({ cv, scale = 1 }: Props) {
  const { sections, theme } = cv;
  const primary = theme.primaryColor || "#4F46E5";
  const sidebarSectionIds = getSectionsForColumn(cv, "sidebar");
  const mainSectionIds = getSectionsForColumn(cv, "main");
  const sidebarLayoutBlocks = getLayoutBlocksForColumn(cv, "sidebar");
  const mainLayoutBlocks = getLayoutBlocksForColumn(cv, "main");
  const sidebarOnRight = isSidebarRight(cv);

  return (
    <div
      className="cv-document"
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: "#1E1B4B",
        display: "flex",
        flexDirection: sidebarOnRight ? "row-reverse" : "row",
        fontFamily: resolveFontFamily(theme.fontFamily),
        fontSize: theme.fontSize === "small" ? "11px" : theme.fontSize === "large" ? "14px" : "12px",
        color: "#E0E7FF",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Left sidebar */}
      <ColumnDropZone
        column="sidebar"
        dropLabel={`${getColumnSide(cv, "sidebar") === "left" ? "Sol" : "Sağ"} sütuna bırak`}
        style={{ width: "260px", minHeight: "1123px", backgroundColor: "#312E81", padding: "40px 24px", display: "flex", flexDirection: "column", gap: "28px", flexShrink: 0 }}
      >
        {sidebarLayoutBlocks.map((blockId) => (
          <PersonalLayoutBlock
            key={blockId}
            cv={cv}
            blockId={blockId}
            column="sidebar"
            accentColor={primary}
            titleColor={primary}
            textColor="#FFFFFF"
            mutedColor="#C7D2FE"
            photoBorder={`3px solid ${primary}`}
            align="left"
            summaryTitle="Hakkımda"
          />
        ))}

        {sidebarSectionIds.map((sectionId) => (
          <CompactSidebarSection
            key={sectionId}
            cv={cv}
            sectionId={sectionId}
            titleColor={primary}
            textColor="#FFFFFF"
            mutedColor="#C7D2FE"
            accentColor={primary}
          />
        ))}
      </ColumnDropZone>

      {/* Main content */}
      <ColumnDropZone
        column="main"
        dropLabel={`${getColumnSide(cv, "main") === "left" ? "Sol" : "Sağ"} sütuna bırak`}
        style={{ flex: 1, padding: "40px 32px", display: "flex", flexDirection: "column", gap: "22px" }}
      >
        {mainLayoutBlocks.map((blockId) => (
          <PersonalLayoutBlock
            key={blockId}
            cv={cv}
            blockId={blockId}
            column="main"
            accentColor={primary}
            titleColor={primary}
            textColor="#FFFFFF"
            mutedColor="#C7D2FE"
            photoBorder={`3px solid ${primary}`}
            align="left"
            summaryTitle="Hakkımda"
          />
        ))}

        {/* Dynamic sections */}
        {mainSectionIds.map((sectionId) => {
            if (!isBuiltInSectionId(sectionId)) {
              const customSection = getCustomSection(cv, sectionId);
              if (!customSection) return null;

              return (
                <DraggableSection key={sectionId} sectionId={sectionId}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                    <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "2px", color: primary, textTransform: "uppercase" }}>
                      <EditableText fieldId={`sectionTitle:${sectionId}`} value={getSectionTitle(cv, sectionId)} singleLine />
                    </div>
                    <div style={{ flex: 1, height: "1px", backgroundColor: primary, opacity: 0.4 }} />
                  </div>
                  {customSection.items.map((item) => (
                    <div key={item.id} style={{ marginBottom: "14px", paddingLeft: "12px", borderLeft: `2px solid ${primary}` }}>
                      {item.title && <div style={{ fontWeight: "600", fontSize: "12px", color: "#fff" }}>{item.title}</div>}
                      {item.description && <EditableText fieldId={`custom:${sectionId}:item:${item.id}:field:description`} value={item.description} as="p" multiline style={{ fontSize: "10px", marginTop: item.title ? "4px" : 0, lineHeight: "1.6", color: "#C7D2FE", whiteSpace: "pre-line" }} />}
                    </div>
                  ))}
                </div>
                </DraggableSection>
              );
            }

            const key = sectionId;

            return (
              <DraggableSection key={key} sectionId={key}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "2px", color: primary, textTransform: "uppercase" }}>
                    <EditableText fieldId={`sectionTitle:${key}`} value={getSectionTitle(cv, key)} singleLine />
                  </div>
                  <div style={{ flex: 1, height: "1px", backgroundColor: primary, opacity: 0.4 }} />
                </div>

                {key === "experience" &&
                  sections.experience.map((exp) => (
                    <div key={exp.id} style={{ marginBottom: "16px", paddingLeft: "12px", borderLeft: `2px solid ${primary}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <EditableText fieldId={`section:experience:item:${exp.id}:field:position`} value={exp.position} as="div" singleLine style={{ fontWeight: "600", fontSize: "12px", color: "#fff" }} />
                          <div style={{ fontSize: "11px", color: primary }}>{exp.company}</div>
                        </div>
                        <div style={{ fontSize: "10px", color: "#818CF8", whiteSpace: "nowrap", marginLeft: "8px" }}>
                          {exp.startDate} — {exp.current ? "Devam" : exp.endDate}
                        </div>
                      </div>
                      {exp.description && <EditableText fieldId={`section:experience:item:${exp.id}:field:description`} value={exp.description} as="p" multiline style={{ fontSize: "10px", marginTop: "5px", lineHeight: "1.6", color: "#C7D2FE" }} />}
                    </div>
                  ))}

                {key === "education" &&
                  sections.education.map((edu) => (
                    <div key={edu.id} style={{ marginBottom: "14px", paddingLeft: "12px", borderLeft: `2px solid ${primary}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "12px", color: "#fff" }}>{edu.degree} {edu.field && `— ${edu.field}`}</div>
                          <div style={{ fontSize: "11px", color: primary }}>{edu.school}</div>
                        </div>
                        <div style={{ fontSize: "10px", color: "#818CF8", whiteSpace: "nowrap", marginLeft: "8px" }}>
                          {edu.startDate} — {edu.current ? "Devam" : edu.endDate}
                        </div>
                      </div>
                      {edu.description && <EditableText fieldId={`section:education:item:${edu.id}:field:description`} value={edu.description} as="p" multiline style={{ fontSize: "10px", marginTop: "4px", lineHeight: "1.6", color: "#C7D2FE" }} />}
                    </div>
                  ))}

                {key === "skills" && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                    {sections.skills.map((skill) => (
                      <span key={skill.id} style={{ border: `1px solid ${primary}`, padding: "4px 8px", color: "#E0E7FF", fontSize: "10px" }}>
                        <EditableText fieldId={`section:skills:item:${skill.id}:field:name`} value={skill.name} singleLine />
                      </span>
                    ))}
                  </div>
                )}

                {key === "languages" && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "7px 14px" }}>
                    {sections.languages.map((language) => (
                      <span key={language.id} style={{ fontSize: "10px", color: "#E0E7FF" }}>
                        <EditableText fieldId={`section:languages:item:${language.id}:field:name`} value={language.name} singleLine />
                        <span style={{ color: primary }}> · {language.level}</span>
                      </span>
                    ))}
                  </div>
                )}

                {key === "projects" &&
                  sections.projects.map((proj) => (
                    <div key={proj.id} style={{ marginBottom: "14px", paddingLeft: "12px", borderLeft: `2px solid ${primary}` }}>
                      <div style={{ fontWeight: "600", fontSize: "12px", color: "#fff" }}>{proj.name}</div>
                      {proj.technologies && <div style={{ fontSize: "10px", color: primary, marginTop: "2px" }}>{proj.technologies}</div>}
                      {proj.description && <EditableText fieldId={`section:projects:item:${proj.id}:field:description`} value={proj.description} as="p" multiline style={{ fontSize: "10px", marginTop: "4px", lineHeight: "1.6", color: "#C7D2FE" }} />}
                    </div>
                  ))}

                {key === "certificates" &&
                  sections.certificates.map((cert) => (
                    <div key={cert.id} style={{ marginBottom: "10px" }}>
                      <div style={{ fontWeight: "600", fontSize: "12px", color: "#fff" }}>{cert.name}</div>
                      <div style={{ fontSize: "10px", color: "#818CF8" }}>{cert.issuer} {cert.date && `· ${cert.date}`}</div>
                    </div>
                  ))}

                {key === "references" &&
                  sections.references.map((ref) => (
                    <div key={ref.id} style={{ marginBottom: "14px" }}>
                      <div style={{ fontWeight: "600", fontSize: "12px", color: "#fff" }}>{ref.name}</div>
                      <div style={{ fontSize: "10px", color: primary }}>{ref.title} {ref.company && `· ${ref.company}`}</div>
                      <div style={{ fontSize: "10px", color: "#818CF8", marginTop: "2px" }}>
                        {ref.email} {ref.phone && `· ${ref.phone}`}
                      </div>
                    </div>
                  ))}

                {key === "interests" && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                    {sections.interests.map((interest) => (
                      <span key={interest.id} style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "999px", backgroundColor: "rgba(199,210,254,0.14)", color: "#C7D2FE" }}>
                        {interest.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              </DraggableSection>
            );
          })}
      </ColumnDropZone>
    </div>
  );
}
