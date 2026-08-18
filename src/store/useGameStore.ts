"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CARDS, CARD_IDS, TOTAL_CARDS, getCardBySpotId } from "@/data/cards";
import { GENRE_ORDER } from "@/data/genres";
import type { Genre } from "@/data/types";
import {
  costOf,
  drawFor,
  resolveDraw,
  type DrawnCard,
  type GachaMode,
  type Rng,
} from "@/lib/gacha";

/** 最初に配るコイン。いきなり10連を1回引ける枚数にしている */
export const INITIAL_COINS = 10;
/** 初めてそのスポットのQRを読んだときの獲得枚数 */
export const FIRST_SCAN_COINS = 3;
/** 同じスポットを再訪したときの獲得枚数 */
export const REVISIT_COINS = 1;
/** 再訪でコインがもらえるようになるまでの間隔（24時間） */
export const REVISIT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export const STORAGE_KEY = "shika-meguri-v1";

export interface ScanRecord {
  /** 初めて読み取った日時 */
  firstAt: number;
  /** 最後に読み取った日時 */
  lastAt: number;
  /** 読み取った回数 */
  count: number;
}

export type ScanReason = "first" | "revisit" | "cooldown";

export interface ScanResult {
  gained: number;
  reason: ScanReason;
  /** cooldown のとき、次にもらえるようになる日時 */
  nextAvailableAt: number;
}

export type { DrawnCard };

export interface PullResult {
  mode: GachaMode;
  drawn: DrawnCard[];
  /** 新規に入手したカードID */
  newIds: string[];
  /** 重複ぶんの「おかわりコイン」 */
  refund: number;
  /** この抽選でコンプリートに到達したか */
  justCompleted: boolean;
}

export interface GenreProgress {
  genre: Genre;
  owned: number;
  total: number;
  /** 0〜100 */
  percent: number;
}

interface GameState {
  coins: number;
  /** カードID → 入手した回数 */
  owned: Record<string, number>;
  /** spotId → 読み取り履歴 */
  scans: Record<string, ScanRecord>;
  /** 全50種を集めて認定証が解放されたか */
  certificateUnlocked: boolean;
  /** コンプリート達成日時 */
  completedAt: number | null;
  /** コンプリート時のシークレット演出を再生済みか（2回目以降は出さない） */
  celebrationSeen: boolean;

  scanSpot: (spotId: string) => ScanResult;
  pull: (mode: GachaMode, rng?: Rng) => PullResult | null;
  markCelebrationSeen: () => void;
  /** デバッグ用: 全カードを付与する */
  grantAll: () => void;
  /** デバッグ用: コインを追加する */
  addCoins: (n: number) => void;
  reset: () => void;
}

const initialState = {
  coins: INITIAL_COINS,
  owned: {} as Record<string, number>,
  scans: {} as Record<string, ScanRecord>,
  certificateUnlocked: false,
  completedAt: null as number | null,
  celebrationSeen: false,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      scanSpot: (spotId) => {
        const now = Date.now();
        const record = get().scans[spotId];

        let gained = 0;
        let reason: ScanReason;
        let nextAvailableAt = 0;

        if (!record) {
          gained = FIRST_SCAN_COINS;
          reason = "first";
        } else if (now - record.lastAt >= REVISIT_COOLDOWN_MS) {
          gained = REVISIT_COINS;
          reason = "revisit";
        } else {
          reason = "cooldown";
          nextAvailableAt = record.lastAt + REVISIT_COOLDOWN_MS;
        }

        if (gained > 0) {
          set((s) => ({
            coins: s.coins + gained,
            scans: {
              ...s.scans,
              [spotId]: {
                firstAt: record?.firstAt ?? now,
                lastAt: now,
                count: (record?.count ?? 0) + 1,
              },
            },
          }));
        }

        return { gained, reason, nextAvailableAt };
      },

      pull: (mode, rng) => {
        const cost = costOf(mode);
        if (get().coins < cost) return null;

        const ids = drawFor(mode, rng);
        const { owned, drawn, newIds, refund } = resolveDraw(ids, get().owned);
        const uniqueCount = Object.keys(owned).length;
        const justCompleted =
          uniqueCount >= TOTAL_CARDS && !get().certificateUnlocked;

        set((s) => ({
          owned,
          coins: s.coins - cost + refund,
          certificateUnlocked: s.certificateUnlocked || uniqueCount >= TOTAL_CARDS,
          completedAt: s.completedAt ?? (justCompleted ? Date.now() : null),
        }));

        return { mode, drawn, newIds, refund, justCompleted };
      },

      markCelebrationSeen: () => set({ celebrationSeen: true }),

      grantAll: () => {
        const owned: Record<string, number> = {};
        for (const id of CARD_IDS) owned[id] = 1;
        set((s) => ({
          owned,
          certificateUnlocked: true,
          completedAt: s.completedAt ?? Date.now(),
        }));
      },

      addCoins: (n) => set((s) => ({ coins: s.coins + n })),

      reset: () => set({ ...initialState }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // 関数は保存しない
      partialize: (s) => ({
        coins: s.coins,
        owned: s.owned,
        scans: s.scans,
        certificateUnlocked: s.certificateUnlocked,
        completedAt: s.completedAt,
        celebrationSeen: s.celebrationSeen,
      }),
      migrate: (persisted, version) => {
        // 将来カードを追加してもデータが壊れないよう、ここで差分を吸収する
        if (version === 0) {
          return { ...initialState, ...(persisted as object) };
        }
        return persisted as GameState;
      },
    }
  )
);

// ───────────────────────── 集計ヘルパー（コンポーネントから使う）─────────────────────────

export function countOwned(owned: Record<string, number>): number {
  return Object.keys(owned).length;
}

export function isComplete(owned: Record<string, number>): boolean {
  return countOwned(owned) >= TOTAL_CARDS;
}

export function progressByGenre(
  owned: Record<string, number>
): GenreProgress[] {
  return GENRE_ORDER.map((genre) => {
    const cards = CARDS.filter((c) => c.genre === genre);
    const got = cards.filter((c) => owned[c.id]).length;
    return {
      genre,
      owned: got,
      total: cards.length,
      percent: cards.length === 0 ? 0 : Math.round((got / cards.length) * 100),
    };
  });
}

/** まだ読み取っていないスポットのID一覧（QRモックボタンで使う） */
export function unscannedSpotIds(scans: Record<string, ScanRecord>): string[] {
  return CARDS.filter((c) => c.spotId && !scans[c.spotId]).map(
    (c) => c.spotId as string
  );
}

/** spotId から表示用のスポット名を取る */
export function spotName(spotId: string): string {
  return getCardBySpotId(spotId)?.name ?? spotId;
}
