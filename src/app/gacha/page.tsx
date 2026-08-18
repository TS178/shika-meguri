"use client";

import { GachaStage } from "@/components/gacha/GachaStage";
import { CoinBadge } from "@/components/CoinBadge";

export default function GachaPage() {
  return (
    <main className="mx-auto max-w-md">
      <header className="flex items-center justify-between px-4 pt-5">
        <h1 className="font-serif text-2xl font-bold">お宝ガチャ</h1>
        <CoinBadge />
      </header>

      <GachaStage />
    </main>
  );
}
