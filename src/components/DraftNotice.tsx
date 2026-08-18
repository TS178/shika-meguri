import { UNVERIFIED_COUNT, TOTAL_CARDS, ALL_VERIFIED } from "@/data/cards";

/**
 * 「制作中・情報未検証」の帯。
 *
 * カードの記載内容がまだ公式情報と照合できていないあいだ、全画面の最上部に出す。
 * たまたまこのサイトを見つけた人が、誤った観光情報をそのまま信じてしまうのを防ぐため。
 *
 * 全50種の確認が終わると（cards.ts の verified がすべて true になると）
 * この帯は自動的に表示されなくなる。手動で消す必要はない。
 */
export function DraftNotice() {
  if (ALL_VERIFIED) return null;

  return (
    <div
      role="note"
      className="border-b border-urushi/50 bg-urushi/20 px-4 py-2.5 text-center"
    >
      <p className="text-[11px] font-bold leading-relaxed text-ink">
        ⚠ このアプリは制作中です
      </p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-ink-dim">
        カードに書かれた観光地・特産品の情報は
        <span className="font-bold text-ink">まだ確認が取れていません</span>
        （{UNVERIFIED_COUNT} / {TOTAL_CARDS} 種が未確認）。
        <br />
        おでかけの判断には使わず、必ず公式情報をご確認ください。
      </p>
    </div>
  );
}
