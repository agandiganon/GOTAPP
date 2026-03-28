"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="w-full max-w-md px-6">
        {/* Error Panel */}
        <div className="panel-surface p-8 text-center">
          {/* Error Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D2A85A] to-[#8B6B47] flex items-center justify-center">
              <span className="text-2xl">⚔️</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-cinzel font-bold text-2xl mb-2 text-ink tracking-wide">
            משהו השתבש
          </h1>
          <p className="text-sm text-ink-soft mb-6 leading-relaxed">
            הממלכה חוותה הפרעה לא צפויה. אנא נסה שוב או חזור לעמוד הבית.
          </p>

          {/* Error Details (if available) */}
          {error.message && (
            <div className="mb-6 p-4 rounded-lg bg-[rgba(28,33,50,0.6)] border border-[rgba(210,168,90,0.1)]">
              <p className="text-xs font-mono text-muted break-words">
                {error.message}
              </p>
            </div>
          )}

          {/* Divider */}
          <hr className="got-divider my-6" />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 px-4 py-3 rounded-lg font-heebo font-medium text-sm transition-all duration-200
                bg-gradient-to-br from-[#D2A85A] to-[#B8945A]
                text-[#080A10]
                hover:from-[#E8C573] hover:to-[#D2A85A]
                active:scale-95
                shadow-lg hover:shadow-xl"
            >
              נסה שוב
            </button>
            <a
              href="/"
              className="flex-1 px-4 py-3 rounded-lg font-heebo font-medium text-sm transition-all duration-200
                border border-[rgba(210,168,90,0.35)]
                bg-[rgba(210,168,90,0.08)]
                text-accent
                hover:bg-[rgba(210,168,90,0.15)]
                active:scale-95"
            >
              בחזרה הביתה
            </a>
          </div>

          {/* Decorative gold accent line */}
          <div
            className="mt-6 h-0.5 w-12 mx-auto rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent, rgb(210,168,90), transparent)",
            }}
          />
        </div>

        {/* Ambient background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(210,168,90,0.04) 0%, transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}
