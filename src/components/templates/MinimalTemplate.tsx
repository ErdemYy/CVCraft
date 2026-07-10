"use client";

import React from "react";
import { CVData, SECTION_LABELS } from "@/lib/cv-types";

interface Props {
  cv: CVData;
  scale?: number;
}

export default function MinimalTemplate({ cv, scale = 1 }: Props) {
  const { personalInfo: p, sections, sectionOrder } = cv;

  return (
    <div
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: "#FFFFFF",
        padding: "64px 80px",
        fontFamily: "Inter, Arial, sans-serif",
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
          {p.firstName} {p.lastName}
        </h1>
        {p.title && (
          <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
            {p.title}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px", marginTop: "10px", fontSize: "11px", color: "#555" }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.website && <span>{p.website}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.github && <span>{p.github}</span>}
        </div>
      </div>

      <div style={{ height: "1px", backgroundColor: "#1A1A1A", marginBottom: "28px" }} />

      {/* Summary */}
      {p.summary && (
        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "11px", lineHeight: "1.8", color: "#333", margin: 0 }}>{p.summary}</p>
        </div>
      )}

      {/* Sections */}
      {sectionOrder.map((key) => {
        const items = sections[key];
        if (!items || items.length === 0) return null;

        return (
          <div key={key} style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "3px", color: "#1A1A1A", margin: "0 0 10px 0" }}>
              {SECTION_LABELS[key]}
            </h2>
            <div style={{ height: "1px", backgroundColor: "#E0E0E0", marginBottom: "12px" }} />

            {key === "experience" &&
              sections.experience.map((exp, i) => (
                <div key={exp.id} style={{ marginBottom: i < sections.experience.length - 1 ? "14px" : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div>
                      <span style={{ fontWeight: "600", fontSize: "12px" }}>{exp.position}</span>
                      <span style={{ color: "#555", fontSize: "11px" }}> — {exp.company}</span>
                      {exp.location && <span style={{ color: "#888", fontSize: "10px" }}> · {exp.location}</span>}
                    </div>
                    <span style={{ fontSize: "10px", color: "#888", whiteSpace: "nowrap", marginLeft: "16px" }}>
                      {exp.startDate} – {exp.current ? "Günümüz" : exp.endDate}
                    </span>
                  </div>
                  {exp.description && <p style={{ fontSize: "10px", margin: "5px 0 0", lineHeight: "1.7", color: "#444" }}>{exp.description}</p>}
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
                  {edu.description && <p style={{ fontSize: "10px", margin: "4px 0 0", lineHeight: "1.7", color: "#444" }}>{edu.description}</p>}
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

            {key === "projects" &&
              sections.projects.map((proj, i) => (
                <div key={proj.id} style={{ marginBottom: i < sections.projects.length - 1 ? "12px" : 0 }}>
                  <span style={{ fontWeight: "600", fontSize: "12px" }}>{proj.name}</span>
                  {proj.technologies && <span style={{ fontSize: "10px", color: "#666" }}> — {proj.technologies}</span>}
                  {proj.description && <p style={{ fontSize: "10px", margin: "4px 0 0", lineHeight: "1.7", color: "#444" }}>{proj.description}</p>}
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
        );
      })}
    </div>
  );
}
