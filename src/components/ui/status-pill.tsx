import type { CharacterStatus } from "@/data/schemas";
import { cn } from "@/lib/utils";

const statusStyles: Record<CharacterStatus, string> = {
  active: "border-[#6c9a78]/25 bg-[#6c9a78]/[0.12] text-[#d8eadb]",
  dead: "border-[#7b4d56]/30 bg-[#7b4d56]/[0.16] text-[#f0d5d9]",
  injured: "border-[#d3a24d]/30 bg-[#d3a24d]/[0.12] text-[#f2d39a]",
  incapacitated: "border-danger/30 bg-danger/[0.18] text-[#f7c4cb]",
  recovering: "border-[#d3a24d]/30 bg-[#d3a24d]/[0.12] text-[#f2d39a]",
  captive: "border-[#c18b4d]/30 bg-[#c18b4d]/[0.14] text-[#f3cfaa]",
  released: "border-[#6c9a78]/25 bg-[#6c9a78]/[0.12] text-[#d8eadb]",
  missing: "border-[#9f7b53]/30 bg-[#9f7b53]/[0.14] text-[#e7cfb1]",
  away: "border-white/10 bg-white/[0.06] text-muted",
  pregnant: "border-[#8a77b4]/25 bg-[#8a77b4]/[0.14] text-[#e2d7f4]",
  training: "border-[#7ba6c8]/30 bg-[#7ba6c8]/[0.14] text-[#c7deef]",
  appointed: "border-accent/25 bg-accent/[0.12] text-[#f1e1ba]",
  recruit: "border-[#7ba6c8]/30 bg-[#7ba6c8]/[0.14] text-[#c7deef]",
  sworn: "border-[#7ba6c8]/30 bg-[#7ba6c8]/[0.14] text-[#c7deef]",
  dismissed: "border-[#9f7b53]/30 bg-[#9f7b53]/[0.14] text-[#e7cfb1]",
  ruler: "border-accent/30 bg-accent/[0.16] text-[#f7e5bc]",
  disguised: "border-[#9f7b53]/30 bg-[#9f7b53]/[0.14] text-[#e7cfb1]",
  transformed: "border-accent/30 bg-accent/[0.18] text-[#f7e5bc]",
};

interface StatusPillProps {
  status: CharacterStatus;
  label: string;
  className?: string;
}

export function StatusPill({ status, label, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-medium backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        statusStyles[status],
        className,
      )}
    >
      {label}
    </span>
  );
}
