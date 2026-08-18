"use client";

import Link from "next/link";
import { useGameStore, progressByGenre } from "@/store/useGameStore";
import { useHydrated } from "@/lib/useHydrated";
import { GENRES } from "@/data/genres";
import { TOTAL_CARDS } from "@/data/cards";

/** ジャンルごとの収集状況。ホーム画面に置く */
export function GenreProgress() {
  const hydrated = useHydrated();
  const owned = useGameStore((s) => s.owned);

  const rows = progressByGenre(hydrated ? owned : {});
  const totalOwned = rows.reduce((sum, r) => sum + r.owned, 0);

  return (
    <section className="rounded-2xl border border-line bg-surface/60 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-serif text-lg font-bold">収集のようす</h2>
        <p className="text-sm text-ink-dim">
          <span className="text-xl font-bold tabular-nums text-ink">
            {hydrated ? totalOwned : "…"}
          </span>
          <span className="mx-0.5">/</span>
          {TOTAL_CARDS} 種
        </p>
      </div>

      <ul className="space-y-3">
        {rows.map((row) => {
          const meta = GENRES[row.genre];
          return (
            <li key={row.genre}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden>{meta.icon}</span>
                  <span className="text-ink-dim">{meta.label}</span>
                </span>
                <span className="tabular-nums text-ink-dim">
                  {hydrated ? row.owned : "…"} / {row.total}
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-night"
                role="progressbar"
                aria-valuenow={row.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${meta.label}の収集率`}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: `${row.percent}%`,
                    background: `linear-gradient(90deg, ${meta.accent}99, ${meta.accent})`,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <Link
        href="/collection"
        className="mt-4 block rounded-lg border border-line py-2 text-center text-sm text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
      >
        図鑑を開く
      </Link>
    </section>
  );
}
