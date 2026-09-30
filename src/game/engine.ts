import { ROOMS_BY_SLUG } from "./gameData";
import type {
  GameAction,
  GameState,
  Light,
  PropDef,
  RoomDef,
} from "./types";
import { journalLineFor } from "./types";

export const MAX_HINTS = 4;

export function isPropVisible(
  prop: PropDef,
  dimension: "3d" | "2d",
  light: Light,
): boolean {
  const req = prop.requires;
  if (req?.dimension && !req.dimension.includes(dimension)) return false;
  if (req?.light && !req.light.includes(light)) return false;
  return true;
}

export function isPuzzleAvailable(
  room: RoomDef,
  puzzleId: string,
  dimension: "3d" | "2d",
  light: Light,
): boolean {
  const puzzle = room.puzzles.find((p) => p.id === puzzleId);
  if (!puzzle) return false;
  const req = puzzle.requires;
  if (req?.dimension && !req.dimension.includes(dimension)) return false;
  if (req?.light && !req.light.includes(light)) return false;
  const prop = room.props.find((p) => p.puzzleId === puzzleId);
  if (prop && !isPropVisible(prop, dimension, light)) return false;
  return true;
}

export function normalized(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function createInitialState(
  room: RoomDef,
  seed = Date.now(),
): GameState {
  const now = Date.now();
  return {
    version: 1,
    roomSlug: room.slug,
    seed,
    startedAt: now,
    elapsedBeforePause: 0,
    pausedAt: null,
    dimension: "3d",
    light: "light",
    flashlight: false,
    inspected: [],
    opened: [],
    inventory: [],
    solved: [],
    hintsUsed: 0,
    hintTarget: null,
    journal: [
      {
        at: now,
        text: `Entered the ${room.title} — ${room.setting.toLowerCase()}.`,
      },
      {
        at: now,
        text: `Par for this room is ${room.parMinutes} minutes. The valet's hint book offers four entries; the first two cost nothing but the ledger notes them all.`,
      },
    ],
    exitOpen: false,
    finished: null,
  };
}

export function elapsedSeconds(state: GameState, now: number): number {
  const live = state.pausedAt !== null ? state.pausedAt : now;
  return Math.floor(state.elapsedBeforePause + (live - state.startedAt) / 1000);
}

function gateOpenProp(
  gate: string,
  room: RoomDef,
  state: GameState,
): boolean {
  const prop = room.props.find((p) => p.id === gate);
  if (!prop) return state.solved.includes(gate);
  return state.opened.includes(gate) || state.solved.includes(gate);
}

export function areGatesOpen(room: RoomDef, state: GameState): boolean {
  return room.gates.every((gate) => gateOpenProp(gate, room, state));
}

export function canOpenProp(
  prop: PropDef,
  state: GameState,
  dimension: "3d" | "2d",
  light: Light,
): { ok: boolean; reason?: string } {
  if (!isPropVisible(prop, dimension, light)) {
    return {
      ok: false,
      reason:
        dimension === "2d"
          ? "The plan shows no such feature on this level."
          : "Nothing of the kind stands in the relief.",
    };
  }
  const missing = (prop.opensWith ?? []).filter((need) =>
    need.startsWith("puzzle:")
      ? !state.solved.includes(need.slice("puzzle:".length))
      : !state.inventory.includes(need),
  );
  if (missing.length > 0) {
    const names = missing
      .map((need) =>
        need.startsWith("puzzle:")
          ? "its mechanism solving"
          : `the ${need.split("_").join(" ")}`,
      )
      .join(", ");
    return { ok: false, reason: `It wants ${names} first.` };
  }
  return { ok: true };
}

function grantYields(state: GameState, prop: PropDef): GameState {
  const yields = prop.yields ?? [];
  const fresh = yields.filter((y) => !state.inventory.includes(y));
  if (fresh.length === 0) return state;
  return { ...state, inventory: [...state.inventory, ...fresh] };
}

export function reducer(state: GameState, action: GameAction): GameState {
  if (state.finished) return state;
  const room = ROOMS_BY_SLUG[state.roomSlug];
  if (!room) return state;

  const withJournal = (base: GameState, act: GameAction): GameState => {
    const line = journalLineFor(act, room, base);
    if (!line) return base;
    return { ...base, journal: [...base.journal, { at: Date.now(), text: line }] };
  };

  switch (action.type) {
    case "tick":
      return state;

    case "toggleDimension": {
      return withJournal(
        {
          ...state,
          dimension: state.dimension === "3d" ? "2d" : "3d",
          flashlight: false,
        },
        action,
      );
    }

    case "setLight": {
      return withJournal(
        { ...state, light: action.light, flashlight: false },
        action,
      );
    }

    case "toggleFlashlight": {
      if (state.light !== "dark") return state;
      return withJournal({ ...state, flashlight: !state.flashlight }, action);
    }

    case "inspect": {
      const prop = room.props.find((p) => p.id === action.propId);
      if (!prop || state.inspected.includes(prop.id)) return state;
      return withJournal(
        { ...state, inspected: [...state.inspected, prop.id] },
        action,
      );
    }

    case "open": {
      const prop = room.props.find((p) => p.id === action.propId);
      if (!prop || state.opened.includes(prop.id)) return state;
      if (!canOpenProp(prop, state, state.dimension, state.light).ok) {
        return state;
      }
      const opened = grantYields(
        { ...state, opened: [...state.opened, prop.id] },
        prop,
      );
      return withJournal(opened, action);
    }

    case "solve": {
      const puzzle = room.puzzles.find((p) => p.id === action.puzzleId);
      if (!puzzle || state.solved.includes(puzzle.id)) return state;
      if (!isPuzzleAvailable(room, puzzle.id, state.dimension, state.light)) {
        return state;
      }
      let next: GameState = { ...state, solved: [...state.solved, puzzle.id] };
      if (puzzle.reward && !next.inventory.includes(puzzle.reward)) {
        next = { ...next, inventory: [...next.inventory, puzzle.reward] };
      }
      next = { ...next, exitOpen: areGatesOpen(room, next) };
      return withJournal(next, action);
    }

    case "hint": {
      if (state.hintsUsed >= MAX_HINTS) return state;
      return withJournal(
        { ...state, hintsUsed: state.hintsUsed + 1, hintTarget: action.puzzleId },
        action,
      );
    }

    case "exit": {
      const seconds = elapsedSeconds(state, action.now);
      return {
        ...state,
        exitOpen: true,
        finished: { outcome: "escaped", at: action.now, seconds },
      };
    }

    case "fail": {
      const seconds = elapsedSeconds(state, action.now);
      return {
        ...state,
        finished: { outcome: "failed", at: action.now, seconds },
      };
    }

    case "note":
      return withJournal(state, action);

    default:
      return state;
  }
}
