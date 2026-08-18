"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useGameStore, unscannedSpotIds, spotName } from "@/store/useGameStore";
import { useHydrated } from "@/lib/useHydrated";
import { getCardBySpotId, SPOT_IDS } from "@/data/cards";
import type { ScanResult } from "@/store/useGameStore";

/**
 * QRコードの読み取りとコイン獲得。
 *
 * 現地の看板に印刷したQRには次の形のURLを入れる:
 *   https://（公開先）/shika-meguri/?spot=ganmon
 * 読み取るとこのホーム画面が開き、自動でコインが加算される。
 *
 * 現地に行かなくても動作を試せるよう、デモ用のボタンも用意してある。
 */

interface Feedback {
  spotId: string;
  result: ScanResult;
}

/**
 * URLの ?spot= を読み取る係。
 *
 * useSearchParams は静的書き出しでは Suspense で囲む必要があるため、
 * この小さなコンポーネントに切り出している。
 */
function SpotParamReader({ onScan }: { onScan: (f: Feedback) => void }) {
  const params = useSearchParams();
  const router = useRouter();
  const scanSpot = useGameStore((s) => s.scanSpot);
  const hydrated = useHydrated();
  const handled = useRef(false);

  useEffect(() => {
    // LocalStorage の読み込みを待つ。待たないと履歴が空の状態で判定してしまう
    if (!hydrated || handled.current) return;

    const spotId = params.get("spot");
    if (!spotId) return;

    handled.current = true;

    if (!SPOT_IDS.includes(spotId)) {
      // 知らないIDのQRだった場合は何もせず、URLだけ綺麗にする
      router.replace("/");
      return;
    }

    onScan({ spotId, result: scanSpot(spotId) });

    // 再読み込みで二重に加算されないよう、URLからパラメータを消す
    router.replace("/");
  }, [hydrated, params, router, scanSpot, onScan]);

  return null;
}

function formatRemaining(until: number): string {
  const ms = Math.max(0, until - Date.now());
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.ceil((ms % 3_600_000) / 60_000);
  if (hours > 0) return `約${hours}時間${minutes}分後`;
  return `約${minutes}分後`;
}

export function ScanPanel() {
  const hydrated = useHydrated();
  const scans = useGameStore((s) => s.scans);
  const scanSpot = useGameStore((s) => s.scanSpot);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const visited = hydrated ? Object.keys(scans).length : 0;
  const remaining = hydrated ? unscannedSpotIds(scans).length : SPOT_IDS.length;

  /** デモ用: まだ訪れていないスポットを1つ選んで読み取ったことにする */
  const runDemoScan = () => {
    const pool = unscannedSpotIds(scans);
    const spotId =
      pool.length > 0
        ? pool[Math.floor(Math.random() * pool.length)]
        : SPOT_IDS[Math.floor(Math.random() * SPOT_IDS.length)];
    setFeedback({ spotId, result: scanSpot(spotId) });
  };

  return (
    <section className="rounded-2xl border border-sea/35 bg-gradient-to-b from-sea/10 to-transparent p-4">
      <Suspense fallback={null}>
        <SpotParamReader onScan={setFeedback} />
      </Suspense>

      <h2 className="font-serif text-lg font-bold">現地でコインを集める</h2>
      <p className="mt-1 text-xs leading-relaxed text-ink-dim">
        志賀町の各スポットに掲示されたQRコードを読み取ると、ガチャに使うコインがもらえます。
        <br />
        初めての場所は
        <span className="font-bold text-coin">3コイン</span>、
        同じ場所の再訪は24時間ごとに
        <span className="font-bold text-coin">1コイン</span>。
      </p>

      <p className="mt-3 text-sm text-ink-dim">
        訪れた場所{" "}
        <span className="font-bold tabular-nums text-ink">
          {hydrated ? visited : "…"}
        </span>{" "}
        / {SPOT_IDS.length}
        <span className="ml-2 text-xs text-ink-faint">
          （未訪問 {hydrated ? remaining : "…"} か所）
        </span>
      </p>

      {feedback && <ScanFeedback feedback={feedback} />}

      <button
        type="button"
        onClick={runDemoScan}
        disabled={!hydrated}
        className="mt-3 w-full rounded-xl border border-sea/60 bg-sea/15 py-3 font-bold text-sea-pale transition-transform active:scale-[0.98] disabled:opacity-40"
      >
        QRを読み取る（デモ）
      </button>
      <p className="mt-1.5 text-center text-[11px] text-ink-faint">
        現地に行かなくても動作を試せるボタンです
      </p>
    </section>
  );
}

function ScanFeedback({ feedback }: { feedback: Feedback }) {
  const { spotId, result } = feedback;
  const card = getCardBySpotId(spotId);
  const name = card?.name ?? spotName(spotId);

  if (result.reason === "cooldown") {
    return (
      <div className="anim-pop mt-3 rounded-xl border border-line bg-surface/80 p-3">
        <p className="text-sm font-bold">{name}</p>
        <p className="mt-1 text-xs text-ink-dim">
          この場所は最近読み取ったばかりです。次にコインがもらえるのは
          <span className="font-bold text-ink">
            {formatRemaining(result.nextAvailableAt)}
          </span>
          。
        </p>
      </div>
    );
  }

  return (
    <div className="anim-pop mt-3 rounded-xl border border-coin/50 bg-coin/10 p-3">
      <p className="text-sm font-bold">
        {result.reason === "first" ? "はじめての訪問！" : "おかえりなさい"}
        <span className="ml-1.5 text-ink-dim">{name}</span>
      </p>
      <p className="mt-1 text-2xl font-black tabular-nums text-coin">
        +{result.gained}
        <span className="ml-1 text-sm font-bold">コイン</span>
      </p>
      <Link
        href="/gacha"
        className="mt-2 block rounded-lg bg-gradient-to-b from-gold to-gold-deep py-2.5 text-center text-sm font-bold text-[#2c2109]"
      >
        さっそくガチャを回す
      </Link>
    </div>
  );
}
