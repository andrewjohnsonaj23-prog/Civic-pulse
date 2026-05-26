import { useState } from "react";
import { Check, X, HelpCircle, ShieldCheck, Clock, Flame, MapPin, CheckCircle2, Sparkles, Users, FileText, Megaphone, Landmark, Scale, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Issue } from "@/lib/mock-data";
import { CATEGORY_COLORS } from "@/lib/mock-data";

type Vote = "yes" | "no" | "unsure" | null;

const JOURNEY = [
  { key: "draft", label: "Draft", Icon: FileText },
  { key: "gathering", label: "Support", Icon: Users },
  { key: "reps", label: "Reps", Icon: Landmark },
  { key: "media", label: "Media", Icon: Megaphone },
  { key: "law", label: "Law", Icon: Scale },
] as const;

export function MiniJourneyTracker({ stageIndex, success = false }: { stageIndex: number; success?: boolean }) {
  const tone = success ? "success" : "primary";
  return (
    <div className="mt-4 rounded-xl border border-border/60 bg-surface/40 px-2.5 py-2">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Bill Journey</span>
        <span className={cn("text-[9.5px] font-extrabold uppercase tracking-wider", tone === "success" ? "text-success" : "text-primary")}>
          {JOURNEY[Math.min(stageIndex, JOURNEY.length - 1)].label}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {JOURNEY.map((s, i) => {
          const active = i <= stageIndex;
          const isCurrent = i === stageIndex;
          return (
            <div key={s.key} className="flex flex-1 items-center gap-1">
              <div className="flex flex-col items-center gap-1">
                <div className={cn("flex h-5 w-5 items-center justify-center rounded-full ring-1 transition-all", active ? (tone === "success" ? "bg-success/25 text-success ring-success/50" : "bg-primary/20 text-primary ring-primary/45") : "bg-surface text-muted-foreground/50 ring-border/50", isCurrent && (tone === "success" ? "shadow-[0_0_12px_-2px_oklch(0.72_0.21_148/70%)]" : "shadow-[0_0_12px_-2px_oklch(0.79_0.13_230/75%)]"))}>
                  <s.Icon className="h-2.5 w-2.5" strokeWidth={3} />
                </div>
                <span className={cn("text-[8.5px] font-bold tracking-tight", active ? "text-foreground/80" : "text-muted-foreground/55")}>{s.label}</span>
              </div>
              {i < JOURNEY.length - 1 && (
                <div className={cn("mb-3.5 h-px flex-1 transition-colors", i < stageIndex ? (tone === "success" ? "bg-success/55" : "bg-primary/45") : "bg-border/50")} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const POP_KEYFRAMES = `
@keyframes votePop{0%{transform:scale(.1);opacity:0}25%{transform:scale(2.15);opacity:1}50%{transform:scale(.8)}72%{transform:scale(1.25)}100%{transform:scale(1.1);opacity:1}}
@keyframes voteRing{0%{transform:scale(.4);opacity:1}100%{transform:scale(3.6);opacity:0}}
@keyframes voteRing2{0%{transform:scale(.4);opacity:.8}100%{transform:scale(4.9);opacity:0}}
@keyframes voteBtnPulse{0%{box-shadow:0 0 0 0 color-mix(in oklab, var(--color-success) 95%, transparent),0 0 40px 8px color-mix(in oklab, var(--color-success) 85%, transparent)}100%{box-shadow:0 0 0 44px color-mix(in oklab, var(--color-success) 0%, transparent),0 0 18px 2px color-mix(in oklab, var(--color-success) 0%, transparent)}}
@keyframes voteGlow{0%,100%{filter:drop-shadow(0 0 18px oklch(0.72_0.21_148 / 95%))}50%{filter:drop-shadow(0 0 30px oklch(0.99 0 0 / 95%))}}
@keyframes successBannerIn{0%{transform:scale(.94) translateY(6px);opacity:0}55%{transform:scale(1.02) translateY(0);opacity:1}100%{transform:scale(1) translateY(0);opacity:1}}
@keyframes successHalo{0%,100%{box-shadow:0 0 0 0 color-mix(in oklab, var(--color-success) 0%, transparent),0 12px 40px -12px color-mix(in oklab, var(--color-success) 55%, transparent)}50%{box-shadow:0 0 0 6px color-mix(in oklab, var(--color-success) 14%, transparent),0 16px 50px -10px color-mix(in oklab, var(--color-success) 70%, transparent)}}
@keyframes pulseDot{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.25)}}
@keyframes pulseBar{0%{transform:translateX(-100%)}100%{transform:translateX(220%)}}
@keyframes plusOneRise{0%{transform:translateY(0) scale(.8);opacity:0}20%{opacity:1}100%{transform:translateY(-32px) scale(1.1);opacity:0}}
@keyframes confettiPop{0%{transform:translate(0,0) scale(0);opacity:0}25%{opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(.6);opacity:0}}
`;

const JURISDICTION_LABEL: Record<Issue["scope"], string> = {
  district: "District 7",
  local: "Local",
  state: "State",
  federal: "Federal",
};

const URGENCY: Record<Issue["urgency"], { label: string; cls: string; icon?: typeof Flame }> = {
  critical: { label: "TIME-SENSITIVE", cls: "bg-destructive/12 text-destructive/90 ring-1 ring-destructive/30" },
  high: { label: "PRIORITY", cls: "bg-warning/12 text-warning/90 ring-1 ring-warning/25" },
  medium: { label: "ACTIVE", cls: "bg-muted text-foreground/70 ring-1 ring-border/50" },
  low: { label: "OPEN", cls: "bg-muted text-muted-foreground ring-1 ring-border/40" },
};

export function IssueCard({ issue, onVoted, trendingLabel, whyHere, aiRecommended, relevance, alignmentNote }: { issue: Issue; onVoted?: () => void; trendingLabel?: "Active Discussion" | null; whyHere?: string | null; aiRecommended?: boolean; relevance?: number; alignmentNote?: string | null }) {
  const [vote, setVote] = useState<Vote>(null);
  const [phase, setPhase] = useState<"idle" | "pop" | "done">("idle");
  const [saved, setSaved] = useState(false);
  const [showProsCons, setShowProsCons] = useState(false);
  const [showWhyItMatters, setShowWhyItMatters] = useState(false);

  const voted = vote !== null;

  const castVote = (v: Exclude<Vote, null>) => {
    setVote(v);
    setPhase("pop");
    window.setTimeout(() => setPhase("done"), 550);
    onVoted?.();
  };

  const total = issue.yes + issue.no + issue.unsure + (voted ? 1 : 0);
  const yesPct = Math.round(((issue.yes + (vote === "yes" ? 1 : 0)) / total) * 100);
  const noPct = Math.round(((issue.no + (vote === "no" ? 1 : 0)) / total) * 100);
  const progress = Math.min(100, Math.round((total / issue.goal) * 100));
  const u = URGENCY[issue.urgency];
  const catColor = CATEGORY_COLORS[issue.category] ?? "var(--color-primary)";
  const yesNeighborPct = Math.round((issue.yes / Math.max(1, issue.yes + issue.no + issue.unsure)) * 100);
  const hasHeat = issue.urgency === "critical" || (issue.momentum ?? 0) >= 400;

  return (
    <article className={cn("fade-up group relative overflow-hidden rounded-2xl border bg-gradient-card p-6 shadow-card transition-all duration-300 hover:border-primary/35 hover:-translate-y-[1px] hover:shadow-[0_18px_44px_-24px_oklch(0.79_0.13_230/30%)] active:scale-[0.995] cursor-pointer", hasHeat ? "border-border/70 shadow-[0_1px_0_0_oklch(1_0_0/4%)_inset,0_18px_40px_-24px_oklch(0.66_0.23_25/35%)]" : "border-border/70", phase === "done" && "opacity-95 cursor-default")}>
      <style>{POP_KEYFRAMES}</style>

      {/* Top header */}
      <header className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] ring-1" style={{ color: catColor, backgroundColor: `color-mix(in oklab, ${catColor} 18%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${catColor} 32%, transparent)` }}>
          {issue.category}
        </span>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
          {trendingLabel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-1 text-[9.5px] font-bold uppercase tracking-wider text-primary/90 ring-1 ring-primary/25">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/80" /> {trendingLabel}
            </span>
          )}
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider", u.cls)}>
            {u.icon && <u.icon className="h-2.5 w-2.5" strokeWidth={3} />} {u.label}
          </span>
          <button type="button" onClick={(e) => { e.stopPropagation(); setSaved(s => !s); }} className={cn("flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 active:scale-[0.88] hover:brightness-110", saved ? "bg-destructive/20 text-destructive ring-2 ring-destructive/50" : "bg-surface/70 text-muted-foreground ring-1 ring-border/60 hover:text-foreground hover:ring-border")}>
            <Heart className="h-3.5 w-3.5" strokeWidth={2.5} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </header>

      <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/75">
        <MapPin className="h-2.5 w-2.5" /> {JURISDICTION_LABEL[issue.scope]}
      </div>

      {aiRecommended && (
        <div className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.06] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-primary/85">
          <Sparkles className="h-2.5 w-2.5" strokeWidth={3} /> AI Recommended for You
        </div>
      )}

      {!aiRecommended && whyHere && (
        <div className="mt-2 flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.07] px-2.5 py-1 text-[10px] font-bold tracking-tight text-primary/90 w-fit">
          <Sparkles className="h-2.5 w-2.5" strokeWidth={3} />
          <span className="uppercase tracking-wider text-[9px] text-primary/70">Why this is here</span>
          <span aria-hidden className="text-primary/40">·</span>
          <span className="text-primary normal-case">{whyHere}</span>
        </div>
      )}

      <h3 className="mt-4 text-[20px] font-bold leading-[1.25] tracking-tight text-balance text-foreground">{issue.title}</h3>

      {/* Why it matters — COLLAPSED BY DEFAULT with (tap to expand) */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowWhyItMatters(v => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-primary/30 bg-primary/[0.06] px-3 py-2 text-left text-[11px] font-bold tracking-tight text-primary/90 hover:bg-primary/[0.1] active:bg-primary/[0.12]"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Why it matters (tap to expand)
          </span>
          <span className={cn("transition-transform", showWhyItMatters && "rotate-180")}>▼</span>
        </button>

        {showWhyItMatters && (
          <div className="mt-2 rounded-xl border border-primary/20 bg-primary/[0.05] px-3.5 py-2.5">
            <p className="text-[12.5px] font-normal leading-relaxed text-foreground/85">
              {issue.whyItMatters}
            </p>
          </div>
        )}
      </div>

      {/* Pros & Cons — COLLAPSED BY DEFAULT (Green / Red theme + matching header style) */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowProsCons(v => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-primary/30 bg-primary/[0.06] px-3 py-2 text-left text-[11px] font-bold tracking-tight text-primary/90 hover:bg-primary/[0.1] active:bg-primary/[0.12]"
        >
          <span><span className="text-success">Pros</span> & <span className="text-destructive">Cons</span> (tap to expand)</span>
          <span className={cn("transition-transform", showProsCons && "rotate-180")}>▼</span>
        </button>

        {showProsCons && (
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            {/* PROS - Green */}
            <div className="rounded-xl border border-success/40 bg-success/[0.08] px-3 py-2.5">
              <div className="mb-1.5 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-success">
                <Check className="h-2.5 w-2.5" strokeWidth={3.5} /> Pros
              </div>
              <ul className="space-y-1">
                {issue.pros.slice(0, 3).map((p, i) => (
                  <li key={i} className="flex gap-1.5 text-[11.5px] font-normal leading-[1.4] text-foreground/80">
                    <span className="mt-[6px] inline-block h-[3px] w-[3px] shrink-0 rounded-full bg-success" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CONS - Red */}
            <div className="rounded-xl border border-destructive/40 bg-destructive/[0.08] px-3 py-2.5">
              <div className="mb-1.5 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-destructive">
                <X className="h-2.5 w-2.5" strokeWidth={3.5} /> Cons
              </div>
              <ul className="space-y-1">
                {issue.cons.slice(0, 3).map((c, i) => (
                  <li key={i} className="flex gap-1.5 text-[11.5px] font-normal leading-[1.4] text-foreground/80">
                    <span className="mt-[6px] inline-block h-[3px] w-[3px] shrink-0 rounded-full bg-destructive" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 h-px bg-gradient-to-r from-transparent via-border/70 to-transparent" />

      {/* Momentum & social proof */}
      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2.5 py-1 text-[10.5px] font-bold text-primary ring-1 ring-primary/25">
          <Users className="h-2.5 w-2.5" strokeWidth={3} /> {yesNeighborPct}% of neighbors in your district feel this too
        </span>
        {issue.momentumText && (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface/70 px-2.5 py-1 text-[10.5px] font-semibold text-muted-foreground ring-1 ring-border/50">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/70" /> {issue.momentumText}
          </span>
        )}
      </div>

      {/* Verified District Pulse */}
      <div className="relative mt-5 overflow-hidden rounded-2xl border border-success/30 bg-gradient-to-r from-success/15 via-success/[0.08] to-transparent p-3.5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/20 ring-1 ring-success/40">
            <ShieldCheck className="h-[18px] w-[18px] text-success" strokeWidth={2.5} />
            <span aria-hidden className="absolute inset-0 rounded-xl ring-2 ring-success/35" style={{ animation: "pulseDot 2.4s ease-in-out infinite" }} />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-success">Verified District Pulse</span>
              <span className="text-[18px] font-extrabold text-success tabular-nums">{issue.pulse}%</span>
            </div>
            <p className="text-[11px] leading-tight text-muted-foreground/85">support among verified voters in your district</p>
            <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-success/15">
              <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-success/70 via-success to-success/70 shadow-[0_0_10px_-1px_oklch(0.72_0.21_148/70%)]" style={{ width: `${issue.pulse}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Vote buttons */}
      {phase !== "done" ? (
        <div className="mt-5 grid grid-cols-3 gap-2">
          <button onClick={() => castVote("yes")} disabled={phase === "pop"} className={cn("relative flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[12.5px] font-extrabold tracking-wider transition-all duration-300 active:scale-[0.96] overflow-visible", phase === "pop" && vote === "yes" ? "bg-success !text-background ring-2 ring-success scale-[1.12] z-10" : "bg-success/15 text-success ring-1 ring-success/30 hover:bg-success/25 hover:ring-success/50 active:bg-success/35")}>
            <Check className="h-[18px] w-[18px]" strokeWidth={3} /> YES
          </button>
          <button onClick={() => castVote("unsure")} disabled={phase === "pop"} className={cn("relative flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[12.5px] font-extrabold tracking-wider transition-all duration-300 active:scale-[0.96] overflow-visible", phase === "pop" && vote === "unsure" ? "bg-zinc-500 !text-background ring-2 ring-zinc-400 scale-[1.12] z-10" : "bg-surface text-muted-foreground ring-1 ring-border/60 hover:text-foreground hover:bg-accent active:bg-accent/80")}>
            <HelpCircle className="h-[18px] w-[18px]" strokeWidth={3} /> UNSURE
          </button>
          <button onClick={() => castVote("no")} disabled={phase === "pop"} className={cn("relative flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[12.5px] font-extrabold tracking-wider transition-all duration-300 active:scale-[0.96] overflow-visible", phase === "pop" && vote === "no" ? "bg-destructive !text-background ring-2 ring-destructive scale-[1.12] z-10" : "bg-destructive/15 text-destructive ring-1 ring-destructive/30 hover:bg-destructive/25 hover:ring-destructive/50 active:bg-destructive/35")}>
            <X className="h-[18px] w-[18px]" strokeWidth={3} /> NO
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-2.5">
          <div className="fade-up flex items-center justify-center gap-2 rounded-xl border border-success/40 bg-success/15 px-3 py-3 text-[12.5px] font-bold text-success shadow-[0_0_24px_-8px_oklch(0.72_0.21_148/55%)]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-background" style={{ animation: "votePop 700ms cubic-bezier(.2,1.4,.4,1) both" }}>
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            Vote Recorded
          </div>
          <div className="flex items-center justify-between text-[11.5px] font-bold tabular-nums">
            <span className="text-success">YES {yesPct}%</span>
            <span className="text-muted-foreground">UNSURE {Math.max(0, 100 - yesPct - noPct)}%</span>
            <span className="text-destructive">NO {noPct}%</span>
          </div>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-muted/70">
            <div className="bg-success transition-all duration-700" style={{ width: `${yesPct}%` }} />
            <div className="bg-destructive transition-all duration-700" style={{ width: `${noPct}%` }} />
            <div className="bg-muted-foreground/40 transition-all duration-700" style={{ width: `${Math.max(0, 100 - yesPct - noPct)}%` }} />
          </div>
        </div>
      )}
    </article>
  );
}
