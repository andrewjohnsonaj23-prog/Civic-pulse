import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Phone, MessageCircle, ChevronRight, ChevronLeft, ChevronDown, X, Users, ShieldCheck,
  ThumbsUp, AlertTriangle, Megaphone, Sparkles, CheckCircle2, Vote, Clock,
  TrendingUp, TrendingDown, Send, Info, Lock, Mail, Activity, Landmark, ExternalLink,
} from "lucide-react";
import { REPS, type Rep } from "@/lib/mock-data";
import { CircularGauge } from "@/components/CircularGauge";
import { cn } from "@/lib/utils";

// ---- 24h action lockout (one Thank / one Hold per rep per day) --------------
const LOCK_MS = 24 * 60 * 60 * 1000;
type LockKey = `${string}:${"thank" | "hold"}`;
function readLocks(): Record<LockKey, number> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("cp:rep-locks") ?? "{}"); } catch { return {}; }
}
function writeLocks(l: Record<LockKey, number>) {
  if (typeof window !== "undefined") localStorage.setItem("cp:rep-locks", JSON.stringify(l));
}
function fmtRemaining(ms: number) {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export const Route = createFileRoute("/_tabs/reps")({
  component: MyReps,
  head: () => ({ meta: [{ title: "My Reps — CivicPulse" }] }),
});

const haptic = (ms = 10) => { if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(ms); };

// ---- Extra mock signal per rep -----------------------------------------------
type RepExtras = {
  billSupport: number;            // 0-100 — how often they support bills aligned with district pulse
  votesSentThisMonth: number;     // votes the user routed to this rep
  thanks: number;                 // live counter
  accountable: number;            // live counter
  verified: boolean;
  activity: { id: string; tone: "good" | "bad" | "neutral"; text: string; time: string }[];
};

const EXTRAS: Record<string, RepExtras> = {
  r1: {
    billSupport: 86, votesSentThisMonth: 7, thanks: 1284, accountable: 142, verified: true,
    activity: [
      { id: "a1", tone: "good", text: "Co-sponsored your District 7 insulin bill", time: "2h ago" },
      { id: "a2", tone: "good", text: "Voted YES on Maple Street school rebuild (87% pulse)", time: "yesterday" },
      { id: "a3", tone: "neutral", text: "Town hall Thursday 7pm at the rec center", time: "3d ago" },
    ],
  },
  r2: {
    billSupport: 38, votesSentThisMonth: 4, thanks: 312, accountable: 1864, verified: true,
    activity: [
      { id: "a1", tone: "bad", text: "Voted NO on insulin cap — against 81% district pulse", time: "1d ago" },
      { id: "a2", tone: "bad", text: "Skipped vote on bridge retrofit (92% pulse)", time: "4d ago" },
      { id: "a3", tone: "neutral", text: "Statement issued on state budget", time: "1w ago" },
    ],
  },
  r3: {
    billSupport: 74, votesSentThisMonth: 5, thanks: 942, accountable: 188, verified: true,
    activity: [
      { id: "a1", tone: "good", text: "Sponsored Senior Property Tax Relief", time: "5h ago" },
      { id: "a2", tone: "good", text: "Replied to 18 District 7 messages this week", time: "2d ago" },
      { id: "a3", tone: "neutral", text: "Hearing scheduled May 6 — insulin cap", time: "1w ago" },
    ],
  },
  r4: {
    billSupport: 64, votesSentThisMonth: 9, thanks: 488, accountable: 1320, verified: true,
    activity: [
      { id: "a1", tone: "bad", text: "22% response rate — flagged for follow-up", time: "today" },
      { id: "a2", tone: "good", text: "Voted YES on disaster relief reform (84% pulse)", time: "3d ago" },
      { id: "a3", tone: "bad", text: "Missed vote on voting rights modernization", time: "1w ago" },
    ],
  },
};

// ---- Donor transparency (mock FEC + OpenSecrets data) ----------------------
type DonorRisk = "Low" | "Medium" | "High";
type DonorRow = { name: string; amount: string; note: string };
type DonorData = {
  risk: DonorRisk;
  donors: DonorRow[];
  observations: string[];
};
const DONORS: Record<string, DonorData> = {
  r1: {
    risk: "Low",
    donors: [
      { name: "District 7 Small Donors (avg $42)", amount: "$184,200", note: "92% of total raised from individuals under $200" },
      { name: "National Nurses United PAC",        amount: "$10,000",  note: "Voted with healthcare worker position 94% of the time" },
      { name: "Teachers Federation Local 401",     amount: "$7,500",   note: "Co-sponsored 3 of 4 education bills they prioritized" },
      { name: "Sierra Club Action Fund",           amount: "$5,000",   note: "Alignment with stated environmental positions noted" },
    ],
    observations: [
      "Majority of funding from small-dollar District 7 donors.",
      "No single industry exceeds 8% of total receipts this cycle.",
    ],
  },
  r2: {
    risk: "High",
    donors: [
      { name: "American Petroleum Institute PAC",  amount: "$48,500", note: "Voted with industry position 87% of the time on key bills" },
      { name: "PhRMA Federal Action",              amount: "$32,000", note: "Voted NO on insulin cap aligned with industry position" },
      { name: "Atlantic Resource Holdings Inc.",   amount: "$25,000", note: "Major contributor — 4 alignment instances on energy votes" },
      { name: "Federal Insurance Council",         amount: "$18,750", note: "Voted with industry position on 6 of 7 healthcare bills" },
      { name: "Independent Energy Coalition",      amount: "$15,000", note: "Co-sponsored 2 industry-priority bills this cycle" },
    ],
    observations: [
      "Top 5 donors are concentrated in energy, pharma, and insurance sectors.",
      "Industry-aligned voting pattern noted on 12 of 14 priority bills.",
      "Small-dollar donor share is 14% of cycle receipts.",
    ],
  },
  r3: {
    risk: "Low",
    donors: [
      { name: "District 7 Small Donors (avg $58)", amount: "$142,800", note: "78% of total raised from individuals under $200" },
      { name: "AARP Action Fund",                  amount: "$8,500",   note: "Sponsored Senior Property Tax Relief — alignment noted" },
      { name: "Local Realtors Association",        amount: "$6,000",   note: "Voted with housing affordability position 81% of cycle" },
      { name: "AFL-CIO Regional",                  amount: "$5,000",   note: "Alignment on labor-related votes this cycle" },
    ],
    observations: [
      "Strong small-dollar base; no single PAC exceeds 5% of cycle receipts.",
      "Donor sectors broadly diversified across labor, seniors, and housing.",
    ],
  },
  r4: {
    risk: "Medium",
    donors: [
      { name: "Tennessee Bankers PAC",             amount: "$22,000", note: "Voted with industry position 71% of the time on finance bills" },
      { name: "Federal Defense Suppliers Group",   amount: "$18,500", note: "Major contributor — alignment on 3 procurement votes" },
      { name: "National Realty Federation",        amount: "$12,000", note: "Voted with stated industry position on zoning reform" },
      { name: "Mid-South Energy Council",          amount: "$9,500",  note: "Alignment noted on 2 regional energy votes" },
      { name: "District 7 Small Donors (avg $61)", amount: "$48,300", note: "26% of total raised from individuals under $200" },
    ],
    observations: [
      "Mixed funding profile — institutional donors balanced with regional small donors.",
      "Industry alignment moderate; pattern most notable on finance and energy bills.",
    ],
  },
};

const GLOBAL_THANKS_TODAY = 412;
const GLOBAL_HOLDS_TODAY = 188;

// Reps currently flagged as "Surge — Rapid Pressure Building" (holds rising sharply)
const SURGE_IDS = new Set<string>(["r4"]);

// Public, anonymized live activity strings rotated under each rep card
const LIVE_ACTIVITY: Record<string, string> = {
  r1: "12 verified users in District 7 thanked Maria in the last hour",
  r2: "47 verified users held James accountable in the last hour",
  r3: "8 verified users thanked Aisha in the last hour",
  r4: "23 Nashville users held Daniel accountable in the last hour",
  r5: "5 verified users contacted Sarah's office in the last hour",
};

// ---- National Rep Pulse Rankings (mock leaderboard) -------------------------
type NationalRep = {
  id: string; name: string; district: string; level: "Federal" | "State";
  photo: string; alignment: number; responseRate: number;
  thanks: number; holds: number; surge?: boolean; verified?: boolean;
  holdsTrend: number;     // % change in Hold Accountable actions (24h)
  alignmentTrend: number; // % movement in Pulse / Alignment score
  party: "D" | "R" | "I";
};
const SEED_NATIONAL: NationalRep[] = [
  { id: "n1",  name: "Elena Vargas",    district: "CA-12 · Federal", level: "Federal", party: "D", photo: "👩🏽‍💼", alignment: 92, responseRate: 88, thanks: 9420, holds: 210,  holdsTrend: 6,   alignmentTrend: 8,  verified: true },
  { id: "n2",  name: "Marcus Bell",     district: "GA-05 · Federal", level: "Federal", party: "D", photo: "👨🏿‍💼", alignment: 87, responseRate: 74, thanks: 7180, holds: 340,  holdsTrend: 4,   alignmentTrend: 5,  verified: true },
  { id: "n3",  name: "Priya Natarajan", district: "NY State Sen.",   level: "State",   party: "D", photo: "👩🏽",    alignment: 84, responseRate: 81, thanks: 6420, holds: 290,  holdsTrend: 9,   alignmentTrend: 11, verified: true },
  { id: "n4",  name: "Daniel Okafor",   district: "TN-07 · Federal", level: "Federal", party: "D", photo: "👨🏿‍💼", alignment: 68, responseRate: 22, thanks: 488,  holds: 1320, holdsTrend: 218, alignmentTrend: -4, surge: true, verified: true },
  { id: "n5",  name: "Tom Bridges",     district: "OH-04 · Federal", level: "Federal", party: "R", photo: "👨🏼‍💼", alignment: 33, responseRate: 14, thanks: 220,  holds: 2840, holdsTrend: 312, alignmentTrend: -7, surge: true, verified: true },
  { id: "n6",  name: "Sofia Reyes",     district: "TX State Asm.",   level: "State",   party: "D", photo: "👩🏽‍💼", alignment: 79, responseRate: 69, thanks: 3210, holds: 410,  holdsTrend: 3,   alignmentTrend: 4,  verified: true },
  { id: "n7",  name: "James Whitaker",  district: "ST-14 · State",   level: "State",   party: "R", photo: "👨🏼‍💼", alignment: 41, responseRate: 38, thanks: 312,  holds: 1864, holdsTrend: 142, alignmentTrend: -2, surge: true, verified: true },
  { id: "n8",  name: "Aisha Robinson",  district: "ST-22 · State",   level: "State",   party: "D", photo: "👩🏾‍💼", alignment: 76, responseRate: 64, thanks: 942,  holds: 188,  holdsTrend: 7,   alignmentTrend: 14, verified: true },
  { id: "n9",  name: "Henry Park",      district: "WA-09 · Federal", level: "Federal", party: "D", photo: "👨🏻‍💼", alignment: 71, responseRate: 58, thanks: 2110, holds: 520,  holdsTrend: 5,   alignmentTrend: 9,  verified: true },
  { id: "n10", name: "Lucia Mendoza",   district: "FL State Sen.",   level: "State",   party: "R", photo: "👩🏽",    alignment: 64, responseRate: 47, thanks: 1480, holds: 690,  holdsTrend: 32,  alignmentTrend: 2,  verified: true },
];

// Generate a deterministic Top 100 leaderboard from the seed set
const FIRST_NAMES = ["Elena","Marcus","Priya","Daniel","Tom","Sofia","James","Aisha","Henry","Lucia","Avery","Jordan","Noah","Mia","Ethan","Olivia","Liam","Zara","Diego","Maya","Naomi","Caleb","Rosa","Owen","Hana","Ines","Kai","Lena","Omar","Riya","Theo","Vera","Wes","Yumi","Anya","Bruno","Cleo","Devi","Esi","Faye"];
const LAST_NAMES  = ["Vargas","Bell","Natarajan","Okafor","Bridges","Reyes","Whitaker","Robinson","Park","Mendoza","Hayes","Singh","Nguyen","Carter","Lopez","Patel","Adler","Kowalski","Tanaka","Brooks","Khan","Ortiz","Sasaki","Doyle","Marin","Becker","Vidal","Quincy","Holm","Greene"];
const STATES = ["CA","NY","TX","FL","OH","GA","WA","TN","IL","PA","MI","NC","AZ","CO","MA","OR","VA","NJ","MN","WI"];
const PHOTOS = ["👩🏽‍💼","👨🏿‍💼","👩🏻‍💼","👨🏼‍💼","👩🏾‍💼","👨🏻‍💼","👩🏽","👨🏽‍💼","👩🏼‍💼","👨🏾‍💼"];
const PARTIES: Array<"D"|"R"|"I"> = ["D","R","D","R","I","D","R","D"];

const FULL_NATIONAL: NationalRep[] = (() => {
  const list = [...SEED_NATIONAL];
  for (let i = list.length; i < 100; i++) {
    const seed = i * 73;
    const fn = FIRST_NAMES[seed % FIRST_NAMES.length];
    const ln = LAST_NAMES[(seed * 7) % LAST_NAMES.length];
    const st = STATES[(seed * 3) % STATES.length];
    const lvl: "Federal" | "State" = i % 3 === 0 ? "State" : "Federal";
    const alignment = 22 + ((seed * 11) % 70);
    const responseRate = 12 + ((seed * 17) % 80);
    const holds = 80 + ((seed * 29) % 2600);
    const thanks = 120 + ((seed * 41) % 7800);
    const holdsTrend = ((seed * 53) % 320) - 20;
    const alignmentTrend = ((seed * 31) % 30) - 12;
    const surge = holdsTrend > 120;
    list.push({
      id: `n${i + 1}`,
      name: `${fn} ${ln}`,
      district: lvl === "Federal" ? `${st}-${String((i % 30) + 1).padStart(2, "0")} · Federal` : `${st} State ${i % 2 ? "Sen." : "Asm."}`,
      level: lvl,
      party: PARTIES[i % PARTIES.length],
      photo: PHOTOS[i % PHOTOS.length],
      alignment, responseRate, thanks, holds,
      holdsTrend, alignmentTrend, surge,
      verified: true,
    });
  }
  return list;
})();

type RankFilter = "alignment" | "surge" | "lowResponse" | "improved" | "silentMajority";
type LevelFilter = "all" | "Federal" | "State";

function nationalToRep(n: NationalRep): Rep {
  return {
    id: n.id,
    name: n.name,
    title: n.district,
    party: n.party,
    level: n.level,
    alignment: n.alignment,
    responseRate: n.responseRate,
    recentVotes: Math.max(20, Math.round((n.thanks + n.holds) / 40)),
    photo: n.photo,
  };
}


// ---- Page --------------------------------------------------------------------
function MyReps() {
  const [open, setOpen] = useState<Rep | null>(null);
  const [scrollToDonors, setScrollToDonors] = useState(false);
  const openRep = (r: Rep, opts?: { donors?: boolean }) => { setScrollToDonors(!!opts?.donors); setOpen(r); };
  const [pulse, setPulse] = useState<{ id: string; kind: "thank" | "hold" } | null>(null);
  const [counters, setCounters] = useState<Record<string, { thanks: number; accountable: number }>>(
    () => Object.fromEntries(REPS.map(r => [r.id, { thanks: EXTRAS[r.id]?.thanks ?? 0, accountable: EXTRAS[r.id]?.accountable ?? 0 }])),
  );
  const [locks, setLocks] = useState<Record<LockKey, number>>({});
  const [now, setNow] = useState(() => Date.now());
  const [msgAllOpen, setMsgAllOpen] = useState(false);
  const [top100Open, setTop100Open] = useState(false);
  const [nationalOpen, setNationalOpen] = useState(false);

  const openNational = (n: NationalRep) => {
    setCounters(prev => prev[n.id] ? prev : { ...prev, [n.id]: { thanks: n.thanks, accountable: n.holds } });
    setOpen(nationalToRep(n));
  };


  useEffect(() => { setLocks(readLocks()); }, []);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const totalVotesSent = useMemo(
    () => REPS.reduce((s, r) => s + (EXTRAS[r.id]?.votesSentThisMonth ?? 0), 0),
    [],
  );

  // STRICT: one action per rep per 24h. Tapping Thank OR Hold locks BOTH.
  const isLocked = (_id: string, _kind: "thank" | "hold") => {
    const a = locks[`${_id}:thank` as LockKey] ?? 0;
    const b = locks[`${_id}:hold` as LockKey] ?? 0;
    const ts = Math.max(a, b);
    return ts && now - ts < LOCK_MS ? LOCK_MS - (now - ts) : 0;
  };
  const recordedKind = (id: string): "thank" | "hold" | null => {
    const a = locks[`${id}:thank` as LockKey] ?? 0;
    const b = locks[`${id}:hold` as LockKey] ?? 0;
    if (!a && !b) return null;
    return a >= b ? "thank" : "hold";
  };

  const handleAction = (id: string, kind: "thank" | "hold") => {
    if (isLocked(id, kind)) { haptic(4); return; }
    haptic(kind === "hold" ? 22 : 14);
    setCounters(prev => {
      const cur = prev[id] ?? { thanks: 0, accountable: 0 };
      return {
        ...prev,
        [id]: {
          thanks: cur.thanks + (kind === "thank" ? 1 : 0),
          accountable: cur.accountable + (kind === "hold" ? 1 : 0),
        },
      };
    });

    // Lock BOTH actions for this rep for 24h — strict single use, trustworthy counters.
    const ts = Date.now();
    const next = {
      ...readLocks(),
      [`${id}:${kind}` as LockKey]: ts,
      [`${id}:${kind === "thank" ? "hold" : "thank"}` as LockKey]: ts,
    };
    writeLocks(next); setLocks(next); setNow(ts);
    setPulse({ id, kind });
    setTimeout(() => setPulse(null), 1800);
  };


  return (
    <div className="safe-top">

      {/* Header */}
      <header className="px-5 pb-5 pt-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground ring-1 ring-border/60">
            <Users className="h-2.5 w-2.5" /> Accountability
          </span>
        </div>
        <h1 className="mt-3 text-[24px] font-semibold leading-[1.2] tracking-tight text-foreground text-balance">
          Your Representatives
          <span className="block text-muted-foreground">held to the people's pulse.</span>
        </h1>
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
          {REPS.length} officials representing <span className="font-semibold text-foreground">District 7</span> · <span className="tabular-nums text-foreground">{totalVotesSent}</span> of your votes routed this month.
        </p>
      </header>

      {/* District Civic Pulse Score — tappable percentile + small gauge */}
      <DistrictPulseScore />

      {/* Compact stats row */}
      <div className="mx-5 mb-4 grid grid-cols-3 gap-2">
        <MiniStat tone="success" icon={ThumbsUp} label="Thanks today" value={GLOBAL_THANKS_TODAY.toLocaleString()} sub="verified users" />
        <MiniStat tone="destructive" icon={AlertTriangle} label="Held accountable" value={GLOBAL_HOLDS_TODAY.toLocaleString()} sub="verified users" />
        <MiniStat tone="warning" icon={Send} label="Your votes sent" value={totalVotesSent.toString()} sub="this month" />
      </div>

      {/* Message All Reps — matches Home card treatment */}
      <div className="mx-5 mb-5">
        <button
          onClick={() => { haptic(8); setMsgAllOpen(true); }}
          className="group flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-gradient-card px-4 py-3.5 text-left shadow-card transition-colors hover:bg-surface-elevated active:scale-[0.995]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <Mail className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold tracking-tight">Message All Reps</div>
            <div className="truncate text-[10.5px] text-muted-foreground">One message · {REPS.length} verified inboxes</div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-active:translate-x-0.5" />
        </button>
      </div>

      {/* Section label — local reps hero */}
      <div className="mx-5 mb-3 flex items-end justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Your District 7 Reps</div>
          <div className="mt-1 text-[11px] text-muted-foreground/80">Tap any rep for full record & actions</div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-surface px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-success ring-1 ring-success/25">
          <ShieldCheck className="h-2.5 w-2.5" /> {REPS.length} Verified
        </span>
      </div>

      {/* Rep cards */}
      <div className="px-5 pb-6">
        {REPS.map((rep, idx) => {
          const ex = EXTRAS[rep.id];
          const c = counters[rep.id] ?? { thanks: 0, accountable: 0 };

          const pulsing = pulse?.id === rep.id;
          const lockMs = isLocked(rep.id, "thank");
          const recorded = recordedKind(rep.id);
          return (
            <div key={rep.id}>
              {idx > 0 && (
                <div className="my-5 flex items-center gap-2 px-1" aria-hidden>
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                  <span className="h-1 w-1 rounded-full bg-border/70" />
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                </div>
              )}
              <article className="fade-up group overflow-hidden rounded-2xl border border-border/70 bg-gradient-card shadow-card transition-all duration-300 hover:border-primary/35 hover:shadow-[0_18px_44px_-24px_oklch(0.79_0.13_230/35%)]">
              {/* Header row */}
              <button
                onClick={() => setOpen(rep)}
                className="flex w-full items-center gap-3 p-4 text-left transition active:scale-[0.995]"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface text-3xl ring-1 ring-border/60">
                  {rep.photo}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-[15px] font-semibold tracking-tight">{rep.name}</span>
                    <PartyBadge p={rep.party} />
                    {ex?.verified && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-surface px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground ring-1 ring-border/60">
                        <ShieldCheck className="h-2.5 w-2.5" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="truncate text-[11.5px] text-muted-foreground">{rep.title}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Vote className="h-2.5 w-2.5 text-primary" />
                    {ex?.votesSentThisMonth ?? 0} of your votes routed here
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Donor Caution banner — scannable at a glance */}
              {DONORS[rep.id] && (
                <DonorRiskBanner
                  risk={DONORS[rep.id].risk}
                  onClick={(e) => { e.stopPropagation(); haptic(6); openRep(rep, { donors: true }); }}
                />
              )}


              {/* Surge banner — calm, informational */}
              {SURGE_IDS.has(rep.id) && (
                <div className="border-y border-warning/25 bg-warning/[0.06] px-4 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-warning/90">
                      <Activity className="h-3 w-3" strokeWidth={2.25} />
                      Pressure building this week
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-warning/90 ring-1 ring-warning/25">
                      <TrendingUp className="h-2.5 w-2.5" strokeWidth={2.25} /> holds rising
                    </span>
                  </div>
                </div>
              )}


              {/* Gas-gauge report card */}
              <div className="grid grid-cols-3 gap-1.5 border-t border-border/50 bg-background/40 px-3 py-3">
                <GaugeStat value={rep.alignment} label="Alignment" trend={rep.alignment >= 65 ? 4 : -3} />
                <GaugeStat value={rep.responseRate} label="Response" trend={rep.responseRate >= 60 ? 6 : -5} />
                <GaugeStat
                  value={ex?.billSupport ?? 50}
                  label="District Bill Alignment"
                  hintTitle="District Bill Alignment"
                  hint="% of major bills this rep supported that aligned with your verified District 7 pulse."
                  trend={(ex?.billSupport ?? 50) >= 65 ? 2 : -4}
                />
              </div>

              {/* Recent activity */}
              <div className="border-t border-border/50 px-4 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recent activity</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" /> Live
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {(ex?.activity ?? []).slice(0, 2).map(a => (
                    <li key={a.id} className="flex items-start gap-2 text-[12px] leading-snug">
                      <span
                        className={cn(
                          "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                          a.tone === "good" && "bg-success",
                          a.tone === "bad" && "bg-destructive",
                          a.tone === "neutral" && "bg-muted-foreground/60",
                        )}
                      />
                      <span className="flex-1 text-foreground/90">{a.text}</span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{a.time}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Live counter row */}
              <div className="flex items-center justify-between gap-3 border-t border-border/50 bg-background/30 px-4 py-2.5 text-[11px]">
                <span className="inline-flex items-center gap-1.5 text-success">
                  <ThumbsUp className="h-3 w-3" />
                  <span className="font-bold tabular-nums">{c.thanks.toLocaleString()}</span>
                  <span className="text-muted-foreground">verified thanks</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="font-bold tabular-nums">{c.accountable.toLocaleString()}</span>
                  <span className="text-muted-foreground">verified holds</span>
                </span>
              </div>

              {/* Public live activity — anonymized */}
              {LIVE_ACTIVITY[rep.id] && (
                <div className="flex items-center gap-2 border-t border-border/50 bg-surface/30 px-4 py-2 text-[10.5px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/80" />
                  <Activity className="h-3 w-3 shrink-0 text-primary/80" />
                  <span className="truncate">{LIVE_ACTIVITY[rep.id]}</span>
                </div>
              )}



              {/* Recorded confirmation strip */}
              {recorded && (
                <div
                  className={cn(
                    "flex items-center justify-between gap-2 border-t px-4 py-2 text-[10.5px] font-semibold fade-up",
                    recorded === "thank"
                      ? "border-success/30 bg-success/[0.07] text-success"
                      : "border-destructive/30 bg-destructive/[0.07] text-destructive",
                  )}
                >
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 shrink-0" strokeWidth={2.5} />
                    <span className="truncate">
                      {recorded === "thank" ? "Your thanks" : "Your pressure"} was added to District 7 Pulse
                    </span>
                  </span>
                  <span className="shrink-0 text-[9.5px] font-medium uppercase tracking-wider text-muted-foreground">
                    resets {fmtRemaining(lockMs)}
                  </span>
                </div>
              )}

              {/* Calming purpose line — speaks to the silent majority */}
              <p className="border-t border-border/40 bg-background/20 px-4 py-2 text-[10.5px] font-medium leading-snug text-muted-foreground/90">
                Your input here protects what matters in District 7 — peace, family, and stability.
              </p>

              {/* Action row */}
              <div className="grid grid-cols-3 gap-2 border-t border-border/50 p-3">
                <ActionBtn
                  tone="success"
                  Icon={ThumbsUp}
                  label="Thank"
                  pulsing={pulsing && pulse?.kind === "thank"}
                  lockedMs={isLocked(rep.id, "thank")}
                  recorded={recorded === "thank"}
                  onClick={() => handleAction(rep.id, "thank")}
                />
                <ActionBtn
                  tone="destructive"
                  Icon={AlertTriangle}
                  label="Accountable"
                  pulsing={pulsing && pulse?.kind === "hold"}
                  lockedMs={isLocked(rep.id, "hold")}
                  recorded={recorded === "hold"}
                  onClick={() => handleAction(rep.id, "hold")}
                />
                <ActionBtn tone="primary" Icon={MessageCircle} label="Contact" onClick={() => setOpen(rep)} />
              </div>
              </article>
            </div>
          );
        })}
      </div>

      {/* National Rep Pulse Rankings — secondary, broader context (collapsible) */}
      <div className="mx-5 mb-6">
        <button
          onClick={() => { haptic(6); setNationalOpen(o => !o); }}
          className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-gradient-card px-4 py-3 text-left shadow-card transition-colors hover:bg-surface-elevated active:scale-[0.995]"
          aria-expanded={nationalOpen}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-muted-foreground ring-1 ring-border/60">
            <TrendingUp className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Broader Context</div>
            <div className="mt-0.5 text-[13px] font-semibold tracking-tight">National Rep Pulse Rankings</div>
          </div>
          <ChevronRight
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              nationalOpen && "rotate-90",
            )}
          />
        </button>
        {nationalOpen && (
          <div className="-mx-5 mt-3 fade-up">
            <NationalRankings onOpen={openNational} onSeeAll={() => { haptic(6); setTop100Open(true); }} />
          </div>
        )}
      </div>

      {open && (
        <RepDetail
          rep={open}
          counters={counters[open.id] ?? { thanks: 0, accountable: 0 }}
          locks={{ thank: isLocked(open.id, "thank"), hold: isLocked(open.id, "hold") }}
          onClose={() => { setOpen(null); setScrollToDonors(false); }}
          onAction={(k) => handleAction(open.id, k)}
          scrollToDonors={scrollToDonors}
        />
      )}

      {msgAllOpen && <MessageAllReps onClose={() => setMsgAllOpen(false)} />}
      {top100Open && <Top100Modal onClose={() => setTop100Open(false)} onOpen={(n) => { setTop100Open(false); openNational(n); }} />}
    </div>
  );

}



// ---- Sub-components ----------------------------------------------------------

function DistrictPulseScore() {
  const [open, setOpen] = useState(false);
  const value = 84; // percentile
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color = "var(--color-success)";
  return (
    <div className="mx-5 mb-3 mt-1">
      <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-gradient-card px-4 py-3 shadow-card">
        <div className="relative h-[46px] w-[46px] shrink-0">
          <svg width="46" height="46" className="-rotate-90">
            <circle cx="23" cy="23" r={r} stroke="var(--color-border)" strokeOpacity="0.55" strokeWidth="3" fill="none" />
            <circle
              cx="23" cy="23" r={r}
              stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"
              strokeDasharray={c} strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 700ms cubic-bezier(.2,.8,.2,1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[11.5px] font-bold tabular-nums tracking-tight">
            {value}
          </div>
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">District 7 Civic Pulse Score</div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); haptic(6); setOpen(o => !o); }}
            className="mt-0.5 inline-flex items-center gap-1 text-left text-[13px] font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
            aria-label="What does the percentile mean?"
          >
            <span className="tabular-nums">{value}th percentile</span>
            <Info className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      </div>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fade-up mt-1.5 rounded-xl border border-border/70 bg-popover px-3 py-2 text-[11px] leading-snug text-foreground shadow-card"
        >
          Your district ranks in the top 16% nationally for citizen bill activity.
        </div>
      )}
    </div>
  );
}

function MiniStat({
  tone, icon: Icon, label, value, sub,
}: { tone: "success" | "destructive" | "warning"; icon: typeof ThumbsUp; label: string; value: string; sub?: string }) {
  const toneCls =
    tone === "success" ? "text-success bg-success/10 ring-success/25"
    : tone === "destructive" ? "text-destructive bg-destructive/10 ring-destructive/30"
    : "text-warning bg-warning/10 ring-warning/25";
  return (
    <div className="rounded-2xl border border-border/70 bg-gradient-card p-2.5 shadow-card">
      <div className={cn("mb-1 inline-flex h-6 w-6 items-center justify-center rounded-md ring-1", toneCls)}>
        <Icon className="h-3 w-3" strokeWidth={2.25} />
      </div>
      <div className="text-[15px] font-semibold tabular-nums tracking-tight">{value}</div>
      <div className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      {sub && <div className="mt-0.5 text-[8.5px] uppercase tracking-wider text-muted-foreground/70">{sub}</div>}
    </div>
  );
}


function GaugeStat({
  value, label, hint, hintTitle, trend,
}: { value: number; label: string; hint?: string; hintTitle?: string; trend?: number }) {
  const [showHint, setShowHint] = useState(false);
  const tone: "success" | "warning" | "destructive" =
    value >= 65 ? "success" : value >= 45 ? "warning" : "destructive";
  const color =
    tone === "success" ? "var(--color-success)"
    : tone === "warning" ? "var(--color-warning)"
    : "var(--color-destructive)";
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  const trendUp = (trend ?? 0) > 0;
  const trendAbs = Math.abs(trend ?? 0);
  return (
    <div className="relative flex flex-col items-center justify-center rounded-xl border border-border/60 bg-gradient-card px-1 py-2 shadow-card">
      <div className="relative h-[58px] w-[58px]">
        <svg width="58" height="58" className="-rotate-90">
          <circle cx="29" cy="29" r={r} stroke="var(--color-border)" strokeOpacity="0.55" strokeWidth="3" fill="none" />
          <circle
            cx="29" cy="29" r={r}
            stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"
            strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 700ms cubic-bezier(.2,.8,.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold tabular-nums tracking-tight">
          {value}
        </div>
        {trend !== undefined && trendAbs > 0 && (
          <span
            className={cn(
              "absolute -right-1 -top-0.5 inline-flex items-center gap-0.5 rounded-full px-1 py-0.5 text-[8.5px] font-semibold tabular-nums ring-1",
              trendUp ? "bg-success/10 text-success ring-success/25" : "bg-destructive/10 text-destructive ring-destructive/30",
            )}
            aria-label={`${trendUp ? "up" : "down"} ${trendAbs}% vs last month`}
          >
            {trendUp ? <TrendingUp className="h-2 w-2" strokeWidth={2.5} /> : <TrendingDown className="h-2 w-2" strokeWidth={2.5} />}
            {trendAbs}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        {hint && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowHint(s => !s); }}
            className="flex h-3 w-3 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
            aria-label="What is this?"
          >
            <Info className="h-2.5 w-2.5" />
          </button>
        )}
      </div>
      {hint && showHint && (
        <div
          onClick={(e) => { e.stopPropagation(); setShowHint(false); }}
          className="absolute left-1/2 top-full z-20 mt-1 w-[180px] -translate-x-1/2 rounded-xl border border-border/70 bg-popover p-2 text-[10px] leading-snug text-foreground shadow-card backdrop-blur-xl fade-up"
        >
          <div className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{hintTitle ?? label}</div>
          {hint}
        </div>
      )}
    </div>
  );
}


function ActionBtn({
  Icon, label, tone, onClick, pulsing, lockedMs, recorded,
}: {
  Icon: typeof ThumbsUp; label: string;
  tone: "success" | "destructive" | "primary";
  onClick?: () => void; pulsing?: boolean; lockedMs?: number; recorded?: boolean;
}) {
  const locked = (lockedMs ?? 0) > 0;
  const cls = locked
    ? recorded
      ? tone === "success"
        ? "bg-success/12 text-success ring-success/30 cursor-default"
        : tone === "destructive"
        ? "bg-destructive/12 text-destructive ring-destructive/35 cursor-default"
        : "bg-muted/30 text-muted-foreground ring-border/50 cursor-not-allowed"
      : "bg-muted/25 text-muted-foreground ring-border/50 cursor-not-allowed"
    : tone === "success"
      ? "bg-success/12 text-success ring-success/70 hover:bg-success/20 hover:ring-success/85 shadow-[inset_0_1px_0_0_oklch(1_0_0/12%),0_3px_8px_-2px_oklch(0_0_0/50%),0_0_28px_-6px_oklch(0.72_0.21_148/75%)]"
      : tone === "destructive"
      ? "bg-destructive/12 text-destructive ring-destructive/70 hover:bg-destructive/20 hover:ring-destructive/85 shadow-[inset_0_1px_0_0_oklch(1_0_0/12%),0_3px_8px_-2px_oklch(0_0_0/50%),0_0_28px_-6px_oklch(0.65_0.22_25/75%)]"
      : "bg-primary/12 text-primary ring-primary/60 hover:bg-primary/20 hover:ring-primary/75 shadow-[inset_0_1px_0_0_oklch(1_0_0/12%),0_3px_8px_-2px_oklch(0_0_0/50%),0_0_28px_-6px_oklch(0.79_0.13_230/75%)]";
  return (
    <button
      onClick={onClick}
      disabled={locked}
      title={locked ? (recorded ? "Action recorded — resets in 24h" : `Locked — resets in ${fmtRemaining(lockedMs!)}`) : undefined}
      className={cn(
        "relative flex h-[60px] flex-col items-center justify-center gap-1 rounded-xl ring-[3px] font-semibold transition-all duration-300 ease-out active:scale-[0.94] active:brightness-110",
        cls,
      )}
    >
      {locked
        ? (recorded
            ? <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2.5} />
            : <Lock className="h-[18px] w-[18px]" strokeWidth={2.5} />)
        : <Icon className="h-[18px] w-[18px]" strokeWidth={2.5} />}
      <span className="text-[9.5px] font-extrabold uppercase tracking-wider">
        {locked ? (recorded ? "Recorded" : fmtRemaining(lockedMs!)) : label}
      </span>
    </button>
  );
}

function PartyBadge({ p }: { p: Rep["party"] }) {
  const c =
    p === "D" ? "bg-primary/20 text-primary"
    : p === "R" ? "bg-destructive/20 text-destructive"
    : "bg-warning/20 text-warning";
  return <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold", c)}>{p}</span>;
}

// ---- Focused detail view (Discuss-style thread) ------------------------------
function RepDetail({
  rep, counters, locks, onClose, onAction, scrollToDonors,
}: {
  rep: Rep;
  counters: { thanks: number; accountable: number };
  locks: { thank: number; hold: number };
  onClose: () => void;
  onAction: (k: "thank" | "hold") => void;
  scrollToDonors?: boolean;
}) {

  const ex = EXTRAS[rep.id];
  const tone: "success" | "warning" | "primary" =
    rep.alignment >= 65 ? "success" : rep.alignment >= 45 ? "warning" : "primary";
  const [composer, setComposer] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!scrollToDonors) return;
    const t = setTimeout(() => {
      document.getElementById("donor-caution")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => clearTimeout(t);
  }, [scrollToDonors]);

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-md flex-col bg-background fade-up">
      <div className="safe-top flex items-center justify-between border-b border-border/60 bg-background/95 px-4 pb-3 pt-3 backdrop-blur-xl">
        <button
          onClick={() => { haptic(6); onClose(); }}
          className="inline-flex h-9 items-center gap-1 rounded-xl bg-surface px-3 ring-1 ring-border/60 active:scale-95"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">Back</span>
        </button>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {rep.level} · Focused record
        </span>
        <button
          onClick={() => { haptic(6); onClose(); }}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface ring-1 ring-border/60 active:scale-95"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>


      <div className="flex-1 overflow-y-auto px-5 pb-36 pt-5">
        {/* Identity */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-card text-5xl shadow-card ring-1 ring-border/60">
            {rep.photo}
          </div>
          <h2 className="mt-3 text-[22px] font-semibold tracking-tight">{rep.name}</h2>
          <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
            <PartyBadge p={rep.party} /> {rep.title}
            {ex?.verified && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-surface px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground ring-1 ring-border/60">
                <ShieldCheck className="h-2.5 w-2.5" /> Verified
              </span>
            )}
          </div>
        </div>

        {/* Hero gauge */}
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-border/70 bg-gradient-card p-5 shadow-card">
          <CircularGauge
            value={rep.alignment}
            label={`${rep.alignment}%`}
            sublabel="Alignment with District 7"
            tone={tone}
            size={220}
            stroke={10}
          />
          <p className="mt-3 text-center text-[12px] text-muted-foreground">
            Based on <span className="font-semibold text-foreground">{rep.recentVotes}</span> recent votes vs. your verified district pulse.
          </p>
        </div>

        {/* Report card mini-grid */}
        <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl border border-border/70 bg-gradient-card p-3 shadow-card">
          <GaugeStat value={rep.alignment} label="Alignment" trend={rep.alignment >= 65 ? 4 : -3} />
          <GaugeStat value={rep.responseRate} label="Response" trend={rep.responseRate >= 60 ? 6 : -5} />
          <GaugeStat
            value={ex?.billSupport ?? 50}
            label="District Bill Alignment"
            hintTitle="District Bill Alignment"
            hint="% of major bills this rep supported that aligned with your verified District 7 pulse."
            trend={(ex?.billSupport ?? 50) >= 65 ? 2 : -4}
          />

        </div>

        {/* Donor Caution — FEC transparency */}
        <DonorCaution repId={rep.id} />




        {/* Live counters */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <CounterTile
            tone="success" icon={ThumbsUp}
            label="Thanks from constituents"
            value={counters.thanks.toLocaleString()}
          />
          <CounterTile
            tone="destructive" icon={AlertTriangle}
            label="Held accountable"
            value={counters.accountable.toLocaleString()}
          />
        </div>

        {/* Your votes routed */}
        <div className="mt-3 rounded-2xl border border-primary/25 bg-primary/[0.05] p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            <Send className="h-3 w-3" /> Your recent votes sent here
          </div>
          <p className="mt-1.5 text-[12.5px] leading-snug text-foreground/90">
            <span className="font-semibold text-foreground tabular-nums">{ex?.votesSentThisMonth ?? 0}</span> verified District 7 votes routed to {rep.name.split(" ")[0]}'s office this month — including insulin cap, bridge retrofit, and Maple Street rebuild.
          </p>
        </div>

        {/* Activity feed — discuss-style */}
        <div className="mt-3 rounded-2xl border border-border/70 bg-gradient-card p-4 shadow-card">
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="inline-flex items-center gap-1.5 text-[13px] font-semibold tracking-tight">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              Recent record
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-success ring-1 ring-success/25">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Live
            </span>
          </div>
          <ul className="space-y-2.5">
            {(ex?.activity ?? []).map((a, idx) => {
              // Synthesize a district pulse alignment % per activity (mock)
              const pulsePct = a.tone === "good" ? 78 + (idx * 3) % 14 : a.tone === "bad" ? 22 - (idx * 4) % 12 : 55;
              const pulseTone =
                pulsePct >= 65 ? "text-success bg-success/12 ring-success/25"
                : pulsePct >= 45 ? "text-warning bg-warning/12 ring-warning/25"
                : "text-destructive bg-destructive/12 ring-destructive/30";
              return (
                <li key={a.id} className="flex items-start gap-3 rounded-xl bg-surface/40 p-2.5 ring-1 ring-border/40">
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ring-1",
                      a.tone === "good" && "bg-success/15 text-success ring-success/25",
                      a.tone === "bad" && "bg-destructive/15 text-destructive ring-destructive/30",
                      a.tone === "neutral" && "bg-muted/40 text-muted-foreground ring-border/40",
                    )}
                  >
                    {a.tone === "good" ? <CheckCircle2 className="h-3 w-3" strokeWidth={2.75} />
                      : a.tone === "bad" ? <AlertTriangle className="h-3 w-3" strokeWidth={2.75} />
                      : <Sparkles className="h-3 w-3" strokeWidth={2.5} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] leading-snug text-foreground/95">{a.text}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={cn("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 tabular-nums", pulseTone)}>
                        {pulsePct}% pulse
                      </span>
                      <span className="text-[10px] text-muted-foreground">{a.time}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

        </div>

        {/* Composer — prominent */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-border/70 bg-gradient-card shadow-card">
          <div className="flex items-center justify-between border-b border-border/50 bg-surface/40 px-4 py-2.5">
            <h3 className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold tracking-tight text-foreground">
              <Send className="h-3.5 w-3.5 text-primary" /> Send a direct message
            </h3>
            <span className="rounded-full bg-surface px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-success ring-1 ring-success/25">
              Verified inbox
            </span>
          </div>
          <div className="p-4">
            <p className="text-[11px] text-muted-foreground">
              Delivered to {rep.name.split(" ")[0]}'s office & counted in your District 7 pulse.
            </p>
            <textarea
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              rows={3}
              placeholder="Tell your rep what matters to you…"
              className="mt-2 w-full resize-none rounded-xl bg-input/60 px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none ring-1 ring-border/60 focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => { if (composer.trim()) { haptic(14); setSent(true); setComposer(""); setTimeout(() => setSent(false), 1800); } }}
              disabled={!composer.trim()}
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[13px] font-semibold tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
            >
              {sent ? <><CheckCircle2 className="h-4 w-4" /> Delivered to office</> : <><Send className="h-4 w-4" /> Send to {rep.name.split(" ")[0]}'s office</>}
            </button>
          </div>
        </div>

        {/* Push to Media — high-urgency, serious */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-destructive">
            <AlertTriangle className="h-3 w-3" strokeWidth={2.5} />
            High-urgency action
          </div>
          <button
            onClick={() => haptic(22)}
            className="group flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl border border-destructive/40 bg-destructive/[0.06] px-4 py-4 text-left transition-colors hover:bg-destructive/[0.1] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
                <Megaphone className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div>
                <div className="text-[14px] font-semibold uppercase tracking-wider text-destructive">Push to Media</div>
                <div className="mt-0.5 text-[11px] leading-snug text-foreground/80">Escalate this rep's record to 3 local outlets — verified citizens only.</div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-destructive transition-transform group-active:translate-x-1" />
          </button>
        </div>

      </div>

      {/* Persistent action bar */}
      <div className="safe-bottom fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-border/60 bg-background/95 px-5 py-3 backdrop-blur-xl">
        <div className="grid grid-cols-3 gap-2">
          <BarBtn tone="success" Icon={ThumbsUp} label="Thank" lockedMs={locks.thank} onClick={() => onAction("thank")} />
          <BarBtn tone="destructive" Icon={AlertTriangle} label="Hold" lockedMs={locks.hold} onClick={() => onAction("hold")} />
          <BarBtn tone="primary" Icon={Phone} label="Call" onClick={() => haptic(8)} />
        </div>
        {(locks.thank > 0 || locks.hold > 0) && (
          <div className="mt-1.5 text-center text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            One action per rep per day · keeps counters trustworthy
          </div>
        )}

      </div>
    </div>
  );
}

function CounterTile({
  tone, icon: Icon, label, value,
}: { tone: "success" | "destructive"; icon: typeof ThumbsUp; label: string; value: string }) {
  const cls =
    tone === "success"
      ? "border-success/25 bg-success/5 text-success"
      : "border-destructive/30 bg-destructive/5 text-destructive";
  return (
    <div className={cn("rounded-2xl border p-3.5", cls)}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
        <Icon className="h-3 w-3" strokeWidth={2.5} /> {label}
      </div>
      <div className="mt-1 text-[20px] font-semibold tabular-nums tracking-tight text-foreground">{value}</div>
    </div>
  );
}

function BarBtn({
  tone, Icon, label, onClick, lockedMs,
}: {
  tone: "success" | "destructive" | "primary";
  Icon: typeof Phone; label: string; onClick?: () => void; lockedMs?: number;
}) {
  const locked = (lockedMs ?? 0) > 0;
  const cls = locked
    ? "bg-muted/40 text-muted-foreground cursor-not-allowed"
    : tone === "success"
      ? "bg-success text-success-foreground hover:bg-success/90"
      : tone === "destructive"
      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      : "bg-primary text-primary-foreground hover:bg-primary/90";
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={cn(
        "flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl transition-colors active:scale-95",
        cls,
      )}
    >
      {locked ? <Lock className="h-4 w-4" strokeWidth={2.25} /> : <Icon className="h-4 w-4" strokeWidth={2.25} />}
      <span className="text-[9.5px] font-semibold uppercase tracking-wider">
        {locked ? `${fmtRemaining(lockedMs!)} left` : label}
      </span>
    </button>
  );
}

// ---- Message All Reps modal --------------------------------------------------
function MessageAllReps({ onClose }: { onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const send = () => {
    if (!msg.trim()) return;
    haptic(16);
    setSent(true);
    setTimeout(onClose, 1600);
  };
  return (
    <div className="fixed inset-0 z-[55] mx-auto flex max-w-md flex-col justify-end bg-black/60 backdrop-blur-sm fade-up">
      <button onClick={onClose} className="absolute inset-0" aria-label="Close" />
      <div className="safe-bottom relative z-10 rounded-t-2xl border-t border-border/70 bg-background p-5 shadow-card">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <Mail className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <div>
            <div className="text-[15px] font-semibold tracking-tight">Message all {REPS.length} reps</div>
            <div className="text-[11px] text-muted-foreground">One message · delivered to every verified office</div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {REPS.map(r => (
            <span key={r.id} className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1 text-[10.5px] font-semibold ring-1 ring-border/60">
              <span className="text-[12px] leading-none">{r.photo}</span>
              <span className="truncate max-w-[110px]">{r.name}</span>
            </span>
          ))}
        </div>

        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={4}
          placeholder="Tell every rep what matters most to District 7 right now…"
          className="mt-3 w-full resize-none rounded-xl bg-input/60 px-3 py-2.5 text-[13px] outline-none ring-1 ring-border/60 focus:ring-2 focus:ring-primary"
        />

        <div className="mt-2 flex items-center justify-between text-[10.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-primary" /> Counted in District 7 pulse</span>
          <span className="tabular-nums">{msg.length}/500</span>
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <button
            onClick={send}
            disabled={!msg.trim() || sent}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[13px] font-semibold tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
          >
            {sent ? <><CheckCircle2 className="h-4 w-4" /> Delivered to {REPS.length} offices</> : <><Send className="h-4 w-4" /> Send to all {REPS.length}</>}
          </button>
          <button onClick={onClose} className="rounded-xl bg-surface px-4 text-[11.5px] font-semibold uppercase tracking-wider ring-1 ring-border/60 active:scale-95">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- National Rep Pulse Rankings --------------------------------------------
function sortNationals(list: NationalRep[], sort: RankFilter) {
  return [...list].sort((a, b) => {
    if (sort === "alignment")   return b.alignment - a.alignment;
    if (sort === "surge")       return b.holdsTrend - a.holdsTrend;
    if (sort === "lowResponse") return a.responseRate - b.responseRate;
    if (sort === "silentMajority") {
      // Broadly supported, non-extreme: high alignment + high response, low hold-surge
      const score = (r: NationalRep) => r.alignment * 0.6 + r.responseRate * 0.4 - Math.max(0, r.holdsTrend) * 0.15;
      return score(b) - score(a);
    }
    return b.alignmentTrend - a.alignmentTrend;
  });
}

function NationalRankings({ onOpen, onSeeAll }: { onOpen: (n: NationalRep) => void; onSeeAll: () => void }) {
  const [level, setLevel] = useState<LevelFilter>("all");
  const [sort, setSort] = useState<RankFilter>("alignment");

  const filtered = useMemo(() => {
    const byLevel = FULL_NATIONAL.filter(r => level === "all" ? true : r.level === level);
    return sortNationals(byLevel, sort).slice(0, 12);
  }, [level, sort]);

  return (
    <section className="mx-5 mb-6 overflow-hidden rounded-2xl border border-border/70 bg-gradient-card shadow-card">
      {/* Header — compact */}
      <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-background/30 px-4 pt-3 pb-2.5">
        <div className="min-w-0">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Broader Context</div>
          <h2 className="mt-1 text-[13px] font-semibold leading-none tracking-tight">National Rankings</h2>
        </div>
        <button
          onClick={() => { haptic(6); onSeeAll(); }}
          className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1 text-[9.5px] font-semibold uppercase tracking-wider text-foreground ring-1 ring-border/70 hover:bg-surface-elevated active:scale-95"
        >
          View Top 100 <ChevronRight className="h-2.5 w-2.5" />
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border/40 bg-background/20 px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip active={level === "Federal"} onClick={() => { haptic(4); setLevel(l => l === "Federal" ? "all" : "Federal"); }}>Federal</Chip>
        <Chip active={level === "State"}   onClick={() => { haptic(4); setLevel(l => l === "State"   ? "all" : "State"); }}>State</Chip>
        <Chip active={level === "all"}     onClick={() => { haptic(4); setLevel("all"); }}>All</Chip>
        <span className="mx-1 h-3 w-px shrink-0 bg-border/60" />
        <Chip active={sort === "silentMajority"} onClick={() => { haptic(4); setSort("silentMajority"); }}>Silent Majority Pulse</Chip>
        <Chip active={sort === "alignment"}   onClick={() => { haptic(4); setSort("alignment"); }}>Highest Alignment</Chip>
        <Chip active={sort === "surge"}       onClick={() => { haptic(4); setSort("surge"); }}>Most Surge</Chip>
        <Chip active={sort === "lowResponse"} onClick={() => { haptic(4); setSort("lowResponse"); }}>Lowest Response</Chip>
        <Chip active={sort === "improved"}    onClick={() => { haptic(4); setSort("improved"); }}>Most Improved</Chip>
      </div>

      {/* Horizontal scroll list — compact cards */}
      <div className="flex gap-2.5 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filtered.map((r, i) => (
          <RankCard key={r.id} rep={r} rank={i + 1} sort={sort} onClick={() => { haptic(8); onOpen(r); }} />
        ))}
      </div>
    </section>
  );
}

// ---- Top 100 full leaderboard modal -----------------------------------------
function Top100Modal({ onClose, onOpen }: { onClose: () => void; onOpen: (n: NationalRep) => void }) {
  const [level, setLevel] = useState<LevelFilter>("all");
  const [sort, setSort] = useState<RankFilter>("alignment");
  const list = useMemo(() => {
    const byLevel = FULL_NATIONAL.filter(r => level === "all" ? true : r.level === level);
    return sortNationals(byLevel, sort).slice(0, 100);
  }, [level, sort]);

  return (
    <div className="fixed inset-0 z-[60] mx-auto flex max-w-md flex-col bg-background fade-up">
      <div className="safe-top flex items-center justify-between gap-2 border-b border-border/60 bg-background/95 px-4 pb-3 pt-3 backdrop-blur-xl">
        <button onClick={() => { haptic(6); onClose(); }} className="inline-flex h-9 items-center gap-1 rounded-xl bg-surface px-3 ring-1 ring-border/60 active:scale-95">
          <ChevronLeft className="h-4 w-4" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">Back</span>
        </button>
        <div className="text-[12px] font-semibold uppercase tracking-wider">Top 100 · National</div>
        <button onClick={() => { haptic(6); onClose(); }} className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface ring-1 ring-border/60 active:scale-95" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border/40 bg-background/40 px-4 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip active={level === "Federal"} onClick={() => setLevel(l => l === "Federal" ? "all" : "Federal")}>Federal</Chip>
        <Chip active={level === "State"}   onClick={() => setLevel(l => l === "State"   ? "all" : "State")}>State</Chip>
        <Chip active={level === "all"}     onClick={() => setLevel("all")}>All</Chip>
        <span className="mx-1 h-3 w-px shrink-0 bg-border/60" />
        <Chip active={sort === "silentMajority"} onClick={() => setSort("silentMajority")}>Silent Majority</Chip>
        <Chip active={sort === "alignment"}   onClick={() => setSort("alignment")}>Alignment</Chip>
        <Chip active={sort === "surge"}       onClick={() => setSort("surge")}>Surge</Chip>
        <Chip active={sort === "lowResponse"} onClick={() => setSort("lowResponse")}>Low Response</Chip>
        <Chip active={sort === "improved"}    onClick={() => setSort("improved")}>Improved</Chip>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-2.5 overflow-y-auto px-4 py-3 pb-10">
        {list.map((r, i) => (
          <RankCard key={r.id} rep={r} rank={i + 1} sort={sort} onClick={() => { haptic(8); onOpen(r); }} />
        ))}
      </div>
    </div>
  );
}


function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider ring-1 transition-colors active:scale-95",
        active
          ? "bg-foreground/[0.08] text-foreground ring-foreground/25"
          : "bg-surface text-muted-foreground ring-border/60 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function RankCard({ rep, rank, sort, onClick }: { rep: NationalRep; rank: number; sort?: RankFilter; onClick?: () => void }) {
  const tone: "success" | "warning" | "destructive" =
    rep.alignment >= 70 ? "success" : rep.alignment >= 45 ? "warning" : "destructive";
  const color =
    tone === "success" ? "var(--color-success)"
    : tone === "warning" ? "var(--color-warning)"
    : "var(--color-destructive)";
  const radius = 24;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (rep.alignment / 100) * circ;
  const ratio = rep.thanks / Math.max(1, rep.holds);
  const ratioLabel = ratio >= 1 ? `${ratio.toFixed(1)}×` : `1:${(1 / ratio).toFixed(1)}`;
  // Pick which trend to highlight per active sort
  const trendValue =
    sort === "improved" ? rep.alignmentTrend :
    sort === "surge"    ? rep.holdsTrend :
                          rep.alignmentTrend;
  const trendLabel =
    sort === "improved" ? "Pulse Δ" :
    sort === "surge"    ? "Holds Δ" :
                          "Trend";
  const trendCls =
    sort === "surge" && trendValue > 0
      ? "bg-destructive/10 text-destructive ring-destructive/30"
      : trendValue > 0
        ? "bg-success/10 text-success ring-success/25"
        : trendValue < 0
          ? "bg-destructive/10 text-destructive ring-destructive/30"
          : "bg-muted/30 text-muted-foreground ring-border/40";
  return (
    <button
      onClick={onClick}
      className={cn(
        "fade-up relative flex w-[176px] shrink-0 flex-col rounded-2xl border bg-gradient-card p-3 text-left shadow-card transition-colors active:scale-[0.98]",
        rep.surge
          ? "border-destructive/45"
          : "border-border/70 hover:border-border",
      )}
    >
      {/* Rank — clean numeric indicator */}
      <div className="absolute -top-2 left-3 inline-flex h-5 min-w-[28px] items-center justify-center rounded-full bg-background px-1.5 text-[9.5px] font-semibold tabular-nums tracking-wider text-muted-foreground ring-1 ring-border/70">
        {String(rank).padStart(2, "0")}
      </div>

      {/* Identity */}
      <div className="flex items-start gap-2">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-2xl ring-1 ring-border/60">
          {rep.photo}
          {rep.verified && (
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-surface">
              <ShieldCheck className="h-2.5 w-2.5" strokeWidth={2.5} />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12px] font-semibold tracking-tight">{rep.name}</div>
          <div className="truncate text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">{rep.district}</div>
        </div>
      </div>

      {/* Gauge */}
      <div className="mt-2.5 flex items-center gap-2.5">
        <div className="relative h-[54px] w-[54px] shrink-0">
          <svg width="54" height="54" className="-rotate-90">
            <circle cx="27" cy="27" r={radius - 2} stroke="var(--color-border)" strokeOpacity="0.55" strokeWidth="3" fill="none" />
            <circle
              cx="27" cy="27" r={radius - 2}
              stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"
              strokeDasharray={circ - 4 * Math.PI} strokeDashoffset={(circ - 4 * Math.PI) - (rep.alignment / 100) * (circ - 4 * Math.PI)}
              style={{ transition: "stroke-dashoffset 700ms cubic-bezier(.2,.8,.2,1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[12px] font-semibold tabular-nums leading-none">{rep.alignment}</span>
            <span className="text-[7px] font-semibold uppercase tracking-wider text-muted-foreground">Pulse</span>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-1 text-[9.5px]">
            <span className="text-muted-foreground">Resp</span>
            <span className="font-semibold tabular-nums">{rep.responseRate}%</span>
          </div>
          <div className="flex items-center justify-between gap-1 text-[9.5px]">
            <span className="text-muted-foreground">T/H</span>
            <span className={cn("font-semibold tabular-nums", ratio >= 1 ? "text-success" : "text-destructive")}>{ratioLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-1 text-[9px]">
            <span className="text-muted-foreground">{trendLabel}</span>
            <span className={cn("inline-flex items-center gap-0.5 rounded-full px-1 py-0.5 text-[8.5px] font-semibold tabular-nums ring-1", trendCls)}>
              {trendValue >= 0 ? <TrendingUp className="h-2 w-2" strokeWidth={2.5} /> : <TrendingDown className="h-2 w-2" strokeWidth={2.5} />}
              {trendValue > 0 ? "+" : ""}{trendValue}{sort === "surge" ? "%" : ""}
            </span>
          </div>
        </div>
      </div>

      {rep.surge && (
        <div className="mt-2 inline-flex items-center justify-center gap-1 rounded-full border border-destructive/35 bg-destructive/[0.08] px-1.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-destructive">
          <AlertTriangle className="h-2.5 w-2.5" strokeWidth={2.5} /> Pressure Building
        </div>
      )}
    </button>
  );
}

// ---- Donor Caution -----------------------------------------------------------
function DonorRiskBanner({ risk, onClick }: { risk: DonorRisk; onClick: (e: React.MouseEvent) => void }) {
  const cls =
    risk === "Low"
      ? "text-success bg-success/12 border-success/40 hover:bg-success/18 shadow-[inset_0_1px_0_0_oklch(1_0_0/6%),0_0_18px_-10px_oklch(0.60_0.09_168/70%)]"
      : risk === "Medium"
        ? "text-warning bg-warning/15 border-warning/45 hover:bg-warning/22 shadow-[inset_0_1px_0_0_oklch(1_0_0/6%),0_0_18px_-10px_oklch(0.74_0.11_78/75%)]"
        : "text-destructive bg-destructive/18 border-destructive/55 hover:bg-destructive/24 shadow-[inset_0_1px_0_0_oklch(1_0_0/6%),0_0_22px_-10px_oklch(0.48_0.19_27/80%)]";
  const LeadIcon = risk === "Low" ? Landmark : AlertTriangle;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Donor Caution: ${risk} risk — view details`}
      className={cn(
        "flex w-full items-center justify-between gap-2 border-y px-4 py-3 text-left transition-all active:scale-[0.997]",
        cls,
      )}
    >
      <span className="inline-flex items-center gap-2 min-w-0">
        <LeadIcon className="h-[18px] w-[18px] shrink-0" strokeWidth={2.75} />
        <span className="text-[11.5px] font-extrabold uppercase tracking-[0.16em]">Donor Caution</span>
        <span className="opacity-50">·</span>
        <span className="truncate text-[13.5px] font-extrabold tracking-tight">{risk} Risk</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
    </button>
  );
}


function DonorCaution({ repId }: { repId: string }) {
  const data = DONORS[repId];
  const [open, setOpen] = useState(true);
  if (!data) return null;

  const riskCls =
    data.risk === "Low"
      ? "text-success bg-success/10 ring-success/30"
      : data.risk === "Medium"
        ? "text-warning bg-warning/12 ring-warning/35"
        : "text-destructive bg-destructive/12 ring-destructive/40";
  const borderCls =
    data.risk === "High" ? "border-destructive/35" : "border-border/70";
  const showWarn = data.risk !== "Low";

  return (
    <section id="donor-caution" className={cn("mt-3 overflow-hidden rounded-2xl border bg-gradient-card shadow-card scroll-mt-24", borderCls)}>
      <button
        onClick={() => { haptic(6); setOpen(o => !o); }}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface/40"
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-muted-foreground ring-1 ring-border/60">
          <Landmark className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {showWarn && <AlertTriangle className={cn("h-3.5 w-3.5", data.risk === "High" ? "text-destructive" : "text-warning")} strokeWidth={2.5} />}
            <h3 className="text-[13.5px] font-semibold tracking-tight">Donor Caution</h3>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>Transparency Score:</span>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider ring-1", riskCls)}>
              {data.risk} Risk
            </span>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-border/50 px-4 pb-4 pt-3.5 fade-up">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Top Donors This Cycle (FEC Data)
          </div>
          <ul className="mt-2 space-y-1.5">
            {data.donors.map((d, i) => (
              <li key={i} className="rounded-xl bg-surface/40 px-3 py-2.5 ring-1 ring-border/40">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="min-w-0 truncate text-[12.5px] font-semibold tracking-tight text-foreground">
                    {d.name}
                  </div>
                  <div className="shrink-0 text-[12px] font-semibold tabular-nums text-foreground/90">
                    {d.amount}
                  </div>
                </div>
                <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  {d.note}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Key Observations
            </div>
            <ul className="mt-1.5 space-y-1">
              {data.observations.map((o, i) => (
                <li key={i} className="flex gap-2 text-[12px] leading-snug text-foreground/90">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/70" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-3.5 rounded-lg bg-surface/30 px-3 py-2 text-[10.5px] leading-snug text-muted-foreground ring-1 ring-border/40">
            All data is publicly available. Flags are based on statistical patterns and do not imply illegal activity.
          </p>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/40 pt-3 text-[10px] text-muted-foreground">
            <div className="leading-snug">
              Sources: Federal Election Commission (FEC) + OpenSecrets.org<br />
              Last Updated: May 2026 · Updated quarterly
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); haptic(4); }}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface px-2 py-1 text-[9.5px] font-semibold uppercase tracking-wider text-foreground ring-1 ring-border/60 hover:bg-surface-elevated active:scale-95"
            >
              Learn More <ExternalLink className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}



