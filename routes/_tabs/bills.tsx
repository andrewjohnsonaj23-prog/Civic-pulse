import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Sparkles, GitMerge, Users, MessageSquare, Megaphone, Send, Plus,
  FileText, CheckCircle2, Loader2, MessagesSquare, ArrowBigUp,
  Lightbulb, Flag, MapPin, ShieldCheck, ChevronRight, X, Pin,
  Rocket, Radio, SlidersHorizontal, Clock, UserPlus, CircleUserRound,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { BILLS, CATEGORY_COLORS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_tabs/bills")({
  component: BillFactory,
  head: () => ({ meta: [{ title: "Bill Factory — CivicPulse" }] }),
});

type SegTab = "for-you" | "popular" | "discuss" | "drafts" | "contributions";

const SEG_TABS: { id: SegTab; label: string }[] = [
  { id: "for-you", label: "For You" },
  { id: "popular", label: "Popular" },
  { id: "discuss", label: "Discuss" },
  { id: "drafts", label: "My Drafts" },
  { id: "contributions", label: "My Contributions" },
];

// ---------- Discussion mock data ----------
type RoomKind = "amendment" | "strategy" | "local";
type Room = {
  kind: RoomKind;
  label: string;
  icon: typeof Lightbulb;
  tint: string;
  count: number;
  newToday: number;
  lastActivity: string; // e.g. "2m ago"
  liveNow?: number;
  top: { author: string; text: string; votes: number; pinned?: boolean };
};

const ROOMS_BY_BILL: Record<string, Room[]> = {
  b1: [
    { kind: "amendment", label: "Amendment Ideas", icon: Lightbulb, tint: "primary", count: 42, newToday: 7, lastActivity: "4m ago", liveNow: 3,
      top: { author: "Priya R. · Verified D7", text: "Add language requiring solar-ready rooftops on every rebuilt school wing.", votes: 184, pinned: true } },
    { kind: "strategy", label: "Strategy & Organizing", icon: Flag, tint: "warning", count: 18, newToday: 4, lastActivity: "12m ago", liveNow: 6,
      top: { author: "Marcus T. · Verified D7", text: "Coordinate testimony at the Mar 14 school board meeting — sign-up thread inside.", votes: 96 } },
    { kind: "local", label: "Local Action", icon: MapPin, tint: "success", count: 11, newToday: 2, lastActivity: "1h ago",
      top: { author: "Lina O. · Verified D7", text: "Saturday canvass at Maple & 8th — meet 10am at the library.", votes: 64 } },
  ],
  b2: [
    { kind: "amendment", label: "Amendment Ideas", icon: Lightbulb, tint: "primary", count: 23, newToday: 5, lastActivity: "22m ago",
      top: { author: "Devon K. · Verified D7", text: "Exempt streets with active school zones from the 25mph cap — lower to 20mph instead.", votes: 71, pinned: true } },
    { kind: "strategy", label: "Strategy & Organizing", icon: Flag, tint: "warning", count: 9, newToday: 0, lastActivity: "2d ago",
      top: { author: "Sam W.", text: "Letter-to-editor template is in the doc. Needs 3 more signers.", votes: 28 } },
    { kind: "local", label: "Local Action", icon: MapPin, tint: "success", count: 6, newToday: 1, lastActivity: "5h ago",
      top: { author: "Rosa M. · Verified D7", text: "Speed gun citizen audit on 12th Ave this Sunday 9am.", votes: 19 } },
  ],
  b3: [
    { kind: "amendment", label: "Amendment Ideas", icon: Lightbulb, tint: "primary", count: 58, newToday: 12, lastActivity: "just now", liveNow: 8,
      top: { author: "Dr. A. Patel · Verified", text: "Require co-response model, not replacement — clinicians + officers for first 6 months.", votes: 312, pinned: true } },
    { kind: "strategy", label: "Strategy & Organizing", icon: Flag, tint: "warning", count: 34, newToday: 9, lastActivity: "1m ago", liveNow: 14,
      top: { author: "Jordan B.", text: "Council vote moved to Apr 2. We need 200 emails by Friday.", votes: 142 } },
    { kind: "local", label: "Local Action", icon: MapPin, tint: "success", count: 19, newToday: 3, lastActivity: "30m ago",
      top: { author: "Casey L. · Verified D7", text: "Town hall at the rec center Thursday 7pm — bring a neighbor.", votes: 88 } },
  ],
  b4: [
    { kind: "amendment", label: "Amendment Ideas", icon: Lightbulb, tint: "primary", count: 81, newToday: 0, lastActivity: "archived",
      top: { author: "Erin S. · Verified", text: "Closed: final language adopted the $35 cap + emergency 30-day supply provision.", votes: 421, pinned: true } },
    { kind: "strategy", label: "Strategy & Organizing", icon: Flag, tint: "warning", count: 47, newToday: 0, lastActivity: "archived",
      top: { author: "Team Lead · Mod", text: "Thanks to 5,820 signers. Committee hearing scheduled May 6.", votes: 188 } },
    { kind: "local", label: "Local Action", icon: MapPin, tint: "success", count: 22, newToday: 0, lastActivity: "archived",
      top: { author: "Ana V. · Verified D7", text: "Hosting a watch party at the community center for the hearing.", votes: 73 } },
  ],
  b5: [
    { kind: "amendment", label: "Amendment Ideas", icon: Lightbulb, tint: "primary", count: 14, newToday: 3, lastActivity: "1h ago",
      top: { author: "Helen G. · Verified D7", text: "Raise the income threshold to $75K to cover most retired teachers in D7.", votes: 52, pinned: true } },
    { kind: "strategy", label: "Strategy & Organizing", icon: Flag, tint: "warning", count: 4, newToday: 1, lastActivity: "3h ago",
      top: { author: "Ben C.", text: "Need a co-author with policy background. DM if interested.", votes: 17 } },
    { kind: "local", label: "Local Action", icon: MapPin, tint: "success", count: 2, newToday: 0, lastActivity: "1d ago",
      top: { author: "Mira J. · Verified D7", text: "Senior center outreach planning — Mondays at 4pm.", votes: 9 } },
  ],
};

// Lead authors — avatars (initial + tone) for top-of-card "author highlights"
const LEAD_AUTHORS: Record<string, { initial: string; name: string; role: string }[]> = {
  b1: [
    { initial: "P", name: "Priya R.", role: "Lead author" },
    { initial: "M", name: "Marcus T.", role: "Co-author" },
    { initial: "L", name: "Lina O.", role: "Co-author" },
  ],
  b2: [
    { initial: "D", name: "Devon K.", role: "Lead author" },
    { initial: "S", name: "Sam W.", role: "Co-author" },
  ],
  b3: [
    { initial: "A", name: "Dr. A. Patel", role: "Lead author" },
    { initial: "J", name: "Jordan B.", role: "Co-author" },
    { initial: "C", name: "Casey L.", role: "Co-author" },
  ],
  b4: [
    { initial: "E", name: "Erin S.", role: "Lead author" },
  ],
  b5: [
    { initial: "H", name: "Helen G.", role: "Lead author" },
    { initial: "B", name: "Ben C.", role: "Co-author" },
  ],
};

function tintClasses(tint: string) {
  switch (tint) {
    case "warning": return { text: "text-warning", bg: "bg-warning/12", ring: "ring-warning/25", solid: "bg-warning", dot: "bg-warning" };
    case "success": return { text: "text-success", bg: "bg-success/12", ring: "ring-success/25", solid: "bg-success", dot: "bg-success" };
    case "danger": return { text: "text-destructive", bg: "bg-destructive/14", ring: "ring-destructive/35", solid: "bg-destructive", dot: "bg-destructive" };
    default: return { text: "text-primary", bg: "bg-primary/12", ring: "ring-primary/25", solid: "bg-primary", dot: "bg-primary" };
  }
}

const AI_PROMPT_CHIPS = [
  "Cap rent hikes in District 7 to 5%/year",
  "Free transit for under-18s",
  "Require solar on new schools",
];

// Govt level per bill (for the Filter & Sort menu)
const BILL_LEVEL: Record<string, "Federal" | "State" | "Local"> = {
  b1: "Local", b2: "Local", b3: "Local", b4: "State", b5: "State",
};

const FILTER_CATEGORIES = [
  "Education", "Infrastructure", "Taxes", "Public Safety",
  "Healthcare", "Housing", "Transit", "Environment",
] as const;

const FILTER_LEVELS = ["Federal", "State", "Local"] as const;

type SortKey = "supported" | "newest" | "threshold";
const SORT_LABELS: Record<SortKey, string> = {
  supported: "Most Supported",
  newest: "Newest",
  threshold: "Closest to Threshold",
};

// Journey stages — used for the Bill Journey Tracker
const JOURNEY: { key: string; label: string }[] = [
  { key: "draft", label: "Draft" },
  { key: "gathering", label: "Support" },
  { key: "reps", label: "Reps" },
  { key: "media", label: "Media" },
  { key: "law", label: "Law" },
];
function journeyStep(stage: string): number {
  switch (stage) {
    case "Drafting": return 0;
    case "Gathering Support": return 1;
    case "Threshold Met": return 2;
    case "In Committee": return 3;
    case "Delivered": return 4;
    default: return 1;
  }
}


// ---------- Main ----------
function BillFactory() {
  const [tab, setTab] = useState<SegTab>("for-you");
  const [draft, setDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [openRoom, setOpenRoom] = useState<{ billId: string; kind: RoomKind } | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("supported");
  const [catFilters, setCatFilters] = useState<Set<string>>(new Set());
  const [levelFilters, setLevelFilters] = useState<Set<string>>(new Set());

  const generate = () => {
    if (!draft.trim()) return;
    setGenerating(true);
    setAiSuggestion(null);
    setTimeout(() => {
      setAiSuggestion(
        `Working title: "${draft.slice(0, 40)}${draft.length > 40 ? "…" : ""} Act"\n\nSummary: A District 7 community-drafted measure. AI found 2 similar drafts and suggests merging for stronger impact (combined 612 supporters).\n\nKey provisions auto-suggested:\n  • Establish a working group within 60 days\n  • Allocate seed funding from district reserves\n  • Annual public progress report`,
      );
      setGenerating(false);
    }, 1200);
  };

  const totalSupporters = BILLS.reduce((s, b) => s + b.supporters, 0);
  const delivered = BILLS.filter(b => b.stage === "Delivered").length;
  const activeFilterCount = catFilters.size + levelFilters.size;

  const sortedBills = useMemo(() => {
    let base: typeof BILLS = BILLS;
    if (tab === "drafts") base = BILLS.filter(b => b.stage === "Drafting");
    else if (tab === "contributions") base = BILLS.filter(b => ["b1", "b3"].includes(b.id));

    // Filters
    if (catFilters.size > 0) base = base.filter(b => catFilters.has(b.category));
    if (levelFilters.size > 0) base = base.filter(b => levelFilters.has(BILL_LEVEL[b.id] ?? "Local"));

    // Sort
    const arr = [...base];
    if (sortBy === "supported" || tab === "popular") {
      arr.sort((a, b) => b.supporters - a.supporters);
    } else if (sortBy === "newest") {
      // Newest = drafting/early stages first, then by reverse id
      const stageOrder: Record<string, number> = {
        "Drafting": 0, "Gathering Support": 1, "Threshold Met": 2, "In Committee": 3, "Delivered": 4,
      };
      arr.sort((a, b) => (stageOrder[a.stage] - stageOrder[b.stage]) || b.id.localeCompare(a.id));
    } else if (sortBy === "threshold") {
      arr.sort((a, b) => (b.supporters / b.threshold) - (a.supporters / a.threshold));
    }
    return arr;
  }, [tab, sortBy, catFilters, levelFilters]);

  const toggleSet = (set: Set<string>, key: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key); else next.add(key);
    setter(next);
  };

  return (
    <div className="safe-top">
      <header className="px-5 pb-5 pt-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-2.5 w-2.5" /> Citizen Bill Factory
          </span>
        </div>
        <h1 className="mt-2.5 text-[24px] font-bold leading-[1.15] tracking-tight text-balance">
          Draft, refine & push
          <span className="block bg-gradient-primary bg-clip-text text-transparent">new bills from the people.</span>
        </h1>
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
          This is where citizens <span className="font-semibold text-foreground">create and vote on new bills made by the people</span> — not existing congressional legislation.
        </p>
      </header>

      {/* Segmented tabs */}
      <div className="sticky top-0 z-20 -mt-1 bg-background/85 px-5 pb-3 pt-1 backdrop-blur-2xl">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SEG_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold tracking-tight transition-all active:scale-95",
                tab === t.id
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "bg-surface text-muted-foreground ring-1 ring-border/60 hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "for-you" && (
        <>
          <SectionDivider label="1 · Draft New Bill" sub="Start from a plain-language idea" />

          {/* AI Drafter — collaborative + powerful */}
          <section className="mx-5 mt-2 overflow-hidden rounded-2xl border border-primary/40 bg-gradient-card shadow-card">
            <div className="flex items-center gap-3 border-b border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 py-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.5} />
                <span className="absolute inset-0 rounded-xl pulse-ring" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold tracking-tight">AI Drafting Assistant</span>
                  <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-success ring-1 ring-success/25">
                    Smart
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Describe a change in plain language — we'll structure it as a bill.
                </div>
              </div>
            </div>

            <div className="p-4">
              {/* Example prompt chips */}
              <div className="mb-2.5 flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Try</span>
                <div className="flex flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {AI_PROMPT_CHIPS.map(p => (
                    <button
                      key={p}
                      onClick={() => setDraft(p)}
                      className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10.5px] font-semibold text-primary ring-1 ring-primary/25 transition-all hover:bg-primary/20 active:scale-95"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={3}
                placeholder="e.g. Require new buildings over 5 stories to include affordable housing units..."
                className="w-full resize-none rounded-xl bg-input/60 px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none ring-1 ring-border/60 focus:ring-2 focus:ring-primary"
              />

              {/* AI capability tags */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-surface/80 px-2 py-0.5 ring-1 ring-border/50">
                  <CheckCircle2 className="h-2.5 w-2.5 text-success" strokeWidth={3} /> Legal-grade language
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface/80 px-2 py-0.5 ring-1 ring-border/50">
                  <GitMerge className="h-2.5 w-2.5 text-primary" strokeWidth={3} /> Finds similar drafts
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface/80 px-2 py-0.5 ring-1 ring-border/50">
                  <Users className="h-2.5 w-2.5 text-warning" strokeWidth={3} /> Suggests coauthors
                </span>
              </div>

              {/* AI Similar Bills — quiet suggestions to merge effort */}
              <div className="mt-3 rounded-xl border border-border/60 bg-surface/40 px-3 py-2.5">
                <div className="mb-1.5 flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="h-2.5 w-2.5 text-primary/80" strokeWidth={3} />
                  People also drafted
                </div>
                <ul className="space-y-1">
                  {[
                    { title: "Affordable Housing in New Developments", supporters: 412 },
                    { title: "School Zone Speed Limit Reduction", supporters: 286 },
                    { title: "Senior Property Tax Relief Expansion", supporters: 198 },
                  ].map((s) => (
                    <li key={s.title} className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => setDraft(s.title)}
                        className="min-w-0 flex-1 truncate text-left text-[11.5px] font-medium text-foreground/90 transition-colors hover:text-primary"
                      >
                        {s.title}
                      </button>
                      <span className="shrink-0 text-[10px] font-semibold tabular-nums text-muted-foreground">
                        {s.supporters.toLocaleString()} supporters
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={generate}
                disabled={!draft.trim() || generating}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-[13px] font-bold tracking-wide text-primary-foreground shadow-glow transition-all active:scale-[0.97] disabled:opacity-50"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? "Drafting your bill…" : "Generate Bill Draft"}
              </button>

              {aiSuggestion && (
                <div className="fade-up mt-3 rounded-xl border border-success/30 bg-success/5 p-3.5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-success">
                      <CheckCircle2 className="h-3 w-3" /> Draft ready
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground">Generated in 1.2s</span>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-[12.5px] leading-relaxed text-foreground/95">
                    {aiSuggestion}
                  </pre>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 rounded-lg bg-gradient-primary px-3 py-2.5 text-xs font-bold tracking-wide text-primary-foreground shadow-glow active:scale-[0.97]">
                      Publish for signatures
                    </button>
                    <button className="flex items-center gap-1 rounded-lg bg-surface-elevated px-3 py-2.5 text-xs font-semibold ring-1 ring-border/60 active:scale-[0.97]">
                      <GitMerge className="h-3.5 w-3.5" /> Merge
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Stats strip */}
          <div className="mx-5 mt-6 grid grid-cols-3 gap-3">
            <Stat icon={FileText} value={BILLS.length} label="Active" />
            <Stat icon={Users} value={totalSupporters.toLocaleString()} label="Supporters" />
            <Stat icon={Megaphone} value={delivered} label="Delivered" tone="success" />
          </div>

          <SectionDivider label="2 · Active & Popular Bills" sub="Support, co-sponsor, push to media" />
        </>
      )}


      {tab === "discuss" ? (
        <DiscussFeed onOpen={(billId, kind) => setOpenRoom({ billId, kind })} />
      ) : (
        <section className="px-5 pb-14 pt-10">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-[15px] font-bold tracking-tight">
              {tab === "popular" ? "Most-supported bills" :
                tab === "drafts" ? "Your drafts" :
                  tab === "contributions" ? "Bills you've shaped" :
                    "Active community bills"}
            </h2>
            <div className="flex items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "relative flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold tracking-tight ring-1 transition-all active:scale-95",
                      activeFilterCount > 0
                        ? "text-primary ring-primary/40 bg-primary/10"
                        : "text-muted-foreground ring-border/60 hover:text-foreground",
                    )}
                  >
                    <SlidersHorizontal className="h-3 w-3" />
                    Filter & Sort
                    {activeFilterCount > 0 && (
                      <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-extrabold text-primary-foreground tabular-nums">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 border-border/70 bg-surface-elevated/95 backdrop-blur-xl">
                  <DropdownMenuLabel className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Sort by
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={v => setSortBy(v as SortKey)}>
                    {(Object.keys(SORT_LABELS) as SortKey[]).map(k => (
                      <DropdownMenuRadioItem key={k} value={k} className="text-[12.5px] font-semibold">
                        {SORT_LABELS[k]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Filter by category
                  </DropdownMenuLabel>
                  <div className="max-h-40 overflow-y-auto">
                    {FILTER_CATEGORIES.map(c => (
                      <DropdownMenuCheckboxItem
                        key={c}
                        checked={catFilters.has(c)}
                        onCheckedChange={() => toggleSet(catFilters, c, setCatFilters)}
                        onSelect={e => e.preventDefault()}
                        className="text-[12.5px] font-semibold"
                      >
                        {c}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Filter by level
                  </DropdownMenuLabel>
                  {FILTER_LEVELS.map(l => (
                    <DropdownMenuCheckboxItem
                      key={l}
                      checked={levelFilters.has(l)}
                      onCheckedChange={() => toggleSet(levelFilters, l, setLevelFilters)}
                      onSelect={e => e.preventDefault()}
                      className="text-[12.5px] font-semibold"
                    >
                      {l}
                    </DropdownMenuCheckboxItem>
                  ))}

                  {activeFilterCount > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => { setCatFilters(new Set()); setLevelFilters(new Set()); }}
                        className="justify-center text-[11.5px] font-bold text-destructive focus:text-destructive"
                      >
                        Clear all filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <button className="flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-bold text-primary ring-1 ring-primary/30 active:scale-95">
                <Plus className="h-3 w-3" /> New
              </button>
            </div>
          </div>
          <div className="space-y-8">
            {sortedBills.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-surface/40 p-8 text-center text-[12.5px] text-muted-foreground">
                Nothing here yet. Start a draft to see it appear.
              </div>
            ) : (
              (tab === "for-you" ? sortedBills.slice(0, 3) : sortedBills).map(bill => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onDiscuss={kind => setOpenRoom({ billId: bill.id, kind })}
                />
              ))
            )}
          </div>

          {tab === "for-you" && sortedBills.length > 3 && (
            <button
              onClick={() => setTab("popular")}
              className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/35 bg-primary/[0.08] px-4 py-3 text-[12.5px] font-extrabold tracking-wide text-primary shadow-card transition-all hover:bg-primary/[0.14] active:scale-[0.98]"
            >
              See All Active Bills
              <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold tabular-nums ring-1 ring-primary/30">
                {sortedBills.length}
              </span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}

          {tab === "for-you" && (
            <>
              <SectionDivider label="3 · Action Rooms" sub="Help refine this for real families — verified neighbors only" />

              {/* Your Active Circles — co-sponsor groups the user belongs to */}
              <div className="mx-5 mt-2 mb-3 flex items-center gap-3 rounded-2xl border border-border/70 bg-gradient-card px-4 py-3 shadow-card">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                  <CircleUserRound className="h-4 w-4" strokeWidth={2.25} />
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Co-Sponsor Circles</div>
                  <div className="mt-0.5 text-[13px] font-semibold tracking-tight">
                    Your Active Circles <span className="text-muted-foreground font-bold tabular-nums">· 3</span>
                  </div>
                </div>
                <button
                  onClick={() => setTab("discuss")}
                  title="Join the quiet effort — peaceful, verified neighbors working toward stability."
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/12 px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-primary ring-1 ring-primary/25 transition-colors hover:bg-primary/20 active:scale-95"
                >
                  Join the quiet effort
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="mt-0 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.08] via-surface/40 to-surface/40 p-4 shadow-card mx-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                    <MessagesSquare className="h-[18px] w-[18px] text-primary" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 leading-tight">
                    <div className="text-[15px] font-extrabold tracking-tight">Action Rooms</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">Amendments · Strategy · Local action — moderated, verified-only.</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTab("discuss")}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-primary px-3 py-2.5 text-[12px] font-bold tracking-wide text-primary-foreground shadow-glow active:scale-[0.97]"
                  >
                    <MessagesSquare className="h-3.5 w-3.5" /> Enter Action Rooms
                  </button>
                  <button
                    onClick={() => { setTab("for-you"); if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-surface px-3 py-2.5 text-[12px] font-bold tracking-wide text-primary ring-1 ring-primary/30 active:scale-[0.97]"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> AI Assistant
                  </button>
                </div>
                {/* + Join Circle — compact, optional companion to AI Assistant */}
                <button
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-surface/60 px-3 py-2 text-[11.5px] font-bold tracking-wide text-muted-foreground ring-1 ring-border/60 transition-colors hover:text-primary hover:ring-primary/30 active:scale-[0.97]"
                >
                  <UserPlus className="h-3.5 w-3.5" /> + Join Circle
                </button>
                <button
                  onClick={() => setTab("discuss")}
                  className="mt-3 flex w-full items-center justify-center gap-1 text-[11.5px] font-semibold tracking-wide text-muted-foreground transition-colors hover:text-primary"
                >
                  See All Discussions
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </>
          )}
        </section>
      )}


      {openRoom && (
        <RoomSheet
          billId={openRoom.billId}
          kind={openRoom.kind}
          onClose={() => setOpenRoom(null)}
        />
      )}
    </div>
  );
}

// ---------- Section divider — bold numbered heading, strong separation ----------
function SectionDivider({ label, sub }: { label: string; sub?: string }) {
  // Parse "1 · Title" → number + title
  const m = label.match(/^(\d+)\s*[·.\-]\s*(.+)$/);
  const num = m?.[1];
  const title = m?.[2] ?? label;
  return (
    <div className="mt-14">
      {/* Tinted separator band — strong breath between sections */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="pointer-events-none h-5 w-full bg-gradient-to-b from-primary/[0.06] to-transparent" />
      <div className="mx-5 mb-4 mt-3 flex items-center gap-3">
        {num && (
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-[18px] font-extrabold tabular-nums text-primary ring-1 ring-primary/35"
            style={{ boxShadow: "0 0 22px -8px var(--primary-glow), inset 0 1px 0 0 oklch(1 0 0 / 6%)" }}
          >
            {num}
          </span>
        )}
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[19px] font-extrabold uppercase tracking-[0.04em] text-foreground">
            {title}
          </div>
          {sub && (
            <div className="mt-1 text-[11.5px] font-medium text-muted-foreground">{sub}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Stat ----------
function Stat({
  icon: Icon, value, label, tone = "default",
}: { icon: typeof FileText; value: string | number; label: string; tone?: "default" | "success" }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-gradient-card p-4 shadow-card">
      <Icon className={cn("h-4 w-4", tone === "success" ? "text-success" : "text-primary")} />
      <div className="mt-2 text-[20px] font-bold tabular-nums tracking-tight">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}


// ---------- Action button (Boost / Push to Reps / Push to Media) ----------
function ActionBtn({
  icon: Icon, label, sub, tone,
}: { icon: typeof Rocket; label: string; sub: string; tone: "primary" | "success" | "warning" | "danger" }) {
  const t = tintClasses(tone);
  const danger = tone === "danger";
  // Deeper, dignified patriotic red (#B71C1C ≈ oklch(0.42 0.19 25))
  const deepRed = "oklch(0.42 0.19 25)";
  const deeperRed = "oklch(0.30 0.16 25)";
  return (
    <button
      className={cn(
        "group relative flex flex-col items-center justify-center gap-1.5 rounded-xl border bg-surface/50 px-2 py-4 text-center transition-all duration-300 hover:bg-surface/80 hover:-translate-y-0.5 active:scale-[0.96]",
        t.ring,
        t.text,
      )}
      style={{
        boxShadow: danger
          ? `inset 0 1px 0 0 oklch(1 0 0 / 5%), 0 0 0 1px color-mix(in oklab, ${deepRed} 50%, transparent), 0 0 18px -10px color-mix(in oklab, ${deepRed} 70%, transparent)`
          : "inset 0 1px 0 0 oklch(1 0 0 / 6%), 0 0 0 1px color-mix(in oklab, currentColor 18%, transparent), 0 0 22px -10px color-mix(in oklab, currentColor 70%, transparent), 0 0 34px -10px var(--primary-glow)",
      }}
    >
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg ring-1 transition-transform group-hover:scale-110", t.bg, t.ring)}
           style={{
             boxShadow: danger
               ? `0 0 16px -6px ${deepRed}, inset 0 0 0 1px color-mix(in oklab, ${deepRed} 45%, transparent)`
               : "0 0 18px -6px currentColor",
             ...(danger ? { color: deepRed } : {}),
           }}>
        <Icon className={cn("h-[18px] w-[18px]")} style={danger ? { color: deepRed } : undefined} strokeWidth={2.5} />
      </div>
      <span className="text-[11.5px] font-extrabold tracking-tight text-foreground">{label}</span>
      <span className="text-[9px] font-medium leading-none text-muted-foreground/80">{sub}</span>
      <span
        className={cn(
          "mt-1 rounded-full px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-[0.08em] ring-1",
          danger ? "text-white" : cn(t.bg, t.text, t.ring),
        )}
        style={
          danger
            ? {
                backgroundImage: `linear-gradient(135deg, ${deepRed}, ${deeperRed})`,
                boxShadow: `0 0 10px -4px ${deepRed}, inset 0 1px 0 0 oklch(1 0 0 / 8%)`,
                borderColor: `color-mix(in oklab, ${deepRed} 60%, transparent)`,
              }
            : undefined
        }
      >
        Tap to use
      </span>
    </button>
  );
}

// ---------- Bill card ----------
function BillCard({
  bill, onDiscuss,
}: {
  bill: typeof BILLS[number];
  onDiscuss: (kind: RoomKind) => void;
}) {
  const [supported, setSupported] = useState(false);
  const pct = Math.min(100, Math.round((bill.supporters / bill.threshold) * 100));
  const met = bill.supporters >= bill.threshold;
  const delivered = bill.stage === "Delivered";
  const color = CATEGORY_COLORS[bill.category] ?? "var(--color-primary)";
  const rooms = ROOMS_BY_BILL[bill.id] ?? [];
  const totalComments = rooms.reduce((s, r) => s + r.count, 0);
  const totalNew = rooms.reduce((s, r) => s + r.newToday, 0);
  const totalLive = rooms.reduce((s, r) => s + (r.liveNow ?? 0), 0);
  const authors = LEAD_AUTHORS[bill.id] ?? [];

  return (
    <article className="fade-up group rounded-2xl border border-border/70 bg-gradient-card p-6 shadow-card transition-all duration-300 hover:border-primary/35 hover:-translate-y-[1px] hover:shadow-[0_18px_44px_-24px_oklch(0.79_0.13_230/30%)] active:scale-[0.995] cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{ color, backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)` }}
        >
          {bill.category}
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
            delivered ? "bg-success text-success-foreground shadow-[0_0_14px_-2px_oklch(0.72_0.21_148/60%)]" :
              met ? "bg-warning text-warning-foreground" :
                "bg-surface text-muted-foreground ring-1 ring-border/60",
          )}
        >
          {bill.stage}
        </span>
      </div>

      {/* Moderated badge + AI momentum signal */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <div className="inline-flex items-center gap-1 rounded-full border border-success/25 bg-success/[0.07] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-success/90">
          <ShieldCheck className="h-2.5 w-2.5" strokeWidth={3} />
          Moderated · Verified users only
        </div>
        {!delivered && pct >= 75 && (
          <div
            className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/[0.07] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-primary/85"
            title="AI signal: this bill is gaining strong, sustained support in your district."
          >
            <Sparkles className="h-2.5 w-2.5" strokeWidth={3} />
            High Community Momentum
          </div>
        )}
      </div>

      <h3 className="mt-3 text-[15.5px] font-semibold leading-snug tracking-tight">{bill.title}</h3>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{bill.summary}</p>

      <div className="mt-3.5 space-y-1.5">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="font-bold tabular-nums">
            {(bill.supporters + (supported ? 1 : 0)).toLocaleString()}
            <span className="font-normal text-muted-foreground"> / {bill.threshold.toLocaleString()}</span>
          </span>
          <div className="flex items-center gap-1.5">
            {/* Living Petition — subtle, gradient intensifies with pressure */}
            {!delivered && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.08em] ring-1"
                style={{
                  color: pct >= 90
                    ? "oklch(0.65 0.18 28)"
                    : pct >= 60
                      ? "oklch(0.72 0.14 78)"
                      : "oklch(0.62 0.09 168)",
                  backgroundColor: pct >= 90
                    ? "color-mix(in oklab, oklch(0.65 0.18 28) 12%, transparent)"
                    : pct >= 60
                      ? "color-mix(in oklab, oklch(0.72 0.14 78) 12%, transparent)"
                      : "color-mix(in oklab, oklch(0.62 0.09 168) 12%, transparent)",
                  borderColor: "transparent",
                  boxShadow: `inset 0 0 0 1px color-mix(in oklab, currentColor 25%, transparent)`,
                }}
                title="This is a living petition — pressure grows as supporters join."
              >
                <span className="h-1 w-1 rounded-full" style={{ backgroundColor: "currentColor" }} />
                Living Petition
              </span>
            )}
            <span className={cn(
              "font-bold tabular-nums",
              met ? "text-success" : pct >= 75 ? "text-warning" : "text-muted-foreground",
            )}>
              {met ? "Threshold met ✓" : `${pct}% to threshold`}
            </span>
          </div>
        </div>
        <div className="relative h-2.5 overflow-hidden rounded-full bg-muted/70">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full",
              delivered ? "bg-gradient-success" : met ? "bg-gradient-success" : "bg-gradient-primary",
              !delivered && "shadow-[0_0_12px_-2px_oklch(0.79_0.13_230/70%)]",
            )}
            style={{ width: `${pct}%`, transition: "width 700ms cubic-bezier(0.22,1,0.36,1)" }}
          />
          {/* Milestone ticks at 25/50/75 */}
          {[25, 50, 75].map(m => (
            <span
              key={m}
              className="absolute top-0 h-full w-px bg-background/70"
              style={{ left: `${m}%` }}
            />
          ))}
        </div>
        {!delivered && !met && pct >= 60 && (
          <div className="pt-0.5 text-[10.5px] font-semibold text-warning">
            Only {(bill.threshold - bill.supporters).toLocaleString()} more supporters needed in your District 7.
          </div>
        )}
        {/* Pressure Building — single clean line, threshold reached */}
        {!delivered && met && (
          <div className="inline-flex items-center gap-1.5 pt-0.5 text-[10.5px] font-semibold">
            <span
              className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.08em] ring-1 ring-destructive/30"
              style={{
                color: "oklch(0.65 0.18 28)",
                backgroundColor: "color-mix(in oklab, oklch(0.65 0.18 28) 12%, transparent)",
              }}
            >
              <span className="h-1 w-1 animate-pulse rounded-full" style={{ backgroundColor: "currentColor" }} />
              Pressure Building
            </span>
            <span className="text-muted-foreground">
              · Auto-escalates in <span className="font-bold tabular-nums text-foreground">7 days</span>
            </span>
          </div>
        )}
        {/* Calm deadline timer — derived per bill, stable feel */}
        {!delivered && (() => {
          const daysLeft = met ? 7 : Math.max(3, 28 - Math.round(pct / 4));
          return (
            <div className="flex items-center gap-1.5 pt-1 text-[10.5px] font-semibold text-muted-foreground">
              <Clock className="h-3 w-3 text-muted-foreground/80" strokeWidth={2.5} />
              <span className="tabular-nums">Closes in {daysLeft} days</span>
              <span className="text-muted-foreground/60">· quiet, steady support</span>
            </div>
          );
        })()}
        {!delivered && (
          <p className="pt-1 text-[10.5px] font-medium leading-snug text-muted-foreground/85">
            This is building real change — quiet, verified support compounds every day.
          </p>
        )}
      </div>

      {/* PRIMARY ACTION — restrained secondary button, balanced with peer actions */}
      {!delivered && (
        <div className="mt-7 flex flex-col items-center">
          <button
            onClick={() => setSupported(s => !s)}
            className={cn(
              "group relative inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-[12.5px] font-bold tracking-tight transition-all duration-300 ease-out active:scale-[0.985]",
              supported
                ? "bg-success/12 text-success ring-2 ring-success/55 shadow-[inset_0_1px_0_0_oklch(1_0_0/10%),0_2px_6px_-2px_oklch(0_0_0/40%),0_0_18px_-8px_oklch(0.72_0.21_148/55%)]"
                : "bg-primary/10 text-primary ring-2 ring-primary/45 hover:bg-primary/16 shadow-[inset_0_1px_0_0_oklch(1_0_0/10%),0_2px_6px_-2px_oklch(0_0_0/40%),0_0_18px_-8px_oklch(0.79_0.13_230/55%)]",
            )}
          >
            {supported ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.75} />
                <span>You're supporting</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" strokeWidth={2.5} />
                <span>Support This Bill</span>
              </>
            )}
          </button>
          <p className="mt-2.5 text-center text-[10.5px] font-medium text-muted-foreground/75">
            {supported
              ? "Changeable for 48h · Your voice was added to the count."
              : "Adds your verified voice to the District 7 count."}
          </p>
        </div>
      )}



      {/* Discuss strip — Action Rooms preview */}
      {rooms.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.08] via-surface/40 to-surface/40 shadow-[0_0_0_1px_oklch(0.79_0.13_230/8%),0_8px_24px_-16px_oklch(0.79_0.13_230/40%)]">
          <div className="flex items-center justify-between gap-2 border-b border-border/40 px-3.5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
                <MessagesSquare className="h-4 w-4 text-primary" strokeWidth={2.5} />
              </div>
              <div className="leading-tight">
                <div className="text-[15px] font-extrabold tracking-tight">Action Rooms</div>
                <div className="mt-0.5 text-[10.5px] font-medium text-muted-foreground">
                  Tap rooms below to collaborate · Moderated
                </div>
              </div>
            </div>
            {totalNew > 0 ? (
              <span className="flex items-center gap-1 rounded-full bg-success/15 px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-success ring-1 ring-success/25">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                {totalNew} new
              </span>
            ) : totalLive > 0 ? (
              <span className="flex items-center gap-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-primary ring-1 ring-primary/25">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                {totalLive} live
              </span>
            ) : null}
          </div>
          <div className="grid grid-cols-3 gap-3 px-4 pb-6 pt-5">
            {rooms.map(room => {
              const t = tintClasses(room.tint);
              return (
                <button
                  key={room.kind}
                  onClick={() => onDiscuss(room.kind)}
                  className={cn(
                    "group relative flex flex-col items-center justify-start gap-2 rounded-xl border bg-surface/50 px-1.5 pb-3.5 pt-4 text-center transition-all duration-300",
                    "hover:bg-surface/80 hover:-translate-y-0.5 active:scale-[0.96]",
                    t.ring,
                    t.text,
                  )}
                  style={{
                    boxShadow:
                      "inset 0 1px 0 0 oklch(1 0 0 / 6%), 0 0 0 1px color-mix(in oklab, currentColor 18%, transparent), 0 0 22px -10px color-mix(in oklab, currentColor 70%, transparent), 0 0 34px -10px var(--primary-glow)",
                  }}
                >
                  {room.newToday > 0 && (
                    <span
                      className={cn(
                        "absolute -right-1.5 -top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-extrabold leading-none tabular-nums",
                        t.bg, t.text,
                      )}
                      style={{
                        boxShadow:
                          "0 0 0 1px color-mix(in oklab, currentColor 14%, transparent), 0 0 6px -2px color-mix(in oklab, currentColor 55%, transparent)",
                      }}
                    >
                      <span className="block translate-y-[0.5px]">{room.newToday}</span>
                    </span>
                  )}
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg ring-1 transition-transform group-hover:scale-110",
                      t.bg, t.ring,
                    )}
                    style={{ boxShadow: "0 0 18px -6px currentColor" }}
                  >
                    <room.icon className={cn("h-[18px] w-[18px]", t.text)} strokeWidth={2.5} />
                  </div>
                  <span
                    className="block min-h-[26px] w-full text-[10px] font-extrabold leading-[1.2] tracking-tight text-foreground"
                    style={{ letterSpacing: "-0.015em" }}
                  >
                    {room.label}
                  </span>
                  <span className={cn("mt-0.5 rounded-full px-2 py-[3px] text-[10px] font-extrabold uppercase tracking-[0.1em] ring-1 transition-all group-hover:brightness-110 group-active:scale-95", t.bg, t.text, t.ring)}>
                    Tap to join
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Boost actions — three equal, consistent peer cards */}
      {!delivered && (() => {
        const goal = met ? 4000 : 2500;
        const raised = Math.round(goal * Math.min(0.92, 0.18 + pct / 180));
        const actions: { key: string; label: string; sub: string; icon: typeof Send; tint: string; hot?: boolean }[] = [
          { key: "reps",   label: "Push to Reps",  sub: "Verified messages routed to officials", icon: Send,      tint: "primary" },
          { key: "media",  label: "Boost to Media", sub: `$${raised.toLocaleString()} of $${goal.toLocaleString()} raised`, icon: Radio, tint: "warning", hot: met },
          { key: "social", label: "Boost to Social", sub: "Fund a targeted ad campaign",        icon: Megaphone, tint: "primary" },
        ];
        return (
          <div className="mt-7">
            <div className="mb-3 px-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Amplify this bill
            </div>
            <div className="grid grid-cols-3 gap-3">
              {actions.map(a => {
                const t = tintClasses(a.hot ? "danger" : a.tint);
                return (
                  <button
                    key={a.key}
                    className={cn(
                      "group relative flex flex-col items-center justify-start gap-2 rounded-xl bg-surface/50 px-1.5 pb-4 pt-4 text-center ring-[3px] transition-all duration-300 ease-out hover:bg-surface/80 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.94] active:brightness-110",
                      t.ring,
                    )}
                    style={{
                      boxShadow:
                        "inset 0 1px 0 0 oklch(1 0 0 / 12%), 0 3px 8px -2px oklch(0 0 0 / 50%), 0 0 30px -6px color-mix(in oklab, currentColor 75%, transparent)",
                    }}
                  >
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg ring-1", t.bg, t.ring)}>
                      <a.icon className={cn("h-[15px] w-[15px]", t.text)} strokeWidth={2.5} />
                    </div>
                    <span className="block min-h-[24px] w-full text-[10.5px] font-extrabold leading-[1.2] tracking-tight text-foreground">
                      {a.label}
                    </span>
                    <span className="block w-full px-0.5 text-[9.5px] font-medium leading-snug text-muted-foreground/85">
                      {a.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}



      <div className="mt-3.5 flex items-center gap-2 border-t border-border/60 pt-3 text-[11px]">
        {/* Author avatar stack */}
        {authors.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {authors.slice(0, 3).map((a, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-card",
                    i === 0 ? "bg-gradient-primary text-primary-foreground" :
                      i === 1 ? "bg-warning/25 text-warning" :
                        "bg-success/25 text-success",
                  )}
                  title={`${a.name} · ${a.role}`}
                >
                  {a.initial}
                </div>
              ))}
            </div>
            {bill.authors > authors.length && (
              <span className="text-[10.5px] font-bold text-muted-foreground tabular-nums">
                +{bill.authors - authors.length}
              </span>
            )}
          </div>
        )}
        <span className="flex items-center gap-1 font-medium text-muted-foreground">
          <MessageSquare className="h-3 w-3" /> <span className="font-bold text-foreground">{bill.amendments}</span>
        </span>
        {delivered ? (
          <span className="ml-auto flex items-center gap-1 font-bold text-success">
            <Megaphone className="h-3 w-3" /> Delivered
          </span>
        ) : supported ? (
          <span className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10.5px] font-bold text-success">
            <CheckCircle2 className="h-3 w-3" /> Supported
          </span>
        ) : null}

      </div>

      {/* Bill Journey Tracker — subtle horizontal stepper */}
      <JourneyTracker stage={bill.stage} delivered={delivered} />
    </article>
  );
}

// ---------- Discuss tab feed ----------
function DiscussFeed({ onOpen }: { onOpen: (billId: string, kind: RoomKind) => void }) {
  const activeBills = BILLS.filter(b => b.stage !== "Delivered");
  const totalRooms = activeBills.reduce((s, b) => s + (ROOMS_BY_BILL[b.id]?.length ?? 0), 0);
  const totalNewToday = activeBills.reduce(
    (s, b) => s + (ROOMS_BY_BILL[b.id] ?? []).reduce((x, r) => x + r.newToday, 0),
    0,
  );
  const totalLive = activeBills.reduce(
    (s, b) => s + (ROOMS_BY_BILL[b.id] ?? []).reduce((x, r) => x + (r.liveNow ?? 0), 0),
    0,
  );

  return (
    <section className="px-5 pb-6 pt-5">
      {/* Mod banner */}
      <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-success/30 bg-gradient-to-br from-success/[0.08] to-transparent p-3 shadow-card">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-success/15 ring-1 ring-success/30">
          <ShieldCheck className="h-3.5 w-3.5 text-success" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-[12px] font-bold tracking-tight">Action Rooms — focused, moderated collaboration</div>
          <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            Moderated rooms keep conversation on improving the bill — not general debate. Be specific, be kind, propose wording.
          </div>
        </div>
      </div>

      {/* Live activity strip */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        <ActivityStat label="Open rooms" value={totalRooms} tone="primary" />
        <ActivityStat label="New today" value={totalNewToday} tone="success" pulse />
        <ActivityStat label="Live now" value={totalLive} tone="warning" pulse />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-bold tracking-tight">Active rooms in your District 7</h2>
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          Live
        </span>
      </div>

      <div className="mb-4 inline-flex items-center gap-1 rounded-full border border-success/25 bg-success/[0.07] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-success/90">
        <ShieldCheck className="h-2.5 w-2.5" strokeWidth={3} />
        Moderated · Verified users only
      </div>

      <div className="space-y-4">
        {activeBills.map(bill => {
          const rooms = ROOMS_BY_BILL[bill.id] ?? [];
          const color = CATEGORY_COLORS[bill.category] ?? "var(--color-primary)";
          const billNew = rooms.reduce((s, r) => s + r.newToday, 0);
          const billLive = rooms.reduce((s, r) => s + (r.liveNow ?? 0), 0);
          return (
            <div key={bill.id} className="fade-up overflow-hidden rounded-2xl border border-border/70 bg-gradient-card shadow-card">
              {/* Bill header */}
              <div className="border-b border-border/40 px-3.5 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider"
                    style={{ color, backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)` }}
                  >
                    {bill.category}
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {rooms.reduce((s, r) => s + r.count, 0)} comments
                  </span>
                  {billLive > 0 && (
                    <span className="ml-auto flex items-center gap-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-primary ring-1 ring-primary/25">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                      {billLive} live
                    </span>
                  )}
                  {billLive === 0 && billNew > 0 && (
                    <span className="ml-auto rounded-full bg-success/15 px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-success ring-1 ring-success/25">
                      +{billNew} new
                    </span>
                  )}
                </div>
                <h3 className="mt-1.5 text-[14px] font-semibold leading-snug tracking-tight">{bill.title}</h3>
              </div>

              {/* Room list */}
              <div className="divide-y divide-border/30">
                {rooms.map(room => {
                  const t = tintClasses(room.tint);
                  return (
                    <button
                      key={room.kind}
                      onClick={() => onOpen(bill.id, room.kind)}
                      className="flex w-full items-center gap-2.5 bg-surface/30 px-3.5 py-2.5 text-left transition-all hover:bg-surface/60 active:scale-[0.995]"
                    >
                      <div className={cn("relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1", t.bg, t.ring)}>
                        <room.icon className={cn("h-[18px] w-[18px]", t.text)} strokeWidth={2.5} />
                        {room.newToday > 0 && (
                          <span className={cn(
                            "absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-extrabold ring-2 ring-card",
                            t.solid, "text-background",
                          )}>
                            {room.newToday}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12.5px] font-bold tracking-tight">{room.label}</span>
                          <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">· {room.count}</span>
                          {room.liveNow && (
                            <span className={cn("inline-flex items-center gap-0.5 text-[9.5px] font-bold", t.text)}>
                              <span className={cn("h-1 w-1 animate-pulse rounded-full", t.dot)} />
                              {room.liveNow} live
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                          <span>{room.lastActivity}</span>
                          <span className="text-muted-foreground/50">·</span>
                          <span className="flex items-center gap-0.5">
                            <ArrowBigUp className="h-2.5 w-2.5" />
                            {room.top.votes} top
                          </span>
                        </div>
                        <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-foreground/80">
                          {room.top.pinned && <Pin className="mr-0.5 inline h-2.5 w-2.5 text-warning" />}
                          “{room.top.text}”
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ActivityStat({
  label, value, tone, pulse,
}: { label: string; value: number; tone: "primary" | "success" | "warning"; pulse?: boolean }) {
  const t = tintClasses(tone);
  return (
    <div className={cn("rounded-xl border bg-gradient-card p-2.5 shadow-card", "border-border/60")}>
      <div className="flex items-center gap-1.5">
        {pulse && value > 0 && <span className={cn("h-1.5 w-1.5 animate-pulse rounded-full", t.dot)} />}
        <div className={cn("text-[20px] font-bold tabular-nums tracking-tight leading-none", t.text)}>{value}</div>
      </div>
      <div className="mt-1 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

// ---------- Room detail sheet ----------
function RoomSheet({
  billId, kind, onClose,
}: {
  billId: string;
  kind: RoomKind;
  onClose: () => void;
}) {
  const bill = BILLS.find(b => b.id === billId)!;
  const rooms = ROOMS_BY_BILL[billId] ?? [];
  const room = rooms.find(r => r.kind === kind)!;
  const t = tintClasses(room.tint);

  // mock comments
  const comments = [
    { ...room.top, votes: room.top.votes },
    { author: "Tessa Q. · Verified D7", text: "Strong support. Could we add a sunset clause to revisit after 2 years?", votes: 47 },
    { author: "Marc D.", text: "Has anyone modeled the budget impact? Want to see numbers before voting.", votes: 22 },
    { author: "Imani K. · Verified D7", text: "Local Action team — let's pair this with a flyering effort near the school.", votes: 14 },
  ];

  const [text, setText] = useState("");
  const [voted, setVoted] = useState<Record<number, boolean>>({});

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="fade-up flex max-h-[88vh] w-full max-w-[420px] flex-col overflow-hidden rounded-t-3xl border-t border-border bg-background shadow-[0_-12px_40px_-8px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-border/60 px-5 py-4">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1", t.bg, t.ring)}>
            <room.icon className={cn("h-5 w-5", t.text)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-primary ring-1 ring-primary/25">
                <CircleUserRound className="h-2.5 w-2.5" strokeWidth={2.5} />
                Circle: District 7 Housing
                <span className="font-bold tabular-nums text-primary/80">· 42 members</span>
              </span>
            </div>
            <div className="mt-1 text-[15px] font-bold tracking-tight">{room.label}</div>
            <div className="truncate text-[11px] text-muted-foreground">{bill.title}</div>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-surface active:scale-95">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Moderation banner */}
        <div className="flex items-center gap-2 border-b border-border/60 bg-success/8 px-5 py-2.5 text-[10.5px] font-semibold text-success">
          <ShieldCheck className="h-3.5 w-3.5" />
          Moderated · keep it about improving this bill
        </div>

        {/* Comments */}
        <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
          {comments.map((c, i) => {
            const v = voted[i];
            return (
              <div key={i} className="flex gap-2 rounded-xl border border-border/60 bg-surface/50 p-2.5">
                <button
                  onClick={() => setVoted(s => ({ ...s, [i]: !s[i] }))}
                  className={cn(
                    "flex h-12 w-9 shrink-0 flex-col items-center justify-center rounded-lg ring-1 transition-all active:scale-95",
                    v ? "bg-primary text-primary-foreground ring-primary shadow-glow" : "bg-background text-muted-foreground ring-border/60 hover:text-primary",
                  )}
                >
                  <ArrowBigUp className={cn("h-4 w-4", v && "fill-current")} />
                  <span className="text-[10px] font-bold tabular-nums">{c.votes + (v ? 1 : 0)}</span>
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-muted-foreground">
                    {c.pinned && (
                      <span className="flex items-center gap-0.5 rounded-full bg-warning/15 px-1.5 py-0.5 text-[9px] font-bold text-warning">
                        <Pin className="h-2.5 w-2.5" /> PINNED
                      </span>
                    )}
                    <span className="truncate">{c.author}</span>
                  </div>
                  <div className="mt-1 text-[12.5px] leading-relaxed text-foreground">{c.text}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Composer */}
        <div className="border-t border-border/60 bg-surface/40 p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={1}
              placeholder={
                kind === "amendment" ? "Propose specific wording…" :
                  kind === "strategy" ? "Share an organizing idea…" :
                    "Suggest a local action or event…"
              }
              className="flex-1 resize-none rounded-xl bg-background px-3 py-2.5 text-[13px] outline-none ring-1 ring-border/60 focus:ring-2 focus:ring-primary"
            />
            <button
              disabled={!text.trim()}
              onClick={() => setText("")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow transition-all active:scale-95 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Bill Journey Tracker ----------
function JourneyTracker({ stage, delivered }: { stage: string; delivered: boolean }) {
  const current = journeyStep(stage);
  return (
    <div className="mt-4 border-t border-border/50 pt-3.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground/80">
          Bill Journey
        </span>
        <span className={cn(
          "text-[9.5px] font-bold tracking-tight",
          delivered ? "text-success" : "text-primary/90",
        )}>
          {JOURNEY[current]?.label === "Support" ? "Gathering Support" : JOURNEY[current]?.label}
          {delivered ? " · Passed" : ""}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {JOURNEY.map((s, i) => {
          const reached = i <= current;
          const isCurrent = i === current;
          return (
            <div key={s.key} className="flex flex-1 items-center gap-1">
              <div className="flex flex-1 flex-col items-center gap-1">
                <span
                  className={cn(
                    "h-1.5 w-full rounded-full transition-all",
                    reached
                      ? (delivered ? "bg-success/80" : "bg-primary/80")
                      : "bg-muted/60",
                    isCurrent && !delivered && "shadow-[0_0_10px_-1px_var(--primary-glow)]",
                  )}
                />
                <span
                  className={cn(
                    "text-[8.5px] font-bold uppercase tracking-wider leading-none",
                    isCurrent
                      ? (delivered ? "text-success" : "text-primary")
                      : reached
                        ? "text-foreground/70"
                        : "text-muted-foreground/50",
                  )}
                >
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
