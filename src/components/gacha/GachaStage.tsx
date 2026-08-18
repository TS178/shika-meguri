"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useGameStore } from "@/store/useGameStore";
import { useHydrated } from "@/lib/useHydrated";
import { SINGLE_COST, TEN_COST, type GachaMode } from "@/lib/gacha";
import { getCard } from "@/data/cards";
import { GENRES } from "@/data/genres";
import type { PullResult } from "@/store/useGameStore";
import { CssFallback, isWebglAvailable } from "./CssFallback";
import { ResultGrid } from "./ResultGrid";
import { TOTAL_DURATION } from "./TreasureChest";

/*
  3Dシーンはブラウザでしか動かないため、サーバー側では読み込まない（ssr: false）。
  静的書き出しのビルド時にWebGLを触ろうとしてエラーになるのを防ぐ。
*/
const ChestScene = dynamic(() => import("./ChestScene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-sm text-ink-faint">
      宝箱を準備しています…
    </div>
  ),
});

type Stage = "ready" | "playing" | "result";

export function GachaStage({
  onCompleted,
}: {
  /** 全50種コンプリートに到達したときに呼ばれる */
  onCompleted?: () => void;
}) {
  const hydrated = useHydrated();
  const coins = useGameStore((s) => s.coins);
  const pull = useGameStore((s) => s.pull);

  const [stage, setStage] = useState<Stage>("ready");
  const [result, setResult] = useState<PullResult | null>(null);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
    端末が3D表示に対応しているか、OSで「視差効果を減らす」設定が有効かを調べる。
    どちらもブラウザでしか分からない情報で、HTMLはビルド時に作られるため、
    画面が表示されたあとに一度だけ確定させる必要がある。
  */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    // eslint-disable-next-line react-hooks/set-state-in-effect -- 端末の対応状況はブラウザ上でしか判定できないため
    setWebgl(isWebglAvailable());
    setReducedMotion(mq.matches);

    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    return () => {
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, []);

  const finish = useCallback(() => {
    if (safetyTimer.current) {
      clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }
    setStage("result");
  }, []);

  const start = (mode: GachaMode) => {
    const outcome = pull(mode);
    if (!outcome) {
      setMessage(
        `コインが足りません（${mode === "single" ? SINGLE_COST : TEN_COST}枚必要）。現地のQRコードを読み取って集めましょう。`
      );
      return;
    }

    setMessage(null);
    setResult(outcome);

    if (outcome.justCompleted) onCompleted?.();

    // 動きを減らす設定の人には、短いフェードだけで結果へ
    if (reducedMotion || webgl === false) {
      setStage("playing");
      safetyTimer.current = setTimeout(finish, reducedMotion ? 500 : 1400);
      return;
    }

    setStage("playing");
    // 画面を裏に回すと3Dの時計が止まるため、保険のタイマーを併走させる
    safetyTimer.current = setTimeout(finish, TOTAL_DURATION * 1000 + 1200);
  };

  const cardColors =
    result?.drawn.map((d) => {
      const card = getCard(d.id);
      return card ? GENRES[card.genre].accent : "#d4a447";
    }) ?? [];

  // ───────────────────────── 結果表示 ─────────────────────────

  if (stage === "result" && result) {
    return (
      <div className="px-4 py-6">
        <h1 className="mb-1 text-center font-serif text-2xl font-bold">
          {result.newIds.length > 0 ? "お宝を手に入れた！" : "お宝が出た！"}
        </h1>
        <p className="mb-5 text-center text-sm text-ink-dim">
          新しく{result.newIds.length}種を図鑑に登録しました
        </p>

        <ResultGrid drawn={result.drawn} refund={result.refund} />

        {/* 全50種そろった瞬間だけ現れる、隠しの導線 */}
        {result.justCompleted && (
          <div className="anim-pop mt-6 rounded-2xl border border-gold bg-gradient-to-b from-gold/20 to-transparent p-4 text-center">
            <p className="font-serif text-lg font-bold text-gold">
              全50種コンプリート！
            </p>
            <p className="mt-1 text-xs text-ink-dim">
              特別なデジタル認定証が解放されました
            </p>
            <Link
              href="/certificate"
              className="anim-shimmer mt-3 block rounded-xl bg-gradient-to-b from-gold-pale to-gold py-3 font-bold text-[#2c2109]"
            >
              認定証を受け取る
            </Link>
          </div>
        )}

        <div className="mt-8 space-y-2.5">
          <button
            type="button"
            onClick={() => {
              setStage("ready");
              setResult(null);
            }}
            className="w-full rounded-xl bg-gradient-to-b from-gold to-gold-deep py-3.5 font-bold text-[#2c2109] active:scale-[0.98]"
          >
            もう一度ひく
          </button>
          <Link
            href="/collection"
            className="block w-full rounded-xl border border-line py-3 text-center text-sm text-ink-dim"
          >
            図鑑で確かめる
          </Link>
        </div>
      </div>
    );
  }

  // ───────────────────────── 待機・演出中 ─────────────────────────

  const playing = stage === "playing";

  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col justify-between px-4 py-4">
      {/* 3Dの舞台。高さを画面に対して決め打ちし、宝箱が小さくなりすぎないようにする */}
      <div className="relative h-[46vh] max-h-[420px] min-h-[280px] w-full">
        {webgl === null ? (
          <div className="grid h-full place-items-center text-sm text-ink-faint">
            読み込み中…
          </div>
        ) : webgl && !reducedMotion ? (
          <ChestScene
            running={playing}
            grand={result?.mode === "ten"}
            cardColors={cardColors}
            onComplete={finish}
          />
        ) : (
          <CssFallback running={playing} />
        )}

        {playing && (
          <button
            type="button"
            onClick={finish}
            className="absolute right-2 top-2 rounded-full border border-line bg-night/80 px-4 py-1.5 text-xs text-ink-dim backdrop-blur-sm"
          >
            演出をスキップ
          </button>
        )}
      </div>

      {/* 操作エリア */}
      {playing ? (
        <p className="py-8 text-center text-sm text-ink-dim">
          {result?.mode === "ten" ? "大きな宝箱が" : "宝箱が"}動き出した…
        </p>
      ) : (
        <div className="pt-4">
          {message && (
            <p className="mb-3 rounded-xl border border-urushi/40 bg-urushi/10 px-3 py-2.5 text-center text-sm text-ink-dim">
              {message}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <PullButton
              label="ひとつ引く"
              cost={SINGLE_COST}
              disabled={!hydrated || coins < SINGLE_COST}
              onClick={() => start("single")}
            />
            <PullButton
              label="10連で引く"
              cost={TEN_COST}
              grand
              disabled={!hydrated || coins < TEN_COST}
              onClick={() => start("ten")}
            />
          </div>

          <p className="mt-3 text-center text-xs leading-relaxed text-ink-faint">
            全50種はすべて同じ確率（各2%）で出ます。レア度はありません。
            <br />
            すでに持っているカードが出たら、1枚につきコインが1枚戻ります。
          </p>
        </div>
      )}
    </div>
  );
}

function PullButton({
  label,
  cost,
  disabled,
  grand = false,
  onClick,
}: {
  label: string;
  cost: number;
  disabled: boolean;
  grand?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden rounded-2xl py-4 text-center transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
        grand
          ? "bg-gradient-to-b from-gold to-gold-deep text-[#2c2109]"
          : "border border-gold/50 bg-surface text-ink"
      }`}
    >
      <span className="block text-base font-bold">{label}</span>
      <span
        className={`mt-0.5 block text-xs ${grand ? "text-[#5a4413]" : "text-ink-dim"}`}
      >
        コイン {cost}枚
      </span>
    </button>
  );
}
