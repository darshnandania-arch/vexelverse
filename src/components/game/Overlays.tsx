import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { WALKTHROUGHS } from "@/game/solutions";
import type { GameState, RoomDef } from "@/game/types";
import { normalized } from "@/game/engine";
import { formatClock, formatLong } from "@/game/shop";
import { useState } from "react";
import { Link } from "react-router";

export function IntroOverlay({
  room,
  onBegin,
}: {
  room: RoomDef;
  onBegin: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 p-4">
      <div className="vv-gold-frame vv-parchment max-w-lg rounded-sm p-8 text-center">
        <p className="font-body text-xs uppercase tracking-[0.35em] text-[#8a6d2f]">
          {room.difficulty} · par {formatLong(room.parMinutes)}
        </p>
        <h2 className="mt-2 font-display text-3xl text-[#3b2a12]">{room.title}</h2>
        <div className="vv-rule my-4" />
        <p className="font-body text-base leading-relaxed text-[#4a3717]">
          {room.briefing}
        </p>
        <p className="mt-3 font-body text-xs italic text-[#7a5c2a]">
          {room.setting}
        </p>
        {room.chambers && room.chambers.length > 0 && (
          <p className="mt-3 font-body text-xs uppercase tracking-[0.2em] text-[#8a6d2f]">
            {room.chambers.length} chambers lie beyond the inner door — clear
            each in turn
          </p>
        )}
        <Button
          className="mt-6 w-full bg-[#8a6d2f] font-body text-[#f5edd8] hover:bg-[#a3823a]"
          onClick={onBegin}
        >
          Take the room
        </Button>
      </div>
    </div>
  );
}

export function ExitDialog({
  room,
  state,
  open,
  onClose,
  onEscape,
  gated,
}: {
  room: RoomDef;
  state: GameState;
  open: boolean;
  onClose: () => void;
  onEscape: () => void;
  gated: boolean;
}) {
  const [guess, setGuess] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const accepted = [room.exit.answer, ...(room.exit.accepts ?? [])].map(normalized);
    if (accepted.includes(normalized(guess))) {
      onEscape();
    } else {
      setError("The lock holds. That is not the answer.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="vv-gold-frame border-gold-500/40 bg-[#141009] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-gold-400">
            The way out
          </DialogTitle>
          <DialogDescription className="font-body text-amber-100/80">
            {room.exit.prompt}
          </DialogDescription>
        </DialogHeader>
        {gated ? (
          <p className="font-body text-sm italic text-red-300/80">
            The way is barred. Some mechanism in the room still holds its
            secret.
          </p>
        ) : (
          <>
            <Input
              autoFocus
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Answer the door…"
              className="border-gold-500/40 bg-black/40 font-body text-amber-100"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            {error && <p className="font-body text-sm text-red-400">{error}</p>}
          </>
        )}
        <p className="font-body text-xs text-muted-foreground">
          {state.solved.length}/{room.puzzles.length} mechanisms solved ·{" "}
          {state.hintsUsed} hints · par {room.parMinutes} minutes
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            className="font-body text-muted-foreground"
            onClick={onClose}
          >
            Back to the room
          </Button>
          {!gated && (
            <Button
              className="bg-gold-600 font-body text-black hover:bg-gold-500"
              onClick={submit}
            >
              Turn the key
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function HintDialog({
  room,
  state,
  open,
  onClose,
  onHint,
}: {
  room: RoomDef;
  state: GameState;
  open: boolean;
  onClose: () => void;
  onHint: () => void;
}) {
  const steps = WALKTHROUGHS[room.slug] ?? [];
  const revealed = state.hintsUsed;
  const freeUsed = Math.min(2, revealed);
  const sealed = room.restrictions?.noHints === true;

  if (sealed) {
    return (
      <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent className="vv-gold-frame border-gold-500/40 bg-[#141009] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-gold-400">
              The book is sealed
            </DialogTitle>
            <DialogDescription className="font-body text-amber-100/80">
              For this round the house has taken the hint book away. Whatever
              is answered here will be answered without help.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              className="font-body text-muted-foreground"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="vv-gold-frame border-gold-500/40 bg-[#141009] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-gold-400">
            The valet's hint book
          </DialogTitle>
          <DialogDescription className="font-body text-amber-100/80">
            The first two entries are free; each after costs 10% of the room's
            purse. Four entries in all.
          </DialogDescription>
        </DialogHeader>
        <ol className="space-y-2">
          {steps.map((step, i) => {
            const shown = i < revealed;
            return (
              <li
                key={step.label}
                className={cn_safe_hint(step, shown)}
              >
                <span className="font-body text-xs uppercase tracking-widest text-gold-500/70">
                  Step {i + 1}
                </span>
                <p className="font-body text-sm text-amber-50/90">
                  {shown ? step.detail : "— withheld —"}
                </p>
              </li>
            );
          })}
          {steps.length === 0 && (
            <li className="font-body text-sm text-muted-foreground">
              The valet has not written this room up yet.
            </li>
          )}
        </ol>
        <div className="flex items-center justify-between">
          <span className="font-body text-xs text-muted-foreground">
            {freeUsed} free · {Math.max(0, revealed - 2)} charged ·{" "}
            {4 - revealed} left
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="font-body text-muted-foreground"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className="bg-gold-600 font-body text-black hover:bg-gold-500"
              onClick={onHint}
              disabled={revealed >= 4}
            >
              {revealed < 2 ? "Read next entry (free)" : "Read next (−10% purse)"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function cn_safe_hint(
  step: { label: string },
  shown: boolean,
): string {
  return shown
    ? "vv-plaque rounded-sm p-3"
    : "rounded-sm border border-dashed border-gold-500/20 p-3 opacity-70";
}

export function CompletionDialog({
  room,
  state,
  onRecord,
  recorded,
  reward,
  error,
}: {
  room: RoomDef;
  state: GameState;
  onRecord: () => void;
  recorded: boolean;
  reward: { goldEarned: number; xpEarned: number } | null;
  error: string | null;
}) {
  const escaped = state.finished?.outcome === "escaped";
  const time = state.finished ? formatClock(state.finished.seconds) : "—";
  const parSec = room.parMinutes * 60;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 p-4">
      <div className="vv-gold-frame w-full max-w-md rounded-sm bg-[#141009] p-8 text-center">
        <p className="font-body text-xs uppercase tracking-[0.35em] text-gold-500/70">
          {escaped ? "Escaped" : "The house prevails"}
        </p>
        <h2 className="mt-2 font-display text-3xl text-gold-300">
          {escaped ? room.title : "Not this time"}
        </h2>
        <div className="vv-rule my-4" />
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="font-display text-xl text-amber-100">{time}</div>
            <div className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
              your time
            </div>
          </div>
          <div>
            <div className="font-display text-xl text-amber-100">
              {room.parMinutes}:00
            </div>
            <div className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
              par
            </div>
          </div>
          <div>
            <div className="font-display text-xl text-amber-100">
              {state.hintsUsed}
            </div>
            <div className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
              hints
            </div>
          </div>
        </div>
        {escaped && !recorded && (
          <>
            <p className="mt-4 font-body text-sm text-amber-100/80">
              Sign in to have this escape recorded — the gold and standing you
              earn here are yours to keep.
            </p>
            <Button
              className="mt-3 w-full bg-gold-600 font-body text-black hover:bg-gold-500"
              onClick={onRecord}
              disabled={recorded}
            >
              {recorded ? "Recording…" : "Record the escape"}
            </Button>
          </>
        )}
        {reward && (
          <p className="mt-3 font-body text-sm text-gold-300">
            +{reward.goldEarned} gold · +{reward.xpEarned} standing
          </p>
        )}
        {error && <p className="mt-3 font-body text-sm text-red-400">{error}</p>}
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="outline"
            className="border-gold-500/40 font-body text-amber-100 hover:text-gold-300"
            asChild
          >
            <Link to="/rooms">Back to the rooms</Link>
          </Button>
          <Button
            variant="ghost"
            className="font-body text-muted-foreground"
            asChild
          >
            <Link to="/dashboard">Your ledger</Link>
          </Button>
        </div>
        {escaped && parSec > 0 && (
          <p className="mt-3 font-body text-[11px] italic text-muted-foreground">
            Purse scales with pace: beat par well and the house pays a bonus;
            dawdle and the purse thins. Hints beyond the second thin it further.
          </p>
        )}
      </div>
    </div>
  );
}
