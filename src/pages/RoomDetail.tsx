import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ROOMS_BY_SLUG } from "@/game/gameData";
import { formatClock, formatLong } from "@/game/shop";
import type { RoomRestrictions } from "@/game/types";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { ArrowLeft, BookLock, Clock, EyeOff, Footprints, KeyRound, Layers, Lightbulb, LightbulbOff, Lock } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";

const RESTRICTIONS: {
  key: keyof RoomRestrictions;
  label: string;
  note: string;
  icon: typeof Lock;
}[] = [
  {
    key: "noLightSwitch",
    label: "The chandelier is removed",
    note: "No switch, no light. What hides in the dark stays there unless your lantern finds it.",
    icon: LightbulbOff,
  },
  {
    key: "noHints",
    label: "The hint book is sealed",
    note: "The house lends nothing here. Solve or fail on your own wits.",
    icon: BookLock,
  },
  {
    key: "noDimensionSwitch",
    label: "Your plans are confiscated",
    note: "The 2D blueprint is taken at the door. Read the room in relief only.",
    icon: Layers,
  },
  {
    key: "noMovement",
    label: "Your feet are bound",
    note: "You stand where the house puts you. Every clue must come to you.",
    icon: Footprints,
  },
  {
    key: "noThirdPerson",
    label: "No dollhouse view",
    note: "You may not step outside yourself to watch. First person only.",
    icon: EyeOff,
  },
];

export default function RoomDetail() {
  const { slug } = useParams<{ slug: string }>();
  const room = slug ? ROOMS_BY_SLUG[slug] : undefined;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const runs = useQuery(
    api.game.listRuns,
    isAuthenticated ? { limit: 50 } : "skip",
  );

  if (!room) {
    return (
      <main className="vv-bg flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="font-display text-2xl text-gold-300">No such room</h1>
        <Button asChild className="bg-gold-600 font-body text-black hover:bg-gold-500">
          <Link to="/rooms">Back to the rooms</Link>
        </Button>
      </main>
    );
  }

  const mine = (runs ?? []).filter((r) => r.roomSlug === room.slug);
  const best = mine
    .filter((r) => r.outcome === "escaped")
    .sort((a, b) => a.secondsTaken - b.secondsTaken)[0];
  const activeRestrictions = RESTRICTIONS.filter((r) => room.restrictions?.[r.key]);

  return (
    <main className="vv-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link
          to="/rooms"
          className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/70 hover:text-gold-400"
        >
          ← The rooms
        </Link>

        <header className="mt-6">
          <span className="vv-plaque inline-block rounded-sm px-3 py-1 font-body text-xs uppercase tracking-[0.3em] text-gold-300">
            {room.difficulty} · par {formatLong(room.parMinutes)}
          </span>
          <h1 className="mt-4 font-display text-4xl text-gold-200">{room.title}</h1>
          <p className="mt-2 font-body text-lg italic text-amber-100/75">
            {room.tagline}
          </p>
          <div className="vv-rule mt-6" />
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <Card className="vv-gold-frame border-gold-500/30 bg-[#141009]">
              <CardHeader>
                <CardTitle className="font-display text-xl text-gold-300">
                  The brief
                </CardTitle>
              </CardHeader>
              <CardContent className="font-body text-sm leading-relaxed text-amber-100/80">
                <p>{room.briefing}</p>
                <p className="mt-3 italic text-muted-foreground">{room.setting}</p>
              </CardContent>
            </Card>

            <Card className="vv-gold-frame border-gold-500/30 bg-[#141009]">
              <CardHeader>
                <CardTitle className="font-display text-xl text-gold-300">
                  How this room hides things
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 font-body text-sm text-amber-100/80">
                  <li className="flex gap-2">
                    <KeyRound className="mt-0.5 size-4 shrink-0 text-gold-400" />
                    {room.props.filter((p) => p.requires?.dimension?.includes("3d")).length} clues
                    answer only in 3D relief;{" "}
                    {room.props.filter((p) => p.requires?.dimension?.includes("2d")).length} only
                    in the 2D plan.
                  </li>
                  <li className="flex gap-2">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-gold-400" />
                    {room.props.filter((p) => p.requires?.light?.includes("dark")).length} marks
                    show themselves only in the dark, by flashlight;{" "}
                    {room.props.filter((p) => p.requires?.light?.includes("light")).length} only
                    in full light.
                  </li>
                  <li className="flex gap-2">
                    <Lock className="mt-0.5 size-4 shrink-0 text-gold-400" />
                    {room.gates.length} mechanism{room.gates.length === 1 ? "" : "s"} must
                    be satisfied before the way out answers.
                  </li>
                  <li className="flex gap-2">
                    <Clock className="mt-0.5 size-4 shrink-0 text-gold-400" />
                    The purse pays by pace — beat par and it grows; hints beyond
                    the second thin it.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {activeRestrictions.length > 0 && (
              <Card className="border-red-900/40 bg-[#141009]">
                <CardHeader>
                  <CardTitle className="font-display text-xl text-red-200/90">
                    What the house takes away
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 font-body text-sm text-amber-100/80">
                    {activeRestrictions.map((r) => (
                      <li key={r.key} className="flex gap-2">
                        <r.icon className="mt-0.5 size-4 shrink-0 text-red-300/80" />
                        <span>
                          <span className="font-medium text-red-100/90">{r.label}.</span>{" "}
                          {r.note}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {room.chambers && room.chambers.length > 0 && (
              <Card className="vv-gold-frame border-gold-500/30 bg-[#141009]">
                <CardHeader>
                  <CardTitle className="font-display text-xl text-gold-300">
                    The wing — {room.chambers?.length ?? 0} inner chambers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4">
                    {room.chambers.map((c, i) => (
                      <li
                        key={c.slug}
                        className="rounded-sm border border-gold-500/25 bg-black/30 p-4"
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="font-display text-base text-gold-200">
                            <span className="mr-2 font-body text-xs text-gold-500/80">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            {c.title}
                          </span>
                          <span className="font-body text-xs text-muted-foreground">
                            par {formatLong(c.parMinutes)}
                          </span>
                        </div>
                        <p className="mt-1.5 font-body text-sm italic text-amber-100/70">
                          “{c.epigraph}”
                        </p>
                        {i > 0 && (
                          <p className="mt-2 font-body text-xs text-amber-100/60">
                            Opens once {room.chambers?.[i - 1]?.title ?? "the previous chamber"} is cleared.
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                  <p className="mt-4 font-body text-xs italic text-muted-foreground">
                    The final door answers only once every chamber is cleared.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-5">
            <Card className="vv-gold-frame border-gold-500/30 bg-[#141009]">
              <CardHeader>
                <CardTitle className="font-display text-lg text-gold-300">
                  Enter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-gold-600 font-body text-black hover:bg-gold-500"
                  onClick={() => navigate(`/play/${room.slug}`)}
                >
                  Take the room
                </Button>
                {!isAuthenticated && (
                  <p className="font-body text-xs italic text-muted-foreground">
                    You can play without an account, but only a signed-in
                    player's gold and standing are recorded.
                  </p>
                )}
                {best && (
                  <p className="font-body text-xs text-amber-100/70">
                    Your best escape: {formatClock(best.secondsTaken)} (par{" "}
                    {room.parMinutes}:00)
                  </p>
                )}
              </CardContent>
            </Card>

            {isAuthenticated && mine.length > 0 && (
              <Card className="vv-gold-frame border-gold-500/30 bg-[#141009]">
                <CardHeader>
                  <CardTitle className="font-display text-lg text-gold-300">
                    Your attempts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 font-body text-xs text-amber-100/75">
                    {mine.slice(0, 6).map((run) => (
                      <li key={run._id} className="flex justify-between gap-2">
                        <span>{run.outcome === "escaped" ? "Escaped" : "Failed"}</span>
                        <span className="text-muted-foreground">
                          {formatClock(run.secondsTaken)} · {run.hintsUsed} hints
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
