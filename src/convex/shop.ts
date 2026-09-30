import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * The Emporium keeps its own canonical price list and grants items only when
 * the balance actually covers the purchase, so the client can be trusted with
 * nothing more than a slug.
 */
const CATALOG: Record<string, { price: number; label: string }> = {
  sigil_ash: { price: 250, label: "Ashen Sigil" },
  brass_lantern: { price: 400, label: "Brass Lantern" },
  pocket_watch: { price: 650, label: "Pocket Watch" },
  grandmaster_seal: { price: 900, label: "Grandmaster's Seal" },
  heirloom_key: { price: 1200, label: "Heirloom Key" },
  golden_cigar: { price: 1600, label: "Golden Cigar" },
};

export const buyItem = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in first");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const item = CATALOG[args.slug];
    if (!item) throw new Error("Unknown item");
    if (profile.owned.includes(args.slug)) {
      throw new Error("You already own this item");
    }
    if (profile.gold < item.price) {
      throw new Error("Not enough gold — escape more rooms to earn more");
    }

    const remaining = profile.gold - item.price;
    await ctx.db.patch(profile._id, {
      gold: remaining,
      owned: [...profile.owned, args.slug],
      equipped: profile.equipped ?? args.slug,
    });
    await ctx.db.insert("ledger", {
      userId,
      delta: -item.price,
      reason: `Purchased ${item.label}`,
      balanceAfter: remaining,
      createdAt: Date.now(),
    });
    return { gold: remaining };
  },
});

export const equipItem = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in first");
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Profile not found");

    if (args.slug === "") {
      await ctx.db.patch(profile._id, { equipped: undefined });
      return;
    }
    if (!profile.owned.includes(args.slug)) throw new Error("Not owned");
    await ctx.db.patch(profile._id, { equipped: args.slug });
  },
});

/** Wipe a run snapshot (used by the abandon-flow in the play page). */
export const discardRun = mutation({
  args: { roomSlug: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in first");
    const doc = await ctx.db
      .query("gameStates")
      .withIndex("by_room", (q) => q.eq("roomSlug", args.roomSlug))
      .unique();
    if (!doc) return;
    const snapshot = JSON.parse(doc.snapshot) as { ownerId?: string };
    if (snapshot.ownerId !== userId) throw new Error("Not your run");
    await ctx.db.delete(doc._id);
  },
});
