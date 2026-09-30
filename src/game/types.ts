// Shared types for the Vexelverse Escape engine. The engine is deliberately
// framework-free: a single reducer owns the entire run state, which is what
// makes dimension flips, light flips, movement and chamber progression honest.

export type Dimension = "3d" | "2d";
export type Light = "light" | "dark";
export type Difficulty = "Apprentice" | "Journeyman" | "Master" | "Grandmaster";
export type Person = "1st" | "3rd";
export type Facing = "back" | "left" | "right" | "exit";

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
  /** Wall a 3D prop hangs on; 2D slots are derived from this. "exit" is the door wall. */
  wall: "back" | "left" | "right" | "floor" | "exit";
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
  /** features the house has taken away for this room */
  restrictions?: RoomRestrictions;
  /** chambers the player must clear, in order, before the room's exit opens */
  chambers?: ChamberDef[];
}

/** Features that can be locked away per room to raise the difficulty. */
export interface RoomRestrictions {
  /** true = the chandelier cannot be lit; the room lives by flashlight alone */
  noLightSwitch?: boolean;
  /** true = the valet's hint book is sealed for this room */
  noHints?: boolean;
  /** true = the plan cannot be consulted */
  noDimensionSwitch?: boolean;
  /** true = the player cannot move about the room */
  noMovement?: boolean;
  /** true = the third-person dollhouse view is forbidden */
  noThirdPerson?: boolean;
}

export interface ChamberDef {
  slug: string;
  title: string;
  /** a line under the chamber name on the brass strip */
  epigraph: string;
  /** par minutes for this chamber alone */
  parMinutes: number;
  /** which chamber must be cleared before this one answers */
  requires?: string;
  /** props: each entry carries a room-relative wall, its own gating and loot */
  props: PropDef[];
  puzzles: PuzzleDef[];
  /** chamber is cleared once all these puzzles are solved */
  exitPuzzles: string[];
  /** answered once chamber puzzles are solved; completing opens the wing door */
  exit: { prompt: string; answer: string; accepts?: string[] };
}

export interface JournalEntry {
  at: number;
  text: string;
}

export interface GameState {
  version: 2;
  roomSlug: string;
  seed: number;
  startedAt: number;
  elapsedBeforePause: number;
  pausedAt: number | null;
  dimension: Dimension;
  light: Light;
  flashlight: boolean;
  /** first-person or third-person (dollhouse) */
  person: Person;
  /** which wall the player is looking at in first person */
  facing: Facing;
  /** steps forward from the back wall, 0..3 */
  step: number;
  /** prop ids examined so far */
  inspected: string[];
  /** prop ids opened */
  opened: string[];
  /** item ids in the satchel */
  inventory: string[];
  /** puzzle ids solved */
  solved: string[];
  /** chamber slugs whose exit riddles have been answered */
  chambersCleared: string[];
  /** chamber currently being played, for movement and visibility */
  activeChamber: string | null;
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
  | { type: "setPerson"; person: Person }
  | { type: "turn"; facing: Facing }
  | { type: "stepForward" }
  | { type: "stepBack" }
  | { type: "enterChamber"; chamber: string }
  | { type: "inspect"; propId: string }
  | { type: "open"; propId: string }
  | { type: "solve"; puzzleId: string }
  | { type: "clearChamber"; chamber: string }
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
    case "setPerson":
      return action.person === "1st"
        ? "Stood eye to eye with the room."
        : "Rose above the room, as on a dressmaker's dolly.";
    case "turn":
      return `Turned to face the ${action.facing === "back" ? "far wall" : `${action.facing} side of the room`}.`;
    case "stepForward":
      return "Crossed deeper into the room.";
    case "stepBack":
      return "Stepped back toward the doorway.";
    case "enterChamber": {
      const chamber = room.chambers?.find((c) => c.slug === action.chamber);
      return chamber ? `Entered the ${chamber.title}.` : "Entered a further chamber.";
    }
    case "clearChamber": {
      const chamber = room.chambers?.find((c) => c.slug === action.chamber);
      return chamber ? `The ${chamber.title} is answered.` : "A chamber is answered.";
    }
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
