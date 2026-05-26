import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ShieldCheck, MapPin, Bell, Sparkles, AlertCircle, TrendingUp, CheckCircle2, Megaphone, Check, X, HelpCircle, Clock, Flame, Users, Vote, ArrowRight, SlidersHorizontal, Gavel, Loader2, Settings, Target, Trophy, ChevronDown } from "lucide-react";
import { IssueCard } from "@/components/IssueCard";
import { ISSUES, USER, CATEGORY_ORDER, type Scope } from "@/lib/mock-data";

import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const Route = createFileRoute("/_tabs/")({
  component: IssuesFeed,
  head: () => ({
    meta: [
      { title: "CivicPulse — Your civic voice, amplified" },
      { name: "description", content: "Vote on issues, draft real legislation, and hold representatives accountable." },
    ],
  }),
});

const SCOPES: { key: Scope; label: string }[] = [
  { key: "district", label: "My Feed" },
  { key: "local", label: "Local" },
  { key: "state", label: "State" },
  { key: "federal", label: "Federal" },
  { key: "all", label: "All" },
];


type CongressBill = {
  id: string;
  number: string;
  title: string;
  category: string;
  categoryColor: string;
  chamber: "House" | "Senate";
  status: string;
  urgency: "critical" | "high" | "medium" | "low";
  whyItMatters: string;
  pros: string[];
  cons: string[];
  pulse: number;
  yes: number;
  no: number;
  unsure: number;
  goal: number;
  deadline: string;
  momentum: number;
  momentumText?: string;
};

const CONGRESS_BILLS: CongressBill[] = [
  {
    id: "hr1234", number: "H.R. 1234", title: "Federal Childcare Affordability Act",
    category: "Healthcare", categoryColor: "oklch(0.72 0.21 148)",
    chamber: "House", status: "In Committee — Ways & Means",
    urgency: "high",
    whyItMatters: "If you pay for daycare, this caps it at 7% of your income — about $8,000 back in your pocket every year.",
    pros: ["Cuts childcare bills ~$8K/yr for median family", "Pays for itself by closing carried-interest loophole", "Bipartisan: 38 Democrats, 11 Republicans"],
    cons: ["Adds ~$24B/yr to federal spending", "May nudge provider wages and tuition up slightly", "Phased rollout takes 2 years"],
    pulse: 74, yes: 18420, no: 4210, unsure: 1820,
    goal: 30000, deadline: "Committee vote in 9 days", momentum: 1240, momentumText: "Active in District 7",
  },
  {
    id: "s567", number: "S. 567", title: "Prescription Drug Price Negotiation Expansion",
    category: "Healthcare", categoryColor: "oklch(0.66 0.23 25)",
    chamber: "Senate", status: "Floor vote scheduled",
    urgency: "critical",
    whyItMatters: "Caps your out-of-pocket drug costs at $2,000/yr and lets Medicare negotiate 50 more high-cost drugs.",
    pros: ["Saves seniors ~$1,400/yr on average", "Cuts Medicare spending $98B over 10 yrs", "$2K annual out-of-pocket cap"],
    cons: ["Pharma argues lower R&D investment", "Some new drugs may launch later in the U.S.", "Manufacturers may shift costs elsewhere"],
    pulse: 81, yes: 32140, no: 5620, unsure: 2410,
    goal: 45000, deadline: "Floor vote in 4 days", momentum: 2890, momentumText: "Active today",
  },
  {
    id: "hr2891", number: "H.R. 2891", title: "Border Security & Asylum Modernization Act",
    category: "Immigration", categoryColor: "oklch(0.72 0.15 70)",
    chamber: "House", status: "Passed House — awaiting Senate",
    urgency: "high",
    whyItMatters: "Clears the 5-year asylum backlog down to 10 months and modernizes 22 border processing centers.",
    pros: ["Cuts asylum wait from 5 yrs to ~10 mo", "Bipartisan border + due-process package", "Funds rural border infrastructure jobs"],
    cons: ["$18B price tag over 5 years", "Civil liberties groups flag biometric expansion", "Implementation depends on hiring 1,500 judges"],
    pulse: 58, yes: 14820, no: 9410, unsure: 4820,
    goal: 35000, deadline: "Senate intro in 14 days", momentum: 640,
  },
  {
    id: "s892", number: "S. 892", title: "Veterans Mental Health Access Act",
    category: "Veterans Affairs", categoryColor: "oklch(0.79 0.13 230)",
    chamber: "Senate", status: "Passed Senate — heads to House",
    urgency: "medium",
    whyItMatters: "Guarantees veterans same-week mental health appointments and triples community PTSD program funding.",
    pros: ["Ends VA mental health wait times", "Targets suicide-prevention investments", "Veteran groups unanimously endorsed", "Funds rural community clinics"],
    cons: ["Requires hiring ~4,000 new clinicians", "Implementation phased over 3 years", "$6B annual cost beyond year 3"],
    pulse: 92, yes: 41200, no: 1820, unsure: 940,
    goal: 50000, deadline: "House vote in 21 days", momentum: 420,
  },
];

const CONGRESS_POP_KEYFRAMES = `
@keyframes cVotePop{0%{transform:scale(.1);opacity:0}25%{transform:scale(2.15);opacity:1}50%{transform:scale(.8)}72%{transform:scale(1.25)}100%{transform:scale(1.1);opacity:1}}
@keyframes cVoteRing{0%{transform:scale(.4);opacity:1}100%{transform:scale(3.6);opacity:0}}
@keyframes cVoteRing2{0%{transform:scale(.4);opacity:.8}100%{transform:scale(4.9);opacity:0}}
@keyframes cVoteBtnPulse{0%{box-shadow:0 0 0 0 color-mix(in oklab, var(--color-success) 95%, transparent),0 0 40px 8px color-mix(in oklab, var(--color-success) 85%, transparent)}100%{box-shadow:0 0 0 44px color-mix(in oklab, var(--color-success) 0%, transparent),0 0 18px 2px color-mix(in oklab, var(--color-success) 0%, transparent)}}
@keyframes cVoteGlow{0%,100%{filter:drop-shadow(0 0 18px oklch(0.72 0.21 148 / 95%))}50%{filter:drop-shadow(0 0 30px oklch(0.99 0 0 / 95%))}}
`;

const CONGRESS_URGENCY: Record<CongressBill["urgency"], { label: string; cls: string; icon?: typeof Flame }> = {
  critical: { label: "TIME-SENSITIVE", cls: "bg-destructive/12 text-destructive/90 ring-1 ring-destructive/30" },
  high:     { label: "PRIORITY",       cls: "bg-warning/12 text-warning/90 ring-1 ring-warning/25" },
  medium:   { label: "ACTIVE",         cls: "bg-muted text-foreground/70 ring-1 ring-border/50" },
  low:      { label: "OPEN",           cls: "bg-muted text-muted-foreground ring-1 ring-border/40" },
};

function IssuesFeed() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [scope, setScope] = useState<Scope>("district");
  const [votedIds, setVotedIds] = useState<Set<string>>(() => new Set());
  const [extraRounds, setExtraRounds] = useState(0);
  const [justLoaded, setJustLoaded] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [federalView, setFederalView] = useState<"citizen" | "congress">("citizen");
  const [congressVotes, setCongressVotes] = useState<Record<string, "yes" | "no" | "unsure">>({});
  const [congressHintSeen, setCongressHintSeen] = useState<boolean>(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setCongressHintSeen(window.localStorage.getItem("cp_congress_hint_seen") === "1");
  }, []);
  const dismissCongressHint = () => {
    setCongressHintSeen(true);
    try { window.localStorage.setItem("cp_congress_hint_seen", "1"); } catch {}
  };
  // Auto-dismiss hint when the user switches to congress view
  useEffect(() => {
    if (federalView === "congress" && !congressHintSeen) dismissCongressHint();
  }, [federalView, congressHintSeen]);
  const [notifs, setNotifs] = useState<Array<{ id: string; icon: typeof Bell; tone: "primary" | "success" | "warning" | "destructive"; title: string; body: string; time: string; unread: boolean }>>(() => [
    { id: "n1", icon: TrendingUp, tone: "warning", title: "Bike lane vote surging", body: "1,240 neighbors voted YES in the last 3 hours.", time: "12m", unread: true },
    { id: "n2", icon: CheckCircle2, tone: "success", title: "Your vote was counted", body: "School funding measure reached the District Pulse threshold.", time: "1h", unread: true },
    { id: "n3", icon: Megaphone, tone: "primary", title: "Rep. Hayes responded", body: "She replied to a question you upvoted last week.", time: "3h", unread: true },
    { id: "n4", icon: AlertCircle, tone: "destructive", title: "New CRITICAL issue", body: "Emergency budget vote opens tomorrow at 9 AM.", time: "Yesterday", unread: false },
  ]);
  const unreadCount = notifs.filter(n => n.unread).length;
  const handleVoted = (id: string) => {
    setVotedIds(prev => (prev.has(id) ? prev : new Set(prev).add(id)));
    setQuestProgress(p => Math.min(2, p + 1));
  };

  const [activeCats, setActiveCats] = useState<Set<string>>(() => new Set());
  const [sortMode, setSortMode] = useState<"momentum" | "newest" | "urgency" | "support">("momentum");

  // Onboarding: interest topics quiz (one-time) — hydrate client-side only
  const [interests, setInterests] = useState<Set<string>>(() => new Set());
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState<0 | 1 | 2>(0);
  const [quizDismissed, setQuizDismissed] = useState<boolean>(true);
  const [streakOn, setStreakOn] = useState(true);
  const [questsOn, setQuestsOn] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("cp_interests");
      if (raw) setInterests(new Set(JSON.parse(raw) as string[]));
      setQuizDismissed(window.localStorage.getItem("cp_interests_dismissed") === "1");
      const s = window.localStorage.getItem("cp_streak_on");
      if (s !== null) setStreakOn(s === "1");
      const q = window.localStorage.getItem("cp_quests_on");
      if (q !== null) setQuestsOn(q === "1");
    } catch {}
  }, []);
  const hasInterests = interests.size > 0;
  const saveInterests = (next: Set<string>) => {
    setInterests(next);
    try { window.localStorage.setItem("cp_interests", JSON.stringify(Array.from(next))); } catch {}
  };
  const dismissQuizPrompt = () => {
    setQuizDismissed(true);
    try { window.localStorage.setItem("cp_interests_dismissed", "1"); } catch {}
  };

  // Daily quest progress (locally simulated)
  const [questProgress, setQuestProgress] = useState(0);


  // "My Feed" = AI-personalized mix: big national stories + hot momentum across all scopes + district issues
  const baseFiltered = useMemo(() => {
    if (scope === "all") return ISSUES;
    if (scope === "district") {
      // Personalized mix: every district issue + bigs + top momentum across state/federal/local
      const district = ISSUES.filter(i => i.scope === "district");
      const otherHot = ISSUES
        .filter(i => i.scope !== "district")
        .sort((a, b) => {
          const aScore = (a.big ? 4000 : 0) + (a.momentum ?? 0) + (a.urgency === "critical" ? 1500 : a.urgency === "high" ? 700 : 0);
          const bScore = (b.big ? 4000 : 0) + (b.momentum ?? 0) + (b.urgency === "critical" ? 1500 : b.urgency === "high" ? 700 : 0);
          return bScore - aScore;
        });
      // Interleave district + hot national for a personalized "feed" feel
      const mixed: typeof ISSUES = [];
      const maxLen = Math.max(district.length, otherHot.length);
      for (let i = 0; i < maxLen; i++) {
        if (otherHot[i]) mixed.push(otherHot[i]);
        if (district[i]) mixed.push(district[i]);
      }
      return mixed;
    }
    return ISSUES.filter(i => i.scope === scope);
  }, [scope]);

  const availableCats = useMemo(() => {
    const present = new Set<string>();
    baseFiltered.forEach(i => present.add(i.category));
    // Show known order first, then any leftovers
    const ordered = CATEGORY_ORDER.filter(c => present.has(c));
    const leftovers = Array.from(present).filter(c => !ordered.includes(c));
    return [...ordered, ...leftovers];
  }, [baseFiltered]);

  const toggleCat = (c: string) =>
    setActiveCats(prev => {
      const n = new Set(prev);
      n.has(c) ? n.delete(c) : n.add(c);
      return n;
    });

  // Relevance Engine: momentum × news traction + urgency + impact scale + personal-scope + selected-interest boost
  const relevanceScore = (i: typeof ISSUES[number]) => {
    const urgencyBoost = i.urgency === "critical" ? 2400 : i.urgency === "high" ? 1200 : i.urgency === "medium" ? 400 : 0;
    const momentumBoost = (i.momentum ?? 0) * 1.4;
    const tractionBoost = i.momentumText ? 900 : 0; // proxy for breaking news traction
    const impactBoost = i.big ? 1800 : 0;
    const scaleBoost = Math.min(2000, i.goal / 25);
    const personalBoost = i.scope === "district" ? 600 : i.scope === "local" ? 200 : 0;
    const interestBoost = interests.has(i.category) ? 3200 : 0;
    return urgencyBoost + momentumBoost + tractionBoost + impactBoost + scaleBoost + personalBoost + interestBoost;
  };

  // "Why this is here" — short rationale, used on top trending cards
  const whyHereFor = (i: typeof ISSUES[number]): string | null => {
    if (interests.has(i.category)) return "Matches your interests";
    if (i.momentumText) return i.momentumText;
    if (i.urgency === "critical") return "Critical deadline";
    if (i.big) return "Major national impact";
    if ((i.momentum ?? 0) >= 1000) return "Active today";
    if (i.scope === "district") return "In your district";
    return null;
  };

  // Append fresh rotations of the same pool when most are voted (mock "load more")
  const filtered = useMemo(() => {
    const out = [...baseFiltered];
    for (let r = 1; r <= extraRounds; r++) {
      baseFiltered.forEach((i, idx) => out.push({ ...i, id: `${i.id}-r${r}-${idx}` }));
    }
    const catFiltered = activeCats.size === 0 ? out : out.filter(i => activeCats.has(i.category));
    const urgencyRank = { critical: 0, high: 1, medium: 2, low: 3 } as const;
    const sorted = [...catFiltered].sort((a, b) => {
      if (sortMode === "urgency") return urgencyRank[a.urgency] - urgencyRank[b.urgency];
      if (sortMode === "support") return (b.yes + b.no + b.unsure) - (a.yes + a.no + a.unsure);
      if (sortMode === "newest") return 0;
      // momentum = Hot / Relevance composite
      return relevanceScore(b) - relevanceScore(a);
    });
    return sorted;
  }, [baseFiltered, extraRounds, activeCats, sortMode, interests]);



  const remaining = filtered.filter(i => !votedIds.has(i.id)).length;
  const votedRatio = filtered.length ? (filtered.length - remaining) / filtered.length : 0;

  // Auto-load when most visible cards are voted
  useEffect(() => {
    if (votedRatio >= 0.7 && remaining <= 2) {
      setExtraRounds(r => r + 1);
      setJustLoaded(true);
      const t = window.setTimeout(() => setJustLoaded(false), 3500);
      return () => window.clearTimeout(t);
    }
  }, [votedRatio, remaining]);

  // Reset rounds when scope changes
  useEffect(() => { setExtraRounds(0); setJustLoaded(false); }, [scope]);

  // Scroll-collapse for Federal sub-toggle (Citizen Issues / Bills in Congress)
  const [toggleCollapsed, setToggleCollapsed] = useState(false);
  // Quick Actions cluster — compact by default, user can expand
  const [quickExpanded, setQuickExpanded] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (scope === "federal") setToggleCollapsed(y > 520);
      else setToggleCollapsed(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scope]);


  // Infinite scroll sentinel — auto-load more issues
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  useEffect(() => {
    if (scope === "federal" && federalView === "congress") return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && !loadingMore) {
        setLoadingMore(true);
        window.setTimeout(() => {
          setExtraRounds(r => r + 1);
          setLoadingMore(false);
        }, 650);
      }
    }, { rootMargin: "400px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [scope, federalView, loadingMore, extraRounds]);

  // Filter & Sort popover
  const [filterOpen, setFilterOpen] = useState(false);
  const filterCount = activeCats.size + (sortMode !== "momentum" ? 1 : 0);

  return (
    <div className="safe-top">
      {/* Ultra-subtle verification strip */}
      {USER.verified && (
        <div className="flex items-center justify-center gap-1.5 border-b border-border/30 bg-success/[0.035] px-5 py-1 text-[10px]">
          <ShieldCheck className="h-2.5 w-2.5 text-success/80" strokeWidth={2.75} />
          <span className="font-semibold tracking-tight text-success/85">Verified</span>
          <span className="text-muted-foreground/80">· full voice in your District 7</span>
        </div>
      )}

      {/* Header */}
      <header className="px-5 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <Link to="/welcome" className="flex items-center gap-1.5 rounded-full bg-surface/60 px-2.5 py-1 text-[11px] font-semibold tracking-tight text-muted-foreground ring-1 ring-border/50 transition hover:text-foreground">
            <MapPin className="h-3 w-3 text-primary" />
            {USER.district} · {USER.zip}
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/feed-settings"
              aria-label="My Feed settings"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface/80 ring-1 ring-border/60 transition hover:bg-surface active:scale-95"
            >
              <Settings className="h-4 w-4" strokeWidth={2.25} />
            </Link>
            <button
              onClick={() => setNotifOpen(true)}
              aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-surface/80 ring-1 ring-border/60 transition hover:bg-surface active:scale-95"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground ring-2 ring-background">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <p className="mt-3.5 text-[12px] font-medium tracking-tight text-muted-foreground">
          Good evening, <span className="text-foreground">Andrew</span> <span aria-hidden>👋</span>
        </p>
        <h1 className="mt-1 text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-balance text-foreground">
          {scope === "district" ? (
            <>Your voice. <span className="bg-gradient-primary bg-clip-text text-transparent">Real power.</span> In your hands.</>
          ) : (
            <>Here's what matters in <span className="bg-gradient-primary bg-clip-text text-transparent">your District 7</span> today.</>
          )}
        </h1>
        {scope === "district" && (
          <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-medium leading-snug text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" strokeWidth={2.75} />
            A quiet, verified feed — built for peace, family, and stability.
          </p>
        )}


      </header>

      {/* Civic Streak + Daily Quest — habit-forming, gated on mount to avoid hydration mismatch */}
      {mounted && (streakOn || questsOn) && (
        <div className="px-5 pb-3 pt-1 space-y-2.5">
          {streakOn && (
            <div className="fade-up flex items-center gap-2.5 rounded-xl border border-border/55 bg-surface/45 px-3 py-1.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-warning/15 ring-1 ring-warning/30">
                <Flame className="h-3 w-3 text-warning/90" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[13px] font-extrabold leading-none tabular-nums text-foreground">7</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">day streak</span>
                  <span className="text-[10.5px] font-medium leading-none text-muted-foreground/85">— quiet, consistent voice</span>
                </div>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} className={cn("h-2.5 w-1 rounded-full", i < 7 ? "bg-warning/70" : "bg-muted")} />
                ))}
              </div>
            </div>
          )}

          {questsOn && (
            <button
              type="button"
              className="fade-up group relative block w-full overflow-hidden rounded-2xl border border-warning/35 bg-gradient-to-br from-warning/[0.14] via-surface/40 to-transparent px-3 py-1.5 text-left transition-all active:scale-[0.99] hover:border-warning/55"
            >
              <span aria-hidden className="pointer-events-none absolute -left-6 -bottom-8 h-24 w-24 rounded-full bg-warning/20 blur-2xl" />
              <div className="relative flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-warning/20 ring-1 ring-warning/45 shadow-[0_0_22px_-6px_oklch(0.78_0.16_70/80%)]">
                  <Target className="h-4 w-4 text-warning" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-warning/25 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-warning">Today's Quest</span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-warning/90">
                      <Trophy className="h-2.5 w-2.5" strokeWidth={3} />
                      +25 IP
                    </span>
                    <span className="truncate text-[11px] font-bold text-foreground">— Vote on 2 issues — <span className="tabular-nums text-warning">{Math.min(questProgress, 2)}/2</span></span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted/70">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-warning to-warning/70 shadow-[0_0_10px_-1px_oklch(0.78_0.16_70/80%)] transition-all duration-700"
                      style={{ width: `${Math.min(100, (questProgress / 2) * 100)}%` }}
                    />
                  </div>
                </div>
                {questProgress >= 2 && (
                  <span className="shrink-0 rounded-full bg-success/20 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-success ring-1 ring-success/40">
                    Done
                  </span>
                )}
              </div>
            </button>
          )}
        </div>
      )}


      {/* Quick Actions — compact single row, expandable */}
      <div className="px-5 pb-3 pt-2">
        <div className="overflow-hidden rounded-2xl border border-border/55 bg-surface/45 ring-1 ring-border/30">
          <button
            type="button"
            onClick={() => setQuickExpanded(v => !v)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left transition active:scale-[0.995] hover:bg-surface/70"
            aria-expanded={quickExpanded}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground/80">Quick actions</span>
            <div className="ml-1 flex flex-1 items-center gap-1.5 overflow-hidden">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary ring-1 ring-primary/30">
                <Vote className="h-2.5 w-2.5" strokeWidth={3} /> Election · 24d
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold text-warning ring-1 ring-warning/30">
                <Gavel className="h-2.5 w-2.5" strokeWidth={3} /> Reps 4/8
              </span>
              {mounted && !hasInterests && !quizDismissed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary ring-1 ring-primary/30">
                  <Sparkles className="h-2.5 w-2.5" strokeWidth={3} /> Personalize
                </span>
              )}
            </div>
            <ChevronDown
              className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-300", quickExpanded && "rotate-180")}
              strokeWidth={2.75}
            />
          </button>

          <div
            className={cn(
              "grid transition-all duration-500 ease-out",
              quickExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
            aria-hidden={!quickExpanded}
          >
            <div className="overflow-hidden">
              <div className="space-y-2 border-t border-border/40 p-2.5">
                <button
                  type="button"
                  className="group relative flex w-full items-center gap-2.5 overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/[0.12] via-primary/[0.04] to-transparent px-3 py-2 text-left transition-all active:scale-[0.99] hover:border-primary/45"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/40">
                    <Vote className="h-3.5 w-3.5 text-primary" strokeWidth={2.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-primary/25 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-primary">Election</span>
                      <span className="text-[10px] font-semibold text-muted-foreground">Nov 4 · 24d</span>
                    </div>
                    <p className="mt-0.5 truncate text-[12px] font-semibold leading-tight text-foreground">
                      Check registration + ballot bills
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" strokeWidth={2.75} />
                </button>

                <Link
                  to="/reps"
                  className="flex items-center gap-2.5 rounded-xl border border-warning/25 bg-gradient-to-r from-warning/[0.10] via-surface/40 to-transparent px-3 py-2 transition active:scale-[0.99] hover:border-warning/45"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/15 ring-1 ring-warning/35">
                    <Gavel className="h-3.5 w-3.5 text-warning" strokeWidth={2.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold leading-tight text-foreground">
                      Reps responded to <span className="text-warning">4 / 8</span> bills this month
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">See who's listening — and who isn't.</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={2.5} />
                </Link>

                {mounted && !hasInterests && !quizDismissed && scope === "district" && (
                  <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/[0.10] via-primary/[0.03] to-transparent px-3 py-2">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.75} />
                    <p className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-foreground">
                      Personalize My Feed <span className="font-normal text-muted-foreground">· 30s quiz</span>
                    </p>
                    <button
                      onClick={() => { setQuizStep(0); setQuizOpen(true); }}
                      className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[10.5px] font-bold tracking-tight text-primary-foreground shadow-[0_6px_18px_-6px_oklch(0.79_0.13_230/75%)] transition active:scale-95"
                    >
                      Start
                    </button>
                    <button
                      onClick={dismissQuizPrompt}
                      aria-label="Dismiss"
                      className="shrink-0 rounded-full p-1 text-muted-foreground/60 transition hover:text-foreground"
                    >
                      <X className="h-3 w-3" strokeWidth={2.75} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>






      {/* Scope toggle */}
      <div className="sticky top-0 z-40 bg-background/85 px-5 pt-2.5 pb-2 backdrop-blur-xl">
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SCOPES.map(s => {
            const isActive = scope === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setScope(s.key)}
                className={cn(
                  "relative shrink-0 rounded-full px-4 py-1.5 text-xs font-bold tracking-tight transition-all active:scale-95",
                  isActive
                    ? "-translate-y-px bg-gradient-primary text-primary-foreground shadow-[0_8px_22px_-8px_oklch(0.79_0.13_230/65%)] ring-1 ring-primary/50 after:absolute after:-bottom-1.5 after:left-1/2 after:h-[3px] after:w-7 after:-translate-x-1/2 after:rounded-full after:bg-primary after:shadow-[0_0_10px_oklch(0.79_0.13_230/80%)]"
                    : "bg-surface/70 text-muted-foreground ring-1 ring-border/50 hover:text-foreground",
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {scope !== "federal" && (
          <button
            onClick={() => setScope("federal")}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.08] px-3 py-1 text-[10.5px] font-semibold tracking-tight text-primary transition hover:bg-primary/[0.14] active:scale-95"
          >
            <span aria-hidden>✨</span>
            Want bigger impact? Try Federal
            <span aria-hidden>→</span>
          </button>
        )}

        {/* Federal sub-toggle: Citizen Issues vs Current Bills in Congress
            — stays pinned; gracefully compacts on scroll instead of disappearing */}
        {scope === "federal" && (
          <div className="mt-3">
            {!toggleCollapsed && (
              <div className="mb-2 flex items-center justify-center gap-2 transition-opacity duration-300">
                <span className="h-px w-6 bg-border/60" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-foreground/80">
                  Two Ways to Make Impact
                </span>
                <span className="h-px w-6 bg-border/60" />
              </div>
            )}
            <div
              className={cn(
                "relative grid grid-cols-2 rounded-2xl bg-surface/70 ring-1 ring-border/60 transition-all duration-300 ease-out",
                toggleCollapsed ? "gap-1 p-1" : "gap-2 p-1.5",
              )}
            >
              <button
                onClick={() => setFederalView("citizen")}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl text-center transition-all active:scale-[0.97]",
                  toggleCollapsed ? "px-2 py-1.5" : "px-2 py-2.5",
                  federalView === "citizen"
                    ? "bg-gradient-primary text-primary-foreground shadow-[0_10px_26px_-10px_oklch(0.79_0.13_230/75%)] ring-1 ring-primary/60"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className={cn("font-extrabold tracking-tight transition-all", toggleCollapsed ? "text-[12px]" : "text-[14px]")}>Citizen Issues</span>
                {!toggleCollapsed && (
                  <span className={cn("text-[10px] font-semibold leading-none", federalView === "citizen" ? "text-primary-foreground/85" : "text-muted-foreground/75")}>
                    Bottom-up · from the people
                  </span>
                )}
              </button>
              <button
                onClick={() => { setFederalView("congress"); dismissCongressHint(); }}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 rounded-xl text-center transition-all active:scale-[0.97]",
                  toggleCollapsed ? "px-2 py-1.5" : "px-2 py-2.5",
                  federalView === "congress"
                    ? "bg-gradient-primary text-primary-foreground shadow-[0_10px_26px_-10px_oklch(0.79_0.13_230/75%)] ring-1 ring-primary/60"
                    : "text-muted-foreground hover:text-foreground",
                  !congressHintSeen && federalView !== "congress" && "ring-2 ring-primary/70 shadow-[0_0_0_4px_oklch(0.79_0.13_230/18%)] animate-pulse",
                )}
              >
                <span className={cn("font-extrabold tracking-tight transition-all", toggleCollapsed ? "text-[12px]" : "text-[14px]")}>Bills in Congress</span>
                {!toggleCollapsed && (
                  <span className={cn("text-[10px] font-semibold leading-none", federalView === "congress" ? "text-primary-foreground/85" : "text-muted-foreground/75")}>
                    Top-down · real legislation
                  </span>
                )}
                {!congressHintSeen && federalView !== "congress" && (
                  <span className="pointer-events-none absolute -top-2 right-2 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-primary-foreground shadow-[0_4px_14px_-2px_oklch(0.79_0.13_230/85%)]">
                    New
                  </span>
                )}
              </button>
            </div>
            {!toggleCollapsed && !congressHintSeen && federalView === "citizen" && (
              <button
                onClick={() => { setFederalView("congress"); dismissCongressHint(); }}
                className="fade-up mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.07] px-3 py-1.5 text-[11px] font-semibold tracking-tight text-primary transition hover:bg-primary/[0.12] active:scale-[0.98]"
              >
                <Sparkles className="h-3 w-3" strokeWidth={2.75} />
                Tap to vote on real bills moving through Congress
                <span aria-hidden>→</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter & Sort — single top-right popover */}
      {!(scope === "federal" && federalView === "congress") && (
        <div className="flex items-center justify-between gap-2 px-5 pt-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
            {filtered.length} {filtered.length === 1 ? "issue" : "issues"}
            {activeCats.size > 0 && <span className="text-primary/90"> · filtered</span>}
          </p>
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-tight transition active:scale-95",
                  filterCount > 0
                    ? "bg-primary/15 text-primary ring-1 ring-primary/40 shadow-[0_0_18px_-8px_oklch(0.70_0.17_252/70%)]"
                    : "bg-surface/70 text-muted-foreground ring-1 ring-border/60 hover:text-foreground",
                )}
              >
                <SlidersHorizontal className="h-3 w-3" strokeWidth={2.75} />
                Filter & Sort
                {filterCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-extrabold text-primary-foreground">
                    {filterCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-3">
              <div>
                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Sort by</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { k: "momentum", label: "Hot / Relevance" },
                    { k: "support", label: "Most Supported" },
                    { k: "urgency", label: "Most Urgent" },
                    { k: "newest", label: "Newest" },
                  ].map(o => (
                    <button
                      key={o.k}
                      onClick={() => setSortMode(o.k as typeof sortMode)}
                      className={cn(
                        "rounded-lg px-2 py-1.5 text-[11px] font-bold tracking-tight transition active:scale-95",
                        sortMode === o.k
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface/70 text-muted-foreground ring-1 ring-border/60 hover:text-foreground",
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              {availableCats.length > 1 && (
                <div className="mt-3 border-t border-border/50 pt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Categories</p>
                    {activeCats.size > 0 && (
                      <button
                        onClick={() => setActiveCats(new Set())}
                        className="text-[10px] font-bold text-primary hover:text-primary/80"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {availableCats.map(c => {
                      const on = activeCats.has(c);
                      return (
                        <button
                          key={c}
                          onClick={() => toggleCat(c)}
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[10.5px] font-bold tracking-tight transition active:scale-95",
                            on
                              ? "bg-primary/20 text-primary ring-1 ring-primary/40"
                              : "bg-surface/70 text-muted-foreground ring-1 ring-border/60 hover:text-foreground",
                          )}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Feed */}
      {mounted && votedIds.size > 0 && (
        <div className="fade-up px-5 pb-1 pt-3">
          <div className="flex items-center gap-2 rounded-2xl border border-success/25 bg-success/[0.06] px-3 py-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/20 ring-1 ring-success/40">
              <CheckCircle2 className="h-3 w-3 text-success" strokeWidth={2.75} />
            </span>
            <p className="text-[11.5px] font-semibold leading-snug text-foreground/85">
              You&apos;ve helped strengthen <span className="text-success">{USER.district}</span> today
              <span className="font-normal text-muted-foreground"> · {votedIds.size} {votedIds.size === 1 ? "voice" : "voices"} added</span>
            </p>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-16 px-6 pb-20 pt-8">


        {scope === "federal" && federalView === "congress" ? (
          <>
            <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.08] via-surface/40 to-transparent p-3.5">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-primary">
                  Top-down accountability
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-foreground/85">
                These are <span className="font-semibold">real bills already moving through Congress</span>. Your vote here is delivered to your federal reps as constituent pulse.
              </p>
            </div>
            {CONGRESS_BILLS.map(b => (
              <CongressBillCard
                key={b.id}
                bill={b}
                vote={congressVotes[b.id]}
                onVote={v => setCongressVotes(prev => ({ ...prev, [b.id]: v }))}
              />
            ))}
          </>
        ) : (
          <>
            {(() => {
              const scores = filtered.map(relevanceScore);
              const maxScore = Math.max(1, ...scores);
              const alignmentNotes = [
                "Aligns with 78% of verified neighbors in your district who voted similarly.",
                "Your vote matches the most common position among District 7 parents.",
                "82% of users with your interests voted the same way.",
                "This aligns with the prevailing view across your district this week.",
              ];
              return filtered.map((issue, idx) => {
                const rel = Math.round((scores[idx] / maxScore) * 100);
                const aiRec = scope === "district" && idx < 3;
                const showAlign = idx % 4 === 1; // calm, occasional
                return (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onVoted={() => handleVoted(issue.id)}
                    trendingLabel={null}
                    whyHere={mounted && idx < 4 ? whyHereFor(issue) : null}
                    aiRecommended={mounted && aiRec}
                    relevance={mounted && rel >= 70 ? rel : undefined}
                    alignmentNote={mounted && showAlign ? alignmentNotes[idx % alignmentNotes.length] : null}

                  />
                );
              });
            })()}



            {justLoaded && (
              <div className="fade-up flex items-center justify-center gap-2 rounded-full border border-primary/25 bg-primary/[0.08] px-3 py-2 text-[11.5px] font-semibold tracking-tight text-primary">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.75} />
                New issues loaded for you
              </div>
            )}

            {filtered.length === 0 && (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                No active issues at this level right now. Try another scope.
              </div>
            )}

            {/* Infinite scroll sentinel + loading indicator */}
            {filtered.length > 0 && (
              <div ref={sentinelRef} className="flex items-center justify-center py-4">
                <div className={cn("flex items-center gap-2 text-[11.5px] font-semibold tracking-tight text-muted-foreground transition-opacity duration-300", loadingMore ? "opacity-100" : "opacity-0")}>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" strokeWidth={2.5} />
                  Loading more issues…
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Notifications drawer */}
      <Sheet open={notifOpen} onOpenChange={(o) => { setNotifOpen(o); if (o) setNotifs(ns => ns.map(n => ({ ...n, unread: false }))); }}>
        <SheetContent side="right" className="w-[88%] max-w-[380px] border-l border-border/60 bg-background p-0">
          <SheetHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/50 px-5 py-4">
            <SheetTitle className="flex items-center gap-2 text-[15px] font-bold tracking-tight">
              <Bell className="h-4 w-4 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <span className="rounded-full bg-destructive/15 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
                  {unreadCount} new
                </span>
              )}
            </SheetTitle>
            <button
              onClick={() => setNotifs(ns => ns.map(n => ({ ...n, unread: false })))}
              disabled={unreadCount === 0}
              className="text-[11px] font-semibold tracking-tight text-primary transition hover:text-primary/80 disabled:opacity-40"
            >
              Mark all read
            </button>
          </SheetHeader>
          <div className="space-y-2 overflow-y-auto px-3 py-3">
            {notifs.map(n => {
              const Icon = n.icon;
              const toneCls =
                n.tone === "success" ? "text-success bg-success/15 ring-success/25"
                : n.tone === "warning" ? "text-warning bg-warning/15 ring-warning/25"
                : n.tone === "destructive" ? "text-destructive bg-destructive/15 ring-destructive/25"
                : "text-primary bg-primary/15 ring-primary/25";
              return (
                <button
                  key={n.id}
                  onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, unread: false } : x))}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition active:scale-[0.99]",
                    n.unread ? "border-primary/25 bg-primary/[0.05]" : "border-border/50 bg-surface/40",
                  )}
                >
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1", toneCls)}>
                    <Icon className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[12.5px] font-semibold tracking-tight text-foreground">{n.title}</p>
                      {n.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">{n.time}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Full-screen Onboarding Quiz */}
      {quizOpen && mounted && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-[oklch(0.13_0.03_250)]/95 backdrop-blur-2xl animate-fade-in">
          <div aria-hidden className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-success/15 blur-3xl" />

          {/* Top bar */}
          <div className="relative flex items-center justify-between px-5 pt-6 pb-3 safe-top">
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-9 rounded-full transition-all duration-500",
                    i <= quizStep ? "bg-primary shadow-[0_0_10px_oklch(0.79_0.13_230/85%)]" : "bg-muted/40",
                  )}
                />
              ))}
            </div>
            <button
              onClick={() => setQuizOpen(false)}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface/70 ring-1 ring-border/60 transition hover:bg-surface active:scale-95"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>

          {/* Step body */}
          <div className="relative flex-1 overflow-y-auto px-5 pb-6">
            {quizStep === 0 && (
              <div className="fade-up flex h-full flex-col items-center justify-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/15 ring-1 ring-primary/40 shadow-[0_0_44px_-8px_oklch(0.79_0.13_230/85%)]">
                  <Sparkles className="h-9 w-9 text-primary" strokeWidth={2.25} />
                </div>
                <h2 className="text-[28px] font-bold leading-tight tracking-tight text-balance">
                  Let's tune your <span className="bg-gradient-primary bg-clip-text text-transparent">Feed</span>
                </h2>
                <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
                  Pick the issues you care about most. Takes <span className="font-bold text-foreground">30 seconds</span> and shapes everything we surface.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-muted-foreground">
                  <span className="rounded-full bg-surface/70 px-2.5 py-1 ring-1 ring-border/60">3 quick steps</span>
                  <span className="rounded-full bg-surface/70 px-2.5 py-1 ring-1 ring-border/60">Edit anytime</span>
                  <span className="rounded-full bg-surface/70 px-2.5 py-1 ring-1 ring-border/60">Non-partisan</span>
                </div>
              </div>
            )}

            {quizStep === 1 && (
              <div className="fade-up">
                <h2 className="text-[22px] font-bold leading-tight tracking-tight">
                  What issues fire you up?
                </h2>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  Tap all that matter — minimum 3 for a sharper feed.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {CATEGORY_ORDER.map(cat => {
                    const on = interests.has(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          const next = new Set(interests);
                          next.has(cat) ? next.delete(cat) : next.add(cat);
                          saveInterests(next);
                        }}
                        className={cn(
                          "rounded-full px-3.5 py-2 text-[12.5px] font-bold tracking-tight transition-all active:scale-95",
                          on
                            ? "bg-primary text-primary-foreground shadow-[0_8px_24px_-10px_oklch(0.79_0.13_230/85%)] ring-1 ring-primary/65 scale-[1.02]"
                            : "bg-surface/70 text-muted-foreground ring-1 ring-border/60 hover:text-foreground hover:ring-border",
                        )}
                      >
                        {on && <Check className="mr-1 inline h-3.5 w-3.5" strokeWidth={3} />}
                        {cat}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-5 text-[11px] font-semibold tracking-wide text-muted-foreground">
                  <span className="tabular-nums text-primary">{interests.size}</span> selected
                  {interests.size > 0 && interests.size < 3 && <span className="text-muted-foreground/70"> · pick {3 - interests.size} more for best results</span>}
                </p>
              </div>
            )}

            {quizStep === 2 && (
              <div className="fade-up flex h-full flex-col items-center justify-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-success/15 ring-1 ring-success/40 shadow-[0_0_44px_-8px_oklch(0.72_0.21_148/85%)]">
                  <CheckCircle2 className="h-10 w-10 text-success" strokeWidth={2.25} />
                </div>
                <h2 className="text-[26px] font-bold leading-tight tracking-tight">
                  You're all set, Andrew.
                </h2>
                <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
                  Your Feed is now tuned around <span className="font-bold text-foreground tabular-nums">{interests.size}</span> {interests.size === 1 ? "topic" : "topics"}.
                </p>
                <div className="mt-5 flex max-w-sm flex-wrap justify-center gap-1.5">
                  {Array.from(interests).slice(0, 12).map(c => (
                    <span key={c} className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-bold text-primary ring-1 ring-primary/30">
                      {c}
                    </span>
                  ))}
                  {interests.size > 12 && (
                    <span className="rounded-full bg-surface/70 px-2.5 py-1 text-[11px] font-bold text-muted-foreground ring-1 ring-border/60">
                      +{interests.size - 12} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom action bar */}
          <div className="relative border-t border-border/40 bg-background/60 px-5 py-4 backdrop-blur-xl safe-bottom">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (quizStep === 0) { setQuizOpen(false); dismissQuizPrompt(); }
                  else setQuizStep((quizStep - 1) as 0 | 1 | 2);
                }}
                className="text-[12px] font-semibold tracking-tight text-muted-foreground transition hover:text-foreground"
              >
                {quizStep === 0 ? "Skip for now" : "Back"}
              </button>
              <button
                onClick={() => {
                  if (quizStep < 2) setQuizStep((quizStep + 1) as 0 | 1 | 2);
                  else { dismissQuizPrompt(); setQuizOpen(false); }
                }}
                disabled={quizStep === 1 && interests.size === 0}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-6 py-2.5 text-[12.5px] font-extrabold tracking-tight text-primary-foreground shadow-[0_12px_30px_-12px_oklch(0.79_0.13_230/85%)] transition active:scale-95 disabled:opacity-40"
              >
                {quizStep === 0 ? "Continue" : quizStep === 1 ? "Continue" : "Open my Feed"}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ---------- Congressional Bill Card (top-down accountability) ----------
function CongressBillCard({
  bill,
  vote,
  onVote,
}: {
  bill: CongressBill;
  vote: "yes" | "no" | "unsure" | undefined;
  onVote: (v: "yes" | "no" | "unsure") => void;
}) {
  const [phase, setPhase] = useState<"idle" | "pop" | "done">(vote ? "done" : "idle");
  const cast = (v: "yes" | "no" | "unsure") => {
    onVote(v);
    setPhase("pop");
    window.setTimeout(() => setPhase("done"), 1050);
  };

  const total = bill.yes + bill.no + bill.unsure + (vote ? 1 : 0);
  const yesPct = Math.round(((bill.yes + (vote === "yes" ? 1 : 0)) / total) * 100);
  const noPct = Math.round(((bill.no + (vote === "no" ? 1 : 0)) / total) * 100);
  const progress = Math.min(100, Math.round((total / bill.goal) * 100));
  const u = CONGRESS_URGENCY[bill.urgency];
  const yesNeighborPct = Math.round((bill.yes / Math.max(1, bill.yes + bill.no + bill.unsure)) * 100);
  const hasHeat = bill.urgency === "critical" || (bill.momentum ?? 0) >= 400;

  return (
    <article
      className={cn(
        "fade-up group relative rounded-2xl border bg-gradient-card p-4 shadow-card transition-all duration-500",
        hasHeat
          ? "border-border/70 shadow-[0_1px_0_0_oklch(1_0_0/4%)_inset,0_18px_40px_-24px_oklch(0.66_0.23_25/35%)]"
          : "border-border/70",
      )}
    >
      <style>{CONGRESS_POP_KEYFRAMES}</style>

      {/* Top badge row — category + bill number + chamber + urgency */}
      <header className="flex flex-wrap items-center gap-1.5">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{
            color: bill.categoryColor,
            backgroundColor: `color-mix(in oklab, ${bill.categoryColor} 16%, transparent)`,
          }}
        >
          {bill.category}
        </span>
        <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary ring-1 ring-primary/25">
          {bill.number}
        </span>
        <span className="inline-flex items-center rounded-full bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ring-1 ring-border/60">
          {bill.chamber}
        </span>
        <span className={cn("ml-auto inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider", u.cls)}>
          {u.icon && <u.icon className="h-2.5 w-2.5" strokeWidth={3} />}
          {u.label}
        </span>
      </header>

      {/* Title */}
      <h3 className="mt-3 text-[17px] font-semibold leading-snug tracking-tight text-balance">
        {bill.title}
      </h3>

      {/* Status sub-line */}
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {bill.status}
      </p>

      {/* Why it matters */}
      <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/[0.06] px-3 py-2">
        <Sparkles className="mt-[2px] h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.75} />
        <p className="text-[12px] font-medium leading-snug text-foreground/90">
          <span className="mb-0.5 block text-[9.5px] font-bold uppercase tracking-wider text-primary/90">Why it matters</span>
          {bill.whyItMatters}
        </p>
      </div>

      {/* Pros & Cons */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-success/20 bg-success/[0.06] px-2.5 py-2">
          <div className="mb-1 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-success/90">
            <Check className="h-2.5 w-2.5" strokeWidth={3.5} /> Pros
          </div>
          <ul className="space-y-[3px]">
            {bill.pros.slice(0, 4).map((p, i) => (
              <li key={i} className="flex gap-1.5 text-[11px] leading-[1.3] text-foreground/85">
                <span className="mt-[5px] inline-block h-[3px] w-[3px] shrink-0 rounded-full bg-success/70" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-destructive/20 bg-destructive/[0.06] px-2.5 py-2">
          <div className="mb-1 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-destructive/90">
            <X className="h-2.5 w-2.5" strokeWidth={3.5} /> Cons
          </div>
          <ul className="space-y-[3px]">
            {bill.cons.slice(0, 4).map((c, i) => (
              <li key={i} className="flex gap-1.5 text-[11px] leading-[1.3] text-foreground/85">
                <span className="mt-[5px] inline-block h-[3px] w-[3px] shrink-0 rounded-full bg-destructive/70" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Momentum & social proof */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2.5 py-1 text-[10.5px] font-bold text-primary ring-1 ring-primary/25">
          <Users className="h-2.5 w-2.5" strokeWidth={3} />
          {yesNeighborPct}% of neighbors voting YES
        </span>
        {bill.momentumText && (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface/70 px-2.5 py-1 text-[10.5px] font-semibold text-muted-foreground ring-1 ring-border/50">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
            {bill.momentumText}
          </span>
        )}
      </div>

      {/* Verified District Pulse */}
      <div className="mt-4 overflow-hidden rounded-xl border border-success/30 bg-gradient-to-r from-success/15 via-success/10 to-transparent p-2.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/20">
            <ShieldCheck className="h-4 w-4 text-success" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-success">
                Verified District Pulse
              </span>
              <span className="text-[16px] font-extrabold text-success tabular-nums">
                {bill.pulse}%
              </span>
            </div>
            <p className="text-[11px] leading-tight text-muted-foreground">
              support among verified voters in your district
            </p>
          </div>
        </div>
      </div>

      {/* Progress toward voice goal */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-[11.5px]">
          <span className="font-semibold text-foreground/90 tabular-nums">
            {total.toLocaleString()}
            <span className="font-normal text-muted-foreground"> / {bill.goal.toLocaleString()} voices</span>
          </span>
          <span className="flex items-center gap-1 font-medium text-muted-foreground">
            <Clock className="h-3 w-3" /> {bill.deadline}
          </span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-muted/70">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-primary shadow-[0_0_12px_-2px_oklch(0.79_0.13_230/70%)]"
            style={{ width: `${progress}%`, transition: "width 700ms cubic-bezier(0.22,1,0.36,1)" }}
          />
        </div>
      </div>

      {/* Mini Bill Journey */}
      <MiniJourneyTracker
        stageIndex={bill.status.toLowerCase().includes("passed") ? 3 : bill.status.toLowerCase().includes("floor") ? 2 : 1}
      />

      {/* Vote buttons / pop / recorded state */}
      {phase !== "done" ? (
        <div className="mt-5 grid grid-cols-3 gap-2">
          <CVoteBtn label="YES" Icon={Check} tone="success" onClick={() => cast("yes")} popped={phase === "pop" && vote === "yes"} dimmed={phase === "pop" && vote !== "yes"} disabled={phase === "pop"} />
          <CVoteBtn label="UNSURE" Icon={HelpCircle} tone="muted" onClick={() => cast("unsure")} popped={phase === "pop" && vote === "unsure"} dimmed={phase === "pop" && vote !== "unsure"} disabled={phase === "pop"} />
          <CVoteBtn label="NO" Icon={X} tone="destructive" onClick={() => cast("no")} popped={phase === "pop" && vote === "no"} dimmed={phase === "pop" && vote !== "no"} disabled={phase === "pop"} />
        </div>
      ) : (
        <div className="mt-5 space-y-2.5">
          <div className="fade-up flex items-center justify-center gap-2 rounded-xl border border-success/40 bg-success/15 px-3 py-3 text-[12.5px] font-bold text-success shadow-[0_0_24px_-8px_oklch(0.72_0.21_148/55%)]">
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-background"
              style={{ animation: "cVotePop 700ms cubic-bezier(.2,1.4,.4,1) both" }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            Vote Recorded
            <span className="font-medium text-success/75">• Sent to federal reps</span>
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

function CVoteBtn({
  label, Icon, tone, onClick, popped = false, dimmed = false, disabled = false,
}: { label: string; Icon: typeof Check; tone: "success" | "destructive" | "muted"; onClick: () => void; popped?: boolean; dimmed?: boolean; disabled?: boolean }) {
  const toneCls =
    tone === "success"
      ? "bg-success/15 text-success ring-1 ring-success/30 hover:bg-success/25 hover:ring-success/50 active:bg-success/35"
      : tone === "destructive"
      ? "bg-destructive/15 text-destructive ring-1 ring-destructive/30 hover:bg-destructive/25 hover:ring-destructive/50 active:bg-destructive/35"
      : "bg-surface text-muted-foreground ring-1 ring-border/60 hover:text-foreground hover:bg-accent active:bg-accent/80";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[12.5px] font-extrabold tracking-wider transition-all duration-300 active:scale-[0.96] overflow-visible",
        toneCls,
        popped && "bg-success !text-background ring-2 ring-success scale-[1.12] z-10",
        dimmed && "opacity-30 saturate-50 scale-95",
      )}
      style={popped ? { animation: "cVoteBtnPulse 850ms ease-out both" } : undefined}
    >
      {popped ? (
        <>
          <span className="pointer-events-none absolute inset-0 rounded-xl bg-success/70" style={{ animation: "cVoteRing 950ms ease-out both" }} />
          <span className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-success/90" style={{ animation: "cVoteRing2 1050ms ease-out both" }} />
          <span style={{ animation: "cVotePop 900ms cubic-bezier(.2,1.8,.35,1) both" }} className="relative flex flex-col items-center gap-0.5">
            <CheckCircle2 className="h-[36px] w-[36px]" strokeWidth={3.75} style={{ animation: "cVoteGlow 900ms ease-in-out both" }} />
            {label}
          </span>
        </>
      ) : (
        <>
          <Icon className="h-[18px] w-[18px]" strokeWidth={3} />
          {label}
        </>
      )}
    </button>
  );
}

