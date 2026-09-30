import type { Facing, Light, PropDef, RoomDef } from "@/game/types";
import { isPropVisible } from "@/game/engine";
import { cn } from "@/lib/utils";

interface Scene2DProps {
  room: RoomDef;
  light: Light;
  flashlight: boolean;
  facing: Facing;
  step: number;
  opened: string[];
  inspected: string[];
  onProp: (prop: PropDef) => void;
}

/** Approximate plan positions per wall side, in percent. */
const PLAN_SLOT: Record<PropDef["wall"], { x: number; y: number }> = {
  back: { x: 50, y: 16 },
  left: { x: 16, y: 46 },
  right: { x: 84, y: 46 },
  floor: { x: 50, y: 78 },
  exit: { x: 50, y: 90 },
};

const FACING_ARROW: Record<Facing, { x: number; y: number; rotate: number }> = {
  back: { x: 50, y: 30, rotate: 0 },
  left: { x: 26, y: 50, rotate: -90 },
  right: { x: 74, y: 50, rotate: 90 },
  exit: { x: 50, y: 72, rotate: 180 },
};

export function Scene2D({
  room,
  light,
  flashlight,
  facing,
  step,
  opened,
  inspected,
  onProp,
}: Scene2DProps) {
  const arrow = FACING_ARROW[facing];
  const stepOffset = step * 6; // percent; the marker walks toward the facing wall

  return (
    <div
      className={cn(
        "vv-decor relative h-full w-full rounded-sm transition-all duration-700",
        light === "light"
          ? "vv-parchment brightness-100"
          : "vv-blueprint brightness-[0.22]",
      )}
    >
      <div
        className={cn(
          "absolute left-4 top-4 font-body text-[10px] uppercase tracking-[0.3em]",
          light === "light" ? "text-[#8a6d2f]" : "text-gold-500/60",
        )}
      >
        Plan drawing · {room.title}
      </div>

      {/* walls */}
      <div
        className={cn(
          "absolute inset-[10%] border",
          light === "light" ? "border-[#8a6d2f]/50" : "border-gold-500/30",
        )}
      />
      <div
        className={cn(
          "absolute inset-[13%] border border-dashed",
          light === "light" ? "border-[#8a6d2f]/30" : "border-gold-500/15",
        )}
      />

      {/* facing marker: an arrow that walks with you */}
      <div
        className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
        style={{
          left: `${arrow.x + (facing === "left" ? -stepOffset : facing === "right" ? stepOffset : 0)}%`,
          top: `${arrow.y + (facing === "back" ? -stepOffset : facing === "exit" ? stepOffset : 0)}%`,
          transform: `translate(-50%, -50%) rotate(${arrow.rotate}deg)`,
        }}
      >
        <div
          className={cn(
            "size-0 border-x-8 border-b-[14px] border-x-transparent",
            light === "light" ? "border-b-[#8a6d2f]" : "border-b-gold-400",
          )}
        />
      </div>

      {room.props.map((prop, i) => {
        const visible = isPropVisible(prop, "2d", light);
        if (!visible) return null;
        const done = opened.includes(prop.id);
        const slot = PLAN_SLOT[prop.wall];
        const jitter = ((i * 37) % 21) - 10;
        return (
          <button
            key={prop.id}
            type="button"
            onClick={() => onProp(prop)}
            className={cn(
              "group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-sm border px-2.5 py-1.5 text-center transition-all",
              "hover:scale-[1.08]",
              light === "light"
                ? "border-[#8a6d2f]/60 bg-[#f5edd8]/85 hover:shadow-[0_0_14px_rgba(138,109,47,0.35)]"
                : "border-gold-500/50 bg-[#10131f]/85 hover:shadow-[0_0_16px_rgba(201,162,39,0.35)]",
              done && "opacity-50",
            )}
            style={{
              left: `${slot.x + jitter}%`,
              top: `${slot.y + (jitter > 0 ? 4 : -4)}%`,
            }}
          >
            <span
              className={cn(
                "font-body text-[10px] leading-none",
                light === "light" ? "text-[#4a3717]" : "text-amber-100/90",
              )}
            >
              {prop.label}
            </span>
            {inspected.includes(prop.id) && (
              <span
                className={cn(
                  "ml-1 font-body text-[8px] uppercase tracking-widest",
                  light === "light" ? "text-[#8a6d2f]" : "text-amber-400/70",
                )}
              >
                ✓
              </span>
            )}
          </button>
        );
      })}

      {flashlight && light === "dark" && (
        <div className="vv-flashlight absolute left-1/2 top-1/2 h-48 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      )}
    </div>
  );
}
