"use client";

import React from "react";
import { CVData } from "@/lib/cv-types";
import ModernTemplate from "./ModernTemplate";
import ClassicTemplate from "./ClassicTemplate";
import CreativeTemplate from "./CreativeTemplate";
import MinimalTemplate from "./MinimalTemplate";
import ProfessionalTemplate from "./ProfessionalTemplate";

interface Props {
  cv: CVData;
  scale?: number;
}

export default function CVRenderer({ cv, scale = 1 }: Props) {
  switch (cv.templateId) {
    case "modern":
      return <ModernTemplate cv={cv} scale={scale} />;
    case "classic":
      return <ClassicTemplate cv={cv} scale={scale} />;
    case "creative":
      return <CreativeTemplate cv={cv} scale={scale} />;
    case "minimal":
      return <MinimalTemplate cv={cv} scale={scale} />;
    case "ats-pro":
    case "executive":
    case "corporate":
    case "consultant":
    case "editorial":
    case "tech-focus":
      return <ProfessionalTemplate cv={cv} scale={scale} />;
    default:
      return <ModernTemplate cv={cv} scale={scale} />;
  }
}
