// Shared types for the Vexelverse Escape engine. The engine is deliberately
// framework-free: a single reducer owns the entire run state, which is what
// makes dimension flips, light flips and the half-solved memory trick honest.

export type Dimension = "3d" | "2d";
export type Light = "light" | "dark";
export type Difficulty = "Apprentice" | "Journeyman" | "Master" | "Grandmaster";

export interface PuzzleDef {
  id: string;
  /** How the puzzle is presented and answered. */
  kind:
    | "code" // digits/letters typed into a lock
    | "choice" // pick the right option
    | "sequence" // order items correctly
    | "word"; // free text answer
  prompt: string;
  /** flavour text shown above the prompt, sets the tone of the puzzle */
  flavor?: string;
  answer: string;
  /** accepted variants for word/choice answers, normalised lower-case */
  accepts?: string[];
  choices?: string[];
  /** engine gate: which dimension or light state can interact with this puzzle */
  requires?: { dimension?: Dimension[]; light?: Light[] };
  /** item granted on solve */
  reward?: string;
  /** shown once solved, as a letterpress confirmation */
  confirmLine?: string;
}

export interface PropDef {
  id: string;
  /** Wall a 3D prop hangs on; 2D slots are derived from this. */
  wall: "back" | "left" | "right" | "floor";
  label: string;
  glyph?: string;
  flavor: string;
  /** 3D-only props are invisible from the plan; 2D-only ones have no wall art. */
  requires?: { dimension?: Dimension[]; light?: Light[] };
  /** freeform observation text; journal entries key off inspection */
  inspect?: string;
  /** prop starts locked and opens only with these items or solved puzzles */
  opensWith?: string[];
  /** container props yield these item ids on first open */
  yields?: string[];
  /** interactive puzzle prop */
  puzzleId?: string;
}

export interface RoomDef {
  slug: string;
  title: string;
  tagline: string;
  difficulty: Difficulty;
  parMinutes: number;
  /** short narrative shown before entering */
  briefing: string;
  /** the brass plaque line under the title */
  setting: string;
  theme: string;
  /** tint classes for scene dressing */
  sceneTint: string;
  props: PropDef[];
  puzzles: PuzzleDef[];
  /** props that must be opened or solved before the exit answers */
  gates: string[];
  /** what "escaped" looks like: a final code or phrase */
  exit: { prompt: string; answer: string; accepts?: string[] };
}

export interface JournalEntry {
  at: number;
  text: string;
}

export interface GameState {
  version: 1;
  roomSlug: string;
  seed: number;
  startedAt: number;
  elapsedBeforePause: number;
  pausedAt: number | null;
  dimension: Dimension;
  light: Light;
  flashlight: boolean;
  /** prop ids examined so far */
  inspected: string[];
  /** prop ids opened */
  opened: string[];
  /** item ids in the satchel */
  inventory: string[];
  /** puzzle ids solved */
  solved: string[];
  hintsUsed: number;
  /** puzzle/prop ids specifically asked about, for hint routing */
  hintTarget: string | null;
  journal: JournalEntry[];
  exitOpen: boolean;
  finished: null | { outcome: "escaped" | "failed"; at: number; seconds: number };
}

export type GameAction =
  | { type: "tick" }
  | { type: "toggleDimension" }
  | { type: "setLight"; light: Light }
  | { type: "toggleFlashlight" }
  | { type: "inspect"; propId: string }
  | { type: "open"; propId: string }
  | { type: "solve"; puzzleId: string }
  | { type: "hint"; puzzleId: string }
  | { type: "exit"; now: number }
  | { type: "fail"; now: number }
  | { type: "note"; text: string };

/** An auto-journal line, derived from the action being applied. */
export function journalLineFor(
  action: GameAction,
  room: RoomDef,
  state: GameState,
): string | null {
  switch (action.type) {
    case "inspect":
      return `Examined the ${room.props.find((p) => p.id === action.propId)?.label ?? "object"}.`;
    case "open": {
      const prop = room.props.find((p) => p.id === action.propId);
      if (!prop) return null;
      const got = (prop.yields ?? []).length;
      return got > 0
        ? `Opened the ${prop.label}; recovered ${got} item${got === 1 ? "" : "s"}.`
        : `Opened the ${prop.label}.`;
    }
    case "solve": {
      const pz = room.puzzles.find((p) => p.id === action.puzzleId);
      return pz ? `Solved — ${pz.confirmLine ?? pz.prompt}` : "Solved a mechanism.";
    }
    case "hint":
      return "Consulted the valet's hint book (noted in the ledger).";
    case "toggleDimension":
      return state.dimension === "3d"
        ? "Folded the room into plan form."
        : "Raised the room back into relief.";
    case "setLight":
      return action.light === "light"
        ? "Lit the chandelier."
        : "Doused the lights.";
    case "toggleFlashlight":
      return state.flashlight ? "Lowered the flashlight." : "Raised the flashlight.";
    case "exit":
      return "Opened the way out.";
    case "fail":
      return "The house claimed the round.";
    case "note":
      return action.text;
    default:
      return null;
  }
}
