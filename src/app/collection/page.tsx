"use client";

import { useState } from "react";
import { CardTile } from "@/components/CardTile";
import { CardDetailModal } from "@/components/CardDetailModal";
import { CARDS, TOTAL_CARDS, getCard } from "@/data/cards";
import { GENRES, GENRE_ORDER } from "@/data/genres";
import type { Genre } from "@/data/types";
import { useGameStore } from "@/store/useGameStore";
import { useHydrated } from "@/lib/useHydrated";

export default function CollectionPage() {
  const hydrated = useHydrated();
  const ownedMap = useGameStore((s) => s.owned);
  const owned = hydrated ? ownedMap : {};

  const [tab, setTab] = useState<Genre>("gourmet");
  const [openId, setOpenId] = useState<string | null>(null);

  const cards = CARDS.filter((c) => c.genre === tab);
  const gotInTab = cards.filter((c) => owned[c.id]).length;
  const gotTotal = Object.keys(owned).length;
  const openCard = openId ? getCard(openId) : null;

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <header className="mb-4">
        <h1 className="font-serif text-2xl font-bold">お宝図鑑</h1>
        <p className="mt-1 text-sm text-ink-dim">
          集めた数{" "}
          <span className="font-bold tabular-nums text-ink">
            {hydrated ? gotTotal : "…"}
          </span>{" "}
          / {TOTAL_CARDS} 種
        </p>
      </header>

      {/* ジャンル切り替えタブ */}
      <div role="tablist" className="mb-4 flex gap-1.5">
        {GENRE_ORDER.map((genre) => {
          const meta = GENRES[genre];
          const active = tab === genre;
          const count = CARDS.filter(
            (c) => c.genre === genre && owned[c.id]
          ).length;
          const total = CARDS.filter((c) => c.genre === genre).length;

          return (
            <button
              key={genre}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(genre)}
              className="flex-1 rounded-xl border px-2 py-2 text-center transition-colors"
              style={{
                borderColor: active ? meta.accent : "var(--color-line)",
                backgroundColor: active ? `${meta.accent}1f` : "transparent",
              }}
            >
              <span className="block text-lg leading-none" aria-hidden>
                {meta.icon}
              </span>
              <span
                className="mt-1 block text-[10px] font-medium leading-tight"
                style={{ color: active ? meta.accent : "var(--color-ink-dim)" }}
              >
                {meta.label}
              </span>
              <span className="mt-0.5 block text-[10px] tabular-nums text-ink-faint">
                {hydrated ? count : "…"}/{total}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mb-3 text-xs text-ink-faint">
        {GENRES[tab].description}
        {tab === "spot" && "（QRを読むとコインがもらえます）"}
      </p>

      {/* カード一覧 */}
      <div className="grid grid-cols-3 gap-2.5">
        {cards.map((card) => (
          <CardTile
            key={card.id}
            card={card}
            owned={Boolean(owned[card.id])}
            onClick={() => setOpenId(card.id)}
          />
        ))}
      </div>

      <p className="mt-5 text-center text-xs text-ink-faint">
        {GENRES[tab].label}：{hydrated ? gotInTab : "…"} / {cards.length} 種
        収集ずみ
      </p>

      <CardDetailModal
        card={openCard ?? null}
        owned={Boolean(openCard && owned[openCard.id])}
        onClose={() => setOpenId(null)}
      />
    </main>
  );
}
