import { ChamberGate } from "@/components/game/ChamberGate";
import { HUD } from "@/components/game/HUD";
import {
  CompletionDialog,
  ExitDialog,
  HintDialog,
  IntroOverlay,
} from "@/components/game/Overlays";
import { PropDialog } from "@/components/game/PropDialog";
import { Satchel } from "@/components/game/Satchel";
import { Scene2D } from "@/components/game/Scene2D";
import { Scene3D } from "@/components/game/Scene3D";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  areGatesOpen,
  createInitialState,
  elapsedSeconds,
  reducer,
} from "@/game/engine";
import { ROOMS_BY_SLUG } from "@/game/gameData";
import { formatClock } from "@/game/shop";
import type { PropDef } from "@/game/types";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

export default function Play() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const room = slug ? ROOMS_BY_SLUG[slug] : undefined;
  const { isAuthenticated } = useAuth();

  const [state, dispatch] = useReducer(
    reducer,
    room ?? ({} as NonNullable<typeof room>),
    (r) => createInitialState(r, Date.now()),
  );

  const [intro, setIntro] = useState(true);
  const [activeProp, setActiveProp] = useState<PropDef | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [wingOpen, setWingOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [recorded, setRecorded] = useState(false);
  const [reward, setReward] = useState<{ goldEarned: number; xpEarned: number } | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);

  const recordRun = useMutation(api.game.recordRun);
  const profile = useQuery(api.game.getProfile, isAuthenticated ? {} : "skip");

  const parSeconds = (room?.parMinutes ?? 5) * 60;
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => forceTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const elapsed = useMemo(
    () => (room ? elapsedSeconds(state, Date.now()) : 0),
    [room, state],
  );

  // keyboard: A/D or arrows turn, W/S step, V swaps view
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (intro || state.finished) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "a" || e.key === "ArrowLeft") {
        dispatch({ type: "turn", facing: "left" });
      } else if (e.key === "d" || e.key === "ArrowRight") {
        dispatch({ type: "turn", facing: "right" });
      } else if (e.key === "w" || e.key === "ArrowUp") {
        dispatch({ type: "stepForward" });
      } else if (e.key === "s" || e.key === "ArrowDown") {
        dispatch({ type: "stepBack" });
      } else if (e.key === "v") {
        dispatch({ type: "setPerson", person: state.person === "1st" ? "3rd" : "1st" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [intro, state.finished, state.person]);

  const handleRecord = useCallback(async () => {
    if (!room || !state.finished || !isAuthenticated) return;
    setRecorded(true);
    setRecordError(null);
    try {
      const result = await recordRun({
        roomSlug: room.slug,
        roomTitle: room.title,
        difficulty: room.difficulty,
        outcome: state.finished.outcome,
        secondsTaken: state.finished.seconds,
        parSeconds,
        hintsUsed: state.hintsUsed,
        lightDark: state.light,
        finalDimension: state.dimension,
        chambersCleared: state.chambersCleared.length,
      });
      setReward(result);
    } catch (e) {
      setRecordError(e instanceof Error ? e.message : "Recording failed");
      setRecorded(false);
    }
  }, [room, state.finished, state.hintsUsed, state.light, state.dimension, state.chambersCleared, isAuthenticated, recordRun, parSeconds]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  if (!room) {
    return (
      <main className="vv-bg flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="font-display text-2xl text-gold-300">
          No such room in the house
        </h1>
        <p className="font-body text-muted-foreground">
          The corridor you followed leads nowhere.
        </p>
        <Button asChild className="bg-gold-600 font-body text-black hover:bg-gold-500">
          <Link to="/rooms">Back to the rooms</Link>
        </Button>
      </main>
    );
  }

  const remaining = parSeconds - elapsed;
  const chambers = room.chambers ?? [];
  const total =
    room.puzzles.length +
    chambers.reduce((sum, c) => sum + c.puzzles.length, 0);
  const wingComplete = chambers.every((c) =>
    state.chambersCleared.includes(c.slug),
  );
  const gatesOpen = areGatesOpen(room, state);
  const activeChamber = chambers.find((c) => c.slug === state.activeChamber);
  const scopeProps = activeChamber ? activeChamber.props : room.props;
  const scopePuzzles = activeChamber ? activeChamber.puzzles : room.puzzles;
  const scopeRoom = activeChamber
    ? { ...room, props: scopeProps, puzzles: scopePuzzles }
    : room;

  const handleProp = (prop: PropDef) => {
    setActiveProp(prop);
    dispatch({ type: "inspect", propId: prop.id });
  };

  return (
    <main className="vv-bg flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 py-4">
        <div className="mb-2 flex items-center justify-between">
          <Link to="/rooms" className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/70 hover:text-gold-400">
            ← The house
          </Link>
          <span className="font-display text-lg text-gold-300">
            {room.title}
            {activeChamber ? ` — ${activeChamber.title}` : ""}
          </span>
        </div>
        <HUD
          room={room}
          state={state}
          elapsed={elapsed}
          remaining={remaining}
          onToggleDimension={() => dispatch({ type: "toggleDimension" })}
          onSetLight={(light) => dispatch({ type: "setLight", light })}
          onToggleFlashlight={() => dispatch({ type: "toggleFlashlight" })}
          onSetPerson={(person) => dispatch({ type: "setPerson", person })}
          onTurn={(facing) => dispatch({ type: "turn", facing })}
          onStepForward={() => dispatch({ type: "stepForward" })}
          onStepBack={() => dispatch({ type: "stepBack" })}
          onHint={() => {
            dispatch({ type: "hint", puzzleId: "walkthrough" });
            setHintOpen(true);
          }}
          onAbandon={() => dispatch({ type: "fail", now: Date.now() })}
          onTryExit={() => setExitOpen(true)}
        />
      </div>

      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-4 px-4 pb-6 lg:grid-cols-[1fr_260px]">
        <div className="vv-gold-frame relative h-[540px] overflow-hidden rounded-sm">
          {state.dimension === "3d" ? (
            <Scene3D
              key={activeChamber?.slug ?? "main"}
              room={scopeRoom}
              light={state.light}
              flashlight={state.flashlight}
              person={state.person}
              facing={state.facing}
              step={state.step}
              opened={state.opened}
              inspected={state.inspected}
              onProp={handleProp}
            />
          ) : (
            <Scene2D
              room={scopeRoom}
              light={state.light}
              flashlight={state.flashlight}
              facing={state.facing}
              step={state.step}
              opened={state.opened}
              inspected={state.inspected}
              onProp={handleProp}
            />
          )}
          {intro && (
            <IntroOverlay
              room={room}
              onBegin={() => setIntro(false)}
            />
          )}
          {state.finished && (
            <CompletionDialog
              room={room}
              state={state}
              onRecord={handleRecord}
              recorded={recorded}
              reward={reward}
              error={recordError}
            />
          )}
        </div>

        <aside className="flex flex-col gap-3">
          {chambers.length > 0 && (
            <div className="vv-gold-frame rounded-sm bg-black/50 p-3">
              <h3 className="font-display text-sm uppercase tracking-[0.25em] text-gold-400">
                The wing
              </h3>
              <p className="mt-1 font-body text-xs text-amber-100/75">
                {wingComplete
                  ? "Every chamber is answered. The room's own door will now listen."
                  : activeChamber
                    ? `You are in the ${activeChamber.title}. ${state.chambersCleared.length}/${chambers.length} chambers cleared.`
                    : `${state.chambersCleared.length}/${chambers.length} chambers cleared. The inner door waits.`}
              </p>
              <Button
                size="sm"
                className="mt-2 w-full bg-gold-600 font-body text-xs text-black hover:bg-gold-500"
                onClick={() => setWingOpen(true)}
              >
                {activeChamber ? "Switch chamber" : "The inner door"}
              </Button>
            </div>
          )}
          <Satchel state={state} equipped={profile?.equipped} />
          <div className="vv-gold-frame rounded-sm bg-black/50 p-3">
            <h3 className="font-display text-sm uppercase tracking-[0.25em] text-gold-400">
              Standing
            </h3>
            <div className="mt-2 space-y-1 font-body text-xs text-amber-100/85">
              <p>{state.solved.length} of {total} mechanisms solved</p>
              <p>{state.hintsUsed} hints taken</p>
              <p>Dimension: {state.dimension === "3d" ? "3D relief" : "2D plan"}</p>
              <p>View: {state.person === "1st" ? "first person" : "third person"}</p>
              <p>Light: {state.light}</p>
            </div>
          </div>
          <div className="vv-gold-frame rounded-sm bg-black/50 p-3">
            <h3 className="font-display text-sm uppercase tracking-[0.25em] text-gold-400">
              Latest entry
            </h3>
            <p className="mt-2 font-body text-xs italic text-amber-100/80">
              {state.journal[state.journal.length - 1]?.text}
            </p>
          </div>
        </aside>
      </div>

      {activeProp && (
        <PropDialog
          room={scopeRoom}
          prop={activeProp}
          state={state}
          open={true}
          onClose={() => setActiveProp(null)}
          onInspect={(propId) => dispatch({ type: "inspect", propId })}
          onOpen={(propId) => {
            dispatch({ type: "open", propId });
            const prop = scopeProps.find((p) => p.id === propId);
            const got = (prop?.yields ?? []).filter(
              (y) => !state.inventory.includes(y),
            );
            showToast(
              got.length > 0
                ? `Into the satchel: ${got.map((g) => g.split("_").join(" ")).join(", ")}.`
                : "It gives way.",
            );
          }}
          onSolve={(puzzleId) => {
            dispatch({ type: "solve", puzzleId });
            const chamber = chambers.find((c) =>
              c.exitPuzzles.includes(puzzleId) &&
              c.exitPuzzles.every((id) =>
                id === puzzleId
                  ? true
                  : state.solved.includes(id),
              ),
            );
            if (chamber && activeChamber?.slug === chamber.slug) {
              dispatch({ type: "clearChamber", chamber: chamber.slug });
              showToast(`The ${chamber.title} is answered.`);
            } else {
              showToast("A mechanism gives way.");
            }
          }}
          onPuzzleBlocked={(reason) => showToast(reason)}
        />
      )}

      <ChamberGate
        chambers={chambers}
        state={state}
        open={wingOpen}
        onClose={() => setWingOpen(false)}
        onEnter={(chamber) => {
          dispatch({ type: "enterChamber", chamber });
          setActiveProp(null);
        }}
      />

      <ExitDialog
        room={room}
        state={state}
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        onEscape={() => {
          dispatch({ type: "exit", now: Date.now() });
          setExitOpen(false);
        }}
        gated={!gatesOpen}
      />

      <HintDialog
        room={room}
        state={state}
        open={hintOpen}
        onClose={() => setHintOpen(false)}
        onHint={() => dispatch({ type: "hint", puzzleId: "walkthrough" })}
      />

      <Dialog open={toast !== null} onOpenChange={(n) => !n && setToast(null)}>
        <DialogContent className="vv-gold-frame max-w-sm border-gold-500/40 bg-[#141009] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-gold-300">
              Noted
            </DialogTitle>
            <DialogDescription className="font-body text-amber-100/85">
              {toast}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              size="sm"
              variant="outline"
              className="border-gold-500/40 font-body text-amber-100"
              onClick={() => setToast(null)}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
