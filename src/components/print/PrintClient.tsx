"use client";

import { useEffect, useState } from "react";
import CVRenderer from "@/components/templates/CVRenderer";
import type { CVData } from "@/lib/cv-types";

interface PrintPayload {
  version: 1;
  cv: CVData;
}

function parsePrintPayload(value: string): CVData | null {
  if (!value) return null;

  try {
    const payload = JSON.parse(value) as PrintPayload;
    if (payload?.version !== 1 || !payload.cv?.personalInfo || !payload.cv?.sections) {
      return null;
    }
    return payload.cv;
  } catch {
    return null;
  }
}

export default function PrintClient() {
  const [cv, setCV] = useState<CVData | null>(null);
  const [invalidPayload, setInvalidPayload] = useState(false);

  useEffect(() => {
    const parsed = parsePrintPayload(window.name);
    window.name = "";
    let active = true;

    queueMicrotask(() => {
      if (!active) return;
      if (parsed) {
        setCV(parsed);
      } else {
        setInvalidPayload(true);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (!cv) {
    return (
      <main
        data-print-ready={invalidPayload ? "error" : "false"}
        style={{ padding: 24, fontFamily: "Inter, sans-serif" }}
      >
        {invalidPayload ? "CV verisi okunamadı." : "PDF hazırlanıyor..."}
      </main>
    );
  }

  return (
    <main data-print-ready="true" style={{ margin: 0, padding: 0 }}>
      <CVRenderer cv={cv} />
    </main>
  );
}
