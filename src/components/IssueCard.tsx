import { useState } from "react";
import { Check, X, HelpCircle, ShieldCheck, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Issue } from "@/lib/mock-data";
import { CATEGORY_COLORS } from "@/lib/mock-data";

type Vote = "yes" | "no" | "unsure" | null;

const URGENCY: Record<string, { label: string; cls: string }> = {
  critical: { label: "CRITICAL", cls: "bg-destructive text-destructive-foreground" },
  high: { label: "HIGH", cls: "bg-orange-500 text-white" },
  medium: { label: "ACTIVE", cls: "bg-muted text-foreground/70 ring-1 ring-border/50" },
  low: { label: "OPEN", cls: "bg-muted text-muted-foreground ring-1 ring-border/40" },
};

export function IssueCard({ issue, onVoted, aiRecommended = false }: { 
  issue: Issue; 
  onVoted?: () => void; 
  aiRecommended?: boolean; 
}) {
  const [vote, setVote] = useState<Vote>(null);
  const [phase, setPhase] = useState<"idle" | "pop" | "done">("idle");
  const [showWhyItMatters, setShowWhyItMatters] = useState(false);
  const [showProsCons, setShowProsCons] = useState(false);

  const voted = vote !== null;

  const castVote = (v: Exclude<Vote, null>) => {
    setVote(v);
    setPhase("pop");
    window.setTimeout(() => setPhase("done"), 550);
    onVoted?.();
  };

  const yesNeighborPct = Math.round((issue.yes / Math.max(1, issue.yes + issue.no + issue.unsure)) * 100);
  const u = URGENCY[issue.urgency] || URGENCY.medium;
  const catColor = CATEGORY_COLORS[issue.category] ?? "var(--color-primary)";

  return (
    <article className={cn("rounded-3xl border border-border/60 bg-surface p-4 shadow-sm transition-all", phase === "pop" && "scale-[0.985]")}>
      
      {/* ========== CLEAN TOP BUBBLES ========== */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-extrabold tracking-[0.5px] text-white" style={{ backgroundColor: catColor }}>
          {issue.category.toUpperCase()}
        </div>
        {issue.urgency && (
          <div className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider", u.cls)}>
            {u.label}
          </div>
        )}
        {aiRecommended && (
          <div className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-extrabold text-success">
            <Sparkles className="h-3 w-3" /> AI Recommended
          </div>
        )}
      </div>
      {/* ========== END TOP BUBBLES ========== */}

      <h2 className="text-[17px] font-extrabold leading-tight tracking-[-0.3px] text-foreground pr-2">
        {issue.title}
      </h2>

      <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/[0.035] px-3.5 py-3">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">WHAT YOU'RE VOTING ON</span>
        </div>
        <p className="text-[13px] leading-snug text-foreground/90">
          {issue.whyItMatters ? issue.whyItMatters.split(".")[0] + "." : "Should this policy move forward in your district?"}
        </p>
      </div>

      <button onClick={() => setShowWhyItMatters(!showWhyItMatters)} className="mt-3 flex w-full items-center justify-between rounded-xl border border-border/60 bg-surface/40 px-3.5 py-2.5 text-left text-[11.5px] font-bold tracking-tight text-muted-foreground hover:bg-surface/70 active:bg-surface/60 active:scale-[0.985] transition-all">
        <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" /> Why it matters (tap to expand)</span>
        <span className={cn("transition-transform", showWhyItMatters && "rotate-180")}>▼</span>
      </button>
      {showWhyItMatters && issue.whyItMatters && (
        <div className="mt-2 rounded-2xl border border-border/50 bg-surface/30 px-4 py-3 text-[13.5px] leading-snug text-foreground/90">{issue.whyItMatters}</div>
      )}

      <button onClick={() => setShowProsCons(!showProsCons)} className="mt-2.5 flex w-full items-center justify-between rounded-xl border border-border/60 bg-surface/40 px-3.5 py-2.5 text-left text-[11.5px] font-bold tracking-tight text-muted-foreground hover:bg-surface/70 active:bg-surface/60 active:scale-[0.985] transition-all">
        <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" /> <span className="text-success">Pros</span> & <span className="text-destructive">Cons</span> (tap to expand)</span>
        <span className={cn("transition-transform", showProsCons && "rotate-180")}>▼</span>
      </button>
      {showProsCons && (
        <div className="mt-2 grid grid-cols-1 gap-3 rounded-2xl border border-border/50 bg-surface/30 p-4 text-[13px]">
          <div><div className="mb-1.5 font-extrabold text-success">PROS</div><ul className="space-y-1 text-foreground/90">{issue.pros?.map((p, i) => <li key={i} className="flex gap-2">• {p}</li>)}</ul></div>
          <div><div className="mb-1.5 font-extrabold text-destructive">CONS</div><ul className="space-y-1 text-foreground/90">{issue.cons?.map((c, i) => <li key={i} className="flex gap-2">• {c}</li>)}</ul></div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-border/60 bg-surface/40 p-3.5">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-muted-foreground"><Users className="h-3.5 w-3.5" /><span>{yesNeighborPct}% of neighbors in your district feel this too</span></div>
          {(issue.urgency === "critical" || (issue.momentum ?? 0) >= 400) && <div className="text-[10px] font-extrabold text-orange-500">🔥 Top story on 3 networks</div>}
        </div>
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" /><span className="text-[11px] font-extrabold tracking-[0.3px] text-success">VERIFIED DISTRICT PULSE</span></div>
            <span className="text-[15px] font-extrabold tabular-nums text-success">{issue.pulse}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/60 flex">
            <div className="h-full bg-success transition-all" style={{ width: `${issue.pulse}%` }} />
            <div className="h-full bg-destructive transition-all" style={{ width: `${100 - issue.pulse}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-bold">
            <span className="text-success">Yes {issue.pulse}%</span>
            <span className="text-destructive">No {100 - issue.pulse}%</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button onClick={() => castVote("yes")} disabled={voted} className={cn("flex h-11 items-center justify-center gap-2 rounded-2xl border text-[13px] font-extrabold transition-all active:scale-[0.985]", vote === "yes" ? "border-success bg-success text-white" : "border-border/70 bg-surface hover:bg-success/5")}><Check className="h-4 w-4" /> YES</button>
        <button onClick={() => castVote("unsure")} disabled={voted} className={cn("flex h-11 items-center justify-center gap-2 rounded-2xl border text-[13px] font-extrabold transition-all active:scale-[0.985]", vote === "unsure" ? "border-primary bg-primary text-white" : "border-border/70 bg-surface hover:bg-primary/5")}><HelpCircle className="h-4 w-4" /> UNSURE</button>
        <button onClick={() => castVote("no")} disabled={voted} className={cn("flex h-11 items-center justify-center gap-2 rounded-2xl border text-[13px] font-extrabold transition-all active:scale-[0.985]", vote === "no" ? "border-destructive bg-destructive text-white" : "border-border/70 bg-surface hover:bg-destructive/5")}><X className="h-4 w-4" /> NO</button>
      </div>

      {voted && <div className="mt-3 rounded-2xl border border-success/30 bg-success/5 px-4 py-2.5 text-center text-[12.5px] font-bold text-success">Your vote was recorded. Thank you for making your voice heard.</div>}
    </article>
  );
}
