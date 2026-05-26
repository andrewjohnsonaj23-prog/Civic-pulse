import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Trophy, Users, Sparkles, TrendingUp, Vote, FileText, Phone, MapPin, ArrowUpRight,
  Flame, ChevronRight, Megaphone, Newspaper, Repeat, Quote, CheckCircle2, Clock,
  Share2, Rocket, PenLine, ListChecks, LineChart,
} from "lucide-react";
import { CircularGauge } from "@/components/CircularGauge";
import { VICTORIES, USER, CATEGORY_COLORS, type Victory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_tabs/impacts")({
  component: Impacts,
  head: () => ({ meta: [{ title: "Impacts — CivicPulse" }] }),
});

const SCOPE_LABEL: Record<string, string> = {
  district: "District 7",
  city: "City-wide",
  state: "State-wide",
  national: "Nationwide",
};

type ScopeMode = "local" | "national";

export function Impacts() {
  const [mode, setMode] = useState<ScopeMode>("local");
  const [openVictory, setOpenVictory] = useState<Victory | null>(null);

  const filtered = useMemo(
    () => VICTORIES.filter(v => (mode === "national" ? v.scope === "national" : v.scope !== "national")),
    [mode],
  );

  const totalRipple = filtered.reduce((s, v) => s + v.ripple, 0);
  const scoreNext = 1000;
  const toNext = scoreNext - USER.impactScore;
  const tierProgress = Math.min(100, (USER.impactScore / scoreNext) * 100);
  const topPct = Math.max(3, Math.round(((scoreNext - USER.impactScore) / scoreNext) * 70));
  const projectedScore = USER.impactScore + 498;

  return (
    <div className="safe-top">
      <header className="px-5 pb-4 pt-5">
        <div className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success">
          <Sparkles className="h-2.5 w-2.5" /> Your Impact
        </div>
        <h1 className="mt-2.5 text-[26px] font-bold leading-[1.15] tracking-tight">
          Real outcomes,
          <span className="block text-muted-foreground font-semibold">verified ripple effects.</span>
        </h1>
      </header>

      {/* Local ↔ National toggle + mini heat map */}
      <div className="mx-5 mb-3 flex items-center gap-2">
        <div className="flex flex-1 rounded-full border border-border/60 bg-surface/60 p-0.5">
          {(["local", "national"] as ScopeMode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors",
                mode === m
                  ? "bg-card text-foreground ring-1 ring-border/70 shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "local" ? "Local Impact" : "National Impact"}
            </button>
          ))}
        </div>
        <ImpactHeatMap mode={mode} />
      </div>

      {/* HERO — large gauge */}
      <section className="mx-5 overflow-hidden rounded-3xl border border-border/70 bg-gradient-card shadow-card">
        <div className="relative flex flex-col items-center px-6 pt-8 pb-6">
          <div className="absolute inset-x-0 top-0 mx-auto h-56 w-56 rounded-full bg-primary/25 blur-3xl" aria-hidden />
          <div className="absolute inset-x-0 top-12 mx-auto h-40 w-40 rounded-full bg-primary-glow/20 blur-3xl" aria-hidden />

          <div className="relative">
            <CircularGauge
              value={tierProgress}
              label={USER.impactScore.toString()}
              sublabel="My Impact Score"
              tone="score"
              size={252}
              stroke={16}
            />
          </div>

          <div className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success ring-1 ring-success/25">
            <TrendingUp className="h-3 w-3" strokeWidth={2.75} />
            You&rsquo;re in the <span className="font-extrabold tabular-nums">top {topPct}%</span>
            <span className="text-success/80">of Civic Stewards in {mode === "local" ? "District 7" : "the U.S."}</span>
          </div>

          <div className="relative mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-primary ring-1 ring-primary/30">
              <Sparkles className="h-2.5 w-2.5" strokeWidth={3} />
              Civic Steward
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface/80 px-2.5 py-1 text-[10.5px] font-bold text-muted-foreground ring-1 ring-border/60">
              <TrendingUp className="h-2.5 w-2.5 text-success" strokeWidth={3} />
              +{toNext} to next tier
            </span>
          </div>

          <p className="relative mt-4 max-w-[280px] text-center text-[12.5px] leading-relaxed text-muted-foreground">
            Your votes & bills have reached{" "}
            <span className="font-bold text-foreground tabular-nums">{totalRipple.toLocaleString()}</span>{" "}
            neighbors {mode === "local" ? "in your District 7" : "across the country"} this year.
          </p>
        </div>

        {/* Tier progression strip */}
        <div className="relative border-t border-border/60 px-5 py-3">
          <div className="flex items-center justify-between text-[10.5px]">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-2.5 w-2.5" strokeWidth={3} />
              Civic Steward
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
              <span>Next: </span>
              <span className="font-bold text-foreground">Community Architect</span>
            </div>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow"
              style={{ width: `${tierProgress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10.5px]">
            <div className="inline-flex items-center gap-1 font-semibold text-muted-foreground">
              <Flame className="h-3 w-3 text-warning" strokeWidth={2.5} />
              <span className="tabular-nums text-foreground font-bold">19-day</span> Impact Consistency
            </div>
            <div className="font-semibold text-muted-foreground">
              Unlocks <span className="text-foreground font-bold">bill co-authoring</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-px border-t border-border/60 bg-border/40">
          <HeroStat
            icon={Vote}
            label={mode === "national" ? "National votes" : "Votes"}
            value={mode === "national" ? USER.votesCast * 38 : USER.votesCast}
          />
          <HeroStat
            icon={FileText}
            label="Bills"
            value={mode === "national" ? USER.billsCoauthored * 12 : USER.billsCoauthored}
          />
          <HeroStat
            icon={Phone}
            label={mode === "national" ? "Federal reps" : "Reps reached"}
            value={mode === "national" ? USER.repsContacted * 4 : USER.repsContacted}
          />
        </div>
      </section>

      {/* Forward projection */}
      <section className="mx-5 mt-4 overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.08] via-card to-card p-3.5 shadow-card">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
            <LineChart className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-primary">Forward projection</div>
            <div className="mt-0.5 text-[12.5px] leading-snug text-foreground/90">
              Vote <span className="font-bold">3×/week for a month</span> →{" "}
              <span className="font-bold tabular-nums">{projectedScore.toLocaleString()}</span>{" "}
              <span className="font-semibold text-success">(+498)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Victories */}
      <section className="px-5 pb-6 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold tracking-tight">Recent victories</h2>
          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success ring-1 ring-success/25">
            {filtered.length} resolved
          </span>
        </div>
        <div className="space-y-3">
          {filtered.map(v => {
            const color = CATEGORY_COLORS[v.category] ?? "var(--color-success)";
            return (
              <article
                key={v.id}
                className="fade-up overflow-hidden rounded-2xl border border-success/30 bg-gradient-card shadow-card"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpenVictory(v)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenVictory(v); } }}
                  className="block w-full cursor-pointer text-left transition-all active:scale-[0.995] active:brightness-110"
                >
                  <div className="flex items-center gap-2 bg-gradient-to-r from-success/25 via-success/15 to-success/5 px-4 py-2">
                    <Trophy className="h-3.5 w-3.5 text-success" strokeWidth={2.5} />
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-success">
                      Resolved
                    </span>
                    {v.scope && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-success/80">
                        <MapPin className="h-2.5 w-2.5" />
                        {SCOPE_LABEL[v.scope]}
                      </span>
                    )}
                    <span className="ml-auto text-[11px] font-medium text-muted-foreground">{v.date}</span>
                  </div>

                  <div className="p-4">
                    <span
                      className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{ color, backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)` }}
                    >
                      {v.category}
                    </span>
                    <h3 className="mt-2 text-[15px] font-semibold leading-snug tracking-tight">{v.title}</h3>

                    <div className="mt-3 flex items-center gap-3 rounded-xl bg-success/[0.08] px-3 py-2.5 ring-1 ring-success/20">
                      <RippleIcon />
                      <div className="flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-success">
                          Ripple effect
                        </div>
                        <div className="text-[12.5px]">
                          <span className="font-bold tabular-nums text-foreground">
                            {v.ripple.toLocaleString()}
                          </span>{" "}
                          <span className="text-muted-foreground">neighbors impacted</span>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-success" strokeWidth={2.5} />
                    </div>

                    {v.yourRole && (
                      <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/[0.07] px-2.5 py-2">
                        <span className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 ring-1 ring-primary/35">
                          <CheckCircle2 className="h-2.5 w-2.5 text-primary" strokeWidth={3} />
                        </span>
                        <div className="min-w-0 flex-1 leading-snug">
                          <div className="text-[9.5px] font-extrabold uppercase tracking-wider text-primary/90">
                            Your voice helped move this
                          </div>
                          <div className="text-[11.5px] font-medium text-foreground/90">
                            {v.yourRole}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                        Read the hope story <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                      <ShareVictoryButton victory={v} compact />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Quick action bar */}
      <section className="mx-5 mb-6 grid grid-cols-3 gap-2">
        <QuickAction icon={PenLine} label="Draft Similar Bill" onPress={() => console.log("quick-action: draft-similar-bill")} />
        <QuickAction icon={Rocket} label="Boost This Victory" onPress={() => console.log("quick-action: boost-this-victory")} />
        <QuickAction icon={ListChecks} label="All My Contributions" onPress={() => console.log("quick-action: all-my-contributions")} />
      </section>

      <HopeStoryDialog victory={openVictory} onClose={() => setOpenVictory(null)} />
    </div>
  );
}

function QuickAction({
  icon: Icon, label, onPress,
}: { icon: typeof Users; label: string; onPress?: () => void }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={label}
      className="group flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-border/60 bg-surface/60 px-2 py-2.5 text-center transition-all duration-150 hover:border-primary/40 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.96] active:bg-primary/10 active:border-primary/50"
    >
      <Icon className="h-3.5 w-3.5 text-primary transition-transform group-active:scale-110" strokeWidth={2.5} />
      <span className="text-[10px] font-bold uppercase leading-tight tracking-wider text-foreground/90">
        {label}
      </span>
    </button>
  );
}

function ShareVictoryButton({
  victory, compact, full,
}: { victory: Victory; compact?: boolean; full?: boolean }) {
  const handleShare = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    const text = `🏆 Victory: ${victory.title} — ${victory.ripple.toLocaleString()} neighbors impacted. Tracked on CivicPulse.`;
    try {
      if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share) {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({ title: victory.title, text });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      /* user dismissed */
    }
  };
  if (full) {
    return (
      <button
        type="button"
        onClick={handleShare}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-success to-success/80 px-4 py-3 text-[12.5px] font-bold uppercase tracking-wider text-success-foreground shadow-sm transition-transform active:scale-[0.99]"
      >
        <Share2 className="h-4 w-4" strokeWidth={2.5} />
        Share this Victory
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-success/12 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-success ring-1 ring-success/30 transition-colors hover:bg-success/20",
        compact && "shrink-0",
      )}
    >
      <Share2 className="h-3 w-3" strokeWidth={2.75} />
      Share
    </button>
  );
}

function ImpactHeatMap({ mode }: { mode: ScopeMode }) {
  // Decorative non-interactive U.S. heat map glyph
  const dots = [
    { cx: 12, cy: 18, r: 2.2, on: true },   // West
    { cx: 20, cy: 14, r: 1.8, on: mode === "national" },
    { cx: 28, cy: 20, r: 2.0, on: mode === "national" },
    { cx: 36, cy: 12, r: 2.4, on: mode === "national" },
    { cx: 42, cy: 22, r: 2.2, on: true },   // District 7 pin
    { cx: 48, cy: 16, r: 1.6, on: mode === "national" },
  ];
  return (
    <div
      aria-hidden
      className="flex h-9 items-center gap-1 rounded-full border border-border/60 bg-surface/60 px-2"
      title="Impact distribution"
    >
      <svg viewBox="0 0 56 32" className="h-5 w-14">
        <path
          d="M4 18 Q10 8 22 10 T44 8 Q52 10 52 18 Q50 26 38 26 T14 26 Q4 26 4 18 Z"
          fill="color-mix(in oklab, var(--color-primary) 8%, transparent)"
          stroke="color-mix(in oklab, var(--color-border) 80%, transparent)"
          strokeWidth="0.6"
        />
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={d.on ? "var(--color-success)" : "color-mix(in oklab, var(--color-muted-foreground) 35%, transparent)"}
            opacity={d.on ? 0.95 : 0.5}
          >
            {d.on && (
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite" />
            )}
          </circle>
        ))}
      </svg>
    </div>
  );
}

function HeroStat({
  icon: Icon, label, value,
}: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center bg-card px-2 py-3.5">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <div className={cn("mt-1.5 text-[20px] font-bold tabular-nums tracking-tight")}>{value}</div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function RippleIcon() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-success/15 pulse-ring" />
      <span className="absolute inset-1.5 rounded-full bg-success/25" />
      <span className="absolute inset-3 rounded-full bg-success/40" />
      <span className="relative h-2 w-2 rounded-full bg-success shadow-glow" />
    </div>
  );
}

// ---------------- Hope Story Dialog ----------------

type StoryDetails = {
  timeline: { date: string; label: string }[];
  supportTarget: number;
  supportReached: number;
  flipped: { name: string; title: string; from: "Against" | "Undecided"; to: "YES" }[];
  steps: { icon: typeof Megaphone; label: string; detail: string }[];
  playbook: string[];
  quote: { text: string; author: string };
};

function deriveStory(v: Victory): StoryDetails {
  const target = Math.max(2500, Math.round(v.ripple / 20));
  const reached = Math.round(target * 1.08);
  return {
    timeline: [
      { date: "Week 1", label: "Issue surfaced on local feed" },
      { date: "Week 2", label: "Reached district pulse threshold" },
      { date: "Week 4", label: "Reps publicly responded" },
      { date: v.date, label: "Resolved & signed into action" },
    ],
    supportTarget: target,
    supportReached: reached,
    flipped: [
      { name: "James Whitaker", title: "State Senator, Dist. 14", from: "Against", to: "YES" },
      { name: "Aisha Robinson", title: "State Assembly, Dist. 22", from: "Undecided", to: "YES" },
    ],
    steps: [
      { icon: Vote, label: "Coordinated vote push", detail: `${reached.toLocaleString()} verified neighbors backed it` },
      { icon: Megaphone, label: "Targeted rep outreach", detail: "412 calls + 1,840 emails sent in 72 hours" },
      { icon: Newspaper, label: "Local media pickup", detail: "Featured by 3 outlets within the district" },
      { icon: CheckCircle2, label: "Hearing testimony", detail: "9 residents spoke at the committee session" },
    ],
    playbook: [
      "Surface the issue with a clear, verified one-line stake.",
      "Hit district pulse threshold before contacting reps.",
      "Coordinate a 72-hour call + email window on undecideds.",
      "Brief 1 local reporter the day before the committee vote.",
      "Pack the hearing with 5–10 verified constituents.",
    ],
    quote: {
      text: "We were told this was impossible for years. It took one organized week to prove otherwise.",
      author: `A neighbor in ${v.scope === "state" ? "the state" : "District 7"}`,
    },
  };
}

function HopeStoryDialog({
  victory, onClose,
}: { victory: Victory | null; onClose: () => void }) {
  if (!victory) return null;
  const color = CATEGORY_COLORS[victory.category] ?? "var(--color-success)";
  const story = deriveStory(victory);
  const supportPct = Math.min(100, (story.supportReached / story.supportTarget) * 100);

  return (
    <Dialog open={!!victory} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-md gap-0 overflow-y-auto rounded-2xl border-border/70 bg-gradient-card p-0">
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-2xl border-b border-border/60 bg-gradient-to-r from-success/25 via-success/10 to-transparent px-5 pb-4 pt-5">
          <div className="flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-success" strokeWidth={2.5} />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-success">
              Hope Story
            </span>
            {victory.scope && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-success/80">
                <MapPin className="h-2.5 w-2.5" />
                {SCOPE_LABEL[victory.scope]}
              </span>
            )}
            <span className="ml-auto text-[11px] font-medium text-muted-foreground">{victory.date}</span>
          </div>
          <span
            className="mt-3 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ color, backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)` }}
          >
            {victory.category}
          </span>
          <DialogHeader className="mt-2 space-y-1 text-left">
            <DialogTitle className="text-[17px] font-semibold leading-snug tracking-tight">
              {victory.title}
            </DialogTitle>
            <DialogDescription className="text-[12px] text-muted-foreground">
              How {victory.ripple.toLocaleString()} neighbors turned an idea into law.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3">
            <ShareVictoryButton victory={victory} full />
          </div>
        </div>



        <div className="space-y-5 px-5 py-5">
          {/* Support stats */}
          <section>
            <SectionLabel>Support needed</SectionLabel>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-[20px] font-bold tabular-nums tracking-tight">
                {story.supportReached.toLocaleString()}
              </div>
              <div className="text-[11px] font-semibold text-muted-foreground">
                of {story.supportTarget.toLocaleString()} target
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-success to-success/70"
                style={{ width: `${supportPct}%` }}
              />
            </div>
          </section>

          {/* Timeline */}
          <section>
            <SectionLabel>Timeline</SectionLabel>
            <ol className="mt-2.5 space-y-2.5">
              {story.timeline.map((t, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-2 w-2 rounded-full bg-success ring-2 ring-success/25" />
                    {i < story.timeline.length - 1 && (
                      <span className="mt-1 h-full w-px flex-1 bg-border/60" />
                    )}
                  </div>
                  <div className="pb-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-success">
                      {t.date}
                    </div>
                    <div className="text-[12.5px] text-foreground/90">{t.label}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Flipped reps */}
          <section>
            <SectionLabel>Reps flipped or pressured</SectionLabel>
            <div className="mt-2 space-y-2">
              {story.flipped.map(r => (
                <div
                  key={r.name}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface/60 px-3 py-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/15 text-success ring-1 ring-success/25">
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-[12.5px] font-semibold">{r.name}</div>
                    <div className="truncate text-[10.5px] text-muted-foreground">{r.title}</div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold">
                    <span className="rounded-full bg-destructive/15 px-1.5 py-0.5 uppercase tracking-wider text-destructive">
                      {r.from}
                    </span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="rounded-full bg-success/15 px-1.5 py-0.5 uppercase tracking-wider text-success">
                      {r.to}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Steps taken */}
          <section>
            <SectionLabel>Steps taken</SectionLabel>
            <div className="mt-2 grid grid-cols-1 gap-2">
              {story.steps.map(s => (
                <div
                  key={s.label}
                  className="flex items-start gap-3 rounded-xl border border-border/60 bg-surface/60 px-3 py-2.5"
                >
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
                    <s.icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[12.5px] font-semibold">{s.label}</div>
                    <div className="text-[11px] text-muted-foreground">{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quote */}
          <section className="relative rounded-2xl border border-border/60 bg-surface/60 px-4 py-3.5">
            <Quote className="absolute -top-2 left-3 h-4 w-4 text-success" strokeWidth={2.5} />
            <p className="text-[13px] leading-relaxed text-foreground/90">
              {story.quote.text}
            </p>
            <div className="mt-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              — {story.quote.author}
            </div>
          </section>

          {/* Repeatable playbook */}
          <section className="overflow-hidden rounded-2xl border border-primary/30 bg-primary/[0.06]">
            <div className="flex items-center gap-2 border-b border-primary/20 px-4 py-2.5">
              <Repeat className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-primary">
                Repeatable Playbook
              </span>
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                <Clock className="h-2.5 w-2.5" /> ~4 weeks
              </span>
            </div>
            <ol className="space-y-2 px-4 py-3">
              {story.playbook.map((p, i) => (
                <li key={i} className="flex gap-2.5 text-[12.5px] leading-snug">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-foreground/90">{p}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground">
      {children}
    </div>
  );
}
