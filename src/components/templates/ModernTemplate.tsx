/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { CVData, SECTION_LABELS } from "@/lib/cv-types";

interface Props {
  cv: CVData;
  scale?: number;
}

export default function ModernTemplate({ cv, scale = 1 }: Props) {
  const { personalInfo: p, sections, sectionOrder, theme } = cv;
  const primary = theme.primaryColor || "#B08D57";
  const secondary = theme.secondaryColor || "#2B2A28";

  const photoShape = theme.photoShape === "square"
    ? "0px"
    : theme.photoShape === "rounded"
    ? "12px"
    : "50%";

  return (
    <div
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: "#FAF9F6",
        display: "flex",
        fontFamily: theme.fontFamily === "serif" ? "Georgia, serif" : "Inter, sans-serif",
        fontSize: theme.fontSize === "small" ? "11px" : theme.fontSize === "large" ? "14px" : "12px",
        color: secondary,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Left sidebar */}
      <div
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
            <img
              src={p.photo}
              alt="Profil"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                borderRadius: photoShape,
                border: "3px solid rgba(255,255,255,0.4)",
              }}
            />
          </div>
        )}

        {/* Name & Title */}
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: "18px", fontWeight: "700", lineHeight: "1.2" }}>
            {p.firstName} {p.lastName}
          </div>
          {p.title && (
            <div style={{ fontSize: "11px", marginTop: "6px", opacity: 0.85, letterSpacing: "0.5px" }}>
              {p.title}
            </div>
          )}
        </div>

        {/* Contact */}
        <div style={{ color: "#fff" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.7, marginBottom: "10px" }}>
            İletişim
          </div>
          {[
            { icon: "✉", val: p.email },
            { icon: "📱", val: p.phone },
            { icon: "📍", val: p.location },
            { icon: "🌐", val: p.website },
            { icon: "in", val: p.linkedin },
            { icon: "gh", val: p.github },
          ]
            .filter((i) => i.val)
            .map((item, idx) => (
              <div key={idx} style={{ fontSize: "10px", marginBottom: "6px", opacity: 0.9, wordBreak: "break-all" }}>
                <span style={{ fontWeight: "600" }}>{item.icon} </span>
                {item.val}
              </div>
            ))}
        </div>

        {/* Skills */}
        {sections.skills.length > 0 && (
          <div style={{ color: "#fff" }}>
            <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.7, marginBottom: "10px" }}>
              Yetenekler
            </div>
            {sections.skills.map((skill) => (
              <div key={skill.id} style={{ marginBottom: "8px" }}>
                <div style={{ fontSize: "10px", marginBottom: "3px", opacity: 0.9 }}>{skill.name}</div>
                <div style={{ height: "3px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "2px" }}>
                  <div
                    style={{
                      height: "3px",
                      width: `${(skill.level / 5) * 100}%`,
                      backgroundColor: "rgba(255,255,255,0.8)",
                      borderRadius: "2px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {sections.languages.length > 0 && (
          <div style={{ color: "#fff" }}>
            <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.7, marginBottom: "10px" }}>
              Diller
            </div>
            {sections.languages.map((lang) => (
              <div key={lang.id} style={{ fontSize: "10px", marginBottom: "5px", opacity: 0.9, display: "flex", justifyContent: "space-between" }}>
                <span>{lang.name}</span>
                <span style={{ opacity: 0.7 }}>{lang.level}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "36px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Summary */}
        {p.summary && (
          <div>
            <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: primary, marginBottom: "8px" }}>
              Hakkımda
            </div>
            <div style={{ height: "2px", backgroundColor: primary, marginBottom: "10px", opacity: 0.3 }} />
            <p style={{ fontSize: "11px", lineHeight: "1.6", color: "#555" }}>{p.summary}</p>
          </div>
        )}

        {/* Dynamic sections */}
        {sectionOrder
          .filter((k) => k !== "skills" && k !== "languages")
          .map((key) => {
            const items = sections[key];
            if (!items || items.length === 0) return null;

            return (
              <div key={key}>
                <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: primary, marginBottom: "8px" }}>
                  {SECTION_LABELS[key]}
                </div>
                <div style={{ height: "2px", backgroundColor: primary, marginBottom: "12px", opacity: 0.3 }} />

                {key === "experience" &&
                  sections.experience.map((exp) => (
                    <div key={exp.id} style={{ marginBottom: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "12px" }}>{exp.position}</div>
                          <div style={{ fontSize: "11px", color: primary }}>{exp.company}</div>
                        </div>
                        <div style={{ fontSize: "10px", color: "#888", whiteSpace: "nowrap", marginLeft: "8px" }}>
                          {exp.startDate} — {exp.current ? "Devam ediyor" : exp.endDate}
                        </div>
                      </div>
                      {exp.location && <div style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>📍 {exp.location}</div>}
                      {exp.description && <p style={{ fontSize: "10px", marginTop: "5px", lineHeight: "1.5", color: "#555" }}>{exp.description}</p>}
                    </div>
                  ))}

                {key === "education" &&
                  sections.education.map((edu) => (
                    <div key={edu.id} style={{ marginBottom: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "12px" }}>{edu.degree} {edu.field && `— ${edu.field}`}</div>
                          <div style={{ fontSize: "11px", color: primary }}>{edu.school}</div>
                        </div>
                        <div style={{ fontSize: "10px", color: "#888", whiteSpace: "nowrap", marginLeft: "8px" }}>
                          {edu.startDate} — {edu.current ? "Devam ediyor" : edu.endDate}
                        </div>
                      </div>
                      {edu.gpa && <div style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>GPA: {edu.gpa}</div>}
                      {edu.description && <p style={{ fontSize: "10px", marginTop: "5px", lineHeight: "1.5", color: "#555" }}>{edu.description}</p>}
                    </div>
                  ))}

                {key === "projects" &&
                  sections.projects.map((proj) => (
                    <div key={proj.id} style={{ marginBottom: "14px" }}>
                      <div style={{ fontWeight: "600", fontSize: "12px" }}>{proj.name}</div>
                      {proj.technologies && <div style={{ fontSize: "10px", color: primary, marginTop: "2px" }}>{proj.technologies}</div>}
                      {proj.description && <p style={{ fontSize: "10px", marginTop: "5px", lineHeight: "1.5", color: "#555" }}>{proj.description}</p>}
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
              </div>
            );
          })}
      </div>
    </div>
  );
}
