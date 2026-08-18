"use client";

import { useState } from "react";
import { CardFrame } from "@/components/CardFrame";
import { CardArt } from "@/components/CardArt";
import { CardDetailModal } from "@/components/CardDetailModal";
import { getCard } from "@/data/cards";
import type { DrawnCard } from "@/lib/gacha";

/**
 * ガチャ結果の表示。
 * 1枚ずつ少しずつ遅らせてめくることで、10連でも一枚ずつ見られるようにしている。
 */
export function ResultGrid({
  drawn,
  refund,
}: {
  drawn: DrawnCard[];
  refund: number;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const single = drawn.length === 1;
  const openCard = openId ? getCard(openId) : null;

  return (
    <div className="w-full">
      <div
        className={
          single
            ? "mx-auto max-w-[240px]"
            : "grid grid-cols-3 gap-2.5 sm:grid-cols-5"
        }
      >
        {drawn.map((d, i) => {
          const card = getCard(d.id);
          if (!card) return null;
          return (
            <button
              key={`${d.id}-${i}`}
              type="button"
              onClick={() => setOpenId(d.id)}
              className="anim-card-in relative block w-full text-left active:scale-95"
              style={{ animationDelay: `${i * 80}ms` }}
              aria-label={`${card.name} の詳細を見る`}
            >
              <CardFrame genre={card.genre} thick={single}>
                <CardArt card={card} />
                <div className="bg-night-2 px-1 py-1">
                  <p
                    className={`truncate text-center font-medium leading-tight ${
                      single ? "py-1 text-sm" : "text-[10px]"
                    }`}
                  >
                    {card.name}
                  </p>
                </div>
              </CardFrame>

              {d.isNew ? (
                <span className="anim-pop absolute -right-1.5 -top-1.5 rounded-full bg-gradient-to-br from-gold-pale to-gold px-2 py-0.5 text-[10px] font-black text-[#3a2c0c] shadow-lg">
                  NEW
                </span>
              ) : (
                <span className="absolute -right-1.5 -top-1.5 rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold text-coin">
                  +1
                </span>
              )}
            </button>
          );
        })}
      </div>

      {refund > 0 && (
        <p className="mt-4 text-center text-sm text-ink-dim">
          重複した{refund}枚を
          <span className="mx-1 font-bold text-coin">
            おかわりコイン {refund}枚
          </span>
          に交換しました
        </p>
      )}

      <CardDetailModal
        card={openCard ?? null}
        owned
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}
