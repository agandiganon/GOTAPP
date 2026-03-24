"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookText, Castle, Home, Map, UsersRound } from "lucide-react";

import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "בית", icon: Home },
  { href: "/characters", label: "דמויות", icon: UsersRound },
  { href: "/map", label: "מפה", icon: Map },
  { href: "/politics", label: "פוליטיקה", icon: Castle },
  { href: "/summary", label: "תקציר", icon: BookText },
] as const;

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <nav className="pointer-events-auto w-full max-w-[430px] rounded-[30px] border border-line/10 bg-canvas-soft/88 p-2 shadow-shell backdrop-blur-2xl">
        <ul className="grid grid-cols-5 gap-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-[66px] flex-col items-center justify-center gap-1 rounded-[22px] text-[0.7rem] font-medium transition duration-200",
                    isActive
                      ? "bg-accent/[0.14] text-accent shadow-accent"
                      : "text-muted hover:bg-white/[0.05] hover:text-ink",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
