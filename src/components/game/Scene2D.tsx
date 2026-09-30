import type { Light, PropDef, RoomDef } from "@/game/types";
import { isPropVisible } from "@/game/engine";
import { cn } from "@/lib/utils";

interface Scene2DProps {
  room: RoomDef;
  light: Light;
  flashlight: boolean;
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
};

export function Scene2D({
  room,
  light,
  flashlight,
  opened,
  inspected,
  onProp,
}: Scene2DProps) {
  return (
    <div
      className={cn(
        "vv-blueprint vv-decor relative h-full w-full",
        light === "dark" && "brightness-[0.22]",
      )}
    >
      <div className="absolute left-4 top-4 font-body text-[10px] uppercase tracking-[0.3em] text-gold-500/60">
        Plan drawing · {room.title}
      </div>

      {/* walls */}
      <div className="absolute inset-[10%] border border-gold-500/30" />
      <div className="absolute inset-[13%] border border-dashed border-gold-500/15" />

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
              "hover:scale-[1.08] hover:shadow-[0_0_16px_rgba(201,162,39,0.35)]",
              done
                ? "border-gold-500/25 opacity-50"
                : "border-gold-500/50 bg-[#10131f]/85",
              flashlight &&
                light === "dark" &&
                prop.requires?.light?.includes("dark") &&
                "border-amber-200/70",
            )}
            style={{
              left: `${slot.x + jitter}%`,
              top: `${slot.y + (jitter > 0 ? 4 : -4)}%`,
            }}
          >
            <span className="font-body text-[10px] leading-none text-amber-100/90">
              {prop.label}
            </span>
            {inspected.includes(prop.id) && (
              <span className="ml-1 font-body text-[8px] uppercase tracking-widest text-amber-400/70">
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
