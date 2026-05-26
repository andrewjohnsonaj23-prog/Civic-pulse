import { useMemo, useRef, useState } from "react";
import {
  X, Search, Layers, MapPin, Info, Users, Flame, Activity,
  ChevronRight, Compass, TrendingUp, Vote, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type LayerKey = "reps" | "districts" | "legislation" | "alignment";

const LAYERS: { key: LayerKey; label: string; icon: typeof Layers; tint: string; desc: string }[] = [
  { key: "reps",        label: "Rep overlays",      icon: Users,    tint: "var(--color-primary)",     desc: "Pins for House, Senate & Governor offices." },
  { key: "districts",   label: "District lines",    icon: Compass,  tint: "var(--color-primary-glow)",desc: "Federal & state district boundaries." },
  { key: "legislation", label: "Legislation heat",  icon: Flame,    tint: "var(--color-destructive)", desc: "Bills drafted, pushed & passed via CivicPulse." },
  { key: "alignment",   label: "District alignment",icon: Activity, tint: "var(--color-success)",     desc: "How closely each region's reps match its pulse." },
];

// Hot pins (simulated) — coordinates in viewBox (0..1000 x, 0..620 y) over a stylized US silhouette
const PINS = [
  { id: "sf",  x: 110, y: 290, label: "San Francisco · CA-11", pulse: 82, bills: 14, tone: "success" as const },
  { id: "la",  x: 165, y: 380, label: "Los Angeles · CA-30",   pulse: 71, bills: 22, tone: "success" as const },
  { id: "den", x: 380, y: 305, label: "Denver · CO-1",         pulse: 64, bills: 9,  tone: "warning" as const },
  { id: "aus", x: 510, y: 470, label: "Austin · TX-35",        pulse: 58, bills: 18, tone: "warning" as const },
  { id: "chi", x: 645, y: 270, label: "Chicago · IL-7",        pulse: 76, bills: 11, tone: "success" as const },
  { id: "atl", x: 745, y: 430, label: "Atlanta · GA-5",        pulse: 49, bills: 16, tone: "destructive" as const },
  { id: "mia", x: 830, y: 535, label: "Miami · FL-27",         pulse: 41, bills: 24, tone: "destructive" as const },
  { id: "nyc", x: 870, y: 235, label: "New York · NY-12",      pulse: 88, bills: 31, tone: "success" as const },
  { id: "dc",  x: 845, y: 295, label: "Washington · DC",       pulse: 70, bills: 27, tone: "success" as const },
  { id: "sea", x: 195, y: 130, label: "Seattle · WA-7",        pulse: 81, bills: 8,  tone: "success" as const },
  { id: "phx", x: 295, y: 420, label: "Phoenix · AZ-3",        pulse: 52, bills: 12, tone: "warning" as const },
  { id: "bos", x: 905, y: 195, label: "Boston · MA-7",         pulse: 79, bills: 13, tone: "success" as const },
];

// Stylized US silhouette (intentionally abstract — not a precise topology)
const US_PATH =
  "M70 230 L140 150 L220 110 L300 130 L370 110 L460 135 L520 100 L600 105 L680 120 L770 140 L860 175 L920 215 L955 270 L935 320 L880 335 L835 320 L820 365 L860 410 L850 470 L815 510 L780 555 L720 580 L660 555 L600 520 L540 530 L470 510 L410 485 L355 460 L305 430 L260 395 L215 365 L165 340 L115 305 L80 270 Z";

const RELOCATION_PRESETS: { q: string; label: string; reps: string[]; pulse: number; topIssues: string[]; velocity: number }[] = [
  { q: "Austin, TX",      label: "Austin, TX · 78701",  reps: ["Rep. M. Lopez", "Sen. J. Cornyn", "Sen. T. Cruz"], pulse: 64, topIssues: ["Housing", "Power grid", "Public transit"], velocity: 18 },
  { q: "Denver, CO",      label: "Denver, CO · 80202",  reps: ["Rep. D. DeGette", "Sen. M. Bennet", "Sen. J. Hickenlooper"], pulse: 71, topIssues: ["Wildfire prep", "Water rights", "Childcare"], velocity: 12 },
  { q: "Brooklyn, NY",    label: "Brooklyn, NY · 11201",reps: ["Rep. D. Goldman", "Sen. K. Gillibrand", "Sen. C. Schumer"], pulse: 88, topIssues: ["Rent control", "Subway funding", "Climate"], velocity: 31 },
  { q: "Atlanta, GA",     label: "Atlanta, GA · 30301", reps: ["Rep. N. Williams", "Sen. R. Warnock", "Sen. J. Ossoff"],   pulse: 49, topIssues: ["Voting rights", "Insulin cap", "Transit"], velocity: 16 },
];

export function USMapExplorer({ onClose }: { onClose: () => void }) {
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    reps: true, districts: true, legislation: true, alignment: false,
  });
  const [hint, setHint] = useState(true);
  const [active, setActive] = useState<typeof PINS[number] | null>(null);
  // Default to focused District view — user opts into National to avoid overload.
  const [view, setView] = useState<"district" | "national">("district");
  const DISTRICT_ZOOM = 2.4;
  const DISTRICT_PAN = { x: -560, y: -90 }; // centers roughly on NY-12 (mock District 7)
  const [zoom, setZoom] = useState(DISTRICT_ZOOM);
  const [pan, setPan] = useState(DISTRICT_PAN);
  const [search, setSearch] = useState("");
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const switchView = (v: "district" | "national") => {
    setView(v);
    if (v === "district") { setZoom(DISTRICT_ZOOM); setPan(DISTRICT_PAN); }
    else { setZoom(1); setPan({ x: 0, y: 0 }); }
    if ("vibrate" in navigator) navigator.vibrate?.(6);
  };


  const reloc = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return (
      RELOCATION_PRESETS.find(p => p.q.toLowerCase().includes(q) || p.label.toLowerCase().includes(q)) ??
      { q, label: `${search} · sample district`, reps: ["Local Rep", "Senator A", "Senator B"], pulse: 60, topIssues: ["Housing", "Healthcare", "Schools"], velocity: 8 }
    );
  }, [search]);

  const toggle = (k: LayerKey) => setLayers(prev => ({ ...prev, [k]: !prev[k] }));

  return (
    <div className="fixed inset-0 z-[60] mx-auto flex max-w-md flex-col bg-background fade-up">
      {/* Header */}
      <div className="safe-top relative z-10 flex items-center justify-between border-b border-border/60 bg-background/95 px-4 pb-3 pt-3 backdrop-blur-xl">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface ring-1 ring-border/60 active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">United States</div>
          <div className="text-[13.5px] font-bold tracking-tight">Civic Map Explorer</div>
        </div>
        <button
          onClick={() => setHint(h => !h)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface ring-1 ring-border/60 active:scale-95"
        >
          <Info className="h-4 w-4 text-primary" />
        </button>
      </div>

      {/* Search */}
      <div className="relative z-10 px-4 pt-3">
        <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-surface/80 px-3 py-2.5 ring-1 ring-border/40 focus-within:ring-2 focus-within:ring-primary/60">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search any city or ZIP — Relocation Explorer"
            className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/70 outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* View toggle */}
      <div className="mx-4 mt-3 flex items-center gap-1 rounded-2xl border border-border/70 bg-surface/60 p-1 ring-1 ring-border/40">
        <button
          onClick={() => switchView("district")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-bold tracking-tight transition-all active:scale-[0.98]",
            view === "district"
              ? "bg-gradient-primary text-primary-foreground shadow-[0_0_18px_-6px_var(--color-primary)]"
              : "text-muted-foreground",
          )}
        >
          <MapPin className="h-3.5 w-3.5" /> Focused · District 7
        </button>
        <button
          onClick={() => switchView("national")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-bold tracking-tight transition-all active:scale-[0.98]",
            view === "national"
              ? "bg-gradient-primary text-primary-foreground shadow-[0_0_18px_-6px_var(--color-primary)]"
              : "text-muted-foreground",
          )}
        >
          <Compass className="h-3.5 w-3.5" /> Explore National Map
        </button>
      </div>

      {/* Educational hint */}
      {hint && (
        <div className="mx-4 mt-2 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/[0.07] px-3 py-2 text-[11px] leading-snug text-foreground/90">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span>
            {view === "district"
              ? "Showing your district by default. Tap pins for pulse · switch to National to explore the full map."
              : "Pinch / scroll to zoom · drag to pan · tap a pin to inspect any district. Toggle layers below."}
          </span>
        </div>
      )}


      {/* Map */}
      <div
        className="relative mx-4 mt-3 flex-1 overflow-hidden rounded-3xl border border-border/70 bg-gradient-card shadow-card"
        onPointerDown={(e) => { dragRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }; }}
        onPointerMove={(e) => {
          if (!dragRef.current) return;
          setPan({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y });
        }}
        onPointerUp={() => { dragRef.current = null; }}
        onPointerLeave={() => { dragRef.current = null; }}
        onWheel={(e) => {
          const dz = e.deltaY < 0 ? 0.1 : -0.1;
          setZoom(z => Math.max(0.8, Math.min(3, +(z + dz).toFixed(2))));
        }}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--color-primary)/14%,transparent_60%),radial-gradient(circle_at_75%_80%,var(--color-destructive)/10%,transparent_55%)]" />

        <svg
          viewBox="0 0 1000 620"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full touch-none select-none"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center", transition: dragRef.current ? "none" : "transform 220ms cubic-bezier(.2,.8,.2,1)" }}
        >
          <defs>
            <linearGradient id="us-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--color-primary-glow)" stopOpacity="0.10" />
            </linearGradient>
            <radialGradient id="heat" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-destructive)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--color-destructive)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="align" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0" />
            </radialGradient>
            <filter id="pin-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Grid */}
          <g opacity="0.12">
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="620" stroke="var(--color-border)" strokeWidth="1" />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 90} x2="1000" y2={i * 90} stroke="var(--color-border)" strokeWidth="1" />
            ))}
          </g>

          {/* US silhouette */}
          <path d={US_PATH} fill="url(#us-fill)" stroke="var(--color-primary)" strokeOpacity="0.55" strokeWidth="1.5" />

          {/* Districts layer — interior lines */}
          {layers.districts && (
            <g stroke="var(--color-primary-glow)" strokeOpacity="0.35" strokeDasharray="3 4" strokeWidth="1" fill="none">
              <path d="M250 180 L300 380 M450 130 L470 510 M650 130 L660 540 M820 180 L820 540 M150 250 L900 280 M100 380 L880 410" />
            </g>
          )}

          {/* Legislation heat blobs */}
          {layers.legislation && PINS.map(p => (
            <circle key={`heat-${p.id}`} cx={p.x} cy={p.y} r={28 + p.bills * 1.6} fill="url(#heat)" opacity={0.55 + Math.min(p.bills, 30) / 60} />
          ))}

          {/* Alignment heat */}
          {layers.alignment && PINS.map(p => (
            <circle key={`a-${p.id}`} cx={p.x} cy={p.y} r={32 + (p.pulse - 40)} fill="url(#align)" opacity={p.pulse > 60 ? 0.75 : 0.3} />
          ))}

          {/* Rep pins */}
          {layers.reps && PINS.map(p => {
            const fill = p.tone === "success" ? "var(--color-success)" : p.tone === "warning" ? "var(--color-warning)" : "var(--color-destructive)";
            return (
              <g key={p.id} onClick={() => { setActive(p); if ("vibrate" in navigator) navigator.vibrate?.(8); }} style={{ cursor: "pointer" }}>
                <circle cx={p.x} cy={p.y} r="13" fill={fill} fillOpacity="0.18" />
                <circle cx={p.x} cy={p.y} r="6" fill={fill} stroke="var(--color-background)" strokeWidth="2" filter="url(#pin-glow)" />
              </g>
            );
          })}
        </svg>

        {/* Zoom controls */}
        <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-xl border border-border/70 bg-background/85 shadow-card backdrop-blur-md">
          <button onClick={() => setZoom(z => Math.min(3, +(z + 0.25).toFixed(2)))} className="flex h-8 w-8 items-center justify-center text-[16px] font-bold active:scale-95">+</button>
          <div className="h-px bg-border/60" />
          <button onClick={() => setZoom(z => Math.max(0.8, +(z - 0.25).toFixed(2)))} className="flex h-8 w-8 items-center justify-center text-[16px] font-bold active:scale-95">−</button>
          <div className="h-px bg-border/60" />
          <button onClick={() => switchView(view)} className="flex h-8 w-8 items-center justify-center text-[10px] font-bold uppercase tracking-wider active:scale-95">Fit</button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 rounded-xl border border-border/70 bg-background/85 px-2.5 py-2 shadow-card backdrop-blur-md">
          <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Legend</div>
          <div className="flex flex-col gap-1 text-[10px]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success ring-2 ring-success/30" /> Aligned ≥ 65%</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning ring-2 ring-warning/30" /> 45–64%</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive ring-2 ring-destructive/30" /> Below 45%</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive/40" /> Bill activity</span>
          </div>
        </div>

        {/* Active pin tooltip */}
        {active && (
          <div className="absolute left-1/2 top-3 z-10 w-[260px] -translate-x-1/2 rounded-2xl border border-border/70 bg-background/95 p-3 shadow-glow backdrop-blur-xl fade-up">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-primary">{active.label}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">Tap-through for rep cards & pulse</div>
              </div>
              <button onClick={() => setActive(null)} className="text-muted-foreground"><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg bg-success/10 px-2 py-1.5 text-success ring-1 ring-success/25">
                <div className="font-bold tabular-nums text-[14px]">{active.pulse}%</div>
                <div className="text-[9px] uppercase tracking-wider">Alignment</div>
              </div>
              <div className="rounded-lg bg-destructive/10 px-2 py-1.5 text-destructive ring-1 ring-destructive/25">
                <div className="font-bold tabular-nums text-[14px]">{active.bills}</div>
                <div className="text-[9px] uppercase tracking-wider">Bills this mo.</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Layer toggles */}
      <div className="px-4 pt-3">
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          <Layers className="h-3 w-3 text-primary" /> Layers
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {LAYERS.map(l => {
            const on = layers[l.key];
            return (
              <button
                key={l.key}
                onClick={() => { toggle(l.key); if ("vibrate" in navigator) navigator.vibrate?.(6); }}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-all active:scale-[0.98]",
                  on ? "border-primary/50 bg-primary/10 shadow-[0_0_18px_-6px_var(--color-primary)]" : "border-border/60 bg-surface/40",
                )}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1"
                  style={{ background: on ? l.tint + "20" : "transparent", color: on ? l.tint : "var(--color-muted-foreground)", boxShadow: on ? `0 0 14px -4px ${l.tint}` : undefined, borderColor: on ? l.tint : undefined }}
                >
                  <l.icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <div className="min-w-0">
                  <div className="text-[11.5px] font-bold tracking-tight">{l.label}</div>
                  <div className="truncate text-[9.5px] text-muted-foreground">{l.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Relocation explorer panel */}
      <div className="safe-bottom px-4 pb-4 pt-3">
        {reloc ? (
          <div className="rounded-2xl border border-primary/35 bg-gradient-card p-3.5 shadow-glow fade-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                <MapPin className="h-3 w-3" /> Relocation preview
              </div>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-success ring-1 ring-success/25">
                {reloc.velocity} bills/mo
              </span>
            </div>
            <div className="mt-1 text-[14px] font-bold tracking-tight">{reloc.label}</div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-lg bg-surface/60 px-2 py-1.5 ring-1 ring-border/50">
                <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Pulse</div>
                <div className="text-[14px] font-bold tabular-nums">{reloc.pulse}%</div>
              </div>
              <div className="col-span-2 rounded-lg bg-surface/60 px-2 py-1.5 ring-1 ring-border/50">
                <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Hot issues</div>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {reloc.topIssues.map(i => (
                    <span key={i} className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">{i}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {reloc.reps.map(r => (
                <div key={r} className="flex items-center justify-between rounded-lg bg-surface/40 px-2.5 py-1.5 ring-1 ring-border/40">
                  <span className="inline-flex items-center gap-1.5 text-[11.5px]"><ShieldCheck className="h-3 w-3 text-primary" /> {r}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-gradient-card px-3.5 py-3 shadow-card">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-primary" />
              <div>
                <div className="text-[12px] font-bold tracking-tight">Try Relocation Explorer</div>
                <div className="text-[10.5px] text-muted-foreground">Search any city or ZIP above.</div>
              </div>
            </div>
            <div className="flex gap-1">
              {RELOCATION_PRESETS.slice(0, 3).map(p => (
                <button key={p.q} onClick={() => setSearch(p.q)} className="rounded-full bg-primary/15 px-2 py-1 text-[9.5px] font-bold uppercase tracking-wider text-primary ring-1 ring-primary/30 active:scale-95">
                  {p.q.split(",")[0]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
