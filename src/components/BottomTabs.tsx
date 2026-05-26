import { Link, useLocation } from "@tanstack/react-router";
import { Podcast, FileSignature, MessagesSquare, TrendingUp, TreeDeciduous } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Voice", icon: Podcast, live: "soft" as const },
  { to: "/bills", label: "Bills", icon: FileSignature, live: "soft" as const },
  { to: "/discuss", label: "Discuss", icon: MessagesSquare, live: "strong" as const },
  { to: "/reps", label: "My Reps", icon: TrendingUp, live: undefined },
  { to: "/legacy", label: "Legacy", icon: TreeDeciduous, live: undefined },
] as const;

export function BottomTabs() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/90 backdrop-blur-2xl safe-bottom shadow-[0_-8px_24px_-12px_oklch(0_0_0/60%)]">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pt-1.5">
        {tabs.map(({ to, label, icon: Icon, live }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold tracking-tight transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                    active && "bg-primary/15 shadow-glow",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 2} />
                  {live && (
                    <span className="absolute right-1 top-1 flex h-1.5 w-1.5">
                      <span className={cn(
                        "absolute inset-0 animate-ping rounded-full bg-success",
                        live === "strong" ? "opacity-80" : "opacity-40",
                      )} />
                      <span className={cn(
                        "relative inline-flex h-1.5 w-1.5 rounded-full bg-success",
                        live === "soft" && "opacity-70",
                      )} />
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
