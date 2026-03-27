"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookText, Castle, Home, Map, UsersRound } from "lucide-react";

import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/",          label: "בית",     icon: Home      },
  { href: "/characters",label: "דמויות",  icon: UsersRound},
  { href: "/map",       label: "מפה",     icon: Map       },
  { href: "/politics",  label: "פוליטיקה",icon: Castle    },
  { href: "/summary",   label: "תקציר",   icon: BookText  },
] as const;

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <nav
        className="bottom-nav-bar pointer-events-auto w-full max-w-[430px] p-1.5"
        aria-label="ניווט ראשי"
      >
        <ul className="grid grid-cols-5 gap-0.5">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "bottom-nav-item",
                    isActive && "is-active",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className="h-[18px] w-[18px]"
                    strokeWidth={isActive ? 2.1 : 1.7}
                    aria-hidden="true"
                  />
                  <span style={{ fontSize: "0.63rem" }}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
