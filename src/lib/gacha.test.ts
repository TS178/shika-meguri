/**
 * 抽選ロジックとコイン計算の検証。
 *
 *   npm test
 *
 * 「レア度なし・全50種が均等」という要件が守られているかを、
 * 実際に10万回引いて統計的に確かめる。
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  drawOnce,
  drawTen,
  drawFor,
  costOf,
  resolveDraw,
  seededRng,
  DUPLICATE_REFUND,
  SINGLE_COST,
  TEN_COST,
  TEN_COUNT,
} from "./gacha";
import { CARD_IDS, TOTAL_CARDS, CARDS } from "../data/cards";
import { GENRE_ORDER } from "../data/genres";

test("カードは全部で50種ある", () => {
  assert.equal(TOTAL_CARDS, 50);
  assert.equal(CARD_IDS.length, 50);
  assert.equal(new Set(CARD_IDS).size, 50, "IDに重複がある");
});

test("ジャンルの内訳は 20 / 20 / 10", () => {
  const counts = GENRE_ORDER.map(
    (g) => CARDS.filter((c) => c.genre === g).length
  );
  assert.deepEqual(counts, [20, 20, 10]);
});

test("引いたカードは必ず実在するIDになる", () => {
  const rng = seededRng(12345);
  for (let i = 0; i < 1000; i++) {
    assert.ok(CARD_IDS.includes(drawOnce(rng)), "存在しないIDが出た");
  }
});

test("10連は必ず10枚返す", () => {
  const rng = seededRng(999);
  for (let i = 0; i < 100; i++) {
    assert.equal(drawTen(rng).length, TEN_COUNT);
  }
});

test("排出確率は全50種が均等（10万回で各2%±0.3%）", () => {
  const TRIALS = 100_000;
  const rng = seededRng(20260818);
  const counts = new Map<string, number>(CARD_IDS.map((id) => [id, 0]));

  for (let i = 0; i < TRIALS; i++) {
    const id = drawOnce(rng);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const expected = 100 / TOTAL_CARDS; // = 2%
  const tolerance = 0.3;

  for (const [id, n] of counts) {
    const percent = (n / TRIALS) * 100;
    assert.ok(
      Math.abs(percent - expected) <= tolerance,
      `${id} の出現率が ${percent.toFixed(3)}% で、${expected}% から ${tolerance}% 以上ずれている`
    );
  }
});

test("rng が境界値 0 と 1 を返しても範囲外にならない", () => {
  assert.equal(drawOnce(() => 0), CARD_IDS[0]);
  assert.equal(drawOnce(() => 0.999999), CARD_IDS[CARD_IDS.length - 1]);
  // Math.random は 1 を返さない仕様だが、念のため守りを入れてある
  assert.equal(drawOnce(() => 1), CARD_IDS[CARD_IDS.length - 1]);
});

test("コインの消費枚数はシングル1枚・10連10枚", () => {
  assert.equal(costOf("single"), SINGLE_COST);
  assert.equal(costOf("ten"), TEN_COST);
  assert.equal(SINGLE_COST, 1);
  assert.equal(TEN_COST, 10);
});

test("drawFor はモードに応じた枚数を返す", () => {
  const rng = seededRng(7);
  assert.equal(drawFor("single", rng).length, 1);
  assert.equal(drawFor("ten", rng).length, 10);
});

test("seededRng は同じ種から同じ並びを返す（テストの再現性）", () => {
  assert.deepEqual(drawTen(seededRng(42)), drawTen(seededRng(42)));
});

// ───────────────────────── 新規判定と重複の還元 ─────────────────────────

test("すべて新規なら還元コインは0枚", () => {
  const r = resolveDraw(["gm01", "gm02", "sp01"], {});
  assert.deepEqual(r.newIds, ["gm01", "gm02", "sp01"]);
  assert.equal(r.refund, 0);
  assert.ok(r.drawn.every((d) => d.isNew));
});

test("すでに持っているカードは重複扱いになり、1枚につき1コイン返る", () => {
  const r = resolveDraw(["gm01", "gm02"], { gm01: 1 });
  assert.deepEqual(r.newIds, ["gm02"]);
  assert.equal(r.refund, DUPLICATE_REFUND);
  assert.equal(r.drawn[0].isNew, false);
  assert.equal(r.drawn[1].isNew, true);
});

test("同じ抽選の中で2枚出たら、2枚目は重複として扱う", () => {
  const r = resolveDraw(["gm01", "gm01", "gm01"], {});
  assert.deepEqual(r.newIds, ["gm01"]);
  assert.equal(r.refund, 2 * DUPLICATE_REFUND);
  assert.equal(r.owned.gm01, 3);
});

test("resolveDraw は渡された所持データを書き換えない", () => {
  const before = { gm01: 1 };
  resolveDraw(["gm01", "gm02"], before);
  assert.deepEqual(before, { gm01: 1 }, "元のオブジェクトが変更された");
});

test("10連をコンプリート済みの状態で引くと、消費10枚に対し10枚返る（実質無料）", () => {
  const owned: Record<string, number> = {};
  for (const id of CARD_IDS) owned[id] = 1;
  const r = resolveDraw(drawTen(seededRng(1)), owned);
  assert.equal(r.newIds.length, 0);
  assert.equal(r.refund, TEN_COST);
});

test("コインが尽きて詰まないこと（重複還元があるので所持枚数は単調には減らない）", () => {
  // 全種持っている状態では、10連のコストと還元が釣り合う
  assert.equal(TEN_COUNT * DUPLICATE_REFUND, TEN_COST);
});
