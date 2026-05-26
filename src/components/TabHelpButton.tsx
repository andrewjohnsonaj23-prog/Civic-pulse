import { useState } from "react";
import { useLocation, Link } from "@tanstack/react-router";
import { HelpCircle, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Tip = { title: string; sub: string; items: { label: string; body: string }[] };

const TIPS: Record<string, Tip> = {
  "/": {
    title: "Your Voice",
    sub: "Verified neighbors are voting on what matters in District 7.",
    items: [
      { label: "Yes / Unsure / No", body: "Your vote is verified, instantly added to the District Pulse, and routed to your reps." },
      { label: "Why you're seeing this", body: "Ranked by your district, past votes, and trending pressure — never by ads." },
      { label: "Smart relevance", body: "The score on each card shows how aligned this issue is with you and your neighbors." },
    ],
  },
  "/bills": {
    title: "Bill Factory",
    sub: "Citizen-drafted bills that gain inevitable momentum.",
    items: [
      { label: "Support This Bill", body: "Adds your verified voice — changeable for 48h. Cards near threshold escalate automatically." },
      { label: "Action Rooms", body: "Collaborate on Amendments, Strategy, and Local Action with moderated discussion." },
      { label: "Amplify", body: "Push to Reps, Boost to Media, or fund a Social/Ad campaign — peer actions, transparent funding." },
    ],
  },
  "/discuss": {
    title: "Discuss",
    sub: "Calm, verified conversation rooms.",
    items: [
      { label: "Verified only", body: "Every voice is a verified neighbor. No anonymous trolls, no algorithmic outrage." },
      { label: "Active rooms", body: "Join live discussions tied to issues, bills, and local decisions." },
    ],
  },
  "/reps": {
    title: "My Reps",
    sub: "A calm accountability dashboard.",
    items: [
      { label: "Alignment · Response · Pulse", body: "Three gauges show how a rep aligns with your district, responds to constituents, and tracks the local pulse." },
      { label: "Switch views", body: "Toggle between My Reps and the National leaderboard at any time." },
    ],
  },
  "/legacy": {
    title: "Legacy",
    sub: "Your impact today and stewardship over time.",
    items: [
      { label: "Impact / Legacy toggle", body: "Switch between your live Impact Score and the long-term Stewardship view." },
      { label: "Your voice helped move this", body: "Past votes that meaningfully contributed to real victories." },
      { label: "Quiet compounding", body: "Every verified vote builds your legacy. No streaks, no pressure." },
    ],
  },
};

function tipForPath(pathname: string): Tip {
  if (pathname === "/") return TIPS["/"];
  const key = Object.keys(TIPS).find(k => k !== "/" && pathname.startsWith(k));
  return key ? TIPS[key] : TIPS["/"];
}

export function TabHelpButton() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const tip = tipForPath(pathname);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="App tutorial"
        className={cn(
          "fixed right-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-full",
          "bg-surface/80 text-muted-foreground ring-1 ring-border/60 backdrop-blur-xl",
          "transition-all hover:text-primary hover:ring-primary/40 active:scale-95",
        )}
      >
        <HelpCircle className="h-[18px] w-[18px]" strokeWidth={2.25} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="fade-up mx-auto w-full max-w-md rounded-t-3xl border border-border/60 bg-card p-5 shadow-card sm:rounded-3xl"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-extrabold tracking-tight">{tip.title}</div>
                <div className="mt-0.5 text-[12px] text-muted-foreground">{tip.sub}</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ul className="mt-4 space-y-2.5">
              {tip.items.map(it => (
                <li
                  key={it.label}
                  className="rounded-xl border border-border/50 bg-surface/50 px-3.5 py-3"
                >
                  <div className="text-[11.5px] font-extrabold uppercase tracking-wider text-primary">
                    {it.label}
                  </div>
                  <div className="mt-1 text-[12.5px] leading-snug text-foreground/85">
                    {it.body}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between gap-3">
              <Link
                to="/welcome"
                onClick={() => setOpen(false)}
                className="text-[11.5px] font-bold text-primary transition-opacity hover:opacity-80"
              >
                Replay onboarding →
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full bg-gradient-primary px-4 py-2 text-[12px] font-bold text-primary-foreground shadow-glow transition active:scale-95"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
