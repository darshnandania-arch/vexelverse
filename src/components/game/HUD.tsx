import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MoveControls } from "@/components/game/MoveControls";
import { formatClock } from "@/game/shop";
import type { Facing, GameState, Person, RoomDef } from "@/game/types";
import { restrictionBlocked } from "@/game/engine";
import { cn } from "@/lib/utils";
import { Lightbulb, Moon, ScrollText, Sun, Timer } from "lucide-react";

interface HUDProps {
  room: RoomDef;
  state: GameState;
  elapsed: number;
  remaining: number;
  onToggleDimension: () => void;
  onSetLight: (light: "light" | "dark") => void;
  onToggleFlashlight: () => void;
  onSetPerson: (person: Person) => void;
  onTurn: (facing: Facing) => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onHint: () => void;
  onAbandon: () => void;
  onTryExit: () => void;
}

export function HUD({
  room,
  state,
  elapsed,
  remaining,
  onToggleDimension,
  onSetLight,
  onToggleFlashlight,
  onSetPerson,
  onTurn,
  onStepForward,
  onStepBack,
  onHint,
  onAbandon,
  onTryExit,
}: HUDProps) {
  const solvedCount = state.solved.length;
  const total =
    room.puzzles.length +
    (room.chambers ?? []).reduce((sum, c) => sum + c.puzzles.length, 0);
  const hintsLeft = 4 - state.hintsUsed;
  const dimLocked = restrictionBlocked(room, "noDimensionSwitch");
  const lightLocked = restrictionBlocked(room, "noLightSwitch");
  const hintsSealed = restrictionBlocked(room, "noHints");
  const chambers = room.chambers ?? [];

  return (
    <div className="border-b border-gold-500/25 bg-black/60 px-4 py-3">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Timer className="size-5 text-gold-400" />
          <div>
            <div className="font-display text-xl leading-none text-gold-300">
              {formatClock(elapsed)}
            </div>
            <div className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
              par {room.parMinutes}:00
            </div>
          </div>
          <div
            className={cn(
              "ml-2 font-display text-lg",
              remaining <= 60 ? "text-red-400" : "text-amber-100/80",
            )}
          >
            {remaining > 0
              ? `−${formatClock(remaining)}`
              : "the hour has slipped"}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="vv-plaque flex items-center gap-1 rounded-sm px-2 py-1">
            <Button
              size="sm"
              variant={state.dimension === "3d" ? "default" : "ghost"}
              disabled={dimLocked}
              title={dimLocked ? "The plan is withheld for this round." : undefined}
              className={cn(
                "h-7 px-2 text-xs",
                state.dimension === "3d"
                  ? "bg-gold-600 text-black hover:bg-gold-500"
                  : "text-amber-100 hover:text-gold-300",
              )}
              onClick={onToggleDimension}
            >
              3D relief
            </Button>
            <Button
              size="sm"
              variant={state.dimension === "2d" ? "default" : "ghost"}
              disabled={dimLocked}
              title={dimLocked ? "The plan is withheld for this round." : undefined}
              className={cn(
                "h-7 px-2 text-xs",
                state.dimension === "2d"
                  ? "bg-gold-600 text-black hover:bg-gold-500"
                  : "text-amber-100 hover:text-gold-300",
              )}
              onClick={onToggleDimension}
            >
              2D plan
            </Button>
          </div>

          <div className="vv-plaque flex items-center gap-1 rounded-sm px-2 py-1">
            <Button
              size="sm"
              variant="ghost"
              disabled={lightLocked}
              title={lightLocked ? "The chandelier has been removed for this round." : undefined}
              className="h-7 px-2 text-xs text-amber-100 hover:text-gold-300 disabled:opacity-40"
              onClick={() => onSetLight("light")}
            >
              <Sun className="mr-1 size-3.5" /> Lit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-amber-100 hover:text-gold-300"
              onClick={() => onSetLight("dark")}
            >
              <Moon className="mr-1 size-3.5" /> Dark
            </Button>
          </div>

          {state.light === "dark" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 border-gold-500/40 text-xs text-amber-100 hover:text-gold-300"
              onClick={onToggleFlashlight}
            >
              <Lightbulb className="mr-1 size-3.5" />
              Flashlight {state.flashlight ? "off" : "on"}
            </Button>
          )}
        </div>

        <MoveControls
          room={room}
          person={state.person}
          facing={state.facing}
          step={state.step}
          maxStep={state.activeChamber ? 1 : 3}
          onSetPerson={onSetPerson}
          onTurn={onTurn}
          onStepForward={onStepForward}
          onStepBack={onStepBack}
        />

        <div className="flex items-center gap-2">
          <span className="font-body text-xs text-amber-100/70">
            {solvedCount}/{total} mechanisms
          </span>
          {!hintsSealed && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 border-gold-500/40 font-body text-xs text-amber-100 hover:text-gold-300"
              onClick={onHint}
              disabled={hintsLeft <= 0}
            >
              <Lightbulb className="size-3.5" />
              Hints ({hintsLeft})
            </Button>
          )}
          {hintsSealed && (
            <span
              className="vv-plaque rounded-sm px-2 py-1.5 font-body text-[10px] uppercase tracking-widest text-amber-100/60"
              title="The valet's hint book is sealed for this round."
            >
              hints sealed
            </span>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 border-gold-500/40 font-body text-xs text-amber-100 hover:text-gold-300"
              >
                <ScrollText className="size-3.5" /> Journal
              </Button>
            </SheetTrigger>
            <SheetContent className="vv-gold-frame w-[380px] border-gold-500/40 bg-[#100d07] sm:w-[420px]">
              <SheetHeader>
                <SheetTitle className="font-display text-gold-300">
                  Investigator's journal
                </SheetTitle>
                <SheetDescription className="font-body text-amber-100/70">
                  Everything you have seen and done, in the order you did it.
                </SheetDescription>
              </SheetHeader>
              <ol className="space-y-3 px-4 pb-6">
                {state.journal.map((entry, i) => (
                  <li key={i} className="border-l border-gold-500/30 pl-3">
                    <p className="font-body text-xs uppercase tracking-widest text-gold-500/60">
                      {formatClock(Math.floor((entry.at - state.startedAt) / 1000)) === "0:00"
                        ? "on arrival"
                        : formatClock(Math.floor((entry.at - state.startedAt) / 1000))}
                    </p>
                    <p className="font-body text-sm text-amber-50/90">{entry.text}</p>
                  </li>
                ))}
              </ol>
            </SheetContent>
          </Sheet>
          <Button
            size="sm"
            className="h-8 bg-gold-600 font-body text-xs text-black hover:bg-gold-500"
            onClick={onTryExit}
          >
            The way out
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 font-body text-xs text-muted-foreground"
            onClick={onAbandon}
          >
            Abandon
          </Button>
        </div>
      </div>

      {chambers.length > 0 && (
        <div className="mx-auto mt-3 flex max-w-6xl flex-wrap items-center gap-2 border-t border-gold-500/15 pt-3">
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold-500/70">
            the wing:
          </span>
          {chambers.map((c, i) => {
            const cleared = state.chambersCleared.includes(c.slug);
            const active = state.activeChamber === c.slug;
            const unlocked =
              !c.requires || state.chambersCleared.includes(c.requires);
            return (
              <span key={c.slug} className="flex items-center gap-2">
                {i > 0 && <span className="text-gold-500/40">→</span>}
                <span
                  className={cn(
                    "vv-plaque rounded-sm px-2 py-1 font-body text-xs",
                    cleared && "text-gold-300 line-through opacity-70",
                    active && "ring-1 ring-gold-400",
                    !cleared && !active && "text-amber-100/70",
                    !unlocked && "opacity-40",
                  )}
                  title={c.epigraph}
                >
                  {c.title}
                  {cleared ? " ✓" : unlocked ? "" : " · locked"}
                </span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
