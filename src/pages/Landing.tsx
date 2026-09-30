import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ROOMS } from "@/game/gameData";
import { formatLong } from "@/game/shop";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Gem, KeyRound, Sparkles } from "lucide-react";
import { Link } from "react-router";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <main className="vv-bg min-h-screen text-foreground">
      {/* Masthead */}
      <header className="border-b border-gold-500/25">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-baseline gap-2">
            <KeyRound className="size-5 text-gold-400" />
            <span className="font-display text-xl tracking-wide text-gold-300">
              Vexelverse Escape
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" className="font-body text-amber-100/85 hover:text-gold-300">
              <Link to="/rooms">The Rooms</Link>
            </Button>
            <Button asChild variant="ghost" className="font-body text-amber-100/85 hover:text-gold-300">
              <Link to="/shop">The Emporium</Link>
            </Button>
            {!isLoading && isAuthenticated ? (
              <Button asChild className="bg-gold-600 font-body text-black hover:bg-gold-500">
                <Link to="/dashboard">Your Ledger</Link>
              </Button>
            ) : (
              <Button asChild className="bg-gold-600 font-body text-black hover:bg-gold-500">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="font-body text-xs uppercase tracking-[0.45em] text-gold-500/80">
            Est. MMXXVI · The House of Rooms
          </p>
          <h1 className="mt-5 font-display text-5xl leading-tight text-gold-200 sm:text-6xl">
            Think. Act. Solve.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-body text-lg leading-relaxed text-amber-100/80">
            Twelve chambers in a house that rewards patience. Turn the room
            from relief to plan, light it or douse it, and read the clues each
            state alone reveals. Built for anyone who enjoys being stumped
            properly — no quick fingers required, only a settled mind.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-gold-600 font-body text-black hover:bg-gold-500">
              <Link to={isAuthenticated ? "/rooms" : "/auth?returnTo=%2Frooms"}>
                Enter the House <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gold-500/50 font-body text-gold-300 hover:bg-gold-500/10">
              <Link to="/rooms">Browse the Twelve</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <div className="vv-rule" />
      </div>

      {/* The three states */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center font-display text-3xl text-gold-200">
          Three states of every room
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center font-body text-amber-100/70">
          No clue sits where the first glance lands. The house hides its truth
          between dimensions and after dusk.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: <Gem className="size-6 text-gold-400" />,
              title: "3D Relief",
              text: "The room raised in depth: chalk on casks, glyphs behind glass, the reach of a shadow on a wall.",
            },
            {
              icon: <Sparkles className="size-6 text-gold-400" />,
              title: "2D Plan",
              text: "The same room folded flat: drawers ajar, boxes sunk below the boards, notes tucked out of sight.",
            },
            {
              icon: <Clock className="size-6 text-gold-400" />,
              title: "Light & Dark",
              text: "Some inks only answer the flashlight; some dials only tell the truth in a lit room.",
            },
          ].map((f) => (
            <Card key={f.title} className="vv-gold-frame border-gold-500/30 bg-[#141009]">
              <CardContent className="p-6">
                <div className="mb-3">{f.icon}</div>
                <h3 className="font-display text-xl text-gold-300">{f.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-amber-100/75">
                  {f.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Room previews */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl text-gold-200">A taste of the house</h2>
          <Link to="/rooms" className="font-body text-sm text-gold-400 hover:text-gold-300">
            All twelve →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROOMS.slice(0, 6).map((room) => (
            <Link
              key={room.slug}
              to={`/rooms/${room.slug}`}
              className="vv-gold-frame group rounded-sm bg-[#141009] p-5 transition-transform hover:-translate-y-0.5"
            >
              <p className="font-body text-[10px] uppercase tracking-[0.3em] text-gold-500/70">
                {room.difficulty} · {formatLong(room.parMinutes)}
              </p>
              <h3 className="mt-2 font-display text-xl text-gold-300">{room.title}</h3>
              <p className="mt-1 font-body text-sm italic text-amber-100/70">
                {room.tagline}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Rewards */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="vv-gold-frame rounded-sm bg-[#141009] p-10 text-center">
          <h2 className="font-display text-3xl text-gold-200">Escape, and be paid in gold</h2>
          <p className="mx-auto mt-3 max-w-xl font-body text-amber-100/75">
            Every recorded escape earns gold and standing — faster times and
            cleaner runs pay more. The house keeps a ledger for anyone willing
            to be tested, from first-time players to the vault's most stubborn
            regulars.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-gold-600 font-body text-black hover:bg-gold-500">
              <Link to={isAuthenticated ? "/shop" : "/auth?returnTo=%2Fshop"}>
                Visit the Emporium
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-gold-500/50 font-body text-gold-300 hover:bg-gold-500/10">
              <Link to="/auth">Create an account</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-gold-500/25 py-8 text-center">
        <p className="font-body text-xs uppercase tracking-[0.35em] text-muted-foreground">
          Vexelverse Escape · think. act. solve.
        </p>
      </footer>
    </main>
  );
}
