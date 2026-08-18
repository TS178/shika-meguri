"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";
import { GENRES } from "@/data/genres";
import type { Card } from "@/data/types";

/**
 * カードの絵柄。
 *
 * public/cards/ に写真が置かれていればそれを表示し、
 * 無ければジャンル色のプレースホルダーを表示する。
 * つまり **写真をまだ用意していなくてもアプリは完成した状態で動く**。
 * あとから同じファイル名で画像を置くだけで自動的に差し替わる。
 */

/** カード番号から決まる色相のずらし量。カードごとに見た目を変えるため */
function hueFor(no: number): number {
  return (no * 37) % 60;
}

function Placeholder({ card }: { card: Card }) {
  const meta = GENRES[card.genre];
  const hue = hueFor(card.no);

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-1 select-none"
      style={{
        background: `
          radial-gradient(circle at 30% 25%, ${meta.accent}55, transparent 60%),
          radial-gradient(circle at 75% 80%, ${meta.accent}33, transparent 55%),
          linear-gradient(${140 + hue}deg, #1b2431 0%, #131a24 100%)
        `,
      }}
    >
      <span className="text-3xl opacity-80" aria-hidden>
        {meta.icon}
      </span>
      <span
        className="font-serif text-2xl font-bold tabular-nums"
        style={{ color: meta.accent }}
      >
        {String(card.no).padStart(2, "0")}
      </span>
      <span className="text-[10px] tracking-widest text-ink-faint">
        PHOTO COMING
      </span>
    </div>
  );
}

export function CardArt({
  card,
  silhouette = false,
}: {
  card: Card;
  /** 未入手のときは黒いシルエットにする */
  silhouette?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative aspect-square w-full ${silhouette ? "silhouette" : ""}`}
    >
      {failed ? (
        <Placeholder card={card} />
      ) : (
        // next/image ではなく素の img を使っている。
        // 静的書き出しでは画像最適化が働かず next/image の利点が無い一方、
        // 画像が無いときにプレースホルダーへ切り替える onError の扱いが素直になるため。
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset(card.image)}
          alt={card.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
