import Link from "next/link";
import { cn } from "@/lib/cn";

interface BrandLogoProps {
  href?: string;
  compact?: boolean;
  inverted?: boolean;
  className?: string;
}

function LogoMark({ inverted }: { inverted?: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-9 w-9 shrink-0 items-center justify-center [perspective:120px]",
        inverted && "text-white",
      )}
      aria-hidden="true"
    >
      <span className="absolute h-7 w-6 translate-x-1 translate-y-1 rotate-[8deg] rounded-[4px] bg-[#D8C7A8] shadow-sm" />
      <span className="absolute h-7 w-6 -translate-x-0.5 translate-y-0.5 rotate-[3deg] rounded-[4px] bg-[#F4EFE5] shadow-sm" />
      <span
        className="relative flex h-8 w-7 -rotate-[7deg] items-center justify-center rounded-[5px] bg-[#B08D57] text-[11px] font-black text-white shadow-[0_8px_18px_rgba(43,42,40,0.18)] ring-1 ring-white/40"
        style={{ transformStyle: "preserve-3d" }}
      >
        CV
      </span>
    </span>
  );
}

export default function BrandLogo({ href = "/", compact = false, inverted = false, className }: BrandLogoProps) {
  const content = (
    <>
      <LogoMark inverted={inverted} />
      {!compact && (
        <span
          className={cn(
            "text-xl font-semibold tracking-[0.01em]",
            inverted ? "text-white" : "text-[#2B2A28]",
          )}
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          CVCraft
        </span>
      )}
    </>
  );

  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)}>
      {content}
    </Link>
  );
}
