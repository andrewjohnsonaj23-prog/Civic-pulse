import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  MessagesSquare, Users, Sparkles, ShieldCheck, Search, Plus, Flame,
  MapPin, Star, X, Send, Lock, AlertTriangle, ChevronRight, Filter,
  ThumbsUp, Reply, CheckCircle2, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_tabs/discuss")({
  component: Discuss,
  head: () => ({ meta: [{ title: "Discuss — CivicPulse" }] }),
});

type Scope = "Federal" | "State" | "City" | "District";
type Room = {
  id: string;
  title: string;
  category: string;
  scope: Scope;
  participants: number;
  pulse: number;
  active: boolean;
  trend?: number;       // delta over last 24h
  moderated?: boolean;  // verified-local moderated
};

const ROOMS: Room[] = [
  { id: "r-econ",   title: "Cost of Living & Inflation",         category: "Economy",       scope: "Federal", participants: 18420, pulse: 88, active: true, trend: 12, moderated: true },
  { id: "r-imm",    title: "Border Security & Immigration",      category: "Immigration",   scope: "Federal", participants: 14210, pulse: 82, active: true, trend: 9,  moderated: true },
  { id: "r-edu",    title: "School Funding Formula",             category: "Education",     scope: "State",   participants: 9870,  pulse: 79, active: true, trend: 6,  moderated: true },
  { id: "r-hc",     title: "Healthcare & Insurance Costs",       category: "Healthcare",    scope: "Federal", participants: 8640,  pulse: 84, active: true, trend: 8 },
  { id: "r-hous",   title: "Housing Affordability Crisis",       category: "Housing",       scope: "State",   participants: 7320,  pulse: 81, active: true, trend: 5,  moderated: true },
  { id: "r-ai",     title: "AI Regulation & Worker Protections", category: "Technology",    scope: "Federal", participants: 6240,  pulse: 73, active: true, trend: 14 },
  { id: "r-clim",   title: "Climate & Energy Policy",            category: "Climate",       scope: "Federal", participants: 5180,  pulse: 71, active: true, trend: 3 },
  { id: "r-crime",  title: "Crime & Public Safety",              category: "Safety",        scope: "City",    participants: 4720,  pulse: 76, active: true, trend: 4,  moderated: true },
  { id: "r-bud",    title: "Federal Budget & Taxes",             category: "Fiscal",        scope: "Federal", participants: 4310,  pulse: 69, active: true, trend: 2 },
  { id: "r-bike",   title: "Bike Lane Expansion",                category: "Transit",       scope: "District",participants: 412,   pulse: 78, active: true, trend: 1,  moderated: true },
];

const LOCAL_ROOMS: Room[] = [
  { id: "l-zone",  title: "Downtown Zoning Overhaul",  category: "Housing",  scope: "City",     participants: 612, pulse: 74, active: true,  moderated: true },
  { id: "l-sch",   title: "District 7 Math Curriculum",category: "Education",scope: "District", participants: 388, pulse: 69, active: true,  moderated: true },
  { id: "l-park",  title: "Riverfront Park Renewal",   category: "Civic",    scope: "City",     participants: 274, pulse: 81, active: false, moderated: true },
];

const HOT_TOPICS = [
  { id: "h1", label: "Cost of Living", roomId: "r-econ", color: "destructive", momentum: "+12%" },
  { id: "h2", label: "Immigration",    roomId: "r-imm",  color: "warning",     momentum: "+9%" },
  { id: "h3", label: "AI Regulation",  roomId: "r-ai",   color: "primary",     momentum: "+14%" },
  { id: "h4", label: "Healthcare",     roomId: "r-hc",   color: "success",     momentum: "+8%" },
  { id: "h5", label: "Housing",        roomId: "r-hous", color: "primary",     momentum: "+5%" },
] as const;

// ----- Mock thread messages --------------------------------------------------
type Msg = { id: string; author: string; district: string; tier: 1 | 2 | 3; text: string; time: string; likes: number; mod?: boolean };
const SAMPLE_THREAD: Msg[] = [
  { id: "m1", author: "Marcus T.", district: "District 7", tier: 2, text: "Grocery prices are up 22% in my zip since last year. Need real action, not talking points.", time: "12m", likes: 84, mod: true },
  { id: "m2", author: "Priya S.",  district: "District 7", tier: 3, text: "Agreed — but tariffs vs subsidies matters. Which bill is closest to moving in committee?", time: "8m",  likes: 41 },
  { id: "m3", author: "James K.",  district: "District 4", tier: 2, text: "Cross-district neighbor here. Our co-op model dropped staples 9%. Happy to share notes.", time: "3m",  likes: 17 },
];

function useTierGate() {
  // Mock: read user verification tier (1=email, 2=address, 3=in-person)
  // Replace with real auth selector later.
  return { tier: 2 as 1 | 2 | 3 };
}

function Discuss() {
  const { tier } = useTierGate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"trending" | "local">("trending");
  const [openRoom, setOpenRoom] = useState<Room | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const trending = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ROOMS
      .filter(r => !q || r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
      .sort((a, b) => b.participants - a.participants);
  }, [query]);

  const local = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LOCAL_ROOMS.filter(r => !q || r.title.toLowerCase().includes(q));
  }, [query]);

  const featured = trending[0];
  const list = filter === "trending" ? trending : local;
  const liveCount = trending.filter(r => r.active).length;

  return (
    <div className="safe-top">
      {/* ---- Header ---- */}
      <header className="px-5 pb-5 pt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary ring-1 ring-primary/25">
          <MessagesSquare className="h-2.5 w-2.5" /> Discuss
          <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-success/15 px-1.5 py-px text-[9px] font-extrabold uppercase tracking-wider text-success ring-1 ring-success/30">
            <LiveDot /> {liveCount} Live
          </span>
        </div>
        <h1 className="mt-2.5 text-[26px] font-bold leading-[1.15] tracking-tight">
          Calm rooms,
          <span className="block text-muted-foreground font-semibold">verified neighbors only.</span>
        </h1>
      </header>

      {/* ---- Trust strip ---- */}
      <section className="mx-5 mb-4 rounded-2xl border border-border/60 bg-gradient-card p-3 shadow-card">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/15 text-success ring-1 ring-success/25">
            <ShieldCheck className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-success">Civil discourse</div>
            <div className="mt-0.5 text-[12.5px] leading-snug text-foreground/90">
              Every voice verified. No anonymous trolls, no algorithmic outrage.
            </div>
          </div>
        </div>
      </section>

      {/* ---- Search + New Room ---- */}
      <section className="mx-5 mb-4 flex items-center gap-2">
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-border/60 bg-surface/80 px-3 py-2 ring-1 ring-inset ring-border/30 focus-within:ring-primary/40">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search rooms or topics"
            className="w-full bg-transparent text-[13px] font-medium text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex h-[38px] items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/15 px-3 text-[12px] font-bold tracking-tight text-primary shadow-[0_1px_0_0_oklch(1_0_0/4%)_inset,0_4px_14px_-10px_oklch(0_0_0/60%)] active:scale-[0.97]"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.6} /> New
        </button>
      </section>

      {/* ---- Hot Topics Carousel ---- */}
      <section className="mb-5">
        <div className="mb-2.5 flex items-center justify-between px-5">
          <h2 className="inline-flex items-center gap-1.5 text-[13px] font-bold tracking-tight">
            <Flame className="h-3.5 w-3.5 text-warning" /> Hot Topics
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trending nationally</span>
        </div>
        <ul className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {HOT_TOPICS.map(t => {
            const r = ROOMS.find(x => x.id === t.roomId)!;
            return (
              <li key={t.id} className="snap-start shrink-0">
                <button
                  type="button"
                  onClick={() => setOpenRoom(r)}
                  className="group relative flex w-[180px] flex-col gap-1.5 rounded-2xl border border-border/60 bg-gradient-card p-3 text-left shadow-card transition-all hover:border-primary/40 active:scale-[0.985]"
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "rounded-full px-1.5 py-px text-[9px] font-extrabold uppercase tracking-wider ring-1",
                      t.color === "destructive" && "bg-destructive/15 text-destructive ring-destructive/30",
                      t.color === "warning"     && "bg-warning/15 text-warning ring-warning/30",
                      t.color === "primary"     && "bg-primary/15 text-primary ring-primary/30",
                      t.color === "success"     && "bg-success/15 text-success ring-success/30",
                    )}>
                      <Flame className="-mt-0.5 mr-0.5 inline h-2.5 w-2.5" /> {t.momentum}
                    </span>
                    {r.active && <LiveBadge compact />}
                  </div>
                  <div className="mt-0.5 text-[13px] font-bold leading-tight tracking-tight">{t.label}</div>
                  <div className="mt-auto flex items-center gap-2 text-[10px] font-semibold text-muted-foreground tabular-nums">
                    <Users className="h-2.5 w-2.5" /> {r.participants.toLocaleString()}
                    <span className="text-border">·</span>
                    <Sparkles className="h-2.5 w-2.5 text-primary" /> {r.pulse}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---- Featured Civic Debate ---- */}
      {featured && (
        <section className="mx-5 mb-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1.5 text-[13px] font-bold tracking-tight">
              <Star className="h-3.5 w-3.5 text-warning" fill="currentColor" /> Featured Debate
            </h2>
            <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-warning ring-1 ring-warning/30">Today</span>
          </div>
          <button
            type="button"
            onClick={() => setOpenRoom(featured)}
            className="group relative w-full overflow-hidden rounded-2xl border border-primary/30 bg-gradient-card p-5 text-left shadow-card transition-all duration-300 hover:border-primary/55 hover:-translate-y-[1px] hover:shadow-[0_18px_44px_-24px_oklch(0.79_0.13_230/35%)] active:scale-[0.99]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-warning/5 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <LiveBadge />
                {featured.moderated && <ModeratedBadge />}
              </div>
              <h3 className="mt-2 text-[16px] font-bold leading-tight tracking-tight">{featured.title}</h3>
              <p className="mt-1 text-[12px] font-medium text-muted-foreground">
                Highest-engagement civic debate in your network this week.
              </p>
              <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold text-muted-foreground tabular-nums">
                <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {featured.participants.toLocaleString()}</span>
                <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" /> Pulse {featured.pulse}</span>
                <span className="ml-auto inline-flex items-center gap-1 text-primary">Join <ChevronRight className="h-3 w-3" /></span>
              </div>
            </div>
          </button>
        </section>
      )}

      {/* ---- Filter tabs ---- */}
      <section className="mx-5 mb-3 flex items-center gap-2">
        <div className="inline-flex rounded-xl border border-border/60 bg-surface/70 p-0.5 ring-1 ring-inset ring-border/30">
          {(["trending", "local"] as const).map(k => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[11.5px] font-bold tracking-tight transition-colors",
                filter === k ? "bg-primary/20 text-primary ring-1 ring-primary/30" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {k === "trending" ? "Trending" : "My District"}
            </button>
          ))}
        </div>
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <Filter className="h-3 w-3" /> {list.length}
        </span>
      </section>

      {/* ---- Active Rooms List ---- */}
      <section className="px-5 pb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold tracking-tight">
            {filter === "trending" ? "Active Rooms" : "My District Discussions"}
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-success ring-1 ring-success/25">
            <LiveDot /> {list.filter(r => r.active).length} Live
          </span>
        </div>

        {list.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <ul className="space-y-4">
            {list.map((r, idx) => (
              <li key={r.id}>
                <RoomCard rank={filter === "trending" ? idx + 1 : undefined} room={r} onOpen={() => setOpenRoom(r)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---- Room thread overlay ---- */}
      {openRoom && (
        <RoomThread room={openRoom} tier={tier} onClose={() => setOpenRoom(null)} />
      )}

      {/* ---- Create Room modal ---- */}
      {createOpen && (
        <CreateRoomModal tier={tier} onClose={() => setCreateOpen(false)} />
      )}
    </div>
  );
}

// ============================================================================
// Subcomponents
// ============================================================================

function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-1.5 w-1.5", className)}>
      <span className="absolute inset-0 animate-ping rounded-full bg-success/80 opacity-75" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
    </span>
  );
}

function LiveBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full bg-success/15 font-extrabold uppercase tracking-wider text-success ring-1 ring-success/30",
      compact ? "px-1.5 py-px text-[9px]" : "px-2 py-0.5 text-[10px]",
    )}>
      <LiveDot /> Live
    </span>
  );
}

function ModeratedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-1.5 py-px text-[9px] font-extrabold uppercase tracking-wider text-primary ring-1 ring-primary/25">
      <ShieldCheck className="h-2.5 w-2.5" /> Verified Locals
    </span>
  );
}

function RoomCard({ room, onOpen, rank }: { room: Room; onOpen: () => void; rank?: number }) {
  const live = room.active;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border bg-gradient-card p-5 text-left shadow-card transition-all duration-300 hover:-translate-y-[1px] active:scale-[0.99] cursor-pointer",
        live
          ? "border-success/40 hover:border-success/65 hover:shadow-[0_18px_44px_-24px_oklch(0.60_0.09_168/55%)] shadow-[inset_0_1px_0_0_oklch(1_0_0/4%),0_0_22px_-14px_oklch(0.60_0.09_168/65%)]"
          : "border-border/60 hover:border-primary/45 hover:shadow-[0_18px_44px_-24px_oklch(0.79_0.13_230/30%)]",
      )}
    >
      {live && (
        <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-success via-success/70 to-success/30" />
      )}
      <div className={cn(
        "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
        live ? "bg-success/15 text-success ring-success/35" : "bg-primary/12 text-primary ring-primary/25",
      )}>
        <MessagesSquare className="h-5 w-5" strokeWidth={2.3} />
        {rank !== undefined && rank <= 3 && (
          <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-warning px-1 text-[9px] font-extrabold text-warning-foreground ring-2 ring-background">
            {rank}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[14px] font-semibold tracking-tight">{room.title}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">{room.scope}</span>
          <span className="text-border">·</span>
          <span className="text-[10.5px] font-semibold text-muted-foreground">{room.category}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {live && <LiveBadge compact />}
          {room.moderated && <ModeratedBadge />}
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-elevated/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground tabular-nums ring-1 ring-border/40">
            <Users className="h-2.5 w-2.5" /> {room.participants.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary tabular-nums ring-1 ring-primary/25">
            <Sparkles className="h-2.5 w-2.5" /> Pulse {room.pulse}
          </span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </button>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-surface/40 p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/25">
        <MessagesSquare className="h-5 w-5" />
      </div>
      <div className="mt-3 text-[13px] font-bold tracking-tight">No active rooms here yet</div>
      <p className="mt-1 text-[11.5px] text-muted-foreground leading-snug">
        Be the first verified neighbor to start a civic conversation in your district.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/15 px-3 py-1.5 text-[11.5px] font-bold text-primary"
      >
        <Plus className="h-3 w-3" /> Start a Room
      </button>
    </div>
  );
}

// ----- Room thread overlay --------------------------------------------------
function RoomThread({ room, tier, onClose }: { room: Room; tier: 1 | 2 | 3; onClose: () => void }) {
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>(SAMPLE_THREAD);
  const canPost = tier >= 2;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const send = () => {
    const text = draft.trim();
    if (!text || !canPost) return;
    setMsgs(prev => [
      ...prev,
      { id: `m${Date.now()}`, author: "You", district: "District 7", tier, text, time: "now", likes: 0 },
    ]);
    setDraft("");
    setTimeout(() => scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 30);
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur-xl">
      {/* Header */}
      <header className="safe-top border-b border-border/60 bg-surface/80 px-4 pb-3 pt-4">
        <div className="flex items-start gap-2">
          <button onClick={onClose} className="-ml-1 flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent active:scale-95">
            <X className="h-4.5 w-4.5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {room.active && <LiveBadge />}
              {room.moderated && <ModeratedBadge />}
              <span className="rounded-full bg-surface-elevated/80 px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-muted-foreground ring-1 ring-border/40">
                {room.scope}
              </span>
            </div>
            <h2 className="mt-1.5 text-[17px] font-bold leading-tight tracking-tight">{room.title}</h2>
            <div className="mt-1 flex items-center gap-3 text-[11px] font-semibold text-muted-foreground tabular-nums">
              <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {room.participants.toLocaleString()}</span>
              <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" /> Pulse {room.pulse}</span>
              <span className="inline-flex items-center gap-1 text-success"><LiveDot /> active now</span>
            </div>
          </div>
        </div>
      </header>

      {/* Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        {msgs.map(m => (
          <article key={m.id} className="rounded-2xl border border-border/60 bg-gradient-card p-3 shadow-card">
            <header className="flex items-center gap-1.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary text-[10.5px] font-bold ring-1 ring-primary/25">
                {m.author.split(" ").map(s => s[0]).join("").slice(0, 2)}
              </span>
              <span className="text-[12px] font-bold tracking-tight">{m.author}</span>
              <TierChip tier={m.tier} />
              {m.mod && <ModeratedBadge />}
              <span className="ml-auto text-[10px] font-semibold text-muted-foreground">{m.time}</span>
            </header>
            <div className="mt-0.5 text-[10.5px] font-semibold text-muted-foreground">{m.district}</div>
            <p className="mt-2 text-[13px] leading-snug text-foreground/95">{m.text}</p>
            <footer className="mt-2.5 flex items-center gap-3 text-[11px] font-bold text-muted-foreground">
              <button className="inline-flex items-center gap-1 hover:text-primary"><ThumbsUp className="h-3 w-3" /> {m.likes}</button>
              <button className="inline-flex items-center gap-1 hover:text-primary"><Reply className="h-3 w-3" /> Reply</button>
            </footer>
          </article>
        ))}
      </div>

      {/* Composer */}
      <div className="safe-bottom border-t border-border/60 bg-surface/90 px-3 pb-3 pt-2.5">
        {canPost ? (
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Add a verified, civil reply…"
              rows={1}
              className="min-h-[40px] max-h-[120px] flex-1 resize-none rounded-xl border border-border/60 bg-surface px-3 py-2 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/70 ring-1 ring-inset ring-border/30 focus:outline-none focus:ring-primary/40"
            />
            <button
              onClick={send}
              disabled={!draft.trim()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow disabled:opacity-40 active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2.5 text-[12px] font-semibold text-warning">
            <Lock className="h-3.5 w-3.5" />
            Verify your address (Tier 2) to post in district rooms.
          </div>
        )}
      </div>
    </div>
  );
}

function TierChip({ tier }: { tier: 1 | 2 | 3 }) {
  const label = tier === 3 ? "T3 In-Person" : tier === 2 ? "T2 Address" : "T1 Email";
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[9px] font-extrabold uppercase tracking-wider ring-1",
      tier === 3 && "bg-success/15 text-success ring-success/30",
      tier === 2 && "bg-primary/15 text-primary ring-primary/30",
      tier === 1 && "bg-muted text-muted-foreground ring-border/40",
    )}>
      <CheckCircle2 className="h-2.5 w-2.5" /> {label}
    </span>
  );
}

// ----- Create Room modal -----------------------------------------------------
function CreateRoomModal({ tier, onClose }: { tier: 1 | 2 | 3; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("Economy");
  const [desc, setDesc] = useState("");
  const gated = tier < 2;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Smart dedupe — flag near-duplicate of existing room titles
  const dupe = useMemo(() => {
    const t = title.trim().toLowerCase();
    if (t.length < 4) return null;
    return ROOMS.find(r => {
      const a = r.title.toLowerCase();
      return a.includes(t) || t.includes(a.split(" ")[0]);
    }) ?? null;
  }, [title]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-background/70 backdrop-blur-xl sm:items-center">
      <div className="safe-bottom relative w-full max-w-md rounded-t-3xl border border-border/60 bg-surface p-5 shadow-card sm:rounded-3xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="inline-flex items-center gap-1.5 text-[15px] font-bold tracking-tight">
            <Plus className="h-4 w-4 text-primary" /> Start a New Room
          </h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>

        {gated ? (
          <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4">
            <div className="flex items-start gap-2">
              <Lock className="mt-0.5 h-4 w-4 text-warning" />
              <div>
                <div className="text-[12.5px] font-bold text-warning">Tier 2 verification required</div>
                <p className="mt-1 text-[11.5px] text-warning/90 leading-snug">
                  To prevent spam, only address-verified neighbors can open new rooms. Verify your address to unlock.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Affordable Childcare in District 7"
                className="mt-1 w-full rounded-xl border border-border/60 bg-surface-elevated/60 px-3 py-2 text-[13px] font-medium ring-1 ring-inset ring-border/30 focus:outline-none focus:ring-primary/40"
              />
              {dupe && (
                <div className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-warning/10 px-2 py-1.5 text-[11px] font-semibold text-warning ring-1 ring-warning/25">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                  Similar room exists: <span className="underline">{dupe.title}</span>. Consider joining instead.
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Category</label>
              <select
                value={cat}
                onChange={e => setCat(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border/60 bg-surface-elevated/60 px-3 py-2 text-[13px] font-medium ring-1 ring-inset ring-border/30 focus:outline-none focus:ring-primary/40"
              >
                {["Economy","Immigration","Education","Healthcare","Housing","Technology","Climate","Safety","Fiscal","Transit","Civic"].map(c =>
                  <option key={c} value={c}>{c}</option>
                )}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Short description</label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                rows={3}
                placeholder="What's the question or focus for this room?"
                className="mt-1 w-full resize-none rounded-xl border border-border/60 bg-surface-elevated/60 px-3 py-2 text-[13px] font-medium ring-1 ring-inset ring-border/30 focus:outline-none focus:ring-primary/40"
              />
            </div>

            <div className="rounded-xl border border-border/60 bg-surface-elevated/40 p-2.5">
              <div className="flex items-start gap-1.5 text-[10.5px] font-semibold text-muted-foreground leading-snug">
                <Info className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                <span>
                  Limit 2 new rooms/week. Rooms in Safety, Healthcare & Elections receive optional moderator review before going public.
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={!title.trim() || !desc.trim() || !!dupe}
              onClick={onClose}
              className="w-full rounded-xl bg-primary py-2.5 text-[13px] font-bold text-primary-foreground shadow-glow disabled:opacity-40 active:scale-[0.98]"
            >
              Submit for Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
