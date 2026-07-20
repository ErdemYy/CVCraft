"use client";

import type { CSSProperties } from "react";
import type { CVData, CVLayoutBlockId, SectionColumn } from "@/lib/cv-types";
import { getContactItems, getPersonalDetailItems } from "@/lib/personal-info";
import CVPhoto from "@/components/templates/CVPhoto";
import { DraggableLayoutBlock, EditableText } from "@/components/templates/PreviewEditContext";

interface Props {
  cv: CVData;
  blockId: CVLayoutBlockId;
  column: SectionColumn;
  accentColor: string;
  textColor: string;
  mutedColor: string;
  titleColor?: string;
  headingFont?: string;
  photoBorder?: string;
  align?: CSSProperties["textAlign"];
  summaryTitle?: string;
}

function BlockTitle({
  children,
  color,
}: {
  children: string;
  color: string;
}) {
  return (
    <div
      style={{
        marginBottom: "9px",
        color,
        fontSize: "9px",
        fontWeight: 800,
        letterSpacing: "1.7px",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

export default function PersonalLayoutBlock({
  cv,
  blockId,
  column,
  accentColor,
  textColor,
  mutedColor,
  titleColor = accentColor,
  headingFont,
  photoBorder = `3px solid ${accentColor}55`,
  align = column === "sidebar" ? "center" : "left",
  summaryTitle = "Profil",
}: Props) {
  const p = cv.personalInfo;
  const compact = column === "sidebar";
  const contactItems = getContactItems(p);
  const personalDetailItems = getPersonalDetailItems(p);
  const spacingStyle: CSSProperties = {
    marginBottom: compact ? "22px" : "20px",
  };

  if (blockId === "photo") {
    if (!p.photo) return null;
    const size = compact ? 96 : 112;
    const fallbackRadius = cv.theme.photoShape === "square"
      ? "0"
      : cv.theme.photoShape === "rounded"
        ? "14px"
        : "50%";

    return (
      <DraggableLayoutBlock blockId={blockId}>
        <div
          style={{
            ...spacingStyle,
            display: "flex",
            justifyContent: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start",
          }}
        >
          <CVPhoto
            personalInfo={p}
            width={size}
            height={size}
            fallbackRadius={fallbackRadius}
            border={photoBorder}
          />
        </div>
      </DraggableLayoutBlock>
    );
  }

  if (blockId === "identity") {
    return (
      <DraggableLayoutBlock blockId={blockId}>
        <div style={{ ...spacingStyle, textAlign: align }}>
          <EditableText
            fieldId="personal.fullName"
            value={[p.firstName, p.lastName].filter(Boolean).join(" ")}
            as="div"
            singleLine
            placeholder="Ad Soyad"
            style={{
              color: textColor,
              fontFamily: headingFont,
              fontSize: compact ? "21px" : "30px",
              fontWeight: 800,
              lineHeight: 1.08,
            }}
          />
          {(p.title || !p.firstName) && (
            <EditableText
              fieldId="personal.title"
              value={p.title}
              as="div"
              singleLine
              placeholder={!p.firstName ? "Profesyonel Ünvan" : ""}
              style={{
                marginTop: "7px",
                color: titleColor,
                fontSize: compact ? "11px" : "13px",
                fontWeight: 700,
                lineHeight: 1.35,
              }}
            />
          )}
        </div>
      </DraggableLayoutBlock>
    );
  }

  if (blockId === "contact") {
    if (contactItems.length === 0) return null;

    return (
      <DraggableLayoutBlock blockId={blockId}>
        <div style={spacingStyle}>
          <BlockTitle color={titleColor}>İletişim</BlockTitle>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: compact ? "1fr" : "repeat(2, minmax(0, 1fr))",
              gap: compact ? "7px" : "8px 18px",
            }}
          >
            {contactItems.map((item) => (
              <div key={item.label} style={{ minWidth: 0 }}>
                <div style={{ color: mutedColor, fontSize: "8.5px", fontWeight: 700, marginBottom: "1px" }}>
                  {item.label}
                </div>
                <EditableText
                  fieldId={`personal.${item.field}`}
                  value={item.value}
                  as="div"
                  singleLine
                  style={{ color: textColor, fontSize: compact ? "9.5px" : "10.5px", overflowWrap: "anywhere" }}
                />
              </div>
            ))}
          </div>
        </div>
      </DraggableLayoutBlock>
    );
  }

  if (blockId === "personalDetails") {
    if (personalDetailItems.length === 0) return null;

    return (
      <DraggableLayoutBlock blockId={blockId}>
        <div style={spacingStyle}>
          <BlockTitle color={titleColor}>Kişisel Bilgiler</BlockTitle>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: compact ? "1fr" : "repeat(2, minmax(0, 1fr))",
              gap: compact ? "6px" : "7px 18px",
            }}
          >
            {personalDetailItems.map((item) => (
              <div key={item.label} style={{ minWidth: 0, color: textColor, fontSize: compact ? "9.5px" : "10.5px" }}>
                <span style={{ color: mutedColor }}>{item.label}: </span>
                <EditableText fieldId={`personal.${item.field}`} value={item.value} singleLine />
              </div>
            ))}
          </div>
        </div>
      </DraggableLayoutBlock>
    );
  }

  if (!p.summary?.trim()) return null;

  return (
    <DraggableLayoutBlock blockId={blockId}>
      <div style={spacingStyle}>
        <BlockTitle color={titleColor}>{summaryTitle}</BlockTitle>
        <EditableText
          fieldId="personal.summary"
          value={p.summary}
          as="p"
          multiline
          style={{
            margin: 0,
            color: compact ? textColor : mutedColor,
            fontSize: compact ? "9.8px" : "11px",
            lineHeight: compact ? 1.58 : 1.68,
          }}
        />
      </div>
    </DraggableLayoutBlock>
  );
}
