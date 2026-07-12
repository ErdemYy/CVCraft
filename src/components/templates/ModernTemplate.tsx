"use client";

import React from "react";
import { CVData } from "@/lib/cv-types";
import { getContactItems, getPersonalDetailItems } from "@/lib/personal-info";
import { getCustomSection, getSectionsForColumn, getSectionTitle, isBuiltInSectionId, isSidebarRight } from "@/lib/section-utils";
import { resolveFontFamily } from "@/lib/font-options";
import CVPhoto from "@/components/templates/CVPhoto";
import { ColumnDropZone, DraggableSection, EditableText } from "@/components/templates/PreviewEditContext";
import CompactSidebarSection from "@/components/templates/CompactSidebarSection";

interface Props {
  cv: CVData;
  scale?: number;
}

export default function ModernTemplate({ cv, scale = 1 }: Props) {
  const { personalInfo: p, sections, theme } = cv;
  const primary = theme.primaryColor || "#B08D57";
  const secondary = theme.secondaryColor || "#2B2A28";
  const contactItems = getContactItems(p);
  const personalDetailItems = getPersonalDetailItems(p);

  const photoShape = theme.photoShape === "square"
    ? "0px"
    : theme.photoShape === "rounded"
    ? "12px"
    : "50%";
  const sidebarSectionIds = getSectionsForColumn(cv, "sidebar");
  const mainSectionIds = getSectionsForColumn(cv, "main");
  const sidebarOnRight = isSidebarRight(cv);

  return (
    <div
      className="cv-document"
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: "#FAF9F6",
        display: "flex",
        flexDirection: sidebarOnRight ? "row-reverse" : "row",
        fontFamily: resolveFontFamily(theme.fontFamily),
        fontSize: theme.fontSize === "small" ? "11px" : theme.fontSize === "large" ? "14px" : "12px",
        color: secondary,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Left sidebar */}
      <ColumnDropZone
        column="sidebar"
        style={{
          width: "240px",
          minHeight: "1123px",
          backgroundColor: primary,
          padding: "36px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          flexShrink: 0,
        }}
      >
        {/* Photo */}
        {p.photo && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <CVPhoto personalInfo={p} width={100} height={100} fallbackRadius={photoShape} border="3px solid rgba(255,255,255,0.4)" />
          </div>
        )}

        {/* Name & Title */}
        <div style={{ textAlign: "center", color: "#fff" }}>
          <EditableText fieldId="personal.fullName" value={`${p.firstName} ${p.lastName}`.trim()} as="div" singleLine style={{ fontSize: "18px", fontWeight: "700", lineHeight: "1.2" }} placeholder="Ad Soyad" />
          {p.title && (
            <EditableText fieldId="personal.title" value={p.title} as="div" singleLine style={{ fontSize: "11px", marginTop: "6px", opacity: 0.85, letterSpacing: "0.5px" }} />
          )}
        </div>

        {/* Contact */}
        <div style={{ color: "#fff" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.7, marginBottom: "10px" }}>
            İletişim
          </div>
          {contactItems
            .map((item) => (
              <div key={item.label} style={{ fontSize: "10px", marginBottom: "6px", opacity: 0.9, wordBreak: "break-all" }}>
                <span style={{ fontWeight: "600" }}>{item.icon} </span>
                <EditableText fieldId={`personal.${item.field}`} value={item.value} singleLine />
              </div>
            ))}
        </div>

        {personalDetailItems.length > 0 && (
          <div style={{ color: "#fff" }}>
            <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.7, marginBottom: "10px" }}>
              Kişisel Bilgiler
            </div>
            {personalDetailItems.map((item) => (
              <div key={item.label} style={{ fontSize: "10px", marginBottom: "6px", opacity: 0.9 }}>
                <span style={{ opacity: 0.72 }}>{item.label}: </span>
                <EditableText fieldId={`personal.${item.field}`} value={item.value} singleLine />
              </div>
            ))}
          </div>
        )}

        {sidebarSectionIds.map((sectionId) => (
          <CompactSidebarSection
            key={sectionId}
            cv={cv}
            sectionId={sectionId}
            titleColor="rgba(255,255,255,0.72)"
            textColor="#FFFFFF"
            mutedColor="rgba(255,255,255,0.72)"
            accentColor="rgba(255,255,255,0.82)"
          />
        ))}
      </ColumnDropZone>

      {/* Main content */}
      <ColumnDropZone column="main" style={{ flex: 1, padding: "36px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Summary */}
        {p.summary && (
          <div>
            <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: primary, marginBottom: "8px" }}>
              <EditableText fieldId="sectionTitle:summary" value="Hakkımda" singleLine />
            </div>
            <div style={{ height: "2px", backgroundColor: primary, marginBottom: "10px", opacity: 0.3 }} />
            <EditableText fieldId="personal.summary" value={p.summary} as="p" multiline style={{ fontSize: "11px", lineHeight: "1.6", color: "#555" }} />
          </div>
        )}

        {/* Dynamic sections */}
        {mainSectionIds.map((sectionId) => {
            if (!isBuiltInSectionId(sectionId)) {
              const customSection = getCustomSection(cv, sectionId);
              if (!customSection) return null;

              return (
                <DraggableSection key={sectionId} sectionId={sectionId}>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: primary, marginBottom: "8px" }}>
                    <EditableText fieldId={`sectionTitle:${sectionId}`} value={getSectionTitle(cv, sectionId)} singleLine />
                  </div>
                  <div style={{ height: "2px", backgroundColor: primary, marginBottom: "12px", opacity: 0.3 }} />
                  {customSection.items.map((item) => (
                    <div key={item.id} style={{ marginBottom: "14px" }}>
                      {item.title && <div style={{ fontWeight: "600", fontSize: "12px" }}>{item.title}</div>}
                      {item.description && <EditableText fieldId={`custom:${sectionId}:item:${item.id}:field:description`} value={item.description} as="p" multiline style={{ fontSize: "10px", marginTop: item.title ? "5px" : 0, lineHeight: "1.5", color: "#555", whiteSpace: "pre-line" }} />}
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
                <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: primary, marginBottom: "8px" }}>
                  <EditableText fieldId={`sectionTitle:${key}`} value={getSectionTitle(cv, key)} singleLine />
                </div>
                <div style={{ height: "2px", backgroundColor: primary, marginBottom: "12px", opacity: 0.3 }} />

                {key === "experience" &&
                  sections.experience.map((exp) => (
                    <div key={exp.id} style={{ marginBottom: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <EditableText fieldId={`section:experience:item:${exp.id}:field:position`} value={exp.position} as="div" singleLine style={{ fontWeight: "600", fontSize: "12px" }} />
                          <EditableText fieldId={`section:experience:item:${exp.id}:field:company`} value={exp.company} as="div" singleLine style={{ fontSize: "11px", color: primary }} />
                        </div>
                        <div style={{ fontSize: "10px", color: "#888", whiteSpace: "nowrap", marginLeft: "8px" }}>
                          {exp.startDate} — {exp.current ? "Devam ediyor" : exp.endDate}
                        </div>
                      </div>
                      {exp.location && <div style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>📍 {exp.location}</div>}
                      {exp.description && <EditableText fieldId={`section:experience:item:${exp.id}:field:description`} value={exp.description} as="p" multiline style={{ fontSize: "10px", marginTop: "5px", lineHeight: "1.5", color: "#555" }} />}
                    </div>
                  ))}

                {key === "education" &&
                  sections.education.map((edu) => (
                    <div key={edu.id} style={{ marginBottom: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <EditableText fieldId={`section:education:item:${edu.id}:field:degree`} value={[edu.degree, edu.field].filter(Boolean).join(" — ")} as="div" singleLine style={{ fontWeight: "600", fontSize: "12px" }} />
                          <EditableText fieldId={`section:education:item:${edu.id}:field:school`} value={edu.school} as="div" singleLine style={{ fontSize: "11px", color: primary }} />
                        </div>
                        <div style={{ fontSize: "10px", color: "#888", whiteSpace: "nowrap", marginLeft: "8px" }}>
                          {edu.startDate} — {edu.current ? "Devam ediyor" : edu.endDate}
                        </div>
                      </div>
                      {edu.gpa && <div style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>GPA: {edu.gpa}</div>}
                      {edu.description && <EditableText fieldId={`section:education:item:${edu.id}:field:description`} value={edu.description} as="p" multiline style={{ fontSize: "10px", marginTop: "5px", lineHeight: "1.5", color: "#555" }} />}
                    </div>
                  ))}

                {key === "skills" && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                    {sections.skills.map((skill) => (
                      <span key={skill.id} style={{ border: `1px solid ${primary}55`, borderRadius: "4px", padding: "4px 8px", color: secondary, fontSize: "10px" }}>
                        <EditableText fieldId={`section:skills:item:${skill.id}:field:name`} value={skill.name} singleLine />
                      </span>
                    ))}
                  </div>
                )}

                {key === "languages" && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "7px 14px" }}>
                    {sections.languages.map((language) => (
                      <span key={language.id} style={{ fontSize: "10px", color: secondary }}>
                        <EditableText fieldId={`section:languages:item:${language.id}:field:name`} value={language.name} singleLine />
                        <span style={{ color: "#888" }}> · {language.level}</span>
                      </span>
                    ))}
                  </div>
                )}

                {key === "projects" &&
                  sections.projects.map((proj) => (
                    <div key={proj.id} style={{ marginBottom: "14px" }}>
                      <EditableText fieldId={`section:projects:item:${proj.id}:field:name`} value={proj.name} as="div" singleLine style={{ fontWeight: "600", fontSize: "12px" }} />
                      {proj.technologies && <div style={{ fontSize: "10px", color: primary, marginTop: "2px" }}>{proj.technologies}</div>}
                      {proj.description && <EditableText fieldId={`section:projects:item:${proj.id}:field:description`} value={proj.description} as="p" multiline style={{ fontSize: "10px", marginTop: "5px", lineHeight: "1.5", color: "#555" }} />}
                      {proj.url && <div style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>🔗 {proj.url}</div>}
                    </div>
                  ))}

                {key === "certificates" &&
                  sections.certificates.map((cert) => (
                    <div key={cert.id} style={{ marginBottom: "10px" }}>
                      <div style={{ fontWeight: "600", fontSize: "12px" }}>{cert.name}</div>
                      <div style={{ fontSize: "10px", color: "#888" }}>{cert.issuer} {cert.date && `· ${cert.date}`}</div>
                    </div>
                  ))}

                {key === "references" &&
                  sections.references.map((ref) => (
                    <div key={ref.id} style={{ marginBottom: "14px" }}>
                      <div style={{ fontWeight: "600", fontSize: "12px" }}>{ref.name}</div>
                      <div style={{ fontSize: "10px", color: primary }}>{ref.title} {ref.company && `· ${ref.company}`}</div>
                      <div style={{ fontSize: "10px", color: "#888", marginTop: "3px" }}>
                        {ref.email && <span>{ref.email} </span>}
                        {ref.phone && <span>{ref.phone}</span>}
                      </div>
                    </div>
                  ))}

                {key === "interests" && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                    {sections.interests.map((interest) => (
                      <span key={interest.id} style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "999px", backgroundColor: `${primary}18`, color: secondary }}>
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
