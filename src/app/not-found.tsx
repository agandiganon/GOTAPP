import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="w-full max-w-md px-6">
        {/* Not Found Panel */}
        <div className="panel-surface p-8 text-center">
          {/* 404 Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="text-6xl font-cinzel font-bold text-accent">
                404
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-[#D2A85A] to-[#8B6B47] flex items-center justify-center text-sm">
                👑
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-cinzel font-bold text-2xl mb-2 text-ink tracking-wide">
            הדף לא נמצא
          </h1>
          <p className="text-sm text-ink-soft mb-6 leading-relaxed">
            זה דוגל בעיר לא קיים בממלכה. העמוד אולי הוזז או נמחק.
          </p>

          {/* Decorative text */}
          <div className="mb-6 p-4 rounded-lg bg-[rgba(28,33,50,0.6)] border border-[rgba(210,168,90,0.1)]">
            <p className="text-xs text-muted italic">
              &quot;כל דרך מובילה חזרה לביתה&quot;
            </p>
          </div>

          {/* Divider */}
          <hr className="got-divider my-6" />

          {/* Navigation Links */}
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 px-4 py-3 rounded-lg font-heebo font-medium text-sm transition-all duration-200
                bg-gradient-to-br from-[#D2A85A] to-[#B8945A]
                text-[#080A10]
                hover:from-[#E8C573] hover:to-[#D2A85A]
                active:scale-95
                shadow-lg hover:shadow-xl"
            >
              בחזרה הביתה
            </Link>
            <Link
              href="/characters"
              className="flex-1 px-4 py-3 rounded-lg font-heebo font-medium text-sm transition-all duration-200
                border border-[rgba(210,168,90,0.35)]
                bg-[rgba(210,168,90,0.08)]
                text-accent
                hover:bg-[rgba(210,168,90,0.15)]
                active:scale-95"
            >
              דמויות
            </Link>
          </div>

          {/* Secondary action */}
          <Link
            href="/politics"
            className="mt-4 block px-4 py-2 rounded-lg font-heebo font-medium text-sm transition-all duration-200
              text-accent-muted hover:text-accent
              border-b border-[rgba(210,168,90,0.1)] hover:border-[rgba(210,168,90,0.3)]"
          >
            עולם פוליטי
          </Link>

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
