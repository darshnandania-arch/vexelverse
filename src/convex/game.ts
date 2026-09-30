import { getAuthUserId } from "@convex-dev/auth/server";
import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { roleValidator } from "./schema";

export const MAX_CONCURRENT_RUNS = 4;

/** Signed-in user's profile, or null before the first ensureProfile call. */
export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

/** Idempotently creates the signed-in player's profile. Safe to call often. */
export const ensureProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in first");
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) return;
    await ctx.db.insert("profiles", {
      userId,
      gold: 100,
      xp: 0,
      runsPlayed: 0,
      wins: 0,
      bestStreak: 0,
      currentStreak: 0,
      roomsCleared: 0,
      owned: [],
      equipped: undefined,
      banished: [],
      titleUnlocks: [],
    });
  },
});
export const listRuns = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("runs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit ?? 20);
  },
});

/** Everything the admin area needs: roster, aggregate stats and recent ledger. */
export const adminOverview = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { authorized: false as const };
    const me = await ctx.db.get(userId);
    if (me?.role !== "admin") return { authorized: false as const };

    const profiles = await ctx.db.query("profiles").collect();
    const users = await ctx.db.query("users").collect();
    const runs = await ctx.db.query("runs").order("desc").take(60);
    const ledger = await ctx.db.query("ledger").order("desc").take(40);

    const userById = new Map(
      users.map((u) => [u._id, u.name ?? u.email ?? u._id.slice(-6)]),
    );

    return {
      authorized: true as const,
      playerCount: profiles.length,
      accounts: users.length,
      runsRecorded: profiles.reduce((sum, p) => sum + p.runsPlayed, 0),
      escapes: profiles.reduce((sum, p) => sum + p.wins, 0),
      goldInCirculation: profiles.reduce((sum, p) => sum + p.gold, 0),
      roster: profiles
        .map((p) => {
          const account = users.find((u) => u._id === p.userId);
          return {
            profileId: p._id,
            userId: p.userId,
            player: userById.get(p.userId) ?? "Unknown",
            role: account?.role ?? ("user" as const),
            gold: p.gold,
            xp: p.xp,
            runsPlayed: p.runsPlayed,
            wins: p.wins,
            currentStreak: p.currentStreak,
            owned: p.owned.length,
          };
        })
        .sort((a, b) => b.xp - a.xp),
      recentRuns: runs.map((r) => ({
        runId: r._id,
        player: userById.get(r.userId) ?? "Unknown",
        roomTitle: r.roomTitle,
        outcome: r.outcome,
        secondsTaken: r.secondsTaken,
        parSeconds: r.parSeconds,
        hintsUsed: r.hintsUsed,
        goldEarned: r.goldEarned,
        finishedAt: r.finishedAt,
      })),
      recentLedger: ledger.map((l) => ({
        entryId: l._id,
        player: userById.get(l.userId) ?? "Unknown",
        delta: l.delta,
        reason: l.reason,
        balanceAfter: l.balanceAfter,
        createdAt: l.createdAt,
      })),
    };
  },
});

/** Grant or revoke a role. Admin-only; guards the last remaining admin. */
export const setUserRole = mutation({
  args: { targetUserId: v.id("users"), role: roleValidator },
  handler: async (ctx, args) => {
    const callerId = await getAuthUserId(ctx);
    if (callerId === null) throw new Error("Sign in first");
    const caller = await ctx.db.get(callerId);
    if (caller?.role !== "admin") throw new Error("Admins only");

    if (args.role !== "admin") {
      const admins = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("role"), "admin"))
        .collect();
      if (
        admins.length <= 1 &&
        admins.some((a) => a._id === args.targetUserId)
      ) {
        throw new Error("Cannot demote the last remaining administrator");
      }
    }
    await ctx.db.patch(args.targetUserId, { role: args.role });
  },
});

/** Adjust a player's gold. Admin-only, fully audited in the ledger. */
export const adjustGold = mutation({
  args: { profileId: v.id("profiles"), delta: v.number(), reason: v.string() },
  handler: async (ctx, args) => {
    const callerId = await getAuthUserId(ctx);
    if (callerId === null) throw new Error("Sign in first");
    const caller = await ctx.db.get(callerId);
    if (caller?.role !== "admin") throw new Error("Admins only");

    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error("Profile not found");
    if (profile.gold + args.delta < 0) {
      throw new Error("Adjustment would go below zero");
    }

    const newGold = profile.gold + args.delta;
    await ctx.db.patch(args.profileId, { gold: newGold });
    await ctx.db.insert("ledger", {
      userId: profile.userId,
      delta: args.delta,
      reason: args.reason.trim() || "Admin adjustment",
      balanceAfter: newGold,
      createdAt: Date.now(),
    });
  },
});

/**
 * A completed run. Gold is computed on the server: par 1.0×, up to +35% for
 * beating par, −10% per hint beyond the two free ones, streak and rank perks.
 */
export const recordRun = mutation({
  args: {
    roomSlug: v.string(),
    roomTitle: v.string(),
    difficulty: v.string(),
    outcome: v.union(v.literal("escaped"), v.literal("failed")),
    secondsTaken: v.number(),
    parSeconds: v.number(),
    hintsUsed: v.number(),
    lightDark: v.string(),
    finalDimension: v.string(),
    chambersCleared: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in first");
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const parRatio = args.secondsTaken / Math.max(1, args.parSeconds);
    let multiplier = 1.0;
    if (parRatio <= 0.5) multiplier = 1.35;
    else if (parRatio <= 0.7) multiplier = 1.25;
    else if (parRatio <= 0.9) multiplier = 1.12;
    else if (parRatio <= 1.0) multiplier = 1.0;
    else if (parRatio <= 1.5) multiplier = 0.75;
    else multiplier = 0.5;

    const hintPenalty = Math.max(0, args.hintsUsed - 2) * 0.1;
    multiplier = Math.max(0.2, multiplier - hintPenalty);

    const base =
      args.outcome === "escaped" ? 60 + Math.round(args.parSeconds / 12) : 10;
    const chamberBonus = Math.max(0, (args.chambersCleared ?? 0) - 1) * 40;
    if (profile.currentStreak >= 2) multiplier += 0.1;
    if (profile.equipped === "heirloom_key") multiplier += 0.1;

    const goldEarned = Math.max(
      5,
      Math.round((base + chamberBonus) * multiplier),
    );
    const xpEarned =
      args.outcome === "escaped"
        ? Math.max(25, Math.round(args.parSeconds / 10))
        : 5;

    const streak = args.outcome === "escaped" ? profile.currentStreak + 1 : 0;
    await ctx.db.patch(profile._id, {
      gold: profile.gold + goldEarned,
      xp: profile.xp + xpEarned,
      runsPlayed: profile.runsPlayed + 1,
      wins: profile.wins + (args.outcome === "escaped" ? 1 : 0),
      currentStreak: streak,
      bestStreak: Math.max(profile.bestStreak, streak),
      roomsCleared: profile.roomsCleared + (args.outcome === "escaped" ? 1 : 0),
    });

    await ctx.db.insert("runs", {
      userId,
      roomSlug: args.roomSlug,
      roomTitle: args.roomTitle,
      difficulty: args.difficulty,
      outcome: args.outcome,
      secondsTaken: args.secondsTaken,
      parSeconds: args.parSeconds,
      hintsUsed: args.hintsUsed,
      lightDark: args.lightDark,
      finalDimension: args.finalDimension,
      goldEarned,
      xpEarned,
      finishedAt: Date.now(),
    });

    await ctx.db.insert("ledger", {
      userId,
      delta: goldEarned,
      reason:
        args.outcome === "escaped"
          ? `Escaped ${args.roomTitle} in ${Math.round(args.secondsTaken / 60)}m`
          : `Failed ${args.roomTitle}`,
      balanceAfter: profile.gold + goldEarned,
      createdAt: Date.now(),
    });

    return { goldEarned, xpEarned };
  },
});

/**
 * Internal sweeper: deletes run snapshots whose expiry has passed so the
 * table cannot grow unbounded. Invoked by a scheduled cron job.
 */
export const sweepExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const stale = await ctx.db
      .query("gameStates")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();
    for (const doc of stale) {
      await ctx.db.delete(doc._id);
    }
    return stale.length;
  },
});
