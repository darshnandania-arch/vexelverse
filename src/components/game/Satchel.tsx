import type { GameState } from "@/game/types";
import { SHOP_ITEMS_BY_SLUG } from "@/game/shop";

export function Satchel({
  state,
  equipped,
}: {
  state: GameState;
  equipped?: string;
}) {
  return (
    <div className="vv-gold-frame rounded-sm bg-black/50 p-3">
      <h3 className="font-display text-sm uppercase tracking-[0.25em] text-gold-400">
        Satchel
      </h3>
      <div className="mt-2 space-y-1.5">
        {state.inventory.length === 0 && (
          <p className="font-body text-xs italic text-muted-foreground">
            Empty. The room will provide.
          </p>
        )}
        {state.inventory.map((item) => {
          const shopItem = SHOP_ITEMS_BY_SLUG[item];
          return (
            <div
              key={item}
              className="flex items-center justify-between rounded-sm border border-gold-500/20 px-2 py-1"
            >
              <span className="font-body text-xs text-amber-100">
                {shopItem?.name ??
                  item
                    .split("_")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
              </span>
              {equipped === item && (
                <span className="font-body text-[10px] uppercase tracking-widest text-gold-400">
                  equipped
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
