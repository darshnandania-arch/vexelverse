import type { Light, PropDef, RoomDef } from "@/game/types";
import { isPropVisible } from "@/game/engine";
import { cn } from "@/lib/utils";

interface Scene3DProps {
  room: RoomDef;
  light: Light;
  flashlight: boolean;
  dimension: "3d" | "2d";
  opened: string[];
  inspected: string[];
  onProp: (prop: PropDef) => void;
}

const WALL_CLASS = {
  back: "left-[26%] top-[22%] h-[52%] w-[48%]",
  left: "left-[4%] top-[30%] h-[44%] w-[22%] [transform:rotateY(58deg)] origin-left",
  right:
    "right-[4%] top-[30%] h-[44%] w-[22%] [transform:rotateY(-58deg)] origin-right",
  floor: "left-[19%] bottom-[6%] h-[26%] w-[62%] [transform:rotateX(60deg)] origin-bottom",
} as const;

export function Scene3D({
  room,
  light,
  flashlight,
  opened,
  inspected,
  onProp,
}: Scene3DProps) {
  const walls: { wall: PropDef["wall"]; x: number; y: number }[] = [
    { wall: "back", x: 26, y: 22 },
    { wall: "left", x: 6, y: 30 },
    { wall: "right", x: 78, y: 30 },
    { wall: "floor", x: 36, y: 78 },
  ];

  return (
    <div
      className={cn(
        "vv-scene vv-decor relative h-full w-full",
        light === "dark" && "vv-blackout",
      )}
    >
      {light === "light" && <div className="vv-chandelier" />}
      <div className="vv-drape absolute inset-x-0 top-0 h-8 opacity-60" />

      {walls.map(({ wall, x, y }) => (
        <div
          key={wall}
          className={cn(
            "absolute rounded-sm",
            WALL_CLASS[wall],
            wall === "back" && "vv-wall-back",
            wall !== "back" && "vv-wall",
          )}
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          {wall === "back" && light === "dark" && (
            <div className="absolute inset-0 rounded-sm" />
          )}
        </div>
      ))}

      {room.props.map((prop) => {
        const visible = isPropVisible(prop, "3d", light);
        if (!visible) return null;
        const done = opened.includes(prop.id);
        return (
          <button
            key={prop.id}
            type="button"
            onClick={() => onProp(prop)}
            className={cn(
              "vv-prop group absolute z-10 flex flex-col items-center gap-1 rounded-sm border px-3 py-2 text-center transition-all",
              "hover:scale-[1.06] hover:shadow-[0_0_18px_rgba(201,162,39,0.35)]",
              done
                ? "border-gold-500/25 opacity-50"
                : "border-gold-500/40 bg-black/45 backdrop-blur-[2px]",
              light === "dark" && "border-gold-500/15 bg-black/70",
            )}
            style={{
              left: `${wallX(prop.wall)}%`,
              top: `${wallY(prop.wall)}%`,
              minWidth: "88px",
            }}
          >
            <span className="text-lg leading-none">{prop.glyph ?? "•"}</span>
            <span className="font-body text-[10px] leading-tight text-amber-100/90">
              {prop.label}
            </span>
            {inspected.includes(prop.id) && (
              <span className="font-body text-[8px] uppercase tracking-widest text-amber-400/70">
                seen
              </span>
            )}
          </button>
        );
      })}

      {flashlight && light === "dark" && (
        <div className="vv-flashlight absolute left-1/2 top-[30%] h-40 w-64 -translate-x-1/2 rounded-full" />
      )}
    </div>
  );
}

function wallX(wall: PropDef["wall"]): number {
  switch (wall) {
    case "back":
      return 40;
    case "left":
      return 12;
    case "right":
      return 70;
    case "floor":
      return 42;
  }
}

function wallY(wall: PropDef["wall"]): number {
  switch (wall) {
    case "back":
      return 34;
    case "left":
      return 42;
    case "right":
      return 42;
    case "floor":
      return 68;
  }
}
