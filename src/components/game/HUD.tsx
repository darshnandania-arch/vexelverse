import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatClock } from "@/game/shop";
import type { GameState, RoomDef } from "@/game/types";
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
  onHint,
  onAbandon,
  onTryExit,
}: HUDProps) {
  const solvedCount = state.solved.length;
  const total = room.puzzles.length;
  const hintsLeft = 4 - state.hintsUsed;

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
              className="h-7 bg-gold-600 px-2 text-xs text-black hover:bg-gold-500"
              onClick={onToggleDimension}
            >
              3D relief
            </Button>
            <Button
              size="sm"
              variant={state.dimension === "2d" ? "default" : "ghost"}
              className="h-7 bg-transparent px-2 text-xs text-amber-100 hover:text-gold-300"
              onClick={onToggleDimension}
            >
              2D plan
            </Button>
          </div>

          <div className="vv-plaque flex items-center gap-1 rounded-sm px-2 py-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-amber-100 hover:text-gold-300"
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
              className="border-gold-500/40 h-7 text-xs text-amber-100 hover:text-gold-300"
              onClick={onToggleFlashlight}
            >
              <Lightbulb className="mr-1 size-3.5" />
              Flashlight {state.flashlight ? "off" : "on"}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-body text-xs text-amber-100/70">
            {solvedCount}/{total} mechanisms
          </span>
          <Button
            size="sm"
            variant="outline"
            className="border-gold-500/40 h-8 gap-1.5 font-body text-xs text-amber-100 hover:text-gold-300"
            onClick={onHint}
            disabled={hintsLeft <= 0}
          >
            <Lightbulb className="size-3.5" />
            Hints ({hintsLeft})
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="border-gold-500/40 h-8 gap-1.5 font-body text-xs text-amber-100 hover:text-gold-300"
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
                      {formatClock(entry.at - state.startedAt) === "0:00"
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
    </div>
  );
}
