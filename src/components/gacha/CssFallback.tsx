"use client";

/**
 * 3Dが使えないときの代替演出。
 *
 * 古い端末や、ブラウザの設定でWebGL（3D表示の仕組み）が無効な場合に使う。
 * CSSだけで宝箱が開く様子を表現しているので、どんな端末でも必ず動く。
 * 演出が出ないだけで、ガチャの結果自体は3Dのときと完全に同じ。
 */
export function CssFallback({ running }: { running: boolean }) {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className={`relative ${running ? "" : "anim-float"}`}>
        {/* 光の広がり */}
        <div
          className={`absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/40 blur-2xl transition-all duration-700 ${
            running ? "scale-150 opacity-100" : "scale-75 opacity-30"
          }`}
        />

        {/* フタ */}
        <div
          className="relative mx-auto h-8 w-32 origin-bottom rounded-t-xl border-2 border-gold-deep bg-gradient-to-b from-[#7a4a1e] to-[#5a3618] transition-transform duration-700 ease-out"
          style={{
            transform: running ? "rotateX(-115deg) translateY(-6px)" : "none",
            transformStyle: "preserve-3d",
          }}
        />
        {/* 本体 */}
        <div className="relative mx-auto h-20 w-32 rounded-b-xl border-2 border-gold-deep bg-gradient-to-b from-[#6b4526] to-[#4a2f18]">
          <div className="absolute left-1/2 top-2 h-6 w-5 -translate-x-1/2 rounded bg-gradient-to-b from-gold-pale to-gold-deep" />
        </div>

        <p className="mt-6 text-center text-xs text-ink-faint">
          この端末では簡易表示になっています
        </p>
      </div>
    </div>
  );
}

/**
 * この端末で3D表示が使えるかを調べる。
 * 実際にWebGLの土台を作ってみて、作れたかどうかで判断する。
 */
export function isWebglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}
