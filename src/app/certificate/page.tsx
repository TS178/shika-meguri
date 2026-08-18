"use client";

import { useState } from "react";
import Link from "next/link";
import { Celebration } from "@/components/Celebration";
import { useGameStore, countOwned } from "@/store/useGameStore";
import { useHydrated } from "@/lib/useHydrated";
import { TOTAL_CARDS } from "@/data/cards";
import { GENRES } from "@/data/genres";
import { progressByGenre } from "@/store/useGameStore";

/**
 * 全50種コンプリート時にだけ解放されるデジタル認定証。
 * 画像として保存できるようにしてあるので、SNSなどで共有できる。
 */
export default function CertificatePage() {
  const hydrated = useHydrated();
  const unlocked = useGameStore((s) => s.certificateUnlocked);
  const completedAt = useGameStore((s) => s.completedAt);
  const owned = useGameStore((s) => s.owned);
  const celebrationSeen = useGameStore((s) => s.celebrationSeen);
  const markCelebrationSeen = useGameStore((s) => s.markCelebrationSeen);

  const [saving, setSaving] = useState(false);
  const [holder, setHolder] = useState("");

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center text-sm text-ink-faint">
        読み込み中…
      </main>
    );
  }

  // ───────── まだ達成していない場合 ─────────
  if (!unlocked) {
    const got = countOwned(owned);
    return (
      <main className="mx-auto max-w-md px-4 py-10 text-center">
        <p className="text-5xl" aria-hidden>
          🔒
        </p>
        <h1 className="mt-4 font-serif text-xl font-bold">
          認定証はまだ解放されていません
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-dim">
          全{TOTAL_CARDS}種を集めると、特別なデジタル認定証が手に入ります。
          <br />
          残り{" "}
          <span className="font-bold text-gold">{TOTAL_CARDS - got}</span> 種。
        </p>
        <Link
          href="/gacha"
          className="mt-6 inline-block rounded-xl bg-gradient-to-b from-gold to-gold-deep px-8 py-3 font-bold text-[#2c2109]"
        >
          ガチャを回す
        </Link>
      </main>
    );
  }

  // ───────── 達成済み ─────────
  // 達成日時が記録されていない場合（古い保存データなど）は日付欄を伏せる
  const achievedDate = completedAt === null ? null : new Date(completedAt);
  const dateText = achievedDate
    ? `${achievedDate.getFullYear()}年${achievedDate.getMonth() + 1}月${achievedDate.getDate()}日`
    : "—";
  const rows = progressByGenre(owned);

  const download = async () => {
    setSaving(true);
    try {
      const blob = await renderCertificate({
        holder: holder.trim() || "旅人",
        dateText,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "shika-meguri-certificate.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      {!celebrationSeen && <Celebration onDone={markCelebrationSeen} />}

      {/* 認定証 */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-gold bg-gradient-to-b from-[#1a1408] via-[#141922] to-[#0f1218] p-6 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-2 rounded-xl border border-gold/35"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-gold/15 blur-2xl"
        />

        <p className="text-[10px] tracking-[0.4em] text-gold/70">CERTIFICATE</p>
        <h1 className="mt-2 font-serif text-2xl font-black leading-tight text-gold">
          志賀町お宝マスター
        </h1>
        <p className="mt-1 text-xs text-ink-dim">認 定 証</p>

        <div className="my-5 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

        <p className="font-serif text-lg font-bold">
          {holder.trim() || "旅人"}
          <span className="ml-1 text-sm font-normal text-ink-dim">殿</span>
        </p>

        <p className="mt-4 text-xs leading-relaxed text-ink-dim">
          あなたは石川県志賀町を巡り、
          <br />
          日本酒を最高に味わうためのお宝
          <span className="mx-1 font-bold text-gold">全{TOTAL_CARDS}種</span>
          を
          <br />
          すべて集めたことをここに認定します。
        </p>

        <ul className="mt-5 flex justify-center gap-4 text-[11px]">
          {rows.map((r) => (
            <li key={r.genre} className="text-center">
              <span className="block text-lg" aria-hidden>
                {GENRES[r.genre].icon}
              </span>
              <span
                className="block font-bold tabular-nums"
                style={{ color: GENRES[r.genre].accent }}
              >
                {r.owned}/{r.total}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-[11px] text-ink-faint">達成日 {dateText}</p>
        <p className="mt-1 text-[10px] tracking-widest text-gold/60">
          志賀町めぐり・お宝ガチャ図鑑
        </p>
      </div>

      {/* お名前の入力 */}
      <label className="mt-5 block">
        <span className="text-xs text-ink-dim">
          認定証に入れるお名前（任意・端末の中だけに保存されます）
        </span>
        <input
          type="text"
          value={holder}
          onChange={(e) => setHolder(e.target.value.slice(0, 16))}
          placeholder="旅人"
          maxLength={16}
          className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-center text-ink outline-none focus:border-gold"
        />
      </label>

      <button
        type="button"
        onClick={download}
        disabled={saving}
        className="mt-4 w-full rounded-xl bg-gradient-to-b from-gold to-gold-deep py-3.5 font-bold text-[#2c2109] active:scale-[0.98] disabled:opacity-50"
      >
        {saving ? "画像を作成しています…" : "画像として保存する"}
      </button>

      <Link
        href="/collection"
        className="mt-3 block rounded-xl border border-line py-3 text-center text-sm text-ink-dim"
      >
        図鑑に戻る
      </Link>
    </main>
  );
}

// ───────────────────────── 画像の書き出し ─────────────────────────

/**
 * 認定証をPNG画像として描き出す。
 *
 * 外部ライブラリを使わず、ブラウザ標準のcanvasだけで描いている。
 * 完全に端末の中で完結するので、通信は一切発生しない。
 */
function renderCertificate({
  holder,
  dateText,
}: {
  holder: string;
  dateText: string;
}): Promise<Blob> {
  const W = 1000;
  const H = 1400;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  if (!ctx) return Promise.reject(new Error("canvas を利用できません"));

  const serif = '"Hiragino Mincho ProN", "Yu Mincho", serif';
  const sans = '"Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif';

  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1a1408");
  bg.addColorStop(0.45, "#141922");
  bg.addColorStop(1, "#0f1218");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 金色の光
  const glow = ctx.createRadialGradient(200, 180, 0, 200, 180, 420);
  glow.addColorStop(0, "rgba(212,164,71,0.22)");
  glow.addColorStop(1, "rgba(212,164,71,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // 二重の枠
  ctx.strokeStyle = "#d4a447";
  ctx.lineWidth = 6;
  ctx.strokeRect(34, 34, W - 68, H - 68);
  ctx.strokeStyle = "rgba(212,164,71,0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(56, 56, W - 112, H - 112);

  ctx.textAlign = "center";

  ctx.fillStyle = "rgba(212,164,71,0.7)";
  ctx.font = `28px ${sans}`;
  ctx.fillText("C E R T I F I C A T E", W / 2, 190);

  ctx.fillStyle = "#d4a447";
  ctx.font = `bold 82px ${serif}`;
  ctx.fillText("志賀町お宝マスター", W / 2, 300);

  ctx.fillStyle = "#a9b4c2";
  ctx.font = `36px ${serif}`;
  ctx.fillText("認 定 証", W / 2, 366);

  // 区切り線
  const line = ctx.createLinearGradient(200, 0, 800, 0);
  line.addColorStop(0, "rgba(212,164,71,0)");
  line.addColorStop(0.5, "rgba(212,164,71,0.6)");
  line.addColorStop(1, "rgba(212,164,71,0)");
  ctx.fillStyle = line;
  ctx.fillRect(200, 420, 600, 2);

  ctx.fillStyle = "#f4efe4";
  ctx.font = `bold 64px ${serif}`;
  ctx.fillText(`${holder}　殿`, W / 2, 540);

  ctx.fillStyle = "#a9b4c2";
  ctx.font = `32px ${sans}`;
  const body = [
    "あなたは石川県志賀町を巡り、",
    "日本酒を最高に味わうためのお宝 全50種を",
    "すべて集めたことをここに認定します。",
  ];
  body.forEach((text, i) => ctx.fillText(text, W / 2, 660 + i * 56));

  // ジャンルの内訳
  ctx.fillStyle = "#d4a447";
  ctx.font = `bold 40px ${sans}`;
  ctx.fillText("アテ 20 ／ スポット 20 ／ 酒器 10", W / 2, 900);

  ctx.fillStyle = "#6c7889";
  ctx.font = `30px ${sans}`;
  ctx.fillText(`達成日　${dateText}`, W / 2, 1020);

  ctx.fillStyle = "rgba(212,164,71,0.65)";
  ctx.font = `28px ${serif}`;
  ctx.fillText("志賀町めぐり・お宝ガチャ図鑑", W / 2, 1300);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("画像の作成に失敗しました"));
    }, "image/png");
  });
}
