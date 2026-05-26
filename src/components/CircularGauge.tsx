import { cn } from "@/lib/utils";

type Props = {
  value: number;          // 0-100
  size?: number;          // px
  stroke?: number;
  label?: string;
  sublabel?: string;
  tone?: "primary" | "success" | "warning" | "score";
  className?: string;
  /** Show tick marks around the arc (Credit Karma gas-hand style) */
  ticks?: boolean;
};

export function CircularGauge({
  value, size = 200, stroke = 8, label, sublabel, tone = "primary", className, ticks = true,
}: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  const colorVar =
    tone === "success" ? "var(--color-success)" :
    tone === "warning" ? "var(--color-warning)" :
    tone === "score"
      ? (clamped >= 70 ? "oklch(0.70 0.16 155)"   // vibrant emerald
        : clamped >= 45 ? "oklch(0.66 0.14 158)"  // brightening green
        : "oklch(0.62 0.10 200)")                 // teal/blue
      : "var(--color-primary)";

  // Score tone gets a gold accent on the leading edge for 700+ scores
  const endStop =
    tone === "score" && clamped >= 70
      ? "oklch(0.82 0.14 88)"                     // soft gold
      : tone === "score"
        ? "oklch(0.72 0.12 162)"                  // emerald glow
        : "var(--color-primary-glow)";

  const id = `g-${tone}`;

  // Tick marks — 40 around the full circle, brighten the ones within `clamped`
  const tickCount = 40;
  const tickInner = r - stroke / 2 - 4;
  const tickOuter = r - stroke / 2 - 1;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}
         style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colorVar} stopOpacity="1" />
            <stop offset="100%" stopColor={endStop} stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Tick marks */}
        {ticks && Array.from({ length: tickCount }).map((_, i) => {
          const angle = (i / tickCount) * Math.PI * 2;
          const x1 = cx + Math.cos(angle) * tickInner;
          const y1 = cy + Math.sin(angle) * tickInner;
          const x2 = cx + Math.cos(angle) * tickOuter;
          const y2 = cy + Math.sin(angle) * tickOuter;
          const active = (i / tickCount) * 100 <= clamped;
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={active ? colorVar : "var(--color-border)"}
              strokeOpacity={active ? 0.55 : 0.4}
              strokeWidth={1.25}
              strokeLinecap="round"
            />
          );
        })}

        {/* Track */}
        <circle cx={cx} cy={cy} r={r}
                stroke="var(--color-border)" strokeOpacity="0.6"
                strokeWidth={stroke} fill="none" />
        {/* Progress arc — restrained, no neon glow */}
        <circle
          cx={cx} cy={cy} r={r}
          stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round" fill="none"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label && (
          <div className="text-[44px] font-bold leading-none tracking-[-0.03em] tabular-nums">
            {label}
          </div>
        )}
        {sublabel && (
          <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}
