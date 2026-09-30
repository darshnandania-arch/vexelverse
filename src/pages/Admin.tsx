import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { formatClock } from "@/game/shop";
import { useMutation, useQuery } from "convex/react";
import { Coins, KeyRound, ScrollText, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const overview = useQuery(api.game.adminOverview, isAuthenticated ? {} : "skip");
  const setRole = useMutation(api.game.setUserRole);
  const adjustGold = useMutation(api.game.adjustGold);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("That door is locked to stewards of the house only.");
    }
  }, [user]);

  if (!isAuthenticated || overview === undefined) {
    return (
      <main className="vv-bg flex min-h-screen items-center justify-center">
        <ShieldCheck className="size-6 animate-pulse text-gold-400" />
      </main>
    );
  }

  if (!overview.authorized) {
    return (
      <main className="vv-bg flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <ShieldCheck className="size-10 text-gold-500/60" />
        <h1 className="font-display text-2xl text-gold-300">Stewards only</h1>
        <p className="max-w-sm font-body text-amber-100/70">
          This area keeps the house's accounts: rosters, roles, ledgers and
          the audit of every run. Your key does not fit this door.
        </p>
        <Button asChild variant="outline" className="border-gold-500/40 font-body text-amber-100">
          <Link to="/dashboard">Back to your ledger</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="vv-bg min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          to="/dashboard"
          className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/70 hover:text-gold-400"
        >
          ← Your ledger
        </Link>
        <header className="mt-6">
          <p className="font-body text-xs uppercase tracking-[0.4em] text-gold-500/80">
            Behind the green baize door
          </p>
          <h1 className="mt-2 font-display text-4xl text-gold-200">The Steward's Office</h1>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat icon={<Users className="size-5 text-gold-400" />} label="Players" value={String(overview.playerCount)} />
          <Stat icon={<KeyRound className="size-5 text-gold-400" />} label="Escapes" value={String(overview.escapes)} />
          <Stat icon={<ScrollText className="size-5 text-gold-400" />} label="Runs recorded" value={String(overview.runsRecorded)} />
          <Stat icon={<Coins className="size-5 text-gold-400" />} label="Gold in circulation" value={String(overview.goldInCirculation)} />
          <Stat icon={<ShieldCheck className="size-5 text-gold-400" />} label="Accounts" value={String(overview.accounts)} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="vv-gold-frame border-gold-500/30 bg-[#141009]">
            <CardHeader>
              <CardTitle className="font-display text-xl text-gold-300">Roster</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full font-body text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                    <th className="pb-2">Player</th>
                    <th className="pb-2">Gold</th>
                    <th className="pb-2">Standing</th>
                    <th className="pb-2">Adjust</th>
                    <th className="pb-2">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-500/15">
                  {overview.roster.map((row) => (
                    <tr key={row.profileId} className="text-amber-100/85">
                      <td className="py-2 pr-2">{row.player}</td>
                      <td className="py-2 pr-2">{row.gold}</td>
                      <td className="py-2 pr-2">{row.xp}</td>
                      <td className="py-2 pr-2">
                        <GoldAdjust
                          onAdjust={async (delta) => {
                            await adjustGold({
                              profileId: row.profileId,
                              delta,
                              reason: reason || "Steward adjustment",
                            });
                            toast.success("Ledger updated.");
                          }}
                        />
                      </td>
                      <td className="py-2">
                        <SelectRow
                          current={row.role}
                          onChange={async (role) => {
                            await setRole({ targetUserId: row.userId, role });
                            toast.success("Role set.");
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for ledger adjustments (audited)"
                className="mt-4 border-gold-500/40 bg-black/40 font-body text-amber-100"
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="vv-gold-frame border-gold-500/30 bg-[#141009]">
              <CardHeader>
                <CardTitle className="font-display text-xl text-gold-300">Recent runs</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 font-body text-xs text-amber-100/80">
                  {overview.recentRuns.slice(0, 8).map((run) => (
                    <li key={run.runId} className="flex justify-between gap-2">
                      <span>{run.player} — {run.roomTitle}</span>
                      <span className={run.outcome === "escaped" ? "text-gold-300" : "text-red-400/80"}>
                        {formatClock(run.secondsTaken)}
                      </span>
                    </li>
                  ))}
                  {overview.recentRuns.length === 0 && (
                    <li className="italic text-muted-foreground">No runs yet.</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card className="vv-gold-frame border-gold-500/30 bg-[#141009]">
              <CardHeader>
                <CardTitle className="font-display text-xl text-gold-300">Gold ledger</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 font-body text-xs text-amber-100/80">
                  {overview.recentLedger.map((entry) => (
                    <li key={entry.entryId} className="flex justify-between gap-2">
                      <span>{entry.player} — {entry.reason}</span>
                      <span className={entry.delta >= 0 ? "text-gold-300" : "text-red-400/80"}>
                        {entry.delta >= 0 ? "+" : ""}{entry.delta}
                      </span>
                    </li>
                  ))}
                  {overview.recentLedger.length === 0 && (
                    <li className="italic text-muted-foreground">No entries yet.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="vv-gold-frame border-gold-500/30 bg-[#141009]">
      <CardContent className="flex items-center gap-3 p-4">
        {icon}
        <div>
          <p className="font-display text-xl text-amber-100">{value}</p>
          <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function GoldAdjust({ onAdjust }: { onAdjust: (delta: number) => Promise<void> }) {
  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="outline"
        className="h-6 border-gold-500/40 px-2 text-xs font-body text-amber-100"
        onClick={() => void onAdjust(50)}
      >
        +50
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-6 border-gold-500/40 px-2 text-xs font-body text-amber-100"
        onClick={() => void onAdjust(-50)}
      >
        −50
      </Button>
    </div>
  );
}

function SelectRow({
  current,
  onChange,
}: {
  current?: string;
  onChange: (role: "admin" | "user" | "member") => Promise<void>;
}) {
  const [value, setValue] = useState(current ?? "user");
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        setValue(next);
        void onChange(next as "admin" | "user" | "member");
      }}
    >
      <SelectTrigger className="h-7 w-28 border-gold-500/40 font-body text-amber-100">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-gold-500/40 bg-[#141009] font-body text-amber-100">
        <SelectItem value="admin">admin</SelectItem>
        <SelectItem value="user">user</SelectItem>
        <SelectItem value="member">member</SelectItem>
      </SelectContent>
    </Select>
  );
}
