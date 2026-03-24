import { Panel } from "@/components/ui/panel";

interface RoutePlaceholderProps {
  title: string;
  description: string;
}

export function RoutePlaceholder({ title, description }: RoutePlaceholderProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-caption">בקרוב</p>
        <h1 className="mt-3 font-display text-3xl text-ink">{title}</h1>
      </div>

      <Panel className="relative overflow-hidden p-5">
        <div className="absolute inset-0 bg-hero-glow opacity-50" />
        <div className="relative space-y-3">
          <p className="text-lg font-semibold text-ink">הבסיס מוכן לחיבור מלא לטיימליין</p>
          <p className="text-sm leading-7 text-muted">{description}</p>
        </div>
      </Panel>
    </section>
  );
}
