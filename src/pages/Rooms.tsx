import { Button } from "@/components/ui/button";
import { ROOMS } from "@/game/gameData";
import { formatLong } from "@/game/shop";
import type { Difficulty, RoomRestrictions } from "@/game/types";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

const FILTERS: (Difficulty | "All")[] = [
  "All",
  "Apprentice",
  "Journeyman",
  "Master",
  "Grandmaster",
];

const DIFFICULTY_NOTE: Record<Difficulty, string> = {
  Apprentice: "Forgiving. A first key for new hands.",
  Journeyman: "The house starts hiding things properly.",
  Master: "Cross-referenced clues and no wasted props.",
  Grandmaster: "The vault tier. Bring the full toolkit.",
};

const RESTRICTION_LABELS: Record<keyof RoomRestrictions, string> = {
  noLightSwitch: "chandelier removed",
  noHints: "hint book sealed",
  noDimensionSwitch: "plans confiscated",
  noMovement: "feet bound",
  noThirdPerson: "no dollhouse view",
};

export default function Rooms() {
  const [filter, setFilter] = useState<Difficulty | "All">("All");
  const shown = useMemo(
    () => (filter === "All" ? ROOMS : ROOMS.filter((r) => r.difficulty === filter)),
    [filter],
  );

  const withWings = useMemo(() => ROOMS.filter((r) => r.chambers && r.chambers.length > 0), []);

  return (
    <main className="vv-bg min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          to="/"
          className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/70 hover:text-gold-400"
        >
          ← The house
        </Link>

        <header className="mt-6 text-center">
          <p className="font-body text-xs uppercase tracking-[0.45em] text-gold-500/80">
            Choose your chamber
          </p>
          <h1 className="mt-3 font-display text-4xl text-gold-200">The Rooms</h1>
          <p className="mx-auto mt-3 max-w-xl font-body text-amber-100/70">
            Twelve chambers across four degrees of difficulty. Par is the
            house's honest estimate for a careful player — the purse pays best
            to those who beat it.
          </p>
        </header>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "vv-plaque rounded-sm px-4 py-1.5 font-body text-sm transition-colors",
                filter === f
                  ? "text-gold-300 ring-1 ring-gold-400"
                  : "text-amber-100/75 hover:text-gold-200",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        {filter !== "All" && (
          <p className="mt-3 text-center font-body text-xs italic text-muted-foreground">
            {DIFFICULTY_NOTE[filter]}
          </p>
        )}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((room) => (
            <Link
              key={room.slug}
              to={`/rooms/${room.slug}`}
              className="vv-gold-frame group flex flex-col rounded-sm bg-[#141009] p-6 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="vv-plaque rounded-sm px-2 py-0.5 font-body text-[10px] uppercase tracking-[0.25em] text-gold-300">
                  {room.difficulty}
                </span>
                <span className="font-body text-xs text-amber-100/60">
                  par {formatLong(room.parMinutes)}
                </span>
              </div>
              <h2 className="mt-4 font-display text-2xl text-gold-300 group-hover:text-gold-200">
                {room.title}
              </h2>
              <p className="mt-1 font-body text-sm italic text-amber-100/70">
                {room.tagline}
              </p>
              <p className="mt-4 font-body text-xs leading-relaxed text-muted-foreground">
                {room.theme}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {(room.chambers?.length ?? 0) > 0 && (
                  <span className="vv-plaque rounded-sm border-gold-400/50 bg-gold-500/10 px-2 py-0.5 font-body text-[10px] uppercase tracking-[0.2em] text-gold-200">
                    {room.chambers?.length}-chamber wing
                  </span>
                )}
                {(Object.keys(room.restrictions ?? {}) as (keyof RoomRestrictions)[])
                  .filter((key) => room.restrictions?.[key])
                  .map((key) => (
                  <span
                    key={key}
                    className="vv-plaque rounded-sm px-2 py-0.5 font-body text-[10px] uppercase tracking-[0.2em] text-amber-100/60"
                  >
                    {RESTRICTION_LABELS[key]}
                  </span>
                ))}
              </div>
              <div className="vv-rule mt-auto pt-4" />
              <span className="mt-3 font-body text-xs uppercase tracking-[0.25em] text-gold-500/80 group-hover:text-gold-400">
                Read the card →
              </span>
            </Link>
          ))}
        </div>

        {withWings.length > 0 && (
          <section className="mt-14">
            <div className="vv-rule" />
            <h2 className="mt-8 text-center font-display text-2xl text-gold-200">
              The Wings
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center font-body text-sm text-amber-100/70">
              Some rooms are whole suites. Clear every inner chamber, in order,
              before the final door will answer — and expect the house to take
              things away from you first.
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {withWings.map((room) => (
                <Link
                  key={room.slug}
                  to={`/rooms/${room.slug}`}
                  className="vv-gold-frame group flex flex-col rounded-sm bg-[#141009] p-6 transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="vv-plaque rounded-sm border-gold-400/50 bg-gold-500/10 px-2 py-0.5 font-body text-[10px] uppercase tracking-[0.25em] text-gold-200">
                      {room.chambers?.length} chambers
                    </span>
                    <span className="font-body text-xs uppercase tracking-[0.2em] text-amber-100/50">
                      {room.difficulty}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl text-gold-300 group-hover:text-gold-200">
                    {room.title}
                  </h3>
                  <ol className="mt-4 space-y-1.5">
                    {room.chambers?.map((c, i) => (
                      <li
                        key={c.slug}
                        className="flex items-baseline justify-between gap-3 font-body text-sm"
                      >
                        <span className="text-amber-100/80">
                          <span className="mr-2 text-gold-500/80">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {c.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          par {formatLong(c.parMinutes)}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <div className="vv-rule mt-auto pt-4" />
                  <span className="mt-3 font-body text-xs uppercase tracking-[0.25em] text-gold-500/80 group-hover:text-gold-400">
                    Study the wing →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
