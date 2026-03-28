"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const routes = ["/", "/characters", "/map", "/politics", "/summary"];

export function useSwipeNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    function handleTouchStart(e: TouchEvent) {
      const touch = e.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    }

    function handleTouchEnd(e: TouchEvent) {
      if (!touchStart.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      touchStart.current = null;

      // Only trigger for horizontal swipes (dx > 80px, angle < 30deg)
      if (Math.abs(dx) < 80 || Math.abs(dy) > Math.abs(dx) * 0.6) return;

      const currentIndex = routes.indexOf(pathname);
      if (currentIndex === -1) return;

      // RTL: swipe left = next, swipe right = prev (reversed for RTL)
      if (dx < 0 && currentIndex < routes.length - 1) {
        router.push(routes[currentIndex + 1]);
      } else if (dx > 0 && currentIndex > 0) {
        router.push(routes[currentIndex - 1]);
      }
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pathname, router]);
}
