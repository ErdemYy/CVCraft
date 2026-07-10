"use client";

/* eslint-disable @next/next/no-img-element */

import type { CSSProperties } from "react";
import type { PersonalInfo, PhotoShape } from "@/lib/cv-types";

function getShapeRadius(shape: PhotoShape, fallback: string, borderRadius: number) {
  if (shape === "circle") return "50%";
  if (shape === "square" || shape === "portrait" || shape === "landscape") return "0";
  if (shape === "rounded") return `${borderRadius || 14}px`;
  return fallback;
}

export default function CVPhoto({
  personalInfo,
  width,
  height,
  fallbackRadius,
  border = "0",
  className,
  style,
}: {
  personalInfo: PersonalInfo;
  width: number;
  height: number;
  fallbackRadius: string;
  border?: string;
  className?: string;
  style?: CSSProperties;
}) {
  if (!personalInfo.photo) return null;

  const settings = personalInfo.photoSettings;
  const shape = settings?.shape ?? "circle";
  const frameWidth = shape === "portrait" ? Math.round(width * 0.82) : shape === "landscape" ? Math.round(width * 1.2) : width;
  const frameHeight = shape === "portrait" ? Math.round(height * 1.18) : shape === "landscape" ? Math.round(height * 0.82) : height;
  const radius = getShapeRadius(shape, fallbackRadius, settings?.borderRadius ?? 14);

  return (
    <div
      className={className}
      style={{
        width: `${frameWidth}px`,
        height: `${frameHeight}px`,
        borderRadius: radius,
        border: settings?.borderWidth
          ? `${settings.borderWidth}px solid rgba(176,141,87,0.9)`
          : border,
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <img
        src={personalInfo.photo}
        alt="Profil"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: [
            `translate(${settings?.offsetX ?? 0}px, ${settings?.offsetY ?? 0}px)`,
            `scale(${settings?.scale ?? 1})`,
            `rotate(${settings?.rotation ?? 0}deg)`,
            `scaleX(${settings?.flipHorizontal ? -1 : 1})`,
            `scaleY(${settings?.flipVertical ? -1 : 1})`,
          ].join(" "),
          filter: [
            `brightness(${settings?.brightness ?? 100}%)`,
            `contrast(${settings?.contrast ?? 100}%)`,
            `saturate(${settings?.saturation ?? 100}%)`,
            settings?.grayscale ? "grayscale(100%)" : "",
          ].filter(Boolean).join(" "),
        }}
      />
    </div>
  );
}
