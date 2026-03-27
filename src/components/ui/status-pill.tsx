import type { CharacterStatus } from "@/data/schemas";
import { cn } from "@/lib/utils";

/* ─── Status colours — all tuned to the "THE REALM" v3 slate-navy palette ── */
const statusStyles: Record<CharacterStatus, string> = {
  /* alive & well — soft slate-blue, not jarring teal */
  active:        "border-[#7a9ec4]/28 bg-[#5a7ea8]/[0.13] text-[#c2d8ef]",
  /* dead — warm rose-crimson */
  dead:          "border-[#8a3844]/35 bg-[#6e2832]/[0.18] text-[#f2c8cf]",
  /* injured / recovering — burnished gold */
  injured:       "border-[#c8a058]/30 bg-[#a07838]/[0.14] text-[#f0d49a]",
  recovering:    "border-[#c8a058]/30 bg-[#a07838]/[0.14] text-[#f0d49a]",
  /* incapacitated — deep danger red */
  incapacitated: "border-danger/30 bg-danger/[0.18] text-[#f7c4cb]",
  /* captive — amber-brown */
  captive:       "border-[#b87c3a]/30 bg-[#8c5c28]/[0.16] text-[#f0c89a]",
  /* released — lighter slate */
  released:      "border-[#7a9ec4]/25 bg-[#5a7ea8]/[0.10] text-[#b8d0e8]",
  /* missing / disguised / dismissed — muted warm grey */
  missing:       "border-[#9080608]/30 bg-[#70605a]/[0.14] text-[#ddd0c0]",
  disguised:     "border-[#806050]/30 bg-[#60504a]/[0.14] text-[#ddd0c0]",
  dismissed:     "border-[#806050]/28 bg-[#60504a]/[0.12] text-[#d0c0b0]",
  /* away — very subtle */
  away:          "border-white/10 bg-white/[0.05] text-muted",
  /* appointments / roles — gold accent */
  appointed:     "border-accent/25 bg-accent/[0.12] text-[#f0e0b8]",
  ruler:         "border-accent/30 bg-accent/[0.16] text-[#f5e5bc]",
  transformed:   "border-accent/30 bg-accent/[0.18] text-[#f5e5bc]",
  /* military/sworn roles — ice blue */
  training:      "border-[#7090b8]/30 bg-[#506888]/[0.14] text-[#c0d8f0]",
  recruit:       "border-[#7090b8]/28 bg-[#506888]/[0.12] text-[#bcd4ec]",
  sworn:         "border-[#7090b8]/28 bg-[#506888]/[0.12] text-[#bcd4ec]",
  /* pregnancy — subtle lavender */
  pregnant:      "border-[#9080b0]/28 bg-[#706090]/[0.14] text-[#e0d4f2]",
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
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-medium backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        statusStyles[status],
        className,
      )}
    >
      {label}
    </span>
  );
}
