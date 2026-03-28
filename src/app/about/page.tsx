"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEpisode } from "@/providers/episode-provider";

export default function AboutPage() {
  const { currentEpisode } = useEpisode();

  return (
    <main className="space-y-8 px-4 py-8 md:px-6">
      {/* Hero section */}
      <div className="max-w-2xl space-y-3">
        <h1
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "2.2rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: "rgba(225,190,110,0.96)",
            textShadow: "0 2px 16px rgba(200,158,82,0.20)",
          }}
        >
          gotspoil
        </h1>
        <p
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.75rem",
            fontWeight: 400,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgba(210,168,90,0.55)",
          }}
        >
          גרסה 0.1.0
        </p>
      </div>

      {/* Main content */}
      <div className="max-w-2xl space-y-6">
        {/* Description */}
        <section className="space-y-3">
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            אודות האפליקציה
          </h2>
          <p className="leading-8 text-ink/80">
            gotspoil היא אפליקציית לוות צפייה נטולת ספוילרים לסדרת משחקי הכס (Game of Thrones). האפליקציה מדריכה אותך דרך הדמויות, הדינמיקה הפוליטית, וההתרחשויות המרכזיות בכל פרק, תוך הסתרת כל מידע שעדיין לא חשפת בנקודת הצפייה שלך.
          </p>
        </section>

        {/* Features */}
        <section className="space-y-3">
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            יכולויות עיקריות
          </h2>
          <ul className="space-y-2 text-ink/80">
            <li className="flex items-start gap-3">
              <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full" style={{ background: "rgba(210,168,90,0.80)" }} />
              <span>תיקייה דמויות מוגנת מספוילרים עם כל הפרטים עד הנקודה הנוכחית של הצפייה שלך</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full" style={{ background: "rgba(210,168,90,0.80)" }} />
              <span>מפה אינטראקטיבית המחשפת מיקומים בהדרגה כפי שהם מתגלים בסדרה</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full" style={{ background: "rgba(210,168,90,0.80)" }} />
              <span>ניתוח פוליטי ודינמיקת כוחות בין הבתים</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full" style={{ background: "rgba(210,168,90,0.80)" }} />
              <span>סיכום אישי של כל פרק עם עדכוני דמויות וזוויות עלילה</span>
            </li>
          </ul>
        </section>

        {/* Design */}
        <section className="space-y-3">
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            עיצוב וטכנולוגיה
          </h2>
          <p className="leading-8 text-ink/80">
            gotspoil בנויה עם Next.js 14 App Router, React, Tailwind CSS וTypeScript. ממשק המשתמש משקף את הטון הקינמטי של משחקי הכס עם פלטה צבעים עמוקה של סלייט וכחול-טיטניום עם דגש על בנחושת וזהב שרוף.
          </p>
        </section>

        {/* Credits */}
        <section className="space-y-3">
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            קרדיטים וכיבוד
          </h2>
          <p className="leading-8 text-ink/80">
            gotspoil אינה פרסומית או מנוהלת על ידי HBO, Warner Bros., או בעלי זכויות היוצרים של משחקי הכס. זה פרויקט מעריצים שנוצר כדי להעשיר את חוויית הצפייה עם עדכונים על דמויות, דינמיקה פוליטית וקווי עלילה.
          </p>
        </section>

        {/* Footer links */}
        <div className="mt-12 pt-8" style={{ borderTop: "1px solid rgba(210,168,90,0.18)" }}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 transition-colors"
            style={{
              background: "rgba(210,168,90,0.08)",
              border: "1px solid rgba(210,168,90,0.22)",
              color: "rgba(225,190,110,0.88)",
            }}
          >
            <span>חזור לעמוד הבית</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Current episode info */}
        <div
          className="rounded-lg p-4"
          style={{
            background: "rgba(210,168,90,0.05)",
            border: "1px solid rgba(210,168,90,0.18)",
          }}
        >
          <p className="text-xs text-muted mb-1">פרק נוכחי:</p>
          <p className="text-sm font-semibold text-accent">
            {currentEpisode.code} · {currentEpisode.title}
          </p>
        </div>
      </div>
    </main>
  );
}
