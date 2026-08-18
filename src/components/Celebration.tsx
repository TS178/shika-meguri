"use client";

import { useEffect, useMemo, useState } from "react";
import { pseudoRandom } from "@/lib/random";

/**
 * コンプリート達成時のシークレット演出。
 *
 * 全50種を集めたときに一度だけ全画面で流れる金色の紙吹雪。
 * 3Dを使わずCSSだけで作ってあるので、どんな端末でも必ず再生される。
 */
export function Celebration({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true);

  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        left: pseudoRandom(i * 5 + 1) * 100,
        delay: pseudoRandom(i * 5 + 2) * 1.2,
        duration: 2.4 + pseudoRandom(i * 5 + 3) * 1.8,
        size: 5 + pseudoRandom(i * 5 + 4) * 8,
        rotate: pseudoRandom(i * 5 + 5) * 360,
        color: ["#f0d9a0", "#d4a447", "#fff0c0", "#b7282e", "#3fa8c4"][i % 5],
      })),
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDone();
    }, 4200);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden
    >
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-12vh) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: translateY(112vh) rotate(720deg); opacity: 0; }
        }
      `}</style>

      {/* 中心から広がる金色の光 */}
      <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/30 blur-3xl" />

      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 block rounded-[2px]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.6,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}

      <div className="absolute inset-x-0 top-[38%] text-center">
        <p className="anim-pop font-serif text-3xl font-black text-gold drop-shadow-[0_2px_12px_rgba(212,164,71,0.7)]">
          全50種 コンプリート
        </p>
        <p
          className="anim-pop mt-2 text-sm text-ink"
          style={{ animationDelay: "0.3s" }}
        >
          志賀町お宝マスターの称号を授与します
        </p>
      </div>
    </div>
  );
}
