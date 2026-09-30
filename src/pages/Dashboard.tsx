import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { formatClock, formatLong, rankFor } from "@/game/shop";
import { SHOP_ITEMS_BY_SLUG } from "@/game/shop";
import { useMutation, useQuery } from "convex/react";
import { BadgeCheck, Clock, Coins, KeyRound, LogOut, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router";

export default function Dashboard() {
  const { user, signOut, isAuthenticated } = useAuth();
  const profile = useQuery(api.game.getProfile, isAuthenticated ? {} : "skip");
  const runs = useQuery(api.game.listRuns, isAuthenticated ? { limit: 12 } : "skip");
  const ensureProfile = useMutation(api.game.ensureProfile);

  useEffect(() => {
    if (isAuthenticated && profile === null) {
      void ensureProfile({});
    }
  }, [isAuthenticated, profile, ensureProfile]);

  if (profile === undefined || runs === undefined) {
    return (
      <main className="vv-bg flex min-h-screen items-center justify-center">
        <Sparkles className="size-6 animate-pulse text-gold-400" />
      </main>
    );
  }

  const { rank, next, progress } = rankFor(profile?.xp ?? 0);
  const equipped = profile?.equipped ? SHOP_ITEMS_BY_SLUG[profile.equipped] : undefined;
  const wins = profile?.wins ?? 0;
  const played = profile?.runsPlayed ?? 0;

  return (
    <main className="vv-bg min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.4em] text-gold-500/80">
              The player's ledger
            </p>
            <h1 className="mt-2 font-display text-4xl text-gold-200">
              {user?.name ?? "Player of the House"}
            </h1>
            <p className="mt-1 font-body text-amber-100/70">
              {rank.name} · {profile?.xp ?? 0} standing
              {next ? ` · ${Math.max(0, next.min - (profile?.xp ?? 0))} to ${next.name}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-gold-600 font-body text-black hover:bg-gold-500">
              <Link to="/rooms">Take a room</Link>
            </Button>
            <Button
              variant="outline"
              className="border-gold-500/40 font-body text-amber-100 hover:text-gold-300"
              onClick={async () => {
                await signOut();
                window.location.href = "/";
              }}
            >
              <LogOut className="mr-2 size-4" /> Sign out
            </Button>
          </div>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Coins className="size-5 text-gold-400" />} label="Gold" value={String(profile?.gold ?? 0)} />
          <StatCard icon={<KeyRound className="size-5 text-gold-400" />} label="Escapes" value={String(wins)} />
          <StatCard icon={<Clock className="size-5 text-gold-400" />} label="Attempts" value={String(played)} />
          <StatCard icon={<BadgeCheck className="size-5 text-gold-400" />} label="Best streak" value={String(profile?.bestStreak ?? 0)} />
        </div>

        {next && (
          <Card className="vv-gold-frame mt-4 border-gold-500/30 bg-[#141009]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between font-body text-xs text-muted-foreground">
                <span>{rank.name}</span>
                <span>{next.name} at {next.min} standing</span>
              </div>
              <Progress value={progress * 100} className="mt-2 h-2" />
            </CardContent>
          </Card>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="vv-gold-frame border-gold-500/30 bg-[#141009]">
            <CardHeader>
              <CardTitle className="font-display text-xl text-gold-300">
                Recent attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(runs ?? []).length === 0 ? (
                <p className="font-body text-sm italic text-muted-foreground">
                  No attempts recorded yet. The house is patient.
                </p>
              ) : (
                <ul className="divide-y divide-gold-500/15">
                  {(runs ?? []).map((run) => (
                    <li key={run._id} className="flex items-center justify-between gap-3 py-2.5">
                      <div>
                        <p className="font-body text-sm text-amber-100/90">{run.roomTitle}</p>
                        <p className="font-body text-xs text-muted-foreground">
                          par {formatLong(Math.round(run.parSeconds / 60))} · {run.hintsUsed} hints
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={
                          run.outcome === "escaped"
                            ? "font-display text-sm text-gold-300"
                            : "font-display text-sm text-red-400/80"
                        }>
                          {run.outcome === "escaped" ? "Escaped" : "Failed"}
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          {formatClock(run.secondsTaken)} · +{run.goldEarned} gold
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="vv-gold-frame border-gold-500/30 bg-[#141009]">
            <CardHeader>
              <CardTitle className="font-display text-xl text-gold-300">
                Equipped
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {equipped ? (
                <div>
                  <p className="font-display text-lg text-gold-300">{equipped.name}</p>
                  <p className="mt-1 font-body text-sm text-amber-100/75">{equipped.blurb}</p>
                  {equipped.perk && (
                    <p className="mt-2 font-body text-xs uppercase tracking-widest text-gold-400">
                      {equipped.perk}
                    </p>
                  )}
                </div>
              ) : (
                <p className="font-body text-sm italic text-muted-foreground">
                  Nothing equipped. The Emporium keeps things worth owning.
                </p>
              )}
              <Button
                asChild
                variant="outline"
                className="w-full border-gold-500/40 font-body text-amber-100 hover:text-gold-300"
              >
                <Link to="/shop">Visit the Emporium</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="vv-gold-frame border-gold-500/30 bg-[#141009]">
      <CardContent className="flex items-center gap-3 p-5">
        {icon}
        <div>
          <p className="font-display text-2xl text-amber-100">{value}</p>
          <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
