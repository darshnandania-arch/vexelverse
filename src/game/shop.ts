export interface ShopItem {
  slug: string;
  name: string;
  price: number;
  blurb: string;
  perk?: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    slug: "sigil_ash",
    name: "Ashen Sigil",
    price: 250,
    blurb:
      "A chalk sigil pressed on ash paper. Marks your ledger with a faint grey flourish beside your name.",
  },
  {
    slug: "brass_lantern",
    name: "Brass Lantern",
    price: 400,
    blurb:
      "A portrait engraving of the lantern every porter carried. Sits behind your name on the dashboard.",
  },
  {
    slug: "pocket_watch",
    name: "Pocket Watch",
    price: 650,
    blurb:
      "Engraved with the seal at half past midnight. Shows a slim gold watch face on your profile.",
  },
  {
    slug: "grandmaster_seal",
    name: "Grandmaster's Seal",
    price: 900,
    blurb:
      "Issued to keepers of the vault. Stamps your record with a wax-red grandmaster's seal.",
    perk: "Waives one hint penalty on every recorded escape.",
  },
  {
    slug: "heirloom_key",
    name: "Heirloom Key",
    price: 1200,
    blurb:
      "Cast from the gatehouse original. Sits at the head of your ledger like a promise kept.",
    perk: "Adds +10% gold on every recorded escape, forever.",
  },
  {
    slug: "golden_cigar",
    name: "Golden Cigar",
    price: 1600,
    blurb:
      "For those who have escaped everything. A gilded cigar ribbon crowns your record.",
  },
];

export const SHOP_ITEMS_BY_SLUG: Record<string, ShopItem> = Object.fromEntries(
  SHOP_ITEMS.map((item) => [item.slug, item]),
);

export interface Rank {
  min: number;
  name: string;
  blurb: string;
}

export const RANKS: Rank[] = [
  { min: 0, name: "Novice Hand", blurb: "Every account begins here." },
  { min: 150, name: "House Guest", blurb: "You know which doors to knock on." },
  { min: 400, name: "Keyholder", blurb: "Rooms open a beat faster for you now." },
  { min: 800, name: "Roomwalker", blurb: "The house has learned your step." },
  { min: 1400, name: "Vexel Adept", blurb: "Few rooms keep their secrets long." },
  { min: 2200, name: "Keeper of Hours", blurb: "The clocks mind their manners around you." },
  { min: 3200, name: "Grandmaster of the House", blurb: "The house keeps a chair for you." },
];

export function rankFor(xp: number): { rank: Rank; next: Rank | null; progress: number } {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].min) idx = i;
  }
  const rank = RANKS[idx];
  const next = RANKS[idx + 1] ?? null;
  const span = next ? next.min - rank.min : 1;
  const into = xp - rank.min;
  return { rank, next, progress: Math.min(1, into / span) };
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function formatLong(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hour${h === 1 ? "" : "s"}` : `${h} hr ${m} min`;
}
