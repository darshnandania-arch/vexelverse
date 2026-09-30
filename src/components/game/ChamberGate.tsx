import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ChamberDef, GameState } from "@/game/types";
import { cn } from "@/lib/utils";
import { Lock, Unlock } from "lucide-react";
import { useState } from "react";

interface ChamberGateProps {
  chambers: ChamberDef[];
  state: GameState;
  open: boolean;
  onClose: () => void;
  onEnter: (slug: string) => void;
}

/** Overlay listing the wing's chambers; entering one switches the active scope. */
export function ChamberGate({ chambers, state, open, onClose, onEnter }: ChamberGateProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const chosen = chambers.find((c) => c.slug === selected) ?? null;
  const unlocked = chosen
    ? !chosen.requires || state.chambersCleared.includes(chosen.requires)
    : false;
  const alreadyCleared = chosen
    ? state.chambersCleared.includes(chosen.slug)
    : false;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="vv-gold-frame border-gold-500/40 bg-[#141009] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-gold-400">
            The inner door
          </DialogTitle>
          <DialogDescription className="font-body text-amber-100/80">
            Beyond it, the wing's chambers wait in a fixed order. Clear one and
            the next unlocks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {chambers.map((c) => {
            const cleared = state.chambersCleared.includes(c.slug);
            const unlockedNow =
              !c.requires || state.chambersCleared.includes(c.requires);
            const active = state.activeChamber === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => setSelected(c.slug)}
                className={cn(
                  "vv-plaque flex w-full items-center justify-between rounded-sm px-3 py-2 text-left transition-colors",
                  selected === c.slug && "ring-1 ring-gold-400",
                  !unlockedNow && "opacity-50",
                )}
              >
                <span>
                  <span className="font-display text-sm text-gold-300">{c.title}</span>
                  <span className="block font-body text-xs italic text-amber-100/70">
                    {c.epigraph} · par {c.parMinutes} min
                  </span>
                </span>
                {cleared ? (
                  <span className="font-body text-xs uppercase tracking-widest text-gold-400">
                    cleared ✓
                  </span>
                ) : unlockedNow ? (
                  <Unlock className="size-4 text-gold-400" />
                ) : (
                  <Lock className="size-4 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            className="font-body text-muted-foreground"
            onClick={onClose}
          >
            Not yet
          </Button>
          <Button
            className="bg-gold-600 font-body text-black hover:bg-gold-500"
            disabled={!chosen || !unlocked}
            onClick={() => {
              if (chosen) onEnter(chosen.slug);
              onClose();
            }}
          >
            {alreadyCleared
              ? "Revisit"
              : chosen
                ? `Enter the ${chosen.title}`
                : "Choose a chamber"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
