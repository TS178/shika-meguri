"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";

/**
 * LocalStorage からの読み込み（hydration）が終わったかどうか。
 *
 * 静的書き出しでは、HTMLはビルド時に「コイン0枚」の状態で作られる。
 * ブラウザで開いた直後に LocalStorage の値へ差し替わるため、
 * これを待たずに描画すると数字が一瞬ちらつく。
 * このフックが true を返してから中身を出すことで、それを防ぐ。
 *
 * 【注意】ビルド時（サーバー側）には localStorage が存在しないため、
 * zustand の persist 機能そのものが無効化され、`useGameStore.persist` が
 * 未定義になる。そのため必ず存在チェックをしてから触る。
 */
export function useHydrated(): boolean {
  /*
    初期値は必ず false から始める。
    ブラウザ側では LocalStorage の読み込みが同期的に終わっているため、
    ここで実際の状態を返すと「ビルド時に作られたHTML（未読込＝false）」と
    「ブラウザの最初の描画（読込済＝true）」が食い違い、
    Reactが hydration エラーを出してしまう。
  */
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persistApi = useGameStore.persist;

    if (!persistApi) {
      // 保存機能が使えない環境（プライベートモードなど）でも
      // 画面は普通に使えるようにする。ただし記録は残らない。
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 保存領域の有無はブラウザでしか分からず、ここで一度だけ確定させる必要がある
      setHydrated(true);
      return;
    }

    const unsubscribe = persistApi.onFinishHydration(() => setHydrated(true));

    // 購読する前に読み込みが終わっていた場合の取りこぼしを防ぐ
    if (persistApi.hasHydrated()) {
      setHydrated(true);
    }

    return unsubscribe;
  }, []);

  return hydrated;
}
