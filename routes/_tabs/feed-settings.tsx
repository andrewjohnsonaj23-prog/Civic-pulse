import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Sparkles, MapPin, Bell, ShieldCheck, EyeOff, Flame, Target, Check } from "lucide-react";
import { CATEGORY_ORDER } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_tabs/feed-settings")({
  component: FeedSettings,
  head: () => ({
    meta: [
      { title: "My Feed Settings — CivicPulse" },
      { name: "description", content: "Personalize your CivicPulse feed: interests, local radius, notifications, and identity." },
    ],
  }),
});

const RADIUS_STEPS = [10, 50, 200] as const;

function FeedSettings() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [radius, setRadius] = useState<number>(50);
  const [mode, setMode] = useState<"anonymous" | "verified">("verified");
  const [notifs, setNotifs] = useState({
    breaking: true,
    nearby: true,
    reps: true,
    digest: false,
  });
  const [streakOn, setStreakOn] = useState(true);
  const [questsOn, setQuestsOn] = useState(true);

  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = localStorage.getItem("cp_interests");
      if (raw) setInterests(new Set(JSON.parse(raw) as string[]));
      const r = localStorage.getItem("cp_radius");
      if (r) setRadius(parseInt(r));
      const m = localStorage.getItem("cp_mode");
      if (m === "anonymous" || m === "verified") setMode(m);
      const n = localStorage.getItem("cp_notifs");
      if (n) setNotifs(JSON.parse(n));
      const s = localStorage.getItem("cp_streak_on");
      if (s !== null) setStreakOn(s === "1");
      const q = localStorage.getItem("cp_quests_on");
      if (q !== null) setQuestsOn(q === "1");
    } catch {}
  }, [mounted]);

  const persist = (key: string, val: string) => {
    try { localStorage.setItem(key, val); } catch {}
  };

  const toggleInterest = (c: string) => {
    const n = new Set(interests);
    n.has(c) ? n.delete(c) : n.add(c);
    setInterests(n);
    persist("cp_interests", JSON.stringify(Array.from(n)));
  };

  const setRadiusVal = (v: number) => { setRadius(v); persist("cp_radius", String(v)); };
  const setModeVal = (m: "anonymous" | "verified") => { setMode(m); persist("cp_mode", m); };
  const setNotif = (k: keyof typeof notifs, v: boolean) => {
    const next = { ...notifs, [k]: v };
    setNotifs(next);
    persist("cp_notifs", JSON.stringify(next));
  };

  const mapZoom = useMemo(() => radius === 10 ? 1.6 : radius === 50 ? 1.15 : 0.75, [radius]);

  return (
    <div className="safe-top min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/90 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface/70 ring-1 ring-border/60 transition active:scale-95 hover:bg-surface"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-[18px] font-bold tracking-tight">My Feed Settings</h1>
            <p className="text-[11px] text-muted-foreground">Tune what surfaces in your feed.</p>
          </div>
        </div>
      </header>

      <div className="space-y-5 px-5 py-5 pb-10">
        {/* Interests */}
        <section className="rounded-2xl border border-border/60 bg-gradient-card p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
              <Sparkles className="h-4 w-4 text-primary" strokeWidth={2.5} />
            </span>
            <div className="flex-1">
              <h2 className="text-[13.5px] font-bold tracking-tight">Manage Interests</h2>
              <p className="text-[11px] text-muted-foreground">{mounted ? `${interests.size} selected` : "—"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_ORDER.map(c => {
              const on = mounted && interests.has(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleInterest(c)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[11px] font-bold tracking-tight transition active:scale-95",
                    on
                      ? "bg-primary text-primary-foreground shadow-[0_6px_18px_-8px_oklch(0.79_0.13_230/85%)] ring-1 ring-primary/60"
                      : "bg-surface/70 text-muted-foreground ring-1 ring-border/60 hover:text-foreground",
                  )}
                >
                  {on && <Check className="mr-1 inline h-3 w-3" strokeWidth={3} />}
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        {/* Local Impact Radius */}
        <section className="rounded-2xl border border-border/60 bg-gradient-card p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15 ring-1 ring-warning/30">
              <MapPin className="h-4 w-4 text-warning" strokeWidth={2.5} />
            </span>
            <div className="flex-1">
              <h2 className="text-[13.5px] font-bold tracking-tight">Local Impact Radius</h2>
              <p className="text-[11px] text-muted-foreground">How wide should "near me" reach?</p>
            </div>
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-extrabold text-primary tabular-nums">{radius} mi</span>
          </div>

          {/* Mini map preview */}
          <div className="relative mb-3 h-28 overflow-hidden rounded-xl border border-border/50 bg-[radial-gradient(circle_at_50%_50%,oklch(0.25_0.04_250)_0%,oklch(0.12_0.03_250)_70%)]">
            <svg viewBox="0 0 200 100" className="absolute inset-0 h-full w-full opacity-40">
              <defs>
                <pattern id="grid" width="14" height="14" patternUnits="userSpaceOnUse">
                  <path d="M14 0 L0 0 0 14" fill="none" stroke="oklch(0.79 0.13 230)" strokeWidth="0.4" />
                </pattern>
              </defs>
              <rect width="200" height="100" fill="url(#grid)" />
              <path d="M0 60 Q50 40 100 55 T200 50" stroke="oklch(0.79 0.13 230 / 50%)" strokeWidth="0.8" fill="none" />
              <path d="M0 30 Q70 70 140 30 T200 40" stroke="oklch(0.72 0.21 148 / 35%)" strokeWidth="0.6" fill="none" />
            </svg>
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/70 bg-primary/15 shadow-[0_0_40px_-4px_oklch(0.79_0.13_230/75%)] transition-all duration-500"
              style={{ width: `${Math.min(90, 36 * mapZoom)}%`, aspectRatio: "1/1" }}
            />
            <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_18px_2px_oklch(0.79_0.13_230/90%)] ring-2 ring-background" />
          </div>

          {/* Sleek step picker */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-surface/70 p-1.5 ring-1 ring-border/60">
            {RADIUS_STEPS.map(v => (
              <button
                key={v}
                onClick={() => setRadiusVal(v)}
                className={cn(
                  "rounded-xl px-2 py-2 text-[12px] font-bold tracking-tight transition-all active:scale-[0.97]",
                  radius === v
                    ? "bg-gradient-primary text-primary-foreground shadow-[0_8px_22px_-10px_oklch(0.79_0.13_230/85%)] ring-1 ring-primary/60"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v} mi
              </button>
            ))}
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="rounded-2xl border border-border/60 bg-gradient-card p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
              <Bell className="h-4 w-4 text-primary" strokeWidth={2.5} />
            </span>
            <div>
              <h2 className="text-[13.5px] font-bold tracking-tight">Notifications</h2>
              <p className="text-[11px] text-muted-foreground">When should we reach you?</p>
            </div>
          </div>
          <div className="divide-y divide-border/40">
            {([
              ["breaking", "Breaking civic alerts", "Critical votes & deadlines."],
              ["nearby", "Nearby momentum", "When issues surge in your district."],
              ["reps", "Rep responses", "When your reps reply to bills you backed."],
              ["digest", "Weekly digest", "Sunday morning summary."],
            ] as const).map(([k, title, desc]) => {
              const on = notifs[k];
              return (
                <div key={k} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-semibold tracking-tight">{title}</p>
                    <p className="text-[11px] text-muted-foreground">{desc}</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={on}
                    onClick={() => setNotif(k, !on)}
                    className={cn(
                      "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                      on ? "bg-primary shadow-[0_0_18px_-4px_oklch(0.79_0.13_230/85%)]" : "bg-surface ring-1 ring-border/60",
                    )}
                  >
                    <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform", on ? "translate-x-5" : "translate-x-0.5")} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Identity mode */}
        <section className="rounded-2xl border border-border/60 bg-gradient-card p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/15 ring-1 ring-success/30">
              <ShieldCheck className="h-4 w-4 text-success" strokeWidth={2.5} />
            </span>
            <div>
              <h2 className="text-[13.5px] font-bold tracking-tight">Identity Mode</h2>
              <p className="text-[11px] text-muted-foreground">Verified votes carry more weight.</p>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-2 rounded-2xl bg-surface/70 p-1.5 ring-1 ring-border/60">
            <button
              onClick={() => setModeVal("anonymous")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[12.5px] font-bold tracking-tight transition-all active:scale-[0.97]",
                mode === "anonymous"
                  ? "bg-muted text-foreground shadow ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <EyeOff className="h-3.5 w-3.5" strokeWidth={2.5} />
              Anonymous
            </button>
            <button
              onClick={() => setModeVal("verified")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[12.5px] font-bold tracking-tight transition-all active:scale-[0.97]",
                mode === "verified"
                  ? "bg-gradient-to-br from-success/85 to-success/65 text-background shadow-[0_8px_22px_-10px_oklch(0.72_0.21_148/85%)] ring-1 ring-success/60"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.75} />
              Verified
            </button>
          </div>
        </section>

        {/* Streak & Quests */}
        <section className="rounded-2xl border border-border/60 bg-gradient-card p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15 ring-1 ring-warning/30">
              <Flame className="h-4 w-4 text-warning" strokeWidth={2.5} />
            </span>
            <div>
              <h2 className="text-[13.5px] font-bold tracking-tight">Civic Streak & Quests</h2>
              <p className="text-[11px] text-muted-foreground">Build a daily civic habit.</p>
            </div>
          </div>
          {([
            ["streak", "Civic Streak", "Show your daily streak banner.", streakOn, (v: boolean) => { setStreakOn(v); persist("cp_streak_on", v ? "1" : "0"); }, Flame],
            ["quests", "Daily Quests", "Surface a daily quest card.", questsOn, (v: boolean) => { setQuestsOn(v); persist("cp_quests_on", v ? "1" : "0"); }, Target],
          ] as const).map(([k, title, desc, on, set, Icon]) => (
            <div key={k} className="flex items-center gap-3 border-t border-border/40 py-2.5 first:border-t-0">
              <Icon className="h-4 w-4 text-warning" strokeWidth={2.5} />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold tracking-tight">{title}</p>
                <p className="text-[11px] text-muted-foreground">{desc}</p>
              </div>
              <button
                role="switch"
                aria-checked={on}
                onClick={() => set(!on)}
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                  on ? "bg-warning shadow-[0_0_18px_-4px_oklch(0.78_0.16_70/85%)]" : "bg-surface ring-1 ring-border/60",
                )}
              >
                <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform", on ? "translate-x-5" : "translate-x-0.5")} />
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
