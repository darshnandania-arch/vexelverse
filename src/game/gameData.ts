// The twelve rooms of the Vexelverse. Every answer is derivable from props the
// player can actually inspect — nothing is guess-the-teacher's-pet. Design
// rules the engine enforces:
//   * every puzzle is hosted on exactly one prop (puzzleId),
//   * a prop that yields items opens only once its requirements are met,
//   * 3D-only / 2D-only / light-locked props force dimension and light flips.

import type { RoomDef } from "./types";

export const ROOMS: RoomDef[] = [
  {
    slug: "gatehouse",
    title: "The Gatehouse",
    tagline: "Where every Vexelverse story begins",
    difficulty: "Apprentice",
    parMinutes: 5,
    briefing:
      "The night porter has gone missing and the gate will not open until his rounds are accounted for. His ledger, his coat and one dim lantern are all he left behind.",
    setting: "The old gatehouse, shortly after dusk",
    theme: "A quiet house on the edge of the estate",
    sceneTint: "from-stone-900/60",
    props: [
      {
        id: "ledger_desk",
        wall: "back",
        label: "Porter's ledger",
        glyph: "✒",
        flavor: "A leather ledger lies open, entries half-finished.",
        inspect:
          "Two entries remain legible: “Monday — three lamps trimmed.” and “Tuesday — five lamps trimmed.” The rest of the week is torn away.",
      },
      {
        id: "coat_rack",
        wall: "left",
        label: "Porter's coat",
        glyph: "🧥",
        flavor: "A heavy coat hangs from the rack by the door.",
        inspect:
          "In the pocket you find a brass token stamped with the numeral 7.",
        yields: ["token_7"],
      },
      {
        id: "lantern",
        wall: "right",
        label: "Trimming lantern",
        glyph: "🏮",
        flavor: "A brass lantern with a dimming wheel set to I.",
        inspect:
          "The wheel clicks through I, III and V. The wick inside has burned unevenly at the V notch.",
      },
      {
        id: "wick_cabinet",
        wall: "right",
        label: "Wick cabinet",
        glyph: "🗄",
        flavor: "A low cabinet with a counting dial set into the door.",
        puzzleId: "count_lamps",
        inspect: "The dial wants a number before it will give an inch.",
      },
      {
        id: "chalk_slate",
        wall: "floor",
        label: "Chalk slate",
        glyph: "▸",
        flavor: "A slate lies flat on the flags, chalk beside it.",
        puzzleId: "lantern_setting",
        inspect:
          "A chalk arrow points at the coat rack, then the number 7, then two short strokes — as if to say “and two more”.",
      },
    ],
    puzzles: [
      {
        id: "count_lamps",
        kind: "code",
        prompt: "How many lamps did the porter trim across Monday and Tuesday?",
        flavor: "The wick cabinet's dial awaits the count.",
        answer: "8",
        confirmLine: "the two days' lamps, trimmed and tallied",
      },
      {
        id: "lantern_setting",
        kind: "choice",
        prompt:
          "The slate's riddle: at which notch does the burned wick prove the wheel was set?",
        flavor: "The lantern itself shows the answer, if you look closely.",
        choices: ["I", "III", "V"],
        answer: "V",
        confirmLine: "the lantern burned low at five",
      },
    ],
    gates: ["wick_cabinet", "chalk_slate"],
    exit: {
      prompt:
        "The gate's brass plate reads “LAMPS TRIMMED, THEN TOKENS KEPT.” Enter both figures in order.",
      answer: "87",
    },
  },
  {
    slug: "conservatory",
    title: "The Conservatory",
    tagline: "Glass, steam, and one dishonest moth",
    difficulty: "Apprentice",
    parMinutes: 7,
    briefing:
      "The gardener locked the conservatory from the inside and left by the roof. The watering clock still runs; the plants have opinions.",
    setting: "The estate conservatory, mid-morning",
    theme: "Victorian glasshouse",
    sceneTint: "from-emerald-900/40",
    props: [
      {
        id: "sundial",
        wall: "floor",
        label: "Sundial",
        glyph: "☀",
        flavor: "A stone sundial, its gnomon throwing a thin shadow.",
        requires: { light: ["light"] },
        inspect:
          "In this light the shadow falls squarely on VIII. In the dark you saw only cold stone.",
      },
      {
        id: "moth_hooks",
        wall: "left",
        label: "Moth hooks",
        glyph: "🦋",
        flavor: "Seven iron hooks line the wall; a moth figurine hangs from one.",
        requires: { dimension: ["3d"] },
        puzzleId: "moth_hook",
        inspect:
          "Counted in relief: seven hooks, and the moth sits on the fourth from the left.",
      },
      {
        id: "planter",
        wall: "floor",
        label: "Planter bed",
        glyph: "▭",
        flavor: "A long planter of slate and soil.",
        requires: { dimension: ["2d"] },
        inspect:
          "Only the plan shows what lies beneath: an etched note — “The moth lies; trust the dial.”",
      },
      {
        id: "orchid_case",
        wall: "back",
        label: "Orchid case",
        glyph: "🌸",
        flavor: "A glass case shelters a single pale orchid.",
        requires: { dimension: ["3d"] },
        puzzleId: "sundial_riddle",
        inspect:
          "A tag reads: “Water when the moth lands.” The case is latched; the latch wants a number.",
      },
      {
        id: "watering_can",
        wall: "right",
        label: "Watering can",
        glyph: "🫗",
        flavor: "A tin can hung beside the door, its cap latched.",
        opensWith: ["orchid_key"],
        yields: ["silk_scrap"],
        inspect: "The can's cap takes the same key that opens the case.",
      },
    ],
    puzzles: [
      {
        id: "moth_hook",
        kind: "code",
        prompt: "On which hook does the moth figurine actually sit?",
        flavor: "Count them in relief; the plan cannot.",
        answer: "4",
        requires: { dimension: ["3d"] },
        reward: "orchid_key",
        confirmLine: "the moth lands on the fourth",
      },
      {
        id: "sundial_riddle",
        kind: "code",
        prompt: "The orchid case latch wants the hour the dial truly shows.",
        flavor:
          "One witness is honest, one is not. The buried note knows which.",
        answer: "8",
        confirmLine: "eight — the dial, not the moth",
      },
    ],
    gates: ["orchid_case", "watering_can"],
    exit: {
      prompt:
        "The conservatory gate wants the dial's hour followed by the moth's hook.",
      answer: "84",
    },
  },
  {
    slug: "study",
    title: "The Study of Stacks",
    tagline: "Knowledge, filed and foiled",
    difficulty: "Journeyman",
    parMinutes: 12,
    briefing:
      "The librarian's card catalogue has swallowed a gear, a key and a grudge. Every drawer that opens tells you which shelf to blame.",
    setting: "The members' study, after hours",
    theme: "Panelled club library",
    sceneTint: "from-amber-900/40",
    props: [
      {
        id: "card_catalog",
        wall: "back",
        label: "Card catalogue",
        glyph: "🗂",
        flavor: "Oak drawers, brass handles. One sits proud, jammed.",
        inspect:
          "Drawer C is jammed shut. Taped inside drawer A, a spare brass card: “For the jammed drawer.”",
        yields: ["catalog_card"],
      },
      {
        id: "drawer_c",
        wall: "left",
        label: "Jammed drawer C",
        glyph: "🗄",
        flavor: "The jammed drawer, marked C in tarnished brass.",
        opensWith: ["catalog_card"],
        inspect:
          "It takes the spare card. Inside: a slip in the cataloguer's hand — “513.13 — the sums.” and “823.8 — the tales.” The rest is water damage.",
      },
      {
        id: "bookshelf",
        wall: "right",
        label: "Reading shelves",
        glyph: "📚",
        flavor: "Shelves sorted by number, spines outward.",
        puzzleId: "dewey_match",
        inspect:
          "The 800s are at shoulder height. The 900s lean against a bookend shaped like a crown.",
      },
      {
        id: "globe",
        wall: "back",
        label: "Floor globe",
        glyph: "🌍",
        flavor: "A globe on a stand, its meridian ring loose.",
        requires: { dimension: ["3d"] },
        opensWith: ["brass_gear"],
        yields: ["key_fragment_a"],
        puzzleId: "globe_math",
        inspect:
          "In relief the globe can be spun. At 51° north a slot opens — it wants a small gear. Seated, a scribe arm finishes the latitude.",
      },
      {
        id: "rug",
        wall: "floor",
        label: "Persian rug",
        glyph: "▨",
        flavor: "A worn rug, its pattern lost to foot traffic.",
        requires: { dimension: ["2d"] },
        inspect:
          "The plan records what the eye skips: the charter box sits behind the shelves, and it opens from the left-hand keyhole.",
      },
      {
        id: "charter_box",
        wall: "right",
        label: "Charter box",
        glyph: "📜",
        flavor: "A steel box stamped CHARTERS, half slid behind the shelves.",
        opensWith: ["key_fragment_a"],
        inspect:
          "Two keyholes; the left is filled. Inside, old charters and nothing of use — but the box proves the globe's key was the right key.",
      },
    ],
    puzzles: [
      {
        id: "dewey_match",
        kind: "choice",
        prompt: "Which shelf hides the hollow book that holds a small gear?",
        flavor: "The drawer's slip names the tales by their number.",
        choices: ["513 — the sums", "823 — the tales", "942 — the charters"],
        answer: "823 — the tales",
        accepts: ["823"],
        reward: "brass_gear",
        confirmLine: "the hollow shelf — eight hundred twenty-three",
      },
      {
        id: "globe_math",
        kind: "code",
        prompt:
          "Inside the globe's slot a latitude is scribed. Enter its final two digits.",
        flavor: "The globe yields its secret once the gear is seated.",
        answer: "28",
        requires: { dimension: ["3d"] },
        confirmLine: "the scribed latitude — fifty-one twenty-eight",
      },
    ],
    gates: ["drawer_c", "globe", "charter_box"],
    exit: {
      prompt:
        "The study door's lock wants the latitude scribed in the globe, followed by the shelf that hid the tales.",
      answer: "28823",
    },
  },
  {
    slug: "printing_house",
    title: "The Printing House",
    tagline: "Set in metal, printed in shadow",
    difficulty: "Journeyman",
    parMinutes: 15,
    briefing:
      "The morning edition never ran. The foreman's frame still holds one word set wrong, and the press will strike nothing until the sorts are counted.",
    setting: "A Fleet Street print floor, before dawn",
    theme: "Letterpress workshop",
    sceneTint: "from-slate-900/50",
    props: [
      {
        id: "type_case",
        wall: "back",
        label: "Composing frame",
        glyph: "🔠",
        flavor: "A frame of metal sorts, one word half-set.",
        inspect:
          "The frame numbers sit beneath each letter: M above 7, I above 3, N above 5, E above 2. The word should read MINE.",
      },
      {
        id: "printed_page",
        wall: "left",
        label: "Fresh proof",
        glyph: "📄",
        flavor: "A damp proof sheet, still smelling of ink.",
        requires: { light: ["dark"] },
        inspect:
          "Under the dark, a ghost impression surfaces on the verso: “READ THE FRAME BACKWARDS.” In the light the page shows nothing at all.",
      },
      {
        id: "press",
        wall: "left",
        label: "Iron hand-press",
        glyph: "⚙",
        flavor: "The press itself, its roller spindle bare.",
        opensWith: ["ink_roller"],
        yields: ["strike_sheet"],
        inspect: "It wants a roller before it will print anything.",
      },
      {
        id: "sort_cabinet",
        wall: "right",
        label: "Sort cabinet",
        glyph: "🗃",
        flavor: "A cabinet of type drawers, each labelled in a dead hand.",
        puzzleId: "press_code",
        yields: ["ink_roller"],
        inspect: "The cabinet's combination lock waits on four figures.",
      },
      {
        id: "galley",
        wall: "floor",
        label: "Galley drawer",
        glyph: "▭",
        flavor: "A flat galley drawer beneath the stone.",
        requires: { dimension: ["2d"] },
        puzzleId: "quire_tally",
        inspect:
          "The plan shows the galley drawn ajar. Inside, a quire note awaits a count.",
      },
    ],
    puzzles: [
      {
        id: "press_code",
        kind: "code",
        prompt:
          "The sort cabinet's lock wants the frame numbers in the order the ghost suggests.",
        flavor: "The ghost impression in the dark knows the order.",
        answer: "2537",
        confirmLine: "the frame, read backwards as instructed",
      },
      {
        id: "quire_tally",
        kind: "code",
        prompt: "How many sheets to the quire, as the galley note counts them?",
        flavor: "The plan found the drawer; the note found the number.",
        answer: "11",
        requires: { dimension: ["2d"] },
        confirmLine: "eleven sheets, counted in plan",
      },
    ],
    gates: ["sort_cabinet", "press", "galley"],
    exit: {
      prompt:
        "Strike the final proof. Enter the word the press was told to print, spelled out.",
      answer: "mine",
      accepts: ["mine"],
    },
  },
  {
    slug: "signal_box",
    title: "The Signal Box",
    tagline: "Two trains, one road, no second chances",
    difficulty: "Journeyman",
    parMinutes: 18,
    briefing:
      "The signalman has gone to his supper and left the box in your hands. Two trains approach on a single road; set the levers wrong and the night ends badly.",
    setting: "A junction signal box, full dark outside",
    theme: "Railway signal cabin",
    sceneTint: "from-red-900/40",
    props: [
      {
        id: "lever_frame",
        wall: "back",
        label: "Lever frame",
        glyph: "🎚",
        flavor: "Three levers stand in a row, coloured red, white and blue.",
        puzzleId: "lever_order",
        inspect:
          "The diagram plate that names the levers is missing from its screws.",
      },
      {
        id: "diagram_plate",
        wall: "floor",
        label: "Diagram plate",
        glyph: "🗺",
        flavor: "A steel plate, filed under the floorboards.",
        requires: { dimension: ["2d"] },
        inspect:
          "Only the plan reveals it: the plate reads “UP — DOWN — UP”, left lever first.",
      },
      {
        id: "signal_lamp",
        wall: "right",
        label: "Signal lamp",
        glyph: "🚦",
        flavor: "A kerosene lamp behind coloured glass.",
        requires: { light: ["dark"] },
        inspect:
          "Lit, the lamp burns green twice, then red. In daylight the glass shows nothing at all.",
      },
      {
        id: "block_bell",
        wall: "floor",
        label: "Block bell",
        glyph: "🔔",
        flavor: "A brass bell with a tally card beside it.",
        opensWith: ["lever_key"],
        puzzleId: "register_order",
        inspect: "The tally card reads: “Down train passed at 3; up train at 5.”",
      },
      {
        id: "train_register",
        wall: "back",
        label: "Train register",
        glyph: "📕",
        flavor: "The register book, open at tonight's page.",
        inspect:
          "The page is blank save a printed line: “Enter the block section number when the road is set.”",
      },
    ],
    puzzles: [
      {
        id: "lever_order",
        kind: "sequence",
        prompt: "Set the three levers in the order the diagram demands.",
        flavor: "The plate under the floor is the only honest witness.",
        choices: ["Up", "Down"],
        answer: "Up,Down,Up",
        requires: { dimension: ["2d"] },
        reward: "lever_key",
        confirmLine: "up, down, up — the road is lined",
      },
      {
        id: "register_order",
        kind: "sequence",
        prompt: "Log the trains in the order they passed, by their tally times.",
        flavor: "The bell tally settles the order.",
        choices: ["3", "5", "8"],
        answer: "3,5",
        confirmLine: "three, then five — as the bell counted",
      },
    ],
    gates: ["lever_frame", "block_bell"],
    exit: {
      prompt:
        "The register wants the block section number: the two tally figures, summed.",
      answer: "8",
    },
  },
  {
    slug: "auction_room",
    title: "The Auction Room",
    tagline: "Sold to the letter V, twice, under the hammer",
    difficulty: "Master",
    parMinutes: 25,
    briefing:
      "The sale ended an hour ago and the books will not close. One bidder signed only as V, one lot was withdrawn in bad faith, and the house's cut is owed in full.",
    setting: "The saleroom, moments after the gavel",
    theme: "Victorian auction house",
    sceneTint: "from-purple-900/40",
    props: [
      {
        id: "lot_book",
        wall: "back",
        label: "Lot book",
        glyph: "📖",
        flavor: "The sale catalogue, annotated in pencil.",
        inspect:
          "“Lot 41 — withdrawn. £110 refused, then resold in the passage.” and “Lot 44 — sold to V. at £220.” No commission is entered against either.",
      },
      {
        id: "paddle_rack",
        wall: "left",
        label: "Paddle rack",
        glyph: "🪧",
        flavor: "A rack of numbered paddles, most returned.",
        inspect:
          "Paddles 12 and 27 hang returned. Slot 44 is empty — its paddle was never handed in.",
        yields: ["paddle_44"],
      },
      {
        id: "telephone",
        wall: "right",
        label: "Bidding telephone",
        glyph: "☎",
        flavor: "A mahogany telephone reserved for absentee bids.",
        requires: { dimension: ["3d"] },
        puzzleId: "commission_calc",
        inspect:
          "Seen only in relief, a slip under the base: “Commission: one tenth of the hammer.”",
      },
      {
        id: "chandelier_winch",
        wall: "floor",
        label: "Winch housing",
        glyph: "⛓",
        flavor: "The winch that raises the chandelier, chalked with initials.",
        requires: { light: ["dark"] },
        puzzleId: "withdrawn_lots",
        inspect:
          "By flashlight, chalk on the winch: “V. bought two lots.” The chalk is invisible by day.",
      },
      {
        id: "absentee_box",
        wall: "back",
        label: "Absentee box",
        glyph: "🧰",
        flavor: "A locked box for commission bids, padlocked shut.",
        opensWith: ["paddle_44"],
        yields: ["bid_slip"],
        inspect:
          "The padlock's shackle fits a paddle's edge, if you have the right one. Inside, the slip: “Lot 44 — hammer £220.”",
      },
    ],
    puzzles: [
      {
        id: "commission_calc",
        kind: "code",
        prompt:
          "The house's cut on lot 44, in pounds. The bid slip holds the hammer price; the telephone slip holds the rate.",
        flavor: "One tenth, exactly, of the hammer.",
        answer: "22",
        requires: { dimension: ["3d"] },
        confirmLine: "twenty-two pounds to the house",
      },
      {
        id: "withdrawn_lots",
        kind: "code",
        prompt:
          "The winch chalk says V. bought two lots; the book records one sale outright. Which withdrawn lot went to V. all the same?",
        flavor: "The chalk in the dark and the pencil in the book disagree.",
        answer: "41",
        requires: { light: ["dark"] },
        confirmLine: "lot forty-one, sold in secret",
      },
    ],
    gates: ["paddle_rack", "telephone", "chandelier_winch", "absentee_box"],
    exit: {
      prompt:
        "Settle the account: V.'s two hammer prices, summed, less the house's cut on lot 44. Enter the figure in pounds.",
      answer: "308",
    },
  },
  {
    slug: "cellar",
    title: "The Vintner's Cellar",
    tagline: "Chalk, casks, and a reserve nobody drinks",
    difficulty: "Master",
    parMinutes: 30,
    briefing:
      "The vintner's books balance to the bottle, but one reserve is drawn in chalk alone. Find the casks the Admiral drank in the dark and the cellar will open.",
    setting: "The estate cellar, cold and low",
    theme: "Sandstone wine cellar",
    sceneTint: "from-rose-900/40",
    props: [
      {
        id: "rack_row",
        wall: "back",
        label: "Bottle rack",
        glyph: "🍷",
        flavor: "Bottles stand neck-down, chalked with numerals.",
        requires: { dimension: ["3d"] },
        puzzleId: "chalk_order",
        inspect:
          "In relief the chalk reads: III, VII, II, IX. The plan could never see chalk this faint.",
      },
      {
        id: "barrel",
        wall: "left",
        label: "Standing barrel",
        glyph: "🛢",
        flavor: "A cask on end, its tap missing.",
        opensWith: ["tap_handle"],
        inspect: "The tap hole is empty; the barrel is dry, somehow.",
      },
      {
        id: "crate",
        wall: "right",
        label: "Straw crate",
        glyph: "📦",
        flavor: "A packing crate the eye slides past.",
        requires: { dimension: ["2d"] },
        yields: ["tap_handle"],
        inspect:
          "The plan shows what the eye skips: a crate packed in straw, and a note — “the tap is in here.”",
      },
      {
        id: "cellar_book",
        wall: "floor",
        label: "Cellar book",
        glyph: "📒",
        flavor: "The vintner's ledger, barrel-smoked.",
        puzzleId: "vintage_sum",
        inspect:
          "“1893 — three casks to the Admiral.” and “1901 — seven casks to the Commodore.”",
      },
      {
        id: "reserve_bottle",
        wall: "back",
        label: "Reserve bottle",
        glyph: "🍾",
        flavor: "One bottle apart from the rest, label inwards.",
        requires: { light: ["dark"] },
        inspect:
          "By flashlight the label gives up its ink: “Reserve — bottled 1893, room 7.”",
      },
    ],
    puzzles: [
      {
        id: "vintage_sum",
        kind: "code",
        prompt: "Casks drawn for the Admiral and Commodore together, from the book.",
        flavor: "Three and seven, as the ledger records them.",
        answer: "10",
        confirmLine: "ten casks between them",
      },
      {
        id: "chalk_order",
        kind: "sequence",
        prompt:
          "Order the rack's chalked numerals as they should be laid down — smallest first.",
        flavor: "The chalk on the rack, read in relief.",
        choices: ["II", "III", "VII", "IX"],
        answer: "II,III,VII,IX",
        requires: { dimension: ["3d"] },
        confirmLine: "the rack, laid down in order",
      },
    ],
    gates: ["barrel", "crate", "rack_row"],
    exit: {
      prompt:
        "The cellar door wants the reserve's year followed by its room, as the label states.",
      answer: "18937",
    },
  },
  {
    slug: "theatre",
    title: "The Puppet Theatre",
    tagline: "Five puppets, four scenes, one lie",
    difficulty: "Master",
    parMinutes: 35,
    briefing:
      "The theatre closed mid-run when the soldier's strings were cut. The prompt box holds the scene list; the dark holds the corrections. Raise the curtain on the truth.",
    setting: "A toy theatre, curtains drawn",
    theme: "Victorian marionette stage",
    sceneTint: "from-indigo-900/50",
    props: [
      {
        id: "curtain",
        wall: "back",
        label: "Stage curtain",
        glyph: "🎭",
        flavor: "The curtain is down and the crank is gone.",
        opensWith: ["crank"],
        puzzleId: "scene_order",
        inspect: "The wind drum turns freely — the crank has been pocketed.",
      },
      {
        id: "marionette_rack",
        wall: "left",
        label: "Marionette rack",
        glyph: "🪆",
        flavor: "Five puppets hang from the rack, strings taut except one.",
        requires: { dimension: ["3d"] },
        inspect:
          "In relief you can see the soldier's strings are cut clean through. The other four hang ready.",
      },
      {
        id: "prompt_box",
        wall: "right",
        label: "Prompt box",
        glyph: "📋",
        flavor: "The prompt corner, its scene list face-down.",
        requires: { dimension: ["2d"] },
        inspect:
          "The plan finds the list the eye misses: “Lion, Soldier, Queen, Dragon.”",
      },
      {
        id: "crank_well",
        wall: "floor",
        label: "Crank well",
        glyph: "🕳",
        flavor: "A recessed well below the stage lip.",
        puzzleId: "crank_riddle",
        inspect: "The well's cover bears a riddle instead of a handle.",
      },
      {
        id: "under_stage",
        wall: "floor",
        label: "Under-stage dark",
        glyph: "✦",
        flavor: "The gap beneath the boards where chalk carries.",
        requires: { light: ["dark"] },
        inspect:
          "By flashlight, chalk arrows revise the scene list: “Queen first. Dragon last.”",
      },
    ],
    puzzles: [
      {
        id: "crank_riddle",
        kind: "choice",
        prompt: "Which puppet never takes the stage again?",
        flavor: "One set of strings will not hold.",
        choices: ["Lion", "Soldier", "Queen", "Dragon"],
        answer: "Soldier",
        requires: { dimension: ["3d"] },
        reward: "crank",
        confirmLine: "the soldier's strings are cut",
      },
      {
        id: "scene_order",
        kind: "sequence",
        prompt: "Set the true running order for the four scenes.",
        flavor: "The prompt list starts it; the chalk in the dark corrects it.",
        choices: ["Lion", "Soldier", "Queen", "Dragon"],
        answer: "Queen,Lion,Soldier,Dragon",
        confirmLine: "queen first, dragon last — as the chalk demands",
      },
    ],
    gates: ["curtain", "crank_well"],
    exit: {
      prompt: "Name the puppet who closes the corrected play.",
      answer: "dragon",
      accepts: ["dragon"],
    },
  },
  {
    slug: "observatory",
    title: "The Observatory",
    tagline: "Two moons ride high, one clock runs fast",
    difficulty: "Grandmaster",
    parMinutes: 45,
    briefing:
      "The observer is gone and the dome will not open for a fast clock. Verify the sky, true the time, and the night is yours.",
    setting: "A hilltop observatory, past midnight",
    theme: "Brass and starlight",
    sceneTint: "from-cyan-900/40",
    props: [
      {
        id: "telescope",
        wall: "back",
        label: "Great telescope",
        glyph: "🔭",
        flavor: "The refractor, capped and stowed.",
        requires: { dimension: ["3d"] },
        inspect:
          "Only in relief can you look through it: Jupiter shows two moons tonight, riding high.",
      },
      {
        id: "star_chart",
        wall: "left",
        label: "Star chart",
        glyph: "🗺",
        flavor: "A chart of the Jovian system, moons numbered.",
        inspect:
          "The chart numbers the moons I to IV and notes: “tonight, only I and III ride high.”",
      },
      {
        id: "orrery",
        wall: "floor",
        label: "Table orrery",
        glyph: "🪐",
        flavor: "A clockwork orrery, its crank folded.",
        puzzleId: "moon_pair",
        inspect: "The orrery's dial waits to be told what the sky shows.",
      },
      {
        id: "dome_shutter",
        wall: "right",
        label: "Dome shutter",
        glyph: "🔧",
        flavor: "The shutter winch, seized at its nut.",
        requires: { dimension: ["2d"] },
        opensWith: ["brass_wrench"],
        inspect:
          "The plan alone shows the nut's reach. With the wrench it turns from the plan and the shutter sighs open.",
      },
      {
        id: "night_note",
        wall: "floor",
        label: "Observer's note",
        glyph: "📝",
        flavor: "A ledger slip in a steady hand, filed flat beneath the desk.",
        requires: { dimension: ["2d"] },
        inspect:
          "Only the plan finds it, tucked under the desk: “The dome clock runs fast by nine minutes. Correct it before you leave.”",
      },
      {
        id: "dome_clock",
        wall: "back",
        label: "Dome clock",
        glyph: "⏱",
        flavor: "The dome's regulator clock, hands at 12:09.",
        puzzleId: "clock_correction",
        inspect: "The hands read 12:09 and hold there, confident and wrong.",
      },
      {
        id: "almanac",
        wall: "floor",
        label: "Almanac",
        glyph: "📗",
        flavor: "The almanac, its margin marked in invisible ink.",
        requires: { light: ["dark"] },
        inspect:
          "By flashlight the margin appears: “The gate sets to the corrected hour, in hundreds.”",
      },
    ],
    puzzles: [
      {
        id: "moon_pair",
        kind: "choice",
        prompt: "Which moons does the sky actually show tonight?",
        flavor: "The telescope in relief, or the chart's note — they agree.",
        choices: ["I and III", "II and IV", "I and II"],
        answer: "I and III",
        accepts: ["i and iii", "i, iii", "i iii"],
        reward: "brass_wrench",
        confirmLine: "the first and third ride high",
      },
      {
        id: "clock_correction",
        kind: "code",
        prompt:
          "The gate wants the corrected hour in hundreds. The dome clock reads 12:09 and runs nine minutes fast.",
        flavor: "Subtract the error the observer logged.",
        answer: "1200",
        confirmLine: "midnight, truly",
      },
    ],
    gates: ["dome_shutter", "orrery", "dome_clock"],
    exit: {
      prompt: "Enter the corrected hour in hundreds, as the almanac instructs.",
      answer: "1200",
    },
  },
  {
    slug: "cistern",
    title: "The Cistern",
    tagline: "Water remembers every mark",
    difficulty: "Grandmaster",
    parMinutes: 55,
    briefing:
      "The cistern keeper's sluice is hidden behind the north wall and the flood line is scratched above head height. Read the water before it reads you.",
    setting: "A Victorian cistern, ankle-deep",
    theme: "Brick vaults and standing water",
    sceneTint: "from-teal-900/50",
    props: [
      {
        id: "water_gauge",
        wall: "back",
        label: "Water gauge",
        glyph: "📏",
        flavor: "A graduated gauge, its marks half-submerged.",
        requires: { dimension: ["3d"] },
        inspect:
          "In relief the waterline stands at the fourth mark. The plan cannot see a waterline.",
      },
      {
        id: "sluice_panel",
        wall: "left",
        label: "Sluice panel",
        glyph: "🚪",
        flavor: "A panel the plan draws behind the north wall.",
        requires: { dimension: ["2d"] },
        puzzleId: "sluice_order",
        inspect:
          "The plan shows three wheels numbered II, IV, VI — and the flow arrows run downhill.",
      },
      {
        id: "sump_grate",
        wall: "floor",
        label: "Sump grate",
        glyph: "⚖",
        flavor: "An iron grate over the sump, locked.",
        opensWith: ["drain_key"],
        inspect: "The grate's lock wants a drain key.",
      },
      {
        id: "token_cache",
        wall: "floor",
        label: "Token cache",
        glyph: "🪙",
        flavor: "A recess beneath the grate, lined with tokens.",
        opensWith: ["drain_key"],
        puzzleId: "sump_count",
        inspect:
          "You count the tokens twice, by any light that will serve: nine, and not one more.",
      },
      {
        id: "flood_note",
        wall: "right",
        label: "Flood scratch",
        glyph: "〰",
        flavor: "Scratches high on the wall, well above the present line.",
        requires: { light: ["dark"] },
        inspect:
          "By flashlight: “When the flood came, the mark rose two.”",
      },
    ],
    puzzles: [
      {
        id: "sluice_order",
        kind: "sequence",
        prompt: "Open the sluice wheels in the order the water flows.",
        flavor: "Water falls: the largest number first.",
        choices: ["II", "IV", "VI"],
        answer: "VI,IV,II",
        requires: { dimension: ["2d"] },
        reward: "drain_key",
        confirmLine: "six, four, two — downhill as water goes",
      },
      {
        id: "sump_count",
        kind: "code",
        prompt: "How many tokens lie in the cache beneath the grate?",
        flavor: "Count what the drain gave back.",
        answer: "9",
        confirmLine: "nine tokens, counted twice",
      },
    ],
    gates: ["sluice_panel", "sump_grate", "token_cache"],
    exit: {
      prompt:
        "The outflow lock wants the flood-risen gauge mark, then the tokens counted. Enter both in order.",
      answer: "69",
    },
  },
  {
    slug: "seance_room",
    title: "The Séance Room",
    tagline: "The table has opinions; the mirror has more",
    difficulty: "Grandmaster",
    parMinutes: 70,
    briefing:
      "The medium left mid-sitting and took the truth with her. The planchette only moves in the dark, the slate only speaks with chalk, and the mirror reverses everything it is told.",
    setting: "The upstairs séance room, candles unlit",
    theme: "Victorian parlour spiritualism",
    sceneTint: "from-violet-900/50",
    props: [
      {
        id: "planchette",
        wall: "floor",
        label: "Planchette",
        glyph: "🫳",
        flavor: "A heart-shaped board resting on a spirit board.",
        requires: { light: ["dark"] },
        inspect:
          "Only in the dark will it drift — letter by letter: C, H, A, I, R. In the light it will not move at all.",
      },
      {
        id: "spirit_slates",
        wall: "back",
        label: "Spirit slates",
        glyph: "🪧",
        flavor: "Two slates bound together, hinged like a book.",
        opensWith: ["chalk"],
        puzzleId: "loose_seat",
        inspect: "The bound slates open for chalk and nothing else.",
      },
      {
        id: "chair_row",
        wall: "left",
        label: "Séance chairs",
        glyph: "🪑",
        flavor: "Six chairs face the table in a strict row.",
        inspect: "Six chairs, and the row runs left to right.",
      },
      {
        id: "knocked_candle",
        wall: "right",
        label: "Fallen candle",
        glyph: "🕯",
        flavor: "A candle knocked from its stick, unlit.",
        requires: { light: ["dark"] },
        yields: ["chalk"],
        inspect: "Beside it, a stub of chalk, knocked from the medium's pocket.",
      },
      {
        id: "mirror_cabinet",
        wall: "back",
        label: "Mirrored cabinet",
        glyph: "🪞",
        flavor: "A cabinet whose door is a looking glass.",
        requires: { dimension: ["3d"] },
        puzzleId: "medallion_riddle",
        inspect:
          "Only in relief can you catch the reflection: inside, a medallion whose crest, mirrored, reads 37.",
      },
    ],
    puzzles: [
      {
        id: "loose_seat",
        kind: "code",
        prompt: "Which chair, counted from the left, keeps the loose seat?",
        flavor: "The slate is blunt about it, once it speaks.",
        answer: "3",
        confirmLine: "the third chair, as the slate insists",
      },
      {
        id: "medallion_riddle",
        kind: "code",
        prompt:
          "The mirror reverses the medallion's crest. Enter the crest as it reads true.",
        flavor: "What the glass shows backwards, the metal says forwards.",
        answer: "73",
        requires: { dimension: ["3d"] },
        confirmLine: "seventy-three, unmirrored",
      },
    ],
    gates: ["spirit_slates", "mirror_cabinet"],
    exit: {
      prompt:
        "The table dial wants the loose seat's number, then the true crest. Enter both in order.",
      answer: "373",
    },
  },
  {
    slug: "vault",
    title: "The Chronometer Vault",
    tagline: "The last door, and the truest time",
    difficulty: "Grandmaster",
    parMinutes: 90,
    briefing:
      "The vault keeps its own time and lies about it twice: once in the gears, once in the glass. Wind the train, swing the bob, and read the hour as it truly falls. Almost nobody leaves this room quickly.",
    setting: "The chronometer vault, deep underground",
    theme: "Horological vault",
    sceneTint: "from-yellow-900/40",
    props: [
      {
        id: "master_clock",
        wall: "back",
        label: "Master clock",
        glyph: "🕰",
        flavor: "The vault's regulator, hands at 6:00 and ticking.",
        puzzleId: "true_time",
        inspect:
          "The hands read 6:00. The dial notes, in small type: “Shown time, not true time.”",
      },
      {
        id: "pendulum",
        wall: "floor",
        label: "Compensation pendulum",
        glyph: "⏲",
        flavor: "The great pendulum, its bob scratched with figures.",
        requires: { dimension: ["3d"] },
        puzzleId: "swing_count",
        inspect:
          "In relief the scratch is legible: “I swing one true second each way, and only in relief may I be counted.”",
      },
      {
        id: "gear_train",
        wall: "left",
        label: "Gear train door",
        glyph: "⚙",
        flavor: "A glazed door onto the clock's train, wound tight.",
        opensWith: ["winding_crank"],
        yields: ["escapement_note"],
        inspect: "The train door takes a winding crank at its heart.",
      },
      {
        id: "toolbox",
        wall: "right",
        label: "Sunken toolbox",
        glyph: "🧰",
        flavor: "A toolbox the plan draws below the floor.",
        requires: { dimension: ["2d"] },
        yields: ["winding_crank"],
        inspect:
          "The plan marks what the eye misses: a toolbox under the boards, and a crank packed inside.",
      },
      {
        id: "ledger_vault",
        wall: "back",
        label: "Vault ledger",
        glyph: "📕",
        flavor: "The keeper's ledger, its last page blank.",
        inspect:
          "A printed line only: “The vault opens at the shown minutes past six, then the true swings in a true minute.” Beneath, in another hand: “Sealed at six o'clock sharp, by the true clock — twelve true minutes ago as you read this.”",
      },
    ],
    puzzles: [
      {
        id: "true_time",
        kind: "code",
        prompt:
          "The vault sealed twelve true minutes ago. What does the master clock show now, in shown minutes past six?",
        flavor: "Shown time runs twice as fast as true time.",
        answer: "24",
        confirmLine: "twenty-four shown minutes — twelve, truly",
      },
      {
        id: "swing_count",
        kind: "code",
        prompt:
          "How many pendulum swings fill one true minute, counting each way as one swing?",
        flavor: "One true second each way; a true minute holds sixty.",
        answer: "60",
        requires: { dimension: ["3d"] },
        confirmLine: "sixty swings, truly counted",
      },
    ],
    gates: ["gear_train", "pendulum", "master_clock"],
    exit: {
      prompt:
        "The chronometer lock wants the shown minutes from the first answer, then the swings from the second. Enter both in order.",
      answer: "2460",
    },
  },
];

export const ROOMS_BY_SLUG: Record<string, RoomDef> = Object.fromEntries(
  ROOMS.map((room) => [room.slug, room]),
);
