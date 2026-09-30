import { Button } from "@/components/ui/button";
import type { Facing, Person, RoomDef } from "@/game/types";
import { restrictionBlocked } from "@/game/engine";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, PersonStanding, Video } from "lucide-react";

interface MoveControlsProps {
  room: RoomDef;
  person: Person;
  facing: Facing;
  step: number;
  maxStep: number;
  onSetPerson: (person: Person) => void;
  onTurn: (facing: Facing) => void;
  onStepForward: () => void;
  onStepBack: () => void;
}

const FACING_ORDER: Facing[] = ["back", "left", "exit", "right"];

export function MoveControls({
  room,
  person,
  facing,
  step,
  maxStep,
  onSetPerson,
  onTurn,
  onStepForward,
  onStepBack,
}: MoveControlsProps) {
  const movementLocked = restrictionBlocked(room, "noMovement");
  const thirdLocked = restrictionBlocked(room, "noThirdPerson");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* person toggle */}
      <div className="vv-plaque flex items-center gap-1 rounded-sm px-2 py-1">
        <Button
          size="sm"
          variant={person === "1st" ? "default" : "ghost"}
          className={cn(
            "h-7 px-2 text-xs",
            person === "1st"
              ? "bg-gold-600 text-black hover:bg-gold-500"
              : "text-amber-100 hover:text-gold-300",
          )}
          onClick={() => onSetPerson("1st")}
        >
          <Video className="mr-1 size-3.5" /> 1st
        </Button>
        <Button
          size="sm"
          variant={person === "3rd" ? "default" : "ghost"}
          disabled={thirdLocked}
          title={thirdLocked ? "The house has taken the dollhouse view for this round." : undefined}
          className={cn(
            "h-7 px-2 text-xs",
            person === "3rd"
              ? "bg-gold-600 text-black hover:bg-gold-500"
              : "text-amber-100 hover:text-gold-300",
          )}
          onClick={() => onSetPerson("3rd")}
        >
          <PersonStanding className="mr-1 size-3.5" /> 3rd
        </Button>
      </div>

      {/* turn compass */}
      <div className="vv-plaque flex items-center gap-1 rounded-sm px-2 py-1" title={movementLocked ? "Your feet will not move in this room." : undefined}>
        {(["left", "back", "right", "exit"] as Facing[]).map((dir) => (
          <button
            key={dir}
            type="button"
            disabled={movementLocked}
            onClick={() => onTurn(dir)}
            className={cn(
              "rounded-sm px-2 py-1 font-body text-[10px] uppercase tracking-widest transition-colors disabled:opacity-40",
              facing === dir
                ? "bg-gold-600 text-black"
                : "text-amber-100/80 hover:text-gold-300",
            )}
          >
            {dir === "exit" ? "door" : dir}
          </button>
        ))}
      </div>

      {/* step forward / back */}
      <div className="vv-plaque flex items-center gap-1 rounded-sm px-2 py-1">
        <Button
          size="sm"
          variant="ghost"
          disabled={movementLocked || step >= maxStep}
          className="h-7 px-2 text-xs text-amber-100 hover:text-gold-300"
          onClick={onStepForward}
        >
          <ArrowUp className="mr-1 size-3.5" /> Closer
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={movementLocked || step <= 0}
          className="h-7 px-2 text-xs text-amber-100 hover:text-gold-300"
          onClick={onStepBack}
        >
          <ArrowDown className="mr-1 size-3.5" /> Back
        </Button>
      </div>
    </div>
  );
}

export { FACING_ORDER };
