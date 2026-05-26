import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Award, Flag, Leaf, Heart, GraduationCap, Vote, ShieldCheck, Lock, Sparkles, TrendingUp } from "lucide-react";
import { CircularGauge } from "@/components/CircularGauge";
import { USER } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Impacts } from "@/routes/_tabs/impacts";

export const Route = createFileRoute("/_tabs/legacy")({
  component: LegacyTab,
  head: () => ({ meta: [{ title: "Legacy — CivicPulse" }] }),
});

type LegacyView = "impact" | "legacy";

function LegacyTab() {
  const [view, setView] = useState<LegacyView>("impact");
  return (
    <div className="safe-top">
      <div className="px-5 pb-5 pt-6">
        <div className="flex rounded-full border border-border/60 bg-surface/60 p-0.5">
          {(["impact", "legacy"] as LegacyView[]).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "flex-1 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors",
                view === v
                  ? "bg-card text-foreground ring-1 ring-border/70 shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v === "impact" ? "Impact" : "Legacy"}
            </button>
          ))}
        </div>
      </div>
      {view === "impact" ? <Impacts /> : <Legacy />}
    </div>
  );
}


type Milestone = {
  id: string;
  icon: typeof Vote;
  title: string;
  blurb: string;
  date: string;
  unlocked: boolean;
  tier: "bronze" | "silver" | "gold";
};

const milestones: Milestone[] = [
  { id: "m1", icon: Vote, title: "First Vote Cast", blurb: "You showed up. The hardest step.", date: "Sep 12, 2025", unlocked: true, tier: "bronze" },
  { id: "m2", icon: Flag, title: "10 Votes Milestone", blurb: "Becoming a regular voice in District 7.", date: "Oct 4, 2025", unlocked: true, tier: "bronze" },
  { id: "m3", icon: GraduationCap, title: "Co-authored Bill Passed", blurb: "Your wording made it into law.", date: "Jan 18, 2026", unlocked: true, tier: "gold" },
  { id: "m4", icon: Heart, title: "Helped 10K Neighbors", blurb: "Verified ripple effect surpassed 10,000.", date: "Feb 2026", unlocked: true, tier: "silver" },
  { id: "m5", icon: Leaf, title: "Sustained 6 Months", blurb: "Half a year of steady civic action.", date: "Mar 12, 2026", unlocked: true, tier: "silver" },
  { id: "m6", icon: Award, title: "100 Votes Milestone", blurb: "A true District 7 anchor.", date: "Pending", unlocked: false, tier: "gold" },
  { id: "m7", icon: ShieldCheck, title: "District Champion", blurb: "Top 5% steward of your district.", date: "Pending", unlocked: false, tier: "gold" },
];

const TIER_STYLES: Record<Milestone["tier"], { ring: string; bg: string; text: string; glow: string; label: string }> = {
  bronze: { ring: "ring-warning/40", bg: "bg-warning/15", text: "text-warning", glow: "shadow-[0_0_18px_-6px_oklch(0.78_0.16_70/70%)]", label: "Bronze" },
  silver: { ring: "ring-primary/40", bg: "bg-primary/15", text: "text-primary", glow: "shadow-[0_0_18px_-6px_oklch(0.79_0.13_230/70%)]", label: "Silver" },
  gold:   { ring: "ring-success/45", bg: "bg-success/15", text: "text-success", glow: "shadow-[0_0_22px_-6px_oklch(0.72_0.21_148/80%)]", label: "Gold" },
};

function Legacy() {
  const unlocked = milestones.filter(m => m.unlocked);
  const nextMilestone = milestones.find(m => !m.unlocked);

  return (
    <div className="safe-top">
      <header className="px-5 pb-4 pt-5">
        <div className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success">
          <Award className="h-2.5 w-2.5" /> My Legacy
        </div>
        <h1 className="mt-2.5 text-[26px] font-bold leading-[1.15] tracking-tight">
          Stewardship is built
          <span className="block text-muted-foreground font-semibold">over years, not headlines.</span>
        </h1>
      </header>

      {/* HERO — stewardship gauge */}
      <section className="mx-5 overflow-hidden rounded-3xl border border-border/70 bg-gradient-card shadow-card">
        <div className="relative flex flex-col items-center px-6 pt-8 pb-6">
          <div className="absolute inset-x-0 top-0 mx-auto h-56 w-56 rounded-full bg-success/25 blur-3xl" aria-hidden />
          <div className="absolute inset-x-0 top-12 mx-auto h-40 w-40 rounded-full bg-primary-glow/15 blur-3xl" aria-hidden />

          <div className="relative">
            <CircularGauge
              value={USER.stewardshipScore}
              label={USER.stewardshipScore.toString()}
              sublabel="Stewardship Score"
              tone="success"
              size={252}
              stroke={16}
            />
          </div>

          <div className="relative mt-5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-success ring-1 ring-success/30">
              <Sparkles className="h-2.5 w-2.5" strokeWidth={3} />
              Top 12% in District 7
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface/80 px-2.5 py-1 text-[10.5px] font-bold text-muted-foreground ring-1 ring-border/60">
              <TrendingUp className="h-2.5 w-2.5 text-success" strokeWidth={3} />
              +4 this month
            </span>
          </div>

          <p className="relative mt-4 text-center text-[12.5px] leading-relaxed text-muted-foreground">
            Member since <span className="font-bold text-foreground">{USER.joined}</span>
            <span className="mx-1.5 text-muted-foreground/50">·</span>
            <span className="font-bold text-foreground tabular-nums">{unlocked.length}</span>{" "}
            milestones earned
          </p>
        </div>

        {/* Next milestone teaser */}
        {nextMilestone && (
          <div className="flex items-center gap-2.5 border-t border-border/60 bg-surface/40 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 ring-1 ring-border/60">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Next milestone</div>
              <div className="truncate text-[12.5px] font-semibold tracking-tight">{nextMilestone.title}</div>
            </div>
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider ring-1",
              TIER_STYLES[nextMilestone.tier].bg,
              TIER_STYLES[nextMilestone.tier].text,
              TIER_STYLES[nextMilestone.tier].ring,
            )}>
              {TIER_STYLES[nextMilestone.tier].label}
            </span>
          </div>
        )}
      </section>

      {/* Milestones grid */}
      <section className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold tracking-tight">Achievements</h2>
          <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">
            {unlocked.length} / {milestones.length} unlocked
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {milestones.map(m => {
            const Icon = m.icon;
            const tier = TIER_STYLES[m.tier];
            return (
              <div
                key={m.id}
                className={cn(
                  "fade-up relative flex flex-col items-center rounded-2xl border p-3 text-center shadow-card transition-all",
                  m.unlocked
                    ? "border-border/60 bg-gradient-card"
                    : "border-border/40 bg-surface/40 opacity-65",
                )}
              >
                {m.unlocked && (
                  <span className={cn(
                    "absolute right-1.5 top-1.5 rounded-full px-1.5 py-px text-[8.5px] font-extrabold uppercase tracking-wider ring-1",
                    tier.bg, tier.text, tier.ring,
                  )}>
                    {tier.label}
                  </span>
                )}
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full ring-1",
                    m.unlocked
                      ? cn(tier.bg, tier.text, tier.ring, tier.glow)
                      : "bg-muted text-muted-foreground ring-border/60",
                  )}
                >
                  {m.unlocked ? <Icon className="h-5 w-5" strokeWidth={2.5} /> : <Lock className="h-3.5 w-3.5" />}
                </div>
                <div className="mt-2 text-[11px] font-bold leading-tight tracking-tight">
                  {m.title}
                </div>
                <div className="mt-0.5 text-[9.5px] font-medium text-muted-foreground tabular-nums">
                  {m.unlocked ? m.date : "Locked"}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Timeline */}
      <section className="px-5 pb-6 pt-6">
        <h2 className="mb-3 text-[15px] font-bold tracking-tight">Timeline</h2>
        <ol className="relative ml-3 space-y-3 border-l-2 border-border/50 pl-5">
          {milestones.map(m => {
            const Icon = m.icon;
            const tier = TIER_STYLES[m.tier];
            return (
              <li key={m.id} className="fade-up relative">
                <span
                  className={cn(
                    "absolute -left-[32px] flex h-8 w-8 items-center justify-center rounded-full border-2 ring-4 ring-background",
                    m.unlocked
                      ? cn(tier.text, tier.ring.replace("ring-", "border-"), tier.bg, tier.glow)
                      : "border-border bg-surface text-muted-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <div
                  className={cn(
                    "rounded-xl border p-3 shadow-card transition-all",
                    m.unlocked
                      ? "border-border/70 bg-gradient-card"
                      : "border-border/40 bg-surface/40 opacity-65",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[13.5px] font-semibold tracking-tight">{m.title}</div>
                    {m.unlocked ? (
                      <span className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1",
                        tier.bg, tier.text, tier.ring,
                      )}>
                        {tier.label}
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        Locked
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
                    {m.blurb}
                  </div>
                  <div className="mt-1 text-[10.5px] font-semibold text-muted-foreground/80 tabular-nums">
                    {m.date}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
