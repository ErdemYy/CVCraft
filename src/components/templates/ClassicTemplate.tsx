"use client";

import React from "react";
import { CVData, SECTION_LABELS } from "@/lib/cv-types";

interface Props {
  cv: CVData;
  scale?: number;
}

export default function ClassicTemplate({ cv, scale = 1 }: Props) {
  const { personalInfo: p, sections, sectionOrder, theme } = cv;
  const primary = theme.primaryColor || "#1A3A5C";

  return (
    <div
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: "#FFFFFF",
        padding: "60px 64px",
        fontFamily: "Georgia, serif",
        fontSize: theme.fontSize === "small" ? "11px" : theme.fontSize === "large" ? "14px" : "12px",
        color: "#2B2A28",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "28px", borderBottom: `3px solid ${primary}`, paddingBottom: "20px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: primary, margin: 0, letterSpacing: "1px" }}>
          {p.firstName} {p.lastName}
        </h1>
        {p.title && (
          <div style={{ fontSize: "14px", color: "#666", marginTop: "6px", fontStyle: "italic" }}>
            {p.title}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "16px", marginTop: "12px", fontSize: "11px", color: "#555" }}>
          {p.email && <span>✉ {p.email}</span>}
          {p.phone && <span>📱 {p.phone}</span>}
          {p.location && <span>📍 {p.location}</span>}
          {p.website && <span>🌐 {p.website}</span>}
          {p.linkedin && <span>in {p.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {p.summary && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px", color: primary, borderBottom: `1px solid ${primary}`, paddingBottom: "4px", marginBottom: "10px" }}>
            Özet
          </h2>
          <p style={{ fontSize: "11px", lineHeight: "1.7", color: "#444" }}>{p.summary}</p>
        </div>
      )}

      {/* Dynamic sections */}
      {sectionOrder.map((key) => {
        const items = sections[key];
        if (!items || items.length === 0) return null;

        return (
          <div key={key} style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px", color: primary, borderBottom: `1px solid ${primary}`, paddingBottom: "4px", marginBottom: "12px" }}>
              {SECTION_LABELS[key]}
            </h2>

            {key === "experience" &&
              sections.experience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <strong style={{ fontSize: "12px" }}>{exp.position}</strong>
                      <span style={{ color: "#666", fontSize: "11px" }}> · {exp.company}</span>
                      {exp.location && <span style={{ color: "#888", fontSize: "10px" }}> · {exp.location}</span>}
                    </div>
                    <div style={{ fontSize: "10px", color: "#888", whiteSpace: "nowrap" }}>
                      {exp.startDate} — {exp.current ? "Devam ediyor" : exp.endDate}
                    </div>
                  </div>
                  {exp.description && <p style={{ fontSize: "10px", marginTop: "5px", lineHeight: "1.6", color: "#555" }}>{exp.description}</p>}
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
                  {edu.description && <p style={{ fontSize: "10px", marginTop: "5px", lineHeight: "1.6", color: "#555" }}>{edu.description}</p>}
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

            {key === "projects" &&
              sections.projects.map((proj) => (
                <div key={proj.id} style={{ marginBottom: "12px" }}>
                  <strong style={{ fontSize: "12px" }}>{proj.name}</strong>
                  {proj.technologies && <span style={{ fontSize: "10px", color: "#666" }}> — {proj.technologies}</span>}
                  {proj.description && <p style={{ fontSize: "10px", marginTop: "4px", lineHeight: "1.6", color: "#555" }}>{proj.description}</p>}
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
        );
      })}
    </div>
  );
}
