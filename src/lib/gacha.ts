import { CARD_IDS } from "@/data/cards";

/**
 * ガチャの抽選ロジック。
 *
 * レア度は設けず、全50種が完全に均等な確率（各2%）で出る。
 * 副作用を持たない純粋関数にしてあるので、テストで乱数を差し替えて検証できる。
 */

export const SINGLE_COST = 1;
export const TEN_COST = 10;
export const TEN_COUNT = 10;

/** 重複したカードが出たときに返ってくるコイン */
export const DUPLICATE_REFUND = 1;

export type Rng = () => number;

/** 1回引く。戻り値はカードID */
export function drawOnce(rng: Rng = Math.random): string {
  const index = Math.floor(rng() * CARD_IDS.length);
  // rng() が 1 を返す実装に備えて範囲を丸める
  return CARD_IDS[Math.min(index, CARD_IDS.length - 1)];
}

/** 10連。各回は独立なので重複しうる */
export function drawMany(count: number, rng: Rng = Math.random): string[] {
  return Array.from({ length: count }, () => drawOnce(rng));
}

export function drawTen(rng: Rng = Math.random): string[] {
  return drawMany(TEN_COUNT, rng);
}

export type GachaMode = "single" | "ten";

export function costOf(mode: GachaMode): number {
  return mode === "single" ? SINGLE_COST : TEN_COST;
}

export function drawFor(mode: GachaMode, rng: Rng = Math.random): string[] {
  return mode === "single" ? [drawOnce(rng)] : drawTen(rng);
}

export interface DrawnCard {
  id: string;
  /** 初めて入手したカードか */
  isNew: boolean;
}

export interface ResolvedDraw {
  /** 更新後の所持カード（元のオブジェクトは書き換えない） */
  owned: Record<string, number>;
  drawn: DrawnCard[];
  /** 新規に入手したカードID */
  newIds: string[];
  /** 重複ぶんの「おかわりコイン」 */
  refund: number;
}

/**
 * 引いた結果を所持状況に突き合わせ、新規判定と還元コインを計算する。
 *
 * すでに持っているカードが出ても損した気分にならないよう、
 * 重複1枚につきコインを1枚返す（コイン切れで詰むのも防いでいる）。
 */
export function resolveDraw(
  ids: string[],
  currentOwned: Record<string, number>
): ResolvedDraw {
  const owned = { ...currentOwned };

  const drawn: DrawnCard[] = ids.map((id) => {
    const isNew = !owned[id];
    owned[id] = (owned[id] ?? 0) + 1;
    return { id, isNew };
  });

  const newIds = drawn.filter((d) => d.isNew).map((d) => d.id);
  const refund = (ids.length - newIds.length) * DUPLICATE_REFUND;

  return { owned, drawn, newIds, refund };
}

/**
 * テスト用の決定的な乱数生成器（mulberry32）。
 * 同じ seed からは常に同じ並びが得られる。
 */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
