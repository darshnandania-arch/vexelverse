import { Html } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { restrictionBlocked } from "@/game/engine";
import { isPropVisible } from "@/game/engine";
import type { Facing, Light, Person, PropDef, RoomDef } from "@/game/types";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

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
  /** called when the player clicks the exit door in the world */
  onDoor?: () => void;
  /** freezes walking/looking while dialogs or overlays are up */
  paused?: boolean;
  /** engine sync: report which wall the player now faces */
  onFacingChange?: (facing: Facing) => void;
}

/* ------------------------------------------------------------------ */
/* room geometry                                                       */
/* ------------------------------------------------------------------ */

const ROOM_W = 8; // along x — left/right walls
const ROOM_D = 10; // along z — back/exit walls
const ROOM_H = 3.6;
const EYE = 1.6;

const PALETTE = {
  light: {
    wall: "#c8b48c",
    wallBack: "#d8c69c",
    floor: "#a98f5e",
    ceiling: "#b3a077",
    rug: "#7c3f3f",
    trim: "#8a6d2f",
  },
  dark: {
    wall: "#171208",
    wallBack: "#1a1409",
    floor: "#100c07",
    ceiling: "#0b0805",
    rug: "#221410",
    trim: "#3a2c12",
  },
};

/** Props per facing group: floor props sit on pedestals near the centre. */
function wallPropsOf(props: PropDef[], wall: "back" | "left" | "right" | "exit"): PropDef[] {
  if (wall === "back") return props.filter((p) => p.wall === "back");
  if (wall === "exit") return props.filter((p) => p.wall === "exit");
  return props.filter((p) => p.wall === wall);
}

function floorPropsOf(props: PropDef[]): PropDef[] {
  return props.filter((p) => p.wall === "floor");
}

/** Even spread across a wall for n props. */
function spread(i: number, n: number, span: number): number {
  if (n <= 1) return 0;
  return (i - (n - 1) / 2) * span;
}

/* ------------------------------------------------------------------ */
/* world objects                                                       */
/* ------------------------------------------------------------------ */

function PropNode({
  prop,
  position,
  rotationY,
  light,
  onProp,
  glow,
}: {
  prop: PropDef;
  position: [number, number, number];
  rotationY: number;
  light: Light;
  onProp: (prop: PropDef) => void;
  glow: boolean;
}) {
  const darkGlow = glow && light === "dark";
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* the clue object itself: a brass-bound plaque / reliquary box */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onProp(prop);
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <boxGeometry args={[0.62, 0.78, 0.14]} />
        <meshStandardMaterial
          color={light === "light" ? "#6b5223" : "#3a2c12"}
          metalness={0.45}
          roughness={0.5}
          emissive={darkGlow ? "#ffcf7a" : "#000000"}
          emissiveIntensity={darkGlow ? 0.55 : 0}
        />
      </mesh>
      {/* gold corner stud */}
      <mesh position={[0, 0, 0.08]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial
          color="#c9a227"
          metalness={0.8}
          roughness={0.3}
          emissive={darkGlow ? "#ffcf7a" : "#000000"}
          emissiveIntensity={darkGlow ? 0.8 : 0}
        />
      </mesh>
      <Html
        center
        distanceFactor={7}
        zIndexRange={[30, 10]}
        position={[0, 0.72, 0]}
        style={{ pointerEvents: "auto" }}
      >
        <button
          type="button"
          onClick={() => onProp(prop)}
          className={cn(
            "vv-plan-prop flex -translate-x-1/2 flex-col items-center gap-0.5 whitespace-nowrap rounded-sm border px-2 py-1",
            "cursor-pointer transition-all hover:scale-105",
            light === "light"
              ? "border-[#8a6d2f]/70 bg-[#f5edd8]/90 text-[#4a3717] hover:shadow-[0_0_14px_rgba(138,109,47,0.45)]"
              : "border-gold-500/50 bg-[#10131f]/90 text-amber-100/90 hover:shadow-[0_0_16px_rgba(201,162,39,0.45)]",
            glow && light === "dark" && "border-amber-300/60 shadow-[0_0_10px_rgba(255,207,122,0.4)]",
          )}
        >
          <span className="text-sm leading-none">{prop.glyph ?? "•"}</span>
          <span className="font-body text-[9px] uppercase tracking-[0.18em] leading-tight">
            {prop.label}
          </span>
        </button>
      </Html>
    </group>
  );
}

function Pedestal({ position, light }: { position: [number, number, number]; light: Light }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.55, 0.9, 0.55]} />
        <meshStandardMaterial color={light === "light" ? "#5c4426" : "#2a1f10"} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.93, 0]}>
        <boxGeometry args={[0.68, 0.08, 0.68]} />
        <meshStandardMaterial color="#8a6d2f" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Chandelier({ light }: { light: Light }) {
  const on = light === "light";
  return (
    <group position={[0, ROOM_H - 0.55, -0.6]}>
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 0.55, 8]} />
        <meshStandardMaterial color="#8a6d2f" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.32, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          color={on ? "#ffe9a8" : "#4a3a1a"}
          emissive={on ? "#ffd98a" : "#000000"}
          emissiveIntensity={on ? 2.2 : 0}
        />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.3, -0.16, Math.sin(a) * 0.3]}
          >
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial
              color={on ? "#fff3c9" : "#3a2e15"}
              emissive={on ? "#ffce7a" : "#000000"}
              emissiveIntensity={on ? 1.6 : 0}
            />
          </mesh>
        );
      })}
      {on && (
        <pointLight
          color="#ffd9a0"
          intensity={42}
          distance={26}
          decay={1.6}
          position={[0, -0.35, 0]}
        />
      )}
    </group>
  );
}

function ExitDoor({
  light,
  onDoor,
  label,
}: {
  light: Light;
  onDoor?: () => void;
  label?: string;
}) {
  return (
    <group
      position={[0, 0, ROOM_D / 2 - 0.12]}
      onClick={(e) => {
        e.stopPropagation();
        onDoor?.();
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[1.5, 2.4, 0.12]} />
        <meshStandardMaterial
          color={light === "light" ? "#4a3016" : "#1d1309"}
          roughness={0.65}
        />
      </mesh>
      <mesh position={[0.55, 1.2, 0.08]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.3} />
      </mesh>
      <Html center distanceFactor={8} position={[0, 2.75, 0.1]} zIndexRange={[30, 10]}>
        <button
          type="button"
          onClick={onDoor}
          className="vv-plan-prop flex -translate-x-1/2 cursor-pointer items-center gap-1 whitespace-nowrap rounded-sm border border-gold-500/50 bg-black/70 px-2.5 py-1 font-body text-[9px] uppercase tracking-[0.25em] text-gold-300 transition-colors hover:border-gold-400 hover:text-gold-200"
        >
          🚪 {label ?? "the way out"}
        </button>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* player: walking, looking, camera, avatar                            */
/* ------------------------------------------------------------------ */

interface PlayerPose {
  pos: THREE.Vector3;
  yaw: number;
  pitch: number;
}

function PlayerController({
  paused,
  movementLocked,
  person,
  facing,
  onFacingChange,
  pose,
}: {
  paused: boolean;
  movementLocked: boolean;
  person: Person;
  facing: Facing;
  onFacingChange?: (facing: Facing) => void;
  pose: PlayerPose;
}) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const keys = useRef<Set<string>>(new Set());
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const lastSent = useRef<Facing>(facing);

  // keyboard walking (WASD + arrows)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (paused) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const k = e.code;
      if (
        k === "KeyW" || k === "KeyA" || k === "KeyS" || k === "KeyD" ||
        k === "ArrowUp" || k === "ArrowDown" || k === "ArrowLeft" || k === "ArrowRight"
      ) {
        if (k.startsWith("Arrow")) e.preventDefault();
        keys.current.add(k);
      }
    };
    const up = (e: KeyboardEvent) => {
      keys.current.delete(e.code);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      keys.current.clear();
    };
  }, [paused]);

  // drag to look
  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e: PointerEvent) => {
      if (paused) return;
      dragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current || paused) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      pose.yaw -= dx * 0.0042;
      pose.pitch = THREE.MathUtils.clamp(pose.pitch - dy * 0.0032, -0.7, 0.6);
    };
    const onUp = () => {
      dragging.current = false;
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [gl, paused, pose]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);

    // walking
    if (!paused && !movementLocked) {
      const k = keys.current;
      const f = new THREE.Vector3(-Math.sin(pose.yaw), 0, -Math.cos(pose.yaw));
      const r = new THREE.Vector3(Math.cos(pose.yaw), 0, -Math.sin(pose.yaw));
      const move = new THREE.Vector3();
      if (k.has("KeyW") || k.has("ArrowUp")) move.add(f);
      if (k.has("KeyS") || k.has("ArrowDown")) move.sub(f);
      if (k.has("KeyD") || k.has("ArrowRight")) move.add(r);
      if (k.has("KeyA") || k.has("ArrowLeft")) move.sub(r);
      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(3.1 * delta);
        pose.pos.x = THREE.MathUtils.clamp(pose.pos.x + move.x, -ROOM_W / 2 + 0.7, ROOM_W / 2 - 0.7);
        pose.pos.z = THREE.MathUtils.clamp(pose.pos.z + move.z, -ROOM_D / 2 + 0.9, ROOM_D / 2 - 1.1);
      }
    }

    // camera
    if (person === "1st") {
      camera.position.set(pose.pos.x, EYE, pose.pos.z);
      camera.rotation.order = "YXZ";
      camera.rotation.set(pose.pitch, pose.yaw, 0);
    } else {
      const back = new THREE.Vector3(
        Math.sin(pose.yaw) * 3.0,
        0,
        Math.cos(pose.yaw) * 3.0,
      );
      camera.position.set(
        pose.pos.x + back.x,
        EYE + 1.15,
        pose.pos.z + back.z,
      );
      camera.lookAt(pose.pos.x, 1.35, pose.pos.z);
    }

    // keep the 2D plan's facing arrow in step with where you actually face
    if (onFacingChange && !paused) {
      const dz = -Math.cos(pose.yaw);
      const dx = -Math.sin(pose.yaw);
      const next: Facing =
        Math.abs(dz) >= Math.abs(dx) ? (dz < 0 ? "back" : "exit") : dx < 0 ? "left" : "right";
      if (next !== lastSent.current) {
        lastSent.current = next;
        if (next !== facing) onFacingChange(next);
      }
    }
  });

  return null;
}

function Avatar({ pose, visible }: { pose: PlayerPose; visible: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!group.current) return;
    group.current.position.set(pose.pos.x, 0, pose.pos.z);
    group.current.rotation.y = pose.yaw;
  });
  if (!visible) return null;
  return (
    <group ref={group}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.32} />
      </mesh>
      <mesh position={[0, 1.02, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.85, 6, 14]} />
        <meshStandardMaterial color="#2c2416" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.78, 0]}>
        <sphereGeometry args={[0.21, 16, 16]} />
        <meshStandardMaterial color="#c9a26a" roughness={0.55} />
      </mesh>
      {/* lantern in hand */}
      <mesh position={[0.42, 0.95, 0.12]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial color="#ffce7a" emissive="#ffb45e" emissiveIntensity={0.9} />
      </mesh>
      <pointLight color="#ffce7a" intensity={3.5} distance={5.5} decay={1.8} position={[0.42, 1, 0.12]} />
    </group>
  );
}

function Flashlight({
  pose,
  person,
  active,
}: {
  pose: PlayerPose;
  person: Person;
  active: boolean;
}) {
  const spot = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ camera }) => {
    if (!spot.current) return;
    const origin =
      person === "1st"
        ? camera.position
        : new THREE.Vector3(pose.pos.x, EYE, pose.pos.z);
    spot.current.position.copy(origin);
    const dir = new THREE.Vector3(
      -Math.sin(pose.yaw) * Math.cos(pose.pitch),
      Math.sin(pose.pitch),
      -Math.cos(pose.yaw) * Math.cos(pose.pitch),
    );
    target.position.copy(origin.clone().add(dir.multiplyScalar(6)));
    target.updateMatrixWorld();
  });
  if (!active) return null;
  return (
    <>
      <primitive object={target} />
      <spotLight
        ref={spot}
        color="#ffe7bd"
        intensity={95}
        angle={0.52}
        penumbra={0.65}
        distance={24}
        decay={1.5}
        target={target}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* room shell                                                          */
/* ------------------------------------------------------------------ */

function RoomShell({
  room,
  light,
  flashlight,
  person,
  facing,
  opened,
  inspected,
  onProp,
  onDoor,
  paused,
  onFacingChange,
}: {
  room: RoomDef;
  light: Light;
  flashlight: boolean;
  person: Person;
  facing: Facing;
  opened: string[];
  inspected: string[];
  onProp: (prop: PropDef) => void;
  onDoor?: () => void;
  paused: boolean;
  onFacingChange?: (facing: Facing) => void;
}) {
  const c = PALETTE[light];
  const pose = useMemo<PlayerPose>(
    () => ({
      pos: new THREE.Vector3(0, 0, ROOM_D / 2 - 1.8),
      yaw: 0,
      pitch: 0,
    }),
    [],
  );
  const movementLocked = restrictionBlocked(room, "noMovement");

  const backProps = wallPropsOf(room.props, "back");
  const leftProps = wallPropsOf(room.props, "left");
  const rightProps = wallPropsOf(room.props, "right");
  const exitWallProps = wallPropsOf(room.props, "exit");
  const floorProps = floorPropsOf(room.props);

  return (
    <>
      <ambientLight color={light === "light" ? "#fff2dc" : "#20242e"} intensity={light === "light" ? 0.75 : 0.07} />
      {light === "light" && (
        <directionalLight color="#ffedd0" intensity={0.5} position={[3, 6, 2]} />
      )}

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color={c.floor} roughness={0.9} />
      </mesh>
      {/* parquet strips */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-ROOM_W / 2 + (i + 1) * (ROOM_W / 10), 0.005, 0]}>
          <planeGeometry args={[0.03, ROOM_D]} />
          <meshBasicMaterial color={c.trim} transparent opacity={0.18} />
        </mesh>
      ))}
      {/* rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.4]}>
        <circleGeometry args={[2.1, 36]} />
        <meshStandardMaterial color={c.rug} roughness={0.95} />
      </mesh>

      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_H, 0]}>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color={c.ceiling} roughness={1} />
      </mesh>

      {/* back wall (far) */}
      <mesh position={[0, ROOM_H / 2, -ROOM_D / 2]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_H]} />
        <meshStandardMaterial color={c.wallBack} roughness={0.85} />
      </mesh>
      {/* left / right walls */}
      <mesh position={[-ROOM_W / 2, ROOM_H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_D, ROOM_H]} />
        <meshStandardMaterial color={c.wall} roughness={0.85} />
      </mesh>
      <mesh position={[ROOM_W / 2, ROOM_H / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_D, ROOM_H]} />
        <meshStandardMaterial color={c.wall} roughness={0.85} />
      </mesh>
      {/* exit wall (behind spawn) with the door */}
      <mesh position={[0, ROOM_H / 2, ROOM_D / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[ROOM_W, ROOM_H]} />
        <meshStandardMaterial color={c.wall} roughness={0.85} />
      </mesh>
      <ExitDoor light={light} onDoor={onDoor} />

      <Chandelier light={light} />

      {/* wall props */}
      {backProps.map((prop, i) => (
        <PropNode
          key={prop.id}
          prop={prop}
          position={[spread(i, backProps.length, 2.1), 1.55, -ROOM_D / 2 + 0.35]}
          rotationY={0}
          light={light}
          onProp={onProp}
          glow={Boolean(prop.requires?.light?.includes("dark"))}
        />
      ))}
      {leftProps.map((prop, i) => (
        <PropNode
          key={prop.id}
          prop={prop}
          position={[-ROOM_W / 2 + 0.35, 1.55, spread(i, leftProps.length, 2.3)]}
          rotationY={Math.PI / 2}
          light={light}
          onProp={onProp}
          glow={Boolean(prop.requires?.light?.includes("dark"))}
        />
      ))}
      {rightProps.map((prop, i) => (
        <PropNode
          key={prop.id}
          prop={prop}
          position={[ROOM_W / 2 - 0.35, 1.55, spread(i, rightProps.length, 2.3)]}
          rotationY={-Math.PI / 2}
          light={light}
          onProp={onProp}
          glow={Boolean(prop.requires?.light?.includes("dark"))}
        />
      ))}
      {exitWallProps.map((prop, i) => (
        <PropNode
          key={prop.id}
          prop={prop}
          position={[spread(i, exitWallProps.length, 2.2) + (exitWallProps.length > 0 ? 1.9 : 0), 1.6, ROOM_D / 2 - 0.35]}
          rotationY={Math.PI}
          light={light}
          onProp={onProp}
          glow={Boolean(prop.requires?.light?.includes("dark"))}
        />
      ))}

      {/* floor props on pedestals near the centre */}
      {floorProps.map((prop, i) => (
        <group key={prop.id}>
          <Pedestal position={[spread(i, floorProps.length, 2.4), 0, -0.9]} light={light} />
          <PropNode
            prop={prop}
            position={[spread(i, floorProps.length, 2.4), 1.32, -0.9]}
            rotationY={0}
            light={light}
            onProp={onProp}
            glow={Boolean(prop.requires?.light?.includes("dark"))}
          />
        </group>
      ))}

      <Flashlight pose={pose} person={person} active={flashlight && light === "dark"} />
      <Avatar pose={pose} visible={person === "3rd"} />
      <PlayerController
        paused={paused}
        movementLocked={movementLocked}
        person={person}
        facing={facing}
        onFacingChange={onFacingChange}
        pose={pose}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* exported scene                                                      */
/* ------------------------------------------------------------------ */

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
  onDoor,
  paused = false,
  onFacingChange,
}: Scene3DProps) {
  void step;
  void opened;
  void inspected;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 68, near: 0.1, far: 60, position: [0, EYE, ROOM_D / 2 - 1.8] }}
        gl={{ antialias: true }}
        style={{ position: "absolute", inset: 0, cursor: "grab" }}
      >
        <RoomShell
          room={room}
          light={light}
          flashlight={flashlight}
          person={person}
          facing={facing}
          opened={opened}
          inspected={inspected}
          onProp={onProp}
          onDoor={onDoor}
          paused={paused}
          onFacingChange={onFacingChange}
        />
      </Canvas>

      {/* the "switch flipped" moment + dust motes stay as DOM overlays */}
      {light === "light" && (
        <>
          <div className="vv-lightflash pointer-events-none" />
          <div className="vv-bloom pointer-events-none" />
          <div className="vv-mote pointer-events-none" style={{ left: "30%", top: "38%", width: 4, height: 4 }} />
          <div className="vv-mote pointer-events-none" style={{ left: "62%", top: "30%", width: 3, height: 3, animationDelay: "1.4s" }} />
          <div className="vv-mote pointer-events-none" style={{ left: "44%", top: "52%", width: 5, height: 5, animationDelay: "2.6s" }} />
        </>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center">
        <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold-500/60">
          {person === "1st" ? "first person" : "third person"} · wasd walk · drag to look ·{" "}
          {facing === "back" ? "facing the far wall" : facing === "exit" ? "facing the door" : `facing the ${facing} wall`}
        </span>
      </div>
    </div>
  );
}
