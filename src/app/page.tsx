"use client";

import Link from "next/link";
import { CoinBadge } from "@/components/CoinBadge";
import { GenreProgress } from "@/components/GenreProgress";
import { ScanPanel } from "@/components/ScanPanel";
import { AVAILABILITY_NOTICE, OFFICIAL_TOWN_URL } from "@/data/genres";
import { useGameStore } from "@/store/useGameStore";
import { useHydrated } from "@/lib/useHydrated";

export default function HomePage() {
  const hydrated = useHydrated();
  const unlocked = useGameStore((s) => s.certificateUnlocked);

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <header className="mb-5 text-center">
        <p className="text-xs tracking-[0.3em] text-ink-faint">ISHIKAWA・SHIKA</p>
        <h1 className="mt-1 font-serif text-2xl font-bold leading-snug">
          志賀町めぐり
          <br />
          <span className="text-gold">お宝ガチャ図鑑</span>
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-ink-dim">
          石川の日本酒を最高に味わうための
          <br />
          「アテ・スポット・酒器」全50種を集めよう。
        </p>
      </header>

      <div className="mb-5 flex justify-center">
        <CoinBadge size="lg" />
      </div>

      <Link
        href="/gacha"
        className="anim-float mb-5 block rounded-2xl bg-gradient-to-b from-gold to-gold-deep py-4 text-center text-lg font-bold text-[#2c2109] active:scale-[0.98]"
      >
        🎁 ガチャを回す
      </Link>

      <div className="space-y-5">
        <ScanPanel />
        <GenreProgress />

        {hydrated && unlocked && (
          <Link
            href="/certificate"
            className="block rounded-2xl border border-gold bg-gradient-to-b from-gold/20 to-transparent p-4 text-center"
          >
            <p className="font-serif font-bold text-gold">
              🏅 志賀町お宝マスター認定証
            </p>
            <p className="mt-1 text-xs text-ink-dim">
              全50種コンプリートの証を見る
            </p>
          </Link>
        )}
      </div>

      <footer className="mt-8 space-y-3 border-t border-line pt-5 text-[11px] leading-relaxed text-ink-faint">
        <p>⚠ {AVAILABILITY_NOTICE}</p>
        <p>
          <a
            href={OFFICIAL_TOWN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sea underline underline-offset-2"
          >
            志賀町 公式サイト
          </a>
        </p>
        <p>
          このアプリのデータはお使いの端末の中だけに保存されます。サーバーには送信されません。
        </p>
        <p>
          お酒は20歳になってから。飲酒運転は法律で禁止されています。
        </p>
      </footer>
    </main>
  );
}
