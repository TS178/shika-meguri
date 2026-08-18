"use client";

import { useEffect, useRef } from "react";
import { CardFrame } from "./CardFrame";
import { CardArt } from "./CardArt";
import { GENRES, OFFICIAL_TOWN_URL, AVAILABILITY_NOTICE } from "@/data/genres";
import type { Card } from "@/data/types";

/** カードの詳細ポップアップ。写真＋ジャンル別フレーム＋解説 */
export function CardDetailModal({
  card,
  owned,
  onClose,
}: {
  card: Card | null;
  owned: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!card) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // 背後の画面がスクロールしないようにする
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [card, onClose]);

  if (!card) return null;

  const meta = GENRES[card.genre];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${card.name} の詳細`}
        onClick={(e) => e.stopPropagation()}
        className="anim-card-in max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-line bg-night-2 p-4 pb-8 sm:rounded-3xl sm:pb-4"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ backgroundColor: `${meta.accent}25`, color: meta.accent }}
          >
            {meta.icon} {meta.fullLabel}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full border border-line px-3 py-1 text-sm text-ink-dim transition-colors hover:text-ink"
          >
            閉じる
          </button>
        </div>

        <CardFrame genre={card.genre} thick className="mx-auto max-w-[280px]">
          <CardArt card={card} silhouette={!owned} />
        </CardFrame>

        {owned ? (
          <>
            <div className="mt-4 text-center">
              <p className="text-xs text-ink-faint">{card.kana}</p>
              <h2 className="font-serif text-2xl font-bold">{card.name}</h2>
              <p className="mt-1 text-xs text-ink-dim">
                No.{String(card.no).padStart(2, "0")} ／ {card.area}
              </p>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-ink-dim">
              {card.summary}
            </p>

            <dl className="mt-4 space-y-3">
              <Section
                icon="🍶"
                title="日本酒とのペアリング"
                accent={meta.accent}
                body={card.pairing}
              />
              <Section
                icon="🧃"
                title="お酒を飲まない人・お子さまへ"
                accent={meta.accent}
                body={card.kidsNote}
              />
              <Section
                icon="💡"
                title="豆知識"
                accent={meta.accent}
                body={card.trivia}
              />
            </dl>

            {card.genre === "spot" && (
              <div className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-3">
                <p className="text-xs leading-relaxed text-ink-dim">
                  ⚠ {AVAILABILITY_NOTICE}
                </p>
                <a
                  href={card.officialUrl ?? OFFICIAL_TOWN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs font-medium text-gold underline underline-offset-2"
                >
                  公式サイトで最新情報を見る →
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="mt-5 text-center">
            <h2 className="font-serif text-2xl font-bold text-ink-faint">
              ？？？
            </h2>
            <p className="mt-1 text-xs text-ink-dim">
              No.{String(card.no).padStart(2, "0")} ／ {meta.fullLabel}
            </p>
            <p className="mt-4 text-sm text-ink-dim">
              まだ手に入れていません。ガチャを回して集めましょう。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  body,
  accent,
}: {
  icon: string;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl bg-surface/70 p-3">
      <dt
        className="mb-1 flex items-center gap-1.5 text-xs font-bold"
        style={{ color: accent }}
      >
        <span aria-hidden>{icon}</span>
        {title}
      </dt>
      <dd className="text-sm leading-relaxed text-ink-dim">{body}</dd>
    </div>
  );
}
