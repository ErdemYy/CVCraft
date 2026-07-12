"use client";

import React from "react";
import { CVData } from "@/lib/cv-types";
import ModernTemplate from "./ModernTemplate";
import ClassicTemplate from "./ClassicTemplate";
import CreativeTemplate from "./CreativeTemplate";
import MinimalTemplate from "./MinimalTemplate";
import ProfessionalTemplate from "./ProfessionalTemplate";
import { PreviewEditProvider } from "./PreviewEditContext";
import type { SectionColumn } from "@/lib/cv-types";

interface Props {
  cv: CVData;
  scale?: number;
  editable?: boolean;
  activeFieldId?: string | null;
  onActiveFieldChange?: (fieldId: string | null) => void;
  onEditableFieldChange?: (fieldId: string, value: string, html?: string) => void;
  onRichTextChange?: (fieldId: string, html: string) => void;
  onSectionDrop?: (sourceId: string, targetId: string, position: "before" | "after") => void;
  onSectionColumnDrop?: (sourceId: string, column: SectionColumn) => void;
}

export default function CVRenderer({
  cv,
  scale = 1,
  editable = false,
  activeFieldId = null,
  onActiveFieldChange,
  onEditableFieldChange,
  onRichTextChange,
  onSectionDrop,
  onSectionColumnDrop,
}: Props) {
  let template: React.ReactNode;

  switch (cv.templateId) {
    case "modern":
      template = <ModernTemplate cv={cv} scale={scale} />;
      break;
    case "classic":
      template = <ClassicTemplate cv={cv} scale={scale} />;
      break;
    case "creative":
      template = <CreativeTemplate cv={cv} scale={scale} />;
      break;
    case "minimal":
      template = <MinimalTemplate cv={cv} scale={scale} />;
      break;
    case "ats-pro":
    case "executive":
    case "corporate":
    case "consultant":
    case "editorial":
    case "tech-focus":
      template = <ProfessionalTemplate cv={cv} scale={scale} />;
      break;
    default:
      template = <ModernTemplate cv={cv} scale={scale} />;
  }

  return (
    <PreviewEditProvider
      editable={editable}
      activeFieldId={activeFieldId}
      globalStyle={cv.theme.globalTextStyle}
      textStyles={cv.theme.textStyles}
      richText={cv.theme.richText}
      onActiveFieldChange={onActiveFieldChange}
      onFieldChange={onEditableFieldChange}
      onRichTextChange={onRichTextChange}
      onSectionDrop={onSectionDrop}
      onSectionColumnDrop={onSectionColumnDrop}
    >
      {template}
    </PreviewEditProvider>
  );
}
