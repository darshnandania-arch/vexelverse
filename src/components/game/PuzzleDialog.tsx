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
import type { GameState, PuzzleDef, RoomDef } from "@/game/types";
import { normalized } from "@/game/engine";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PuzzleDialogProps {
  room: RoomDef;
  puzzle: PuzzleDef;
  state: GameState;
  open: boolean;
  onClose: () => void;
  onSolve: (puzzleId: string) => void;
}

export function PuzzleDialog({
  room,
  puzzle,
  state,
  open,
  onClose,
  onSolve,
}: PuzzleDialogProps) {
  const [code, setCode] = useState("");
  const [choice, setChoice] = useState<string | null>(null);
  const [sequence, setSequence] = useState<string[]>([]);
  const [word, setWord] = useState("");
  const [error, setError] = useState<string | null>(null);

  const solved = state.solved.includes(puzzle.id);
  const available =
    !puzzle.requires ||
    ((!puzzle.requires.dimension ||
      puzzle.requires.dimension.includes(state.dimension)) &&
      (!puzzle.requires.light || puzzle.requires.light.includes(state.light)));

  const submit = () => {
    if (solved) {
      onClose();
      return;
    }
    let guess = "";
    if (puzzle.kind === "code") guess = code;
    else if (puzzle.kind === "choice") guess = choice ?? "";
    else if (puzzle.kind === "sequence") guess = sequence.join(",");
    else guess = word;

    const accepted = [puzzle.answer, ...(puzzle.accepts ?? [])].map(normalized);
    if (accepted.includes(normalized(guess))) {
      onSolve(puzzle.id);
      setCode("");
      setChoice(null);
      setSequence([]);
      setWord("");
      setError(null);
    } else {
      setError("The mechanism refuses. That is not it.");
    }
  };

  const reset = () => {
    setCode("");
    setChoice(null);
    setSequence([]);
    setWord("");
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="vv-gold-frame border-gold-500/40 bg-[#141009] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-gold-400">
            {solved ? "Solved" : "A mechanism presents itself"}
          </DialogTitle>
          <DialogDescription className="font-body text-amber-100/80">
            {puzzle.flavor ?? room.setting}
          </DialogDescription>
        </DialogHeader>

        {!available && (
          <p className="font-body text-sm text-red-300/80">
            The mechanism will not answer in this state. Change the room's
            dimension or light and try again.
          </p>
        )}

        {solved ? (
          <p className="font-body text-sm italic text-gold-300/90">
            Done — {puzzle.confirmLine ?? puzzle.prompt}
          </p>
        ) : (
          <>
            <p className="font-body text-sm leading-relaxed text-amber-50/90">
              {puzzle.prompt}
            </p>

            {puzzle.kind === "code" && (
              <Input
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter the figure…"
                className="font-body border-gold-500/40 bg-black/40 text-amber-100"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            )}

            {puzzle.kind === "choice" && (
              <div className="flex flex-col gap-2">
                {(puzzle.choices ?? []).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChoice(c)}
                    className={cn(
                      "vv-plaque rounded-sm px-3 py-2 text-left font-body text-sm transition-colors",
                      choice === c
                        ? "text-gold-300 ring-1 ring-gold-400"
                        : "text-amber-100/85 hover:text-gold-200",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {puzzle.kind === "sequence" && (
              <div className="flex flex-col gap-2">
                <div className="font-body text-xs uppercase tracking-widest text-gold-500/70">
                  Order so far: {sequence.length ? sequence.join(" → ") : "—"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(puzzle.choices ?? []).map((c) => (
                    <Button
                      key={c}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-gold-500/40 font-body text-amber-100 hover:text-gold-300"
                      onClick={() => setSequence((s) => [...s, c])}
                    >
                      {c}
                    </Button>
                  ))}
                </div>
                {sequence.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="self-start font-body text-muted-foreground"
                    onClick={() => setSequence([])}
                  >
                    Clear order
                  </Button>
                )}
              </div>
            )}

            {puzzle.kind === "word" && (
              <Input
                autoFocus
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Write it out…"
                className="font-body border-gold-500/40 bg-black/40 text-amber-100"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            )}

            {error && <p className="font-body text-sm text-red-400">{error}</p>}
          </>
        )}

        <DialogFooter className="gap-2">
          {!solved && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="font-body text-muted-foreground"
              onClick={reset}
            >
              Start over
            </Button>
          )}
          <Button
            type="button"
            className="bg-gold-600 font-body text-black hover:bg-gold-500"
            onClick={submit}
            disabled={!solved && !available}
          >
            {solved ? "Close" : "Try it"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
