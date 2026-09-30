import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Per-player game profile: XP, gold, rank and cosmetic inventory.
    profiles: defineTable({
      userId: v.id("users"),
      gold: v.number(),
      xp: v.number(),
      runsPlayed: v.number(),
      wins: v.number(),
      bestStreak: v.number(),
      currentStreak: v.number(),
      roomsCleared: v.number(),
      owned: v.array(v.string()),
      equipped: v.optional(v.string()),
      banished: v.array(v.string()),
      titleUnlocks: v.array(v.string()),
    })
      .index("by_user", ["userId"]),

    // One row per completed escape attempt. Written by recordRun; read by history.
    runs: defineTable({
      userId: v.id("users"),
      roomSlug: v.string(),
      roomTitle: v.string(),
      difficulty: v.string(),
      outcome: v.string(), // "escaped" | "failed"
      secondsTaken: v.number(),
      parSeconds: v.number(),
      hintsUsed: v.number(),
      lightDark: v.string(),
      finalDimension: v.string(),
      goldEarned: v.number(),
      xpEarned: v.number(),
      finishedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_room", ["roomSlug"]),

    // Live state of a run in progress, owned by the session that started it.
    gameStates: defineTable({
      roomSlug: v.string(),
      version: v.number(),
      seed: v.number(),
      startedAt: v.number(),
      updatedAt: v.number(),
      expiresAt: v.number(),
      snapshot: v.string(), // JSON-serialised engine state
    }).index("by_room", ["roomSlug"]),

    // Append-only accounting for gold earned and spent.
    ledger: defineTable({
      userId: v.id("users"),
      delta: v.number(),
      reason: v.string(),
      balanceAfter: v.number(),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
