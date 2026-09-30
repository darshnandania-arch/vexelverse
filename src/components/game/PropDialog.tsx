import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GameState, PropDef, RoomDef } from "@/game/types";
import { canOpenProp } from "@/game/engine";
import { cn } from "@/lib/utils";
import { PuzzleDialog } from "./PuzzleDialog";
import { useState } from "react";

interface PropDialogProps {
  room: RoomDef;
  prop: PropDef;
  state: GameState;
  open: boolean;
  onClose: () => void;
  onInspect: (propId: string) => void;
  onOpen: (propId: string) => void;
  onSolve: (puzzleId: string) => void;
  onPuzzleBlocked: (reason: string) => void;
}

export function PropDialog({
  room,
  prop,
  state,
  open,
  onClose,
  onInspect,
  onOpen,
  onSolve,
  onPuzzleBlocked,
}: PropDialogProps) {
  const [puzzleOpen, setPuzzleOpen] = useState(false);
  const inspected = state.inspected.includes(prop.id);
  const done = state.opened.includes(prop.id);
  const gate = canOpenProp(prop, state, state.dimension, state.light);
  const puzzle = prop.puzzleId
    ? room.puzzles.find((p) => p.id === prop.puzzleId)
    : undefined;
  const puzzleSolved = puzzle ? state.solved.includes(puzzle.id) : false;

  const handleInspect = () => {
    if (!inspected) onInspect(prop.id);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) onClose();
        }}
      >
        <DialogContent className="vv-gold-frame border-gold-500/40 bg-[#141009] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-gold-400">
              {prop.label}
            </DialogTitle>
            <DialogDescription className="font-body text-amber-100/80">
              {prop.flavor}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-[64px] font-body text-sm leading-relaxed text-amber-50/90">
            {inspected ? (
              prop.inspect ?? "Nothing more to learn from it."
            ) : (
              <span className="italic text-amber-100/60">
                You have not looked closely yet.
              </span>
            )}
          </div>

          {prop.yields && prop.yields.length > 0 && done && (
            <p className="font-body text-sm text-gold-300">
              Recovered: {prop.yields.map((y) => y.split("_").join(" ")).join(", ")}.
            </p>
          )}

          {gate.reason && (
            <p className="font-body text-sm italic text-red-300/80">{gate.reason}</p>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-gold-500/40 font-body text-amber-100 hover:text-gold-300"
              onClick={handleInspect}
              disabled={inspected}
            >
              {inspected ? "Examined" : "Examine"}
            </Button>
            {prop.opensWith && !done && (
              <Button
                type="button"
                className="bg-gold-600 font-body text-black hover:bg-gold-500"
                onClick={() => onOpen(prop.id)}
                disabled={!gate.ok}
              >
                Try to open
              </Button>
            )}
            {puzzle && !puzzleSolved && (
              <Button
                type="button"
                className="bg-gold-600 font-body text-black hover:bg-gold-500"
                onClick={() => {
                  if (!gate.ok) {
                    onPuzzleBlocked(
                      gate.reason ??
                        "It will not answer while the room keeps its secrets.",
                    );
                    return;
                  }
                  if (prop.requires) {
                    const dimOk =
                      !prop.requires.dimension ||
                      prop.requires.dimension.includes(state.dimension);
                    const lightOk =
                      !prop.requires.light ||
                      prop.requires.light.includes(state.light);
                    if (!dimOk || !lightOk) {
                      onPuzzleBlocked(
                        dimOk
                          ? "It will not answer in this light."
                          : "It only presents itself in the other dimension.",
                      );
                      return;
                    }
                  }
                  setPuzzleOpen(true);
                }}
              >
                {puzzleSolved ? "Solved" : "Work the mechanism"}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              className="font-body text-muted-foreground"
              onClick={onClose}
            >
              Step back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {puzzle && (
        <PuzzleDialog
          room={room}
          puzzle={puzzle}
          state={state}
          open={puzzleOpen}
          onClose={() => setPuzzleOpen(false)}
          onSolve={(id) => {
            onSolve(id);
            setPuzzleOpen(false);
          }}
        />
      )}
    </>
  );
}
