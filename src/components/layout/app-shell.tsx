import type { PropsWithChildren } from "react";

import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { ShellHeader } from "@/components/layout/shell-header";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-8rem] h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-16 left-6 h-36 w-36 rounded-full bg-danger/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-4 pb-28 pt-4">
        <div className="shell-frame flex min-h-[calc(100vh-2rem)] flex-col px-4 pb-6 pt-4">
          <ShellHeader />
          <main className="flex-1">{children}</main>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
