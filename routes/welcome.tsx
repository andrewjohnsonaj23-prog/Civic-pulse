import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldCheck, MapPin, Sparkles, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/welcome")({
  component: Welcome,
  head: () => ({ meta: [{ title: "Welcome to CivicPulse" }] }),
});

const ISSUES = [
  "Education", "Healthcare", "Housing", "Climate", "Transit",
  "Public Safety", "Democracy", "Economy", "Civil Rights", "Infrastructure",
];

function Welcome() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [voice, setVoice] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [zip, setZip] = useState("");

  const next = () => setStep(s => Math.min(4, s + 1));

  const screens = useMemo(() => [
    // 1. Welcome
    <Step key="0" title="Your voice. Verified." sub="Nonpartisan civic engagement that actually moves the needle.">
      <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-25 blur-2xl" />
        <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-primary shadow-glow pulse-ring">
          <ShieldCheck className="h-16 w-16 text-primary-foreground" strokeWidth={2} />
        </div>
      </div>
      <CTA onClick={next}>Get started</CTA>
    </Step>,

    // 2. Voice slider
    <Step key="1" title="How much does your voice matter right now?" sub="Be honest — we'll help you change the answer.">
      <div className="my-6 text-center">
        <div className="text-7xl font-bold tracking-tight text-primary">{voice}</div>
        <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">out of 10</div>
        <div className="mt-3 min-h-[2.5rem] text-sm text-foreground/80 text-balance">
          {voice <= 3 && "We hear you. Most people feel this way. Let's change it together."}
          {voice >= 4 && voice <= 6 && "Lukewarm. CivicPulse turns intentions into measurable impact."}
          {voice >= 7 && voice <= 8 && "You're engaged. Let's compound that into real wins."}
          {voice >= 9 && "Powerful. You'll lead the change in your district."}
        </div>
      </div>
      <input
        type="range" min={1} max={10} value={voice}
        onChange={e => setVoice(+e.target.value)}
        className="w-full accent-primary"
      />
      <CTA onClick={next}>Continue</CTA>
    </Step>,

    // 3. Priorities
    <Step key="2" title="Pick up to 5 priority issues" sub="We'll personalize your feed around what you care about most.">
      <div className="grid grid-cols-2 gap-2 py-2">
        {ISSUES.map(i => {
          const on = selected.includes(i);
          const disabled = !on && selected.length >= 5;
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => setSelected(s => on ? s.filter(x => x !== i) : [...s, i])}
              className={cn(
                "flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all",
                on ? "border-primary bg-primary/15 text-primary" :
                disabled ? "border-border bg-surface/40 text-muted-foreground opacity-50" :
                "border-border bg-surface text-foreground hover:border-primary/40",
              )}
            >
              {i}
              {on && <Check className="h-4 w-4" />}
            </button>
          );
        })}
      </div>
      <div className="text-center text-xs text-muted-foreground">{selected.length} of 5 selected</div>
      <CTA onClick={next} disabled={selected.length === 0}>Continue</CTA>
    </Step>,

    // 4. Location
    <Step key="3" title="Local first" sub="Your district decides what matters most. Verify your location.">
      <div className="mx-auto my-4 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-primary/20">
        <MapPin className="h-12 w-12 text-primary" />
      </div>
      <input
        value={zip}
        onChange={e => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
        placeholder="ZIP code"
        inputMode="numeric"
        className="w-full rounded-xl bg-input px-4 py-3 text-center text-lg font-semibold tracking-widest outline-none focus:ring-2 focus:ring-primary"
      />
      <button className="mt-2 w-full text-center text-xs text-primary">Use my current location</button>
      <CTA onClick={next} disabled={zip.length !== 5}>Continue</CTA>
    </Step>,

    // 5. Magic moment
    <Step key="4" title="Building your personalized feed..." sub="Matching issues, reps, and active bills in your district.">
      <div className="mx-auto my-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-primary/15">
        <Sparkles className="h-12 w-12 animate-pulse text-primary" />
      </div>
      <div className="space-y-2">
        <Ticker label="Loading District 7 issues..." />
        <Ticker label={`Matching ${selected.length} priority topics...`} delay={400} />
        <Ticker label="Verifying district pulse data..." delay={800} />
        <Ticker label="Ready." delay={1200} success />
      </div>
      <CTA onClick={() => navigate({ to: "/" })}>Enter CivicPulse</CTA>
    </Step>,
  ], [step, voice, selected, zip, next, navigate]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-6">
      <div className="mb-6 flex gap-1.5">
        {[0,1,2,3,4].map(i => (
          <div key={i} className={cn(
            "h-1 flex-1 rounded-full transition-all",
            i <= step ? "bg-primary" : "bg-border",
          )} />
        ))}
      </div>
      <div className="flex flex-1 flex-col">{screens[step]}</div>
    </div>
  );
}

function Step({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="fade-up flex flex-1 flex-col">
      <h1 className="text-[28px] font-bold leading-tight text-balance">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground text-balance">{sub}</p>
      <div className="mt-6 flex flex-1 flex-col justify-center">{children}</div>
    </div>
  );
}

function CTA({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-glow transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
    >
      {children} <ArrowRight className="h-4 w-4" />
    </button>
  );
}

function Ticker({ label, delay = 0, success }: { label: string; delay?: number; success?: boolean }) {
  return (
    <div
      className="fade-up flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-[12.5px]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Check className={cn("h-3.5 w-3.5", success ? "text-success" : "text-primary")} />
      <span className={success ? "font-semibold text-success" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
