import type { RoomDef } from "./types";
import { ROOMS_BY_SLUG } from "./gameData";

export interface WalkthroughStep {
  label: string;
  detail: string;
}

/** Step-by-step solutions, surfaced progressively as hints. */
export const WALKTHROUGHS: Record<string, WalkthroughStep[]> = {
  gatehouse: [
    { label: "Read the ledger", detail: "Monday: 3 lamps. Tuesday: 5 lamps." },
    { label: "Sum them", detail: "3 + 5 = 8 — set the wick cabinet's dial to 8." },
    {
      label: "Search the coat",
      detail: "The coat pocket yields a brass token stamped 7.",
    },
    {
      label: "Mind the chalk slate",
      detail: "Arrow → coat → 7 → two strokes: “and two more.” 7 + 2 = 9 is a trap; the slate only confirms the token is a figure of the answer, not to be added. The answer is the token's 7.",
    },
    { label: "Set the lantern", detail: "The wick burned at the V notch — set the wheel to V." },
    { label: "Open the gate", detail: "Lamps first, tokens kept: 8 then 7 → 87." },
  ],
  conservatory: [
    {
      label: "Count the hooks in relief",
      detail: "3D: the moth sits on the fourth hook from the left → answer 4 → takes the orchid key.",
    },
    {
      label: "Read the buried note in plan",
      detail: "2D under the planter: “The moth lies; trust the dial.” The moth's hour is the lie.",
    },
    {
      label: "Read the sundial in light",
      detail: "Light only: the shadow sits at VIII — the dial's true hour is 8.",
    },
    { label: "Open the case", detail: "The case latch takes 8; the watering can takes the same key." },
    { label: "The gate", detail: "Dial hour (8), then hooks (7) → 87." },
  ],
  study: [
    { label: "Drawer A", detail: "Taped inside: the spare brass card for the jammed drawer." },
    { label: "Open drawer C", detail: "The slip inside: “513.13 — the sums.” and “823.8 — the tales.”" },
    {
      label: "Search the shelves",
      detail: "The 823 (tales) shelf hides the hollow book with the small brass gear.",
    },
    {
      label: "Work the globe in relief",
      detail: "3D: seat the gear, spin to 51° north — the scribe finishes 28 minutes → answer 28.",
    },
    {
      label: "Find the charters in plan",
      detail: "2D rug: “the charters keep the second piece.” The charter box takes key fragment A, yields fragment B.",
    },
    { label: "The door", detail: "Latitude (28), then the tales shelf (823) → 28823." },
  ],
  printing_house: [
    {
      label: "Read the frame",
      detail: "M above 7, I above 3, N above 5, E above 2; the word should read MINE.",
    },
    {
      label: "Catch the ghost in the dark",
      detail: "Darkness only: the proof's verso says “READ THE FRAME BACKWARDS.”",
    },
    {
      label: "Reverse it",
      detail: "MINE reversed by number: 2, 5, 3, 7 → 2537 opens the sort cabinet.",
    },
    { label: "Mount the roller", detail: "The cabinet yields the ink roller; mount it on the press." },
    {
      label: "Find the galley in plan",
      detail: "2D: the galley drawer is ajar — quire count: eleven → answer 11.",
    },
    { label: "Strike the proof", detail: "The press prints the frame's word: MINE." },
  ],
  signal_box: [
    {
      label: "Lift the floorboard in plan",
      detail: "2D: the diagram plate reads “UP — DOWN — UP”, left lever first.",
    },
    { label: "Line the road", detail: "Set the levers Up, Down, Up → lever key." },
    {
      label: "Light the lamp in the dark",
      detail: "Darkness only: the lamp burns green twice, then red — two passes, one stop.",
    },
    {
      label: "Log by the bell tally",
      detail: "Tally: down train at 3, up train at 5 → log 3 then 5.",
    },
    { label: "The block section", detail: "3 + 5 = 8 — the register takes 8." },
  ],
  auction_room: [
    { label: "Read the lot book", detail: "Lot 41 withdrawn (£110 refused, resold in the passage); lot 44 sold to V. at £220." },
    { label: "Take paddle 44", detail: "Rack 44 is empty; the paddle hangs unclaimed on the rack." },
    { label: "Work the winch in the dark", detail: "Flashlight chalk: “V. bought two lots.”" },
    {
      label: "The passage resale",
      detail: "The book's margin: lot 41 resold in the passage at £110 — to the paddle that stayed out: V.",
    },
    {
      label: "The commission",
      detail: "The telephone slip (3D): one tenth of the hammer. Lot 44: £220 ÷ 10 = £22 to the house.",
    },
    {
      label: "Settle the account",
      detail: "£220 + £110 = £330, less £22 commission = £308.",
    },
  ],
  cellar: [
    {
      label: "Read the rack in relief",
      detail: "3D chalk: III, VII, II, IX.",
    },
    {
      label: "Find the crate in plan",
      detail: "2D: “the tap is in here” — the straw crate yields the tap handle.",
    },
    { label: "Open the barrel", detail: "Seat the tap; the barrel is dry, as the book is not." },
    {
      label: "Read the ledger",
      detail: "1893 — three casks to the Admiral. 1901 — seven casks to the Commodore → 3 + 7 = 10.",
    },
    {
      label: "Order the rack",
      detail: "Smallest first: II, III, VII, IX.",
    },
    {
      label: "The reserve in the dark",
      detail: "Flashlight: “Reserve — bottled 1893, room 7” → 18937.",
    },
  ],
  theatre: [
    {
      label: "Answer the crank well in relief",
      detail: "3D: the soldier's strings are cut — the riddle's answer is the Soldier → the well gives up the crank.",
    },
    {
      label: "Raise the curtain",
      detail: "The curtain crank yields the playbill and opens the scene-order dial.",
    },
    {
      label: "Read the prompt list in plan",
      detail: "2D: “Lion, Soldier, Queen, Dragon.”",
    },
    {
      label: "Correct it in the dark",
      detail: "Under-stage chalk: “Queen first. Dragon last.” → Queen, Lion, Soldier, Dragon.",
    },
    {
      label: "The workshop — first chamber",
      detail: "String drawer: every bundle holds five, the Soldier's holds three → missing = 2. Wax block (in the dark): pinpricks read 3, 1, 4 → the paint cabinet's wheel → paint_key. Wing door: 2 then 314 → 2314.",
    },
    {
      label: "The dressing room — second chamber",
      detail: "Mirror in relief reflects the true cast: Queen, Dragon, Lion, Soldier. Set that order on the mirror, then on the wing cabinet (opened with paint_key). Stage door: “queen”, spelled out.",
    },
    {
      label: "Take the final bow",
      detail: "The room exit asks for the puppet who takes the final bow — the Soldier, spelled out. The hint book is sealed in this room; study this card before you enter.",
    },
  ],
  observatory: [
    {
      label: "Verify the sky",
      detail: "Telescope in relief, or the chart's note: “tonight, only I and III ride high” → answer I and III → brass wrench.",
    },
    {
      label: "Turn the nut from the plan",
      detail: "2D: with the wrench, the dome shutter yields.",
    },
    {
      label: "True the dome clock",
      detail: "2D under the desk: the clock runs fast by nine minutes. 12:09 − 9 → 12:00 → in hundreds, 1200. (The exit will not take it yet — the wing stands between.)",
    },
    {
      label: "The meridian corridor — first chamber",
      detail: "Transit clock reads 0200, the one clock that never lies. In relief, the third of seven wires is silk → meridian_lock 3 → meridian_key. Corridor gate: 0200 then 3 → 02003.",
    },
    {
      label: "The plate vault — second chamber",
      detail: "Plates in relief: two moons, then four, then two — the third plate is misfiled (the red lamp agrees). Safe (opened with meridian_key, in the dark): 3 then 0200 → 30200 → plate_key. Vault door: 30200.",
    },
    {
      label: "The dome floor — third chamber",
      detail: "Refractor in relief: I and III, seen at last. Final lock (opened with plate_key) takes the corrected hour → 1200. Dome mouth: 1200.",
    },
    {
      label: "Open the dome for good",
      detail: "The room exit takes the corrected hour in hundreds one last time: 1200. The chandelier is removed in this room — your lantern is the only light.",
    },
  ],
  cistern: [
    {
      label: "Read the gauge in relief",
      detail: "3D: the waterline stands at the fourth mark.",
    },
    {
      label: "Find the sluice in plan",
      detail: "2D: wheels II, IV, VI with downhill arrows — open VI, IV, II.",
    },
    { label: "Take the drain key", detail: "The sluice yields the drain key." },
    { label: "Open the sump", detail: "The grate takes the key; beneath, tokens." },
    { label: "Count the cache", detail: "Nine tokens, counted twice → 9." },
    {
      label: "Read the flood scratch in the dark",
      detail: "Flashlight: “When the flood came, the mark rose two” — 4 + 2 = 6.",
    },
    { label: "The outflow lock", detail: "6 then 9 → 69." },
  ],
  seance_room: [
    {
      label: "Move the planchette in the dark",
      detail: "Darkness only: the planchette spells C-H-A-I-R.",
    },
    {
      label: "Ask the slate",
      detail: "The fallen candle (dark) yields chalk; the slates take chalk: “The third chair from the left keeps the loose seat.”",
    },
    { label: "Answer the chairs", detail: "Third from the left → 3 → brass medallion." },
    {
      label: "Catch the mirror in relief",
      detail: "3D only: the medallion's crest, mirrored, reads 37.",
    },
    { label: "Read it true", detail: "Unmirrored, the crest reads 73." },
    { label: "The table dial", detail: "3 then 73 → 373." },
  ],
  vault: [
    {
      label: "Read the escapement note",
      detail: "“The escapement ticks twice for every second shown” — shown time runs twice as fast as true time.",
    },
    {
      label: "Read the ledger's second hand",
      detail: "Sealed at six o'clock sharp, twelve true minutes ago.",
    },
    {
      label: "Work the shown time",
      detail: "12 true minutes × 2 = 24 shown minutes past six → answer 24.",
    },
    {
      label: "Count the swings in relief",
      detail: "3D: one true second each way; a true minute holds sixty → 60 swings.",
    },
    { label: "Open the vault", detail: "24 then 60 → 2460." },
  ],
};

/** Guard against a room gaining puzzles without a walkthrough. */
export function walkthroughFor(room: RoomDef): WalkthroughStep[] {
  return WALKTHROUGHS[room.slug] ?? [];
}

export function hasWalkthrough(slug: string): boolean {
  return Boolean(ROOMS_BY_SLUG[slug] && WALKTHROUGHS[slug]);
}
