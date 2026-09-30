import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { SHOP_ITEMS, SHOP_ITEMS_BY_SLUG } from "@/game/shop";
import { useMutation, useQuery } from "convex/react";
import { Coins, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function Shop() {
  const { isAuthenticated } = useAuth();
  const profile = useQuery(api.game.getProfile, isAuthenticated ? {} : "skip");
  const ensureProfile = useMutation(api.game.ensureProfile);
  const buyItem = useMutation(api.shop.buyItem);
  const equipItem = useMutation(api.shop.equipItem);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && profile === null) {
      void ensureProfile({});
    }
  }, [isAuthenticated, profile, ensureProfile]);

  if (!isAuthenticated) {
    return (
      <main className="vv-bg flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="font-display text-2xl text-gold-300">The counter is closed</h1>
        <p className="max-w-sm font-body text-amber-100/75">
          The Emporium trades only with players of record. Sign in and your
          purse will be waiting.
        </p>
        <Button asChild className="bg-gold-600 font-body text-black hover:bg-gold-500">
          <Link to="/auth?returnTo=%2Fshop">Sign in</Link>
        </Button>
      </main>
    );
  }

  if (profile === undefined) {
    return (
      <main className="vv-bg flex min-h-screen items-center justify-center">
        <Sparkles className="size-6 animate-pulse text-gold-400" />
      </main>
    );
  }

  if (profile === null) {
    return (
      <main className="vv-bg flex min-h-screen items-center justify-center">
        <Sparkles className="size-6 animate-pulse text-gold-400" />
      </main>
    );
  }

  const owned = profile.owned;
  const equipped = profile.equipped;

  const handleBuy = async (slug: string) => {
    setBusy(slug);
    try {
      await buyItem({ slug });
      toast.success("Purchased. It sits in your ledger now.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The sale fell through");
    } finally {
      setBusy(null);
    }
  };

  const handleEquip = async (slug: string) => {
    setBusy(slug);
    try {
      await equipItem({ slug: equipped === slug ? "" : slug });
      toast.success(equipped === slug ? "Put away." : "Equipped.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not equip");
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="vv-bg min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          to="/dashboard"
          className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/70 hover:text-gold-400"
        >
          ← Your ledger
        </Link>

        <header className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.4em] text-gold-500/80">
              Purse &amp; privilege
            </p>
            <h1 className="mt-2 font-display text-4xl text-gold-200">The Emporium</h1>
            <p className="mt-2 max-w-xl font-body text-amber-100/70">
              Gold is earned by escaping rooms — faster than par, with fewer
              hints, pays more. Everything sold here is yours to keep.
            </p>
          </div>
          <div className="vv-plaque flex items-center gap-2 rounded-sm px-4 py-2">
            <Coins className="size-5 text-gold-400" />
            <span className="font-display text-2xl text-gold-300">{profile.gold}</span>
            <span className="font-body text-xs uppercase tracking-widest text-amber-100/70">
              gold
            </span>
          </div>
        </header>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SHOP_ITEMS.map((item) => {
            const isOwned = owned.includes(item.slug);
            const isEquipped = equipped === item.slug;
            const affordable = profile.gold >= item.price;
            return (
              <Card key={item.slug} className="vv-gold-frame flex flex-col border-gold-500/30 bg-[#141009]">
                <CardHeader>
                  <CardTitle className="font-display text-xl text-gold-300">
                    {item.name}
                  </CardTitle>
                  <p className="font-body text-sm text-amber-100/70">{item.blurb}</p>
                </CardHeader>
                <CardContent className="mt-auto space-y-3">
                  {item.perk && (
                    <p className="font-body text-xs uppercase tracking-widest text-gold-400">
                      {item.perk}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-body text-sm text-amber-100">
                      <Coins className="size-4 text-gold-400" /> {item.price}
                    </span>
                    {isOwned ? (
                      <Button
                        size="sm"
                        variant={isEquipped ? "default" : "outline"}
                        className={
                          isEquipped
                            ? "bg-gold-600 font-body text-black hover:bg-gold-500"
                            : "border-gold-500/40 font-body text-amber-100 hover:text-gold-300"
                        }
                        disabled={busy === item.slug}
                        onClick={() => void handleEquip(item.slug)}
                      >
                        {isEquipped ? "Equipped" : "Equip"}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-gold-600 font-body text-black hover:bg-gold-500 disabled:opacity-50"
                        disabled={!affordable || busy === item.slug}
                        onClick={() => void handleBuy(item.slug)}
                      >
                        {affordable ? "Buy" : "Too dear"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="mt-8 text-center font-body text-xs italic text-muted-foreground">
          All sales are final; the house does not refund courage.
        </p>
      </div>
    </main>
  );
}
