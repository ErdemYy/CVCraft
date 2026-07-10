/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { CVData, SECTION_LABELS } from "@/lib/cv-types";

interface Props {
  cv: CVData;
  scale?: number;
}

export default function CreativeTemplate({ cv, scale = 1 }: Props) {
  const { personalInfo: p, sections, sectionOrder, theme } = cv;
  const primary = theme.primaryColor || "#4F46E5";

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
        backgroundColor: "#1E1B4B",
        display: "flex",
        fontFamily: "Inter, sans-serif",
        fontSize: theme.fontSize === "small" ? "11px" : theme.fontSize === "large" ? "14px" : "12px",
        color: "#E0E7FF",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Left sidebar */}
      <div style={{ width: "260px", minHeight: "1123px", backgroundColor: "#312E81", padding: "40px 24px", display: "flex", flexDirection: "column", gap: "28px", flexShrink: 0 }}>
        {/* Photo */}
        {p.photo && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img
              src={p.photo}
              alt="Profil"
              style={{
                width: "110px",
                height: "110px",
                objectFit: "cover",
                borderRadius: photoShape,
                border: `3px solid ${primary}`,
              }}
            />
          </div>
        )}

        {/* Name */}
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", margin: 0, lineHeight: "1.2" }}>
            {p.firstName}
            <br />
            {p.lastName}
          </h1>
          {p.title && (
            <div style={{ fontSize: "11px", color: primary, marginTop: "6px", fontWeight: "600", letterSpacing: "0.5px" }}>
              {p.title}
            </div>
          )}
        </div>

        {/* Contact */}
        <div>
          <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "2px", color: primary, marginBottom: "10px", textTransform: "uppercase" }}>
            İletişim
          </div>
          {[
            { label: "Email", val: p.email },
            { label: "Tel", val: p.phone },
            { label: "Konum", val: p.location },
            { label: "Web", val: p.website },
            { label: "LinkedIn", val: p.linkedin },
            { label: "GitHub", val: p.github },
          ]
            .filter((i) => i.val)
            .map((item, idx) => (
              <div key={idx} style={{ marginBottom: "8px" }}>
                <div style={{ fontSize: "9px", color: primary, marginBottom: "1px" }}>{item.label}</div>
                <div style={{ fontSize: "10px", color: "#C7D2FE", wordBreak: "break-all" }}>{item.val}</div>
              </div>
            ))}
        </div>

        {/* Skills */}
        {sections.skills.length > 0 && (
          <div>
            <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "2px", color: primary, marginBottom: "10px", textTransform: "uppercase" }}>
              Yetenekler
            </div>
            {sections.skills.map((skill) => (
              <div key={skill.id} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                  <span style={{ fontSize: "10px", color: "#C7D2FE" }}>{skill.name}</span>
                </div>
                <div style={{ height: "3px", backgroundColor: "rgba(199,210,254,0.2)", borderRadius: "2px" }}>
                  <div style={{ height: "3px", width: `${(skill.level / 5) * 100}%`, backgroundColor: primary, borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {sections.languages.length > 0 && (
          <div>
            <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "2px", color: primary, marginBottom: "10px", textTransform: "uppercase" }}>
              Diller
            </div>
            {sections.languages.map((lang) => (
              <div key={lang.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginBottom: "5px", color: "#C7D2FE" }}>
                <span>{lang.name}</span>
                <span style={{ color: primary }}>{lang.level}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "40px 32px", display: "flex", flexDirection: "column", gap: "22px" }}>
        {/* Summary */}
        {p.summary && (
          <div>
            <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "2px", color: primary, marginBottom: "6px", textTransform: "uppercase" }}>
              Hakkımda
            </div>
            <p style={{ fontSize: "11px", lineHeight: "1.7", color: "#C7D2FE" }}>{p.summary}</p>
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
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "2px", color: primary, textTransform: "uppercase" }}>
                    {SECTION_LABELS[key]}
                  </div>
                  <div style={{ flex: 1, height: "1px", backgroundColor: primary, opacity: 0.4 }} />
                </div>

                {key === "experience" &&
                  sections.experience.map((exp) => (
                    <div key={exp.id} style={{ marginBottom: "16px", paddingLeft: "12px", borderLeft: `2px solid ${primary}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "12px", color: "#fff" }}>{exp.position}</div>
                          <div style={{ fontSize: "11px", color: primary }}>{exp.company}</div>
                        </div>
                        <div style={{ fontSize: "10px", color: "#818CF8", whiteSpace: "nowrap", marginLeft: "8px" }}>
                          {exp.startDate} — {exp.current ? "Devam" : exp.endDate}
                        </div>
                      </div>
                      {exp.description && <p style={{ fontSize: "10px", marginTop: "5px", lineHeight: "1.6", color: "#C7D2FE" }}>{exp.description}</p>}
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
                      {edu.description && <p style={{ fontSize: "10px", marginTop: "4px", lineHeight: "1.6", color: "#C7D2FE" }}>{edu.description}</p>}
                    </div>
                  ))}

                {key === "projects" &&
                  sections.projects.map((proj) => (
                    <div key={proj.id} style={{ marginBottom: "14px", paddingLeft: "12px", borderLeft: `2px solid ${primary}` }}>
                      <div style={{ fontWeight: "600", fontSize: "12px", color: "#fff" }}>{proj.name}</div>
                      {proj.technologies && <div style={{ fontSize: "10px", color: primary, marginTop: "2px" }}>{proj.technologies}</div>}
                      {proj.description && <p style={{ fontSize: "10px", marginTop: "4px", lineHeight: "1.6", color: "#C7D2FE" }}>{proj.description}</p>}
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
              </div>
            );
          })}
      </div>
    </div>
  );
}
