"use client";

import { CardFrame } from "./CardFrame";
import { CardArt } from "./CardArt";
import type { Card } from "@/data/types";

/**
 * 図鑑グリッドの1マス。
 * 未入手のカードは、枠はそのままに中身をシルエットにして「あと何が残っているか」を示す。
 */
export function CardTile({
  card,
  owned,
  onClick,
}: {
  card: Card;
  owned: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        owned ? `${card.name} の詳細を見る` : `${card.no}番 未入手のカード`
      }
      className="group block w-full text-left transition-transform duration-150 active:scale-95"
    >
      <CardFrame genre={card.genre} className="transition-shadow group-hover:brightness-110">
        <div className="relative">
          <CardArt card={card} silhouette={!owned} />

          {/* 図鑑番号 */}
          <span className="absolute left-1 top-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-ink-dim">
            {String(card.no).padStart(2, "0")}
          </span>

          {!owned && (
            <span className="absolute inset-0 grid place-items-center">
              <span className="text-2xl font-bold text-ink-faint">?</span>
            </span>
          )}
        </div>

        <div className="bg-night-2 px-1.5 py-1.5">
          <p className="truncate text-center text-[11px] font-medium leading-tight">
            {owned ? card.name : "？？？"}
          </p>
        </div>
      </CardFrame>
    </button>
  );
}
