"use client";

import { useGameStore } from "@/store/useGameStore";
import { useHydrated } from "@/lib/useHydrated";

/**
 * 所持コインの表示。
 *
 * LocalStorage の読み込みが終わるまでは「…」を出す。
 * 待たずに描くと 10 → 実際の枚数 と一瞬ちらついてしまうため。
 */
export function CoinBadge({ size = "md" }: { size?: "md" | "lg" }) {
  const hydrated = useHydrated();
  const coins = useGameStore((s) => s.coins);

  const large = size === "lg";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gradient-to-b from-[#2a2313] to-[#1a1710] ${
        large ? "px-5 py-2.5" : "px-3 py-1.5"
      }`}
    >
      <span
        aria-hidden
        className={`grid place-items-center rounded-full bg-gradient-to-br from-gold-pale to-gold-deep font-bold text-[#3a2c0c] ${
          large ? "h-8 w-8 text-base" : "h-5 w-5 text-[11px]"
        }`}
      >
        圓
      </span>
      <span
        className={`font-bold tabular-nums text-coin ${
          large ? "text-3xl" : "text-base"
        }`}
      >
        {hydrated ? coins : "…"}
      </span>
      <span className={`text-ink-dim ${large ? "text-sm" : "text-xs"}`}>
        コイン
      </span>
    </div>
  );
}
