import type { Facing, Light, Person, PropDef, RoomDef } from "@/game/types";
import { isPropVisible } from "@/game/engine";
import { cn } from "@/lib/utils";

interface Scene3DProps {
  room: RoomDef;
  light: Light;
  flashlight: boolean;
  person: Person;
  facing: Facing;
  step: number;
  opened: string[];
  inspected: string[];
  onProp: (prop: PropDef) => void;
}

const WALL_TRANSFORM: Record<Facing, string> = {
  back: "translateX(-50%) translateZ(-300px)",
  left: "translateX(-50%) rotateY(90deg) translateZ(-300px)",
  right: "translateX(-50%) rotateY(-90deg) translateZ(-300px)",
  exit: "translateX(-50%) rotateY(180deg) translateZ(-300px)",
};

/** prop anchor offsets inside a 600×340 wall panel */
function anchorFor(prop: PropDef): { left: string; top: string } {
  switch (prop.wall) {
    case "back":
      return { left: "50%", top: "38%" };
    case "left":
      return { left: "32%", top: "42%" };
    case "right":
      return { left: "68%", top: "42%" };
    case "floor":
      return { left: "50%", top: "86%" };
    case "exit":
      return { left: "50%", top: "74%" };
  }
}

/** A wall panel with its props; props from other walls are hidden. */
function WallPanel({
  wall,
  visibleFacing,
  room,
  light,
  opened,
  inspected,
  onProp,
  chamberTitle,
}: {
  wall: Facing;
  visibleFacing: Facing;
  room: RoomDef;
  light: Light;
  opened: string[];
  inspected: string[];
  onProp: (prop: PropDef) => void;
  chamberTitle?: string;
}) {
  const isActive = wall === visibleFacing;
  const wallProps = room.props.filter((p) => p.wall === wall || (wall === "exit" && p.wall === "floor"));

  return (
    <div
      className={cn(
        "absolute left-1/2 top-[16%] h-[62%] w-[74%]",
        wall === "back" && "vv-wall-back",
        wall !== "back" && "vv-wall",
        wall === "exit" && "vv-wall",
      )}
      style={{
        transform: `${WALL_TRANSFORM[wall]} rotateY(${isActive ? 0 : 8}deg)`,
        opacity: isActive ? 1 : 0.55,
        transition: "transform 420ms cubic-bezier(.2,.7,.3,1), opacity 300ms",
        backfaceVisibility: "hidden",
      }}
    >
      {isActive && (
        <>
          {wall === "back" && light === "light" && (
            <div className="vv-chandelier" />
          )}
          {wall === "exit" && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/1 rounded-sm border border-gold-500/40 bg-black/60 px-3 py-1.5">
              <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold-400/80">
                {chamberTitle ?? "the way out"}
              </span>
            </div>
          )}
        </>
      )}

      {isActive &&
        wallProps.map((prop) => {
          const visible = isPropVisible(prop, "3d", light);
          if (!visible) return null;
          const done = opened.includes(prop.id);
          const seen = inspected.includes(prop.id);
          const anchor = anchorFor(prop);
          return (
            <button
              key={prop.id}
              type="button"
              onClick={() => onProp(prop)}
              className={cn(
                "group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-sm border px-3 py-2 transition-all",
                "hover:scale-[1.07] hover:shadow-[0_0_18px_rgba(201,162,39,0.4)]",
                done
                  ? "border-gold-500/25 opacity-50"
                  : "border-gold-500/40 bg-black/45 backdrop-blur-[2px]",
                light === "dark" && "border-gold-500/15 bg-black/70",
              )}
              style={{ left: anchor.left, top: anchor.top }}
            >
              <span className="text-lg leading-none">{prop.glyph ?? "•"}</span>
              <span className="font-body text-[10px] leading-tight text-amber-100/90">
                {prop.label}
              </span>
              {seen && (
                <span className="font-body text-[8px] uppercase tracking-widest text-amber-400/70">
                  seen
                </span>
              )}
            </button>
          );
        })}
    </div>
  );
}

export function Scene3D({
  room,
  light,
  flashlight,
  person,
  facing,
  step,
  opened,
  inspected,
  onProp,
}: Scene3DProps) {
  const chambers = room.chambers ?? [];
  const chamber = chambers[0];

  return (
    <div
      className={cn(
        "vv-scene relative h-full w-full",
        light === "light" && "vv-scene.light",
      )}
    >
      {light === "light" && (
        <>
          <div className="vv-lightflash" />
          <div className="vv-bloom" />
          <div className="vv-mote" style={{ left: "30%", top: "38%", width: 4, height: 4 }} />
          <div className="vv-mote" style={{ left: "62%", top: "30%", width: 3, height: 3, animationDelay: "1.4s" }} />
          <div className="vv-mote" style={{ left: "44%", top: "52%", width: 5, height: 5, animationDelay: "2.6s" }} />
        </>
      )}

      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: `translateZ(${120 + step * 70}px)`,
          transition: "transform 420ms cubic-bezier(.2,.7,.3,1)",
        }}
      >
        <WallPanel
          wall="back"
          visibleFacing={facing}
          room={room}
          light={light}
          opened={opened}
          inspected={inspected}
          onProp={onProp}
          chamberTitle={chamber?.title}
        />
        <WallPanel
          wall="left"
          visibleFacing={facing}
          room={room}
          light={light}
          opened={opened}
          inspected={inspected}
          onProp={onProp}
          chamberTitle={chamber?.title}
        />
        <WallPanel
          wall="right"
          visibleFacing={facing}
          room={room}
          light={light}
          opened={opened}
          inspected={inspected}
          onProp={onProp}
          chamberTitle={chamber?.title}
        />
        <WallPanel
          wall="exit"
          visibleFacing={facing}
          room={room}
          light={light}
          opened={opened}
          inspected={inspected}
          onProp={onProp}
          chamberTitle={chamber?.title}
        />
      </div>

      {person === "3rd" && (
        <div className="pointer-events-none absolute inset-0">
          <div
            className="vv-avatar-shadow"
            style={{ left: "48%", bottom: "12%" }}
          />
          <div
            className="vv-avatar"
            style={{
              left: "47.5%",
              bottom: "14%",
              transform: `rotate(${facing === "back" ? 0 : facing === "left" ? -55 : facing === "right" ? 55 : 180}deg)`,
              transition: "transform 320ms cubic-bezier(.2,.7,.3,1)",
            }}
          />
        </div>
      )}

      {flashlight && light === "dark" && (
        <div className="vv-flashlight absolute left-1/2 top-[30%] h-44 w-72 -translate-x-1/2 rounded-full" />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center">
        <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold-500/50">
          {person === "1st" ? "first person" : "third person"} · facing{" "}
          {facing === "back" ? "the far wall" : facing}
        </span>
      </div>
    </div>
  );
}
