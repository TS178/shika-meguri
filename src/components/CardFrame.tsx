import type { ReactNode } from "react";
import type { Genre } from "@/data/types";

/**
 * ジャンルごとの専用フレーム。
 *
 * 画像素材は一切使わず、グラデーションと擬似的なテクスチャだけで枠を描いている。
 * 追加のダウンロードが発生しないので、スマホでも表示が速い。
 */

interface FrameStyle {
  /** 枠本体のグラデーション */
  outer: string;
  /** 枠に重ねるテクスチャ用のクラス（globals.css で定義） */
  texture: string;
  /** 内側の細い線 */
  innerRing: string;
  /** 四隅の飾りの色 */
  corner: string;
  /** カードの外側に落とす光 */
  glow: string;
}

const FRAMES: Record<Genre, FrameStyle> = {
  // アテ・グルメ: 温かみのあるゴールドと木目
  gourmet: {
    outer: "bg-gradient-to-br from-gold-pale via-gold to-gold-deep",
    texture: "tex-wood",
    innerRing: "ring-1 ring-inset ring-[#5a4114]",
    corner: "bg-gold-pale",
    glow: "shadow-[0_6px_20px_-6px_rgba(212,164,71,0.55)]",
  },
  // 観光地・スポット: 爽やかなブルーと波
  spot: {
    outer: "bg-gradient-to-br from-sea-pale via-sea to-sea-deep",
    texture: "tex-wave",
    innerRing: "ring-1 ring-inset ring-[#10475a]",
    corner: "bg-sea-pale",
    glow: "shadow-[0_6px_20px_-6px_rgba(63,168,196,0.55)]",
  },
  // 伝統工芸・酒器: 漆器の黒と朱、金の一本線
  craft: {
    outer: "bg-gradient-to-br from-[#2e2624] via-[#0d0b0a] to-[#241b19]",
    texture: "tex-urushi",
    innerRing: "ring-1 ring-inset ring-urushi",
    corner: "bg-gold",
    glow: "shadow-[0_6px_20px_-6px_rgba(183,40,46,0.5)]",
  },
};

/** 四隅の飾り。工芸だけは金の細線、他はジャンル色の小さな角 */
function Corners({ genre }: { genre: Genre }) {
  const { corner } = FRAMES[genre];
  const base = `absolute h-2.5 w-2.5 ${corner} opacity-90`;
  return (
    <>
      <span
        className={`${base} left-[3px] top-[3px]`}
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      />
      <span
        className={`${base} right-[3px] top-[3px]`}
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
      />
      <span
        className={`${base} bottom-[3px] left-[3px]`}
        style={{ clipPath: "polygon(0 0, 0 100%, 100% 100%)" }}
      />
      <span
        className={`${base} bottom-[3px] right-[3px]`}
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
      />
    </>
  );
}

export function CardFrame({
  genre,
  children,
  className = "",
  thick = false,
}: {
  genre: Genre;
  children: ReactNode;
  className?: string;
  /** 詳細ポップアップなど、大きく見せるときに枠を太くする */
  thick?: boolean;
}) {
  const f = FRAMES[genre];
  const pad = thick ? "p-[7px]" : "p-[4px]";
  const radius = thick ? "rounded-2xl" : "rounded-xl";

  return (
    <div className={`relative ${radius} ${pad} ${f.outer} ${f.glow} ${className}`}>
      {/* 枠に重ねるテクスチャ */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${radius} ${f.texture} opacity-70`}
      />
      {/* 工芸だけ、朱の内側にさらに金の細線を一本入れる */}
      {genre === "craft" && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-[2px] ${radius} ring-1 ring-inset ring-gold/45`}
        />
      )}
      <Corners genre={genre} />
      <div
        className={`relative overflow-hidden ${
          thick ? "rounded-xl" : "rounded-lg"
        } ${f.innerRing} bg-night-2`}
      >
        {children}
      </div>
    </div>
  );
}
