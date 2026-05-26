import { useState } from "react";
import { ShieldCheck, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Issue } from "@/lib/mock-data";
import { CATEGORY_COLORS } from "@/lib/mock-data";

type Vote = "yes" | "no" | "unsure" | null;

const URGENCY: Record<string, { label: string; cls: string }> = {
  critical: { label: "CRITICAL", cls: "bg-red-500 text-white" },
  high: { label: "HIGH", cls: "bg-orange-500 text-white" },
  medium: { label: "ACTIVE", cls: "bg-muted text-foreground/70" },
  low: { label: "OPEN", cls: "bg-muted text-muted-foreground" },
};

export function IssueCard({ issue, onVoted, aiRecommended = false }: { 
  issue?: Issue; 
  onVoted?: () => void; 
  aiRecommended?: boolean;
}) {
  if (!issue || typeof issue !== "object") {
    return <div className="rounded-3xl border border-border/60 bg-surface p-4 text-sm text-muted-foreground">Issue data unavailable</div>;
  }

  const [vote, setVote] = useState<Vote>(null);
  const [showWhy, setShowWhy] = useState(false);
  const [showProsCons, setShowProsCons] = useState(false);

  const voted = vote !== null;

  const castVote = (v: Exclude<Vote, null>) => {
    setVote(v);
    onVoted?.();
  };

  const title = issue.title || "Untitled issue";
  const category = issue.category || "General";
  const urgency = issue.urgency || "medium";
  const pulse = Number(issue.pulse) || 0;
  const yes = Number(issue.yes) || 0;
  const no = Number(issue.no) || 0;
  const unsure = Number(issue.unsure) || 0;

  const whyText = issue.whyItMatters || issue.description || "This issue affects your district directly.";
  const prosList = Array.isArray(issue.pros) && issue.pros.length > 0 ? issue.pros : ["Helps working families", "Reduces long-term costs"];
  const consList = Array.isArray(issue.cons) && issue.cons.length > 0 ? issue.cons : ["Requires new funding", "Implementation takes time"];

  const total = yes + no + unsure + (voted ? 1 : 0);
  const yesPct = Math.round(((yes + (vote === "yes" ? 1 : 0)) / Math.max(1, total)) * 100);
  const noPct = Math.round(((no + (vote === "no" ? 1 : 0)) / Math.max(1, total)) * 100);

  const u = URGENCY[urgency] || URGENCY.medium;
  const catColor = CATEGORY_COLORS[category] ?? "#3b82f6";

  return (
    <article className="rounded-3xl border border-border/60 bg-surface p-4 shadow-sm">
      {/* Top bubbles */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div 
          className="inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-extrabold tracking-[0.5px] text-white"
          style={{ backgroundColor: catColor }}
        >
          {category.toUpperCase()}
        </div>
        
        <div className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider", u.cls)}>
          {u.label}
        </div>
        
        {aiRecommended && (
          <div className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-extrabold text-success">
            <Sparkles className="h-3 w-3" /> AI Recommended
          </div>
        )}
      </div>

      <h3 className="text-[15px] font-extrabold leading-tight tracking-[-0.2px] text-foreground">
        {title}
      </h3>

      {/* WHAT YOU'RE VOTING ON */}
      <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 p-3">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.5px] text-primary mb-1">
          WHAT YOU'RE VOTING ON
        </div>
        <p className="text-[13px] leading-snug text-foreground/90">
          {whyText}
        </p>
      </div>

      {/* Why it matters */}
      <button
        onClick={() => setShowWhy(!showWhy)}
        className="mt-3 flex w-full items-center justify-between rounded-xl border border-border/60 bg-surface/60 px-3 py-2 text-left active:bg-white/5"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-[13px] font-extrabold">Why it matters <span className="text-muted-foreground">(tap to expand)</span></span>
        </div>
        <span className="text-xs text-muted-foreground">{showWhy ? "−" : "+"}</span>
      </button>
      {showWhy && (
        <div className="mt-1.5 rounded-xl border border-border/40 bg-surface/40 p-3 text-[13px] leading-snug text-foreground/85">
          {whyText}
        </div>
      )}

      {/* Pros & Cons */}
      <button
        onClick={() => setShowProsCons(!showProsCons)}
        className="mt-2 flex w-full items-center justify-between rounded-xl border border-border/60 bg-surface/60 px-3 py-2 text-left active:bg-white/5"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-[13px] font-extrabold">
            <span className="text-success">Pros</span> & <span className="text-destructive">Cons</span> <span className="text-muted-foreground">(tap to expand)</span>
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{showProsCons ? "−" : "+"}</span>
      </button>
      {showProsCons && (
        <div className="mt-1.5 grid grid-cols-1 gap-2">
          <div className="rounded-xl border border-success/30 bg-success/5 p-3">
            <div className="mb-1 text-[11px] font-extrabold text-success">PROS</div>
            <ul className="space-y-1 text-[12.5px] text-foreground/85">
              {prosList.map((p, i) => <li key={i}>• {p}</li>)}
            </ul>
          </div>
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
            <div className="mb-1 text-[11px] font-extrabold text-destructive">CONS</div>
            <ul className="space-y-1 text-[12.5px] text-foreground/85">
              {consList.map((c, i) => <li key={i}>• {c}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* Verified District Pulse */}
      <div className="mt-4 rounded-2xl border border-success/20 bg-success/5 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span className="text-[11px] font-extrabold text-success">VERIFIED DISTRICT PULSE</span>
          </div>
          <span className="text-[15px] font-extrabold tabular-nums text-success">{pulse}%</span>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">support among verified voters in your district</p>

        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted flex">
          <div className="h-full bg-success" style={{ width: `${yesPct}%` }} />
          <div className="h-full bg-destructive" style={{ width: `${noPct}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px] font-medium">
          <span className="text-success">{yesPct}% Yes</span>
          <span className="text-destructive">{noPct}% No</span>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        {Math.round((yes / Math.max(1, yes + no + unsure)) * 100)}% of your neighbors voted YES on this.
      </p>

      {/* Voting buttons */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          onClick={() => castVote("yes")}
          disabled={voted}
          className={cn(
            "flex h-11 items-center justify-center rounded-2xl text-sm font-extrabold transition active:scale-[0.985]",
            vote === "yes" ? "bg-success text-white" : "bg-success/10 text-success hover:bg-success/15",
            voted && vote !== "yes" && "opacity-40"
          )}
        >
          YES
        </button>
        <button
          onClick={() => castVote("unsure")}
          disabled={voted}
          className={cn(
            "flex h-11 items-center justify-center rounded-2xl text-sm font-extrabold transition active:scale-[0.985]",
            vote === "unsure" ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary/15",
            voted && vote !== "unsure" && "opacity-40"
          )}
        >
          UNSURE
        </button>
        <button
          onClick={() => castVote("no")}
          disabled={voted}
          className={cn(
            "flex h-11 items-center justify-center rounded-2xl text-sm font-extrabold transition active:scale-[0.985]",
            vote === "no" ? "bg-destructive text-white" : "bg-destructive/10 text-destructive hover:bg-destructive/15",
            voted && vote !== "no" && "opacity-40"
          )}
        >
          NO
        </button>
      </div>

      {/* IMPROVED GREEN SUCCESS MESSAGE */}
      {voted && (
        <div className="mt-3 rounded-2xl border border-success/30 bg-success/10 p-3.5 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-center gap-2 text-success">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20">
              <Check className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-[13px] font-extrabold">Vote recorded & sent to your representative</span>
          </div>
          <p className="mt-1 text-[11.5px] text-success/85">
            Thank you for making your voice heard.
          </p>
        </div>
      )}
    </article>
  );
}
