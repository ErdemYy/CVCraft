"use client";

import React from "react";
import { CVData } from "@/lib/cv-types";
import { getContactItems, getPersonalDetailItems } from "@/lib/personal-info";
import { getCustomSection, getOrderedSectionIds, getSectionTitle, isBuiltInSectionId } from "@/lib/section-utils";
import { resolveFontFamily } from "@/lib/font-options";
import { DraggableSection, EditableText } from "@/components/templates/PreviewEditContext";

interface Props {
  cv: CVData;
  scale?: number;
}

export default function MinimalTemplate({ cv, scale = 1 }: Props) {
  const { personalInfo: p, sections, theme } = cv;
  const contactItems = getContactItems(p);
  const personalDetailItems = getPersonalDetailItems(p);

  return (
    <div
      className="cv-document"
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: "#FFFFFF",
        padding: "64px 80px",
        fontFamily: resolveFontFamily(theme.fontFamily),
        fontSize: "12px",
        color: "#1A1A1A",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "700", margin: 0, letterSpacing: "-0.5px" }}>
          <EditableText fieldId="personal.fullName" value={`${p.firstName} ${p.lastName}`.trim()} singleLine placeholder="Ad Soyad" />
        </h1>
        {p.title && (
          <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
            <EditableText fieldId="personal.title" value={p.title} singleLine />
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px", marginTop: "10px", fontSize: "11px", color: "#555" }}>
          {contactItems.map((item) => (
            <span key={item.label}><EditableText fieldId={`personal.${item.field}`} value={item.value} singleLine /></span>
          ))}
        </div>
        {personalDetailItems.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: "8px", fontSize: "10px", color: "#666" }}>
            {personalDetailItems.map((item) => (
              <span key={item.label}>{item.label}: <EditableText fieldId={`personal.${item.field}`} value={item.value} singleLine /></span>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: "1px", backgroundColor: "#1A1A1A", marginBottom: "28px" }} />

      {/* Summary */}
      {p.summary && (
        <div style={{ marginBottom: "24px" }}>
          <EditableText fieldId="personal.summary" value={p.summary} as="p" multiline style={{ fontSize: "11px", lineHeight: "1.8", color: "#333", margin: 0 }} />
        </div>
      )}

      {/* Sections */}
      {getOrderedSectionIds(cv).map((sectionId) => {
        if (!isBuiltInSectionId(sectionId)) {
          const customSection = getCustomSection(cv, sectionId);
          if (!customSection) return null;

          return (
            <DraggableSection key={sectionId} sectionId={sectionId}>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "3px", color: "#1A1A1A", margin: "0 0 10px 0" }}>
                <EditableText fieldId={`sectionTitle:${sectionId}`} value={getSectionTitle(cv, sectionId)} singleLine />
              </h2>
              <div style={{ height: "1px", backgroundColor: "#E0E0E0", marginBottom: "12px" }} />
              {customSection.items.map((item, i) => (
                <div key={item.id} style={{ marginBottom: i < customSection.items.length - 1 ? "12px" : 0 }}>
                  {item.title && <span style={{ fontWeight: "600", fontSize: "12px" }}>{item.title}</span>}
                  {item.description && <EditableText fieldId={`custom:${sectionId}:item:${item.id}:field:description`} value={item.description} as="p" multiline style={{ fontSize: "10px", margin: item.title ? "4px 0 0" : 0, lineHeight: "1.7", color: "#444", whiteSpace: "pre-line" }} />}
                </div>
              ))}
            </div>
            </DraggableSection>
          );
        }

        const key = sectionId;

        return (
          <DraggableSection key={key} sectionId={key}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "3px", color: "#1A1A1A", margin: "0 0 10px 0" }}>
              <EditableText fieldId={`sectionTitle:${key}`} value={getSectionTitle(cv, key)} singleLine />
            </h2>
            <div style={{ height: "1px", backgroundColor: "#E0E0E0", marginBottom: "12px" }} />

            {key === "experience" &&
              sections.experience.map((exp, i) => (
                <div key={exp.id} style={{ marginBottom: i < sections.experience.length - 1 ? "14px" : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div>
                      <span style={{ fontWeight: "600", fontSize: "12px" }}><EditableText fieldId={`section:experience:item:${exp.id}:field:position`} value={exp.position} singleLine /></span>
                      <span style={{ color: "#555", fontSize: "11px" }}> — {exp.company}</span>
                      {exp.location && <span style={{ color: "#888", fontSize: "10px" }}> · {exp.location}</span>}
                    </div>
                    <span style={{ fontSize: "10px", color: "#888", whiteSpace: "nowrap", marginLeft: "16px" }}>
                      {exp.startDate} – {exp.current ? "Günümüz" : exp.endDate}
                    </span>
                  </div>
                  {exp.description && <EditableText fieldId={`section:experience:item:${exp.id}:field:description`} value={exp.description} as="p" multiline style={{ fontSize: "10px", margin: "5px 0 0", lineHeight: "1.7", color: "#444" }} />}
                </div>
              ))}

            {key === "education" &&
              sections.education.map((edu, i) => (
                <div key={edu.id} style={{ marginBottom: i < sections.education.length - 1 ? "12px" : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div>
                      <span style={{ fontWeight: "600", fontSize: "12px" }}>{edu.degree} {edu.field && `· ${edu.field}`}</span>
                      <span style={{ color: "#555", fontSize: "11px" }}> — {edu.school}</span>
                    </div>
                    <span style={{ fontSize: "10px", color: "#888", whiteSpace: "nowrap", marginLeft: "16px" }}>
                      {edu.startDate} – {edu.current ? "Günümüz" : edu.endDate}
                    </span>
                  </div>
                  {edu.gpa && <div style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>GPA: {edu.gpa}</div>}
                  {edu.description && <EditableText fieldId={`section:education:item:${edu.id}:field:description`} value={edu.description} as="p" multiline style={{ fontSize: "10px", margin: "4px 0 0", lineHeight: "1.7", color: "#444" }} />}
                </div>
              ))}

            {key === "skills" && (
              <div style={{ fontSize: "11px", lineHeight: "1.8", color: "#333" }}>
                {sections.skills.map((s) => s.name).join(" · ")}
              </div>
            )}

            {key === "languages" && (
              <div style={{ fontSize: "11px", lineHeight: "1.8", color: "#333" }}>
                {sections.languages.map((l) => `${l.name} (${l.level})`).join(" · ")}
              </div>
            )}

            {key === "interests" && (
              <div style={{ fontSize: "11px", lineHeight: "1.8", color: "#333" }}>
                {sections.interests.map((interest) => interest.name).join(" · ")}
              </div>
            )}

            {key === "projects" &&
              sections.projects.map((proj, i) => (
                <div key={proj.id} style={{ marginBottom: i < sections.projects.length - 1 ? "12px" : 0 }}>
                  <span style={{ fontWeight: "600", fontSize: "12px" }}>{proj.name}</span>
                  {proj.technologies && <span style={{ fontSize: "10px", color: "#666" }}> — {proj.technologies}</span>}
                  {proj.description && <EditableText fieldId={`section:projects:item:${proj.id}:field:description`} value={proj.description} as="p" multiline style={{ fontSize: "10px", margin: "4px 0 0", lineHeight: "1.7", color: "#444" }} />}
                  {proj.url && <div style={{ fontSize: "10px", color: "#888" }}>{proj.url}</div>}
                </div>
              ))}

            {key === "certificates" &&
              sections.certificates.map((cert, i) => (
                <div key={cert.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: i < sections.certificates.length - 1 ? "8px" : 0 }}>
                  <div>
                    <span style={{ fontWeight: "600", fontSize: "12px" }}>{cert.name}</span>
                    <span style={{ fontSize: "10px", color: "#666" }}> — {cert.issuer}</span>
                  </div>
                  {cert.date && <span style={{ fontSize: "10px", color: "#888" }}>{cert.date}</span>}
                </div>
              ))}

            {key === "references" &&
              sections.references.map((ref, i) => (
                <div key={ref.id} style={{ marginBottom: i < sections.references.length - 1 ? "12px" : 0 }}>
                  <span style={{ fontWeight: "600", fontSize: "12px" }}>{ref.name}</span>
                  <div style={{ fontSize: "10px", color: "#555" }}>{ref.title} {ref.company && `· ${ref.company}`}</div>
                  <div style={{ fontSize: "10px", color: "#888" }}>{ref.email} {ref.phone && `· ${ref.phone}`}</div>
                </div>
              ))}
          </div>
          </DraggableSection>
        );
      })}
    </div>
  );
}
