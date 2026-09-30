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
  createInitialState,
  elapsedSeconds,
  reducer,
} from "@/game/engine";
import { ROOMS_BY_SLUG } from "@/game/gameData";
import { formatClock } from "@/game/shop";
import type { PropDef } from "@/game/types";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
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

  const recordedRef = useRef(false);
  useEffect(() => {
    if (!state.finished || recordedRef.current) return;
    recordedRef.current = true;
  }, [state.finished]);

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
      });
      setReward(result);
    } catch (e) {
      setRecordError(e instanceof Error ? e.message : "Recording failed");
      setRecorded(false);
    }
  }, [room, state.finished, state.hintsUsed, state.light, state.dimension, isAuthenticated, recordRun, parSeconds]);

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
  const gatesOpen =
    room.gates.length === 0 ||
    room.gates.every(
      (gate) =>
        state.opened.includes(gate) ||
        state.solved.includes(gate),
    );

  return (
    <main className="vv-bg flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 py-4">
        <div className="mb-2 flex items-center justify-between">
          <Link to="/rooms" className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/70 hover:text-gold-400">
            ← The house
          </Link>
          <span className="font-display text-lg text-gold-300">{room.title}</span>
        </div>
        <HUD
          room={room}
          state={state}
          elapsed={elapsed}
          remaining={remaining}
          onToggleDimension={() => dispatch({ type: "toggleDimension" })}
          onSetLight={(light) => dispatch({ type: "setLight", light })}
          onToggleFlashlight={() => dispatch({ type: "toggleFlashlight" })}
          onHint={() => {
            dispatch({ type: "hint", puzzleId: "walkthrough" });
            setHintOpen(true);
          }}
          onAbandon={() => dispatch({ type: "fail", now: Date.now() })}
          onTryExit={() => setExitOpen(true)}
        />
      </div>

      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-4 px-4 pb-6 lg:grid-cols-[1fr_260px]">
        <div className="vv-gold-frame relative h-[520px] overflow-hidden rounded-sm">
          {state.dimension === "3d" ? (
            <Scene3D
              room={room}
              light={state.light}
              flashlight={state.flashlight}
              dimension={state.dimension}
              opened={state.opened}
              inspected={state.inspected}
              onProp={(prop) => {
                setActiveProp(prop);
                dispatch({ type: "inspect", propId: prop.id });
              }}
            />
          ) : (
            <Scene2D
              room={room}
              light={state.light}
              flashlight={state.flashlight}
              opened={state.opened}
              inspected={state.inspected}
              onProp={(prop) => {
                setActiveProp(prop);
                dispatch({ type: "inspect", propId: prop.id });
              }}
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
          <Satchel state={state} equipped={profile?.equipped} />
          <div className="vv-gold-frame rounded-sm bg-black/50 p-3">
            <h3 className="font-display text-sm uppercase tracking-[0.25em] text-gold-400">
              Standing
            </h3>
            <div className="mt-2 space-y-1 font-body text-xs text-amber-100/85">
              <p>{state.solved.length} of {room.puzzles.length} mechanisms solved</p>
              <p>{state.hintsUsed} hints taken</p>
              <p>Dimension: {state.dimension === "3d" ? "3D relief" : "2D plan"}</p>
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
          room={room}
          prop={activeProp}
          state={state}
          open={true}
          onClose={() => setActiveProp(null)}
          onInspect={(propId) => dispatch({ type: "inspect", propId })}
          onOpen={(propId) => {
            dispatch({ type: "open", propId });
            const prop = room.props.find((p) => p.id === propId);
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
            showToast("A mechanism gives way.");
          }}
          onPuzzleBlocked={(reason) => showToast(reason)}
        />
      )}

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
            <DialogTitle className="flex items-center gap-2 font-display text-lg text-gold-300">
              <CheckCircle2 className="size-4" /> Noted
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
          <div className="sr-only">
            <XCircle />
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
