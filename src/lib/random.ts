/**
 * 番号から決まる 0〜1 のばらつき値。
 *
 * 見た目に「不規則さ」を出したいだけの用途で使う。
 * Math.random() と違い、同じ番号を渡せば必ず同じ値が返るので、
 * 描画のたびに結果が変わらず、Reactが安全に再利用できる。
 * （ガチャの抽選そのものには使わない。そちらは lib/gacha.ts）
 */
export function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
