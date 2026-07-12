"use client";

import type { CVData, SectionId } from "@/lib/cv-types";
import { getCustomSection, getSectionTitle, isBuiltInSectionId } from "@/lib/section-utils";
import { DraggableSection, EditableText } from "@/components/templates/PreviewEditContext";

interface Props {
  cv: CVData;
  sectionId: SectionId;
  titleColor: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
}

export default function CompactSidebarSection({
  cv,
  sectionId,
  titleColor,
  textColor,
  mutedColor,
  accentColor,
}: Props) {
  const heading = (
    <div style={{ marginBottom: "10px", color: titleColor, fontSize: "9.5px", fontWeight: 800, letterSpacing: "1.7px", textTransform: "uppercase" }}>
      <EditableText fieldId={`sectionTitle:${sectionId}`} value={getSectionTitle(cv, sectionId)} singleLine />
    </div>
  );

  if (!isBuiltInSectionId(sectionId)) {
    const section = getCustomSection(cv, sectionId);
    if (!section?.items.length) return null;

    return (
      <DraggableSection sectionId={sectionId}>
        <section style={{ color: textColor }}>
          {heading}
          {section.items.map((item) => (
            <div key={item.id} style={{ marginBottom: "9px", paddingLeft: "8px", borderLeft: `2px solid ${accentColor}` }}>
              {item.title && <div style={{ fontSize: "10px", fontWeight: 700 }}>{item.title}</div>}
              {item.description && (
                <EditableText
                  fieldId={`custom:${sectionId}:item:${item.id}:field:description`}
                  value={item.description}
                  as="p"
                  multiline
                  style={{ margin: item.title ? "3px 0 0" : 0, color: mutedColor, fontSize: "9.5px", lineHeight: 1.45 }}
                />
              )}
            </div>
          ))}
        </section>
      </DraggableSection>
    );
  }

  return (
    <DraggableSection sectionId={sectionId}>
      <section style={{ color: textColor }}>
        {heading}

        {sectionId === "skills" && cv.sections.skills.map((item) => (
          <div key={item.id} style={{ marginBottom: "8px" }}>
            <EditableText fieldId={`section:skills:item:${item.id}:field:name`} value={item.name} as="div" singleLine style={{ fontSize: "10px", marginBottom: "3px" }} />
            <div style={{ height: "3px", backgroundColor: `${accentColor}45`, borderRadius: "2px" }}>
              <div style={{ width: `${(item.level / 5) * 100}%`, height: "3px", backgroundColor: accentColor, borderRadius: "2px" }} />
            </div>
          </div>
        ))}

        {sectionId === "languages" && cv.sections.languages.map((item) => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "6px", fontSize: "10px" }}>
            <EditableText fieldId={`section:languages:item:${item.id}:field:name`} value={item.name} singleLine />
            <EditableText fieldId={`section:languages:item:${item.id}:field:level`} value={item.level} singleLine style={{ color: mutedColor }} />
          </div>
        ))}

        {sectionId === "experience" && cv.sections.experience.map((item) => (
          <div key={item.id} style={{ marginBottom: "10px", paddingLeft: "8px", borderLeft: `2px solid ${accentColor}` }}>
            <EditableText fieldId={`section:experience:item:${item.id}:field:position`} value={item.position} as="div" singleLine style={{ fontSize: "10px", fontWeight: 700 }} />
            <div style={{ color: mutedColor, fontSize: "9px", lineHeight: 1.4 }}>{[item.company, item.startDate].filter(Boolean).join(" · ")}</div>
          </div>
        ))}

        {sectionId === "education" && cv.sections.education.map((item) => (
          <div key={item.id} style={{ marginBottom: "10px", paddingLeft: "8px", borderLeft: `2px solid ${accentColor}` }}>
            <div style={{ fontSize: "10px", fontWeight: 700 }}>{item.degree || item.school}</div>
            <div style={{ color: mutedColor, fontSize: "9px", lineHeight: 1.4 }}>{[item.school, item.endDate].filter(Boolean).join(" · ")}</div>
          </div>
        ))}

        {sectionId === "projects" && cv.sections.projects.map((item) => (
          <div key={item.id} style={{ marginBottom: "9px" }}>
            <EditableText fieldId={`section:projects:item:${item.id}:field:name`} value={item.name} as="div" singleLine style={{ fontSize: "10px", fontWeight: 700 }} />
            {item.technologies && <div style={{ color: mutedColor, fontSize: "9px" }}>{item.technologies}</div>}
          </div>
        ))}

        {sectionId === "certificates" && cv.sections.certificates.map((item) => (
          <div key={item.id} style={{ marginBottom: "7px", fontSize: "10px" }}>
            <strong>{item.name}</strong>
            {item.issuer && <div style={{ color: mutedColor, fontSize: "9px" }}>{item.issuer}</div>}
          </div>
        ))}

        {sectionId === "references" && cv.sections.references.map((item) => (
          <div key={item.id} style={{ marginBottom: "8px", fontSize: "10px" }}>
            <strong>{item.name}</strong>
            <div style={{ color: mutedColor, fontSize: "9px" }}>{[item.title, item.company].filter(Boolean).join(" · ")}</div>
          </div>
        ))}

        {sectionId === "interests" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {cv.sections.interests.map((item) => (
              <span key={item.id} style={{ border: `1px solid ${accentColor}`, padding: "3px 5px", fontSize: "9px" }}>{item.name}</span>
            ))}
          </div>
        )}
      </section>
    </DraggableSection>
  );
}
