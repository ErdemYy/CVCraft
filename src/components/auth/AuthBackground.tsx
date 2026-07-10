"use client";

import dynamic from "next/dynamic";

const FloatingCV = dynamic(() => import("@/components/landing/FloatingCV"), { ssr: false });

export default function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute right-[-80px] top-24 h-[420px] w-[340px] opacity-25 sm:right-[6%] sm:top-28 sm:h-[520px] sm:w-[420px] lg:right-[12%] lg:h-[620px] lg:w-[500px]">
        <FloatingCV />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#E8E4DC]" />
    </div>
  );
}
