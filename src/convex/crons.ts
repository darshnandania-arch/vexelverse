import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "sweep expired run snapshots",
  { minutes: 5 },
  internal.game.sweepExpired,
);

export default crons;
