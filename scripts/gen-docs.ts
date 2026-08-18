/**
 * カードデータから、人が確認するためのドキュメントを生成する。
 *
 *   npm run gen:docs
 *
 * 出力先:
 *   docs/card-facts.md   … 記載内容の事実確認チェックリスト（公開前に必ず潰す）
 *   docs/qr-list.md      … 現地掲示用QRコードのURL一覧
 *   public/cards/README.md … 差し替え用の画像ファイル名一覧
 *
 * カードデータを唯一の情報源にしておくことで、
 * データを直せばドキュメントも必ず追随する。
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { CARDS, TOTAL_CARDS } from "../src/data/cards";
import { GENRES, GENRE_ORDER, OFFICIAL_TOWN_URL, AVAILABILITY_NOTICE } from "../src/data/genres";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function write(relPath: string, content: string) {
  const full = join(ROOT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content, "utf8");
  console.log(`  書き出し: ${relPath}`);
}

/** Markdownの表を壊さないようにパイプ記号を退避する */
const cell = (s: string) => s.replace(/\|/g, "\\|");

// ───────────────────────── docs/card-facts.md ─────────────────────────

function buildCardFacts(): string {
  const unverified = CARDS.filter((c) => !c.verified).length;

  const lines: string[] = [
    "# カード記載内容 事実確認チェックリスト",
    "",
    "> このファイルは `npm run gen:docs` で自動生成されます。直接編集しても次回の生成で上書きされます。",
    "> 確認結果は `src/data/cards.ts` の `verified` を `true` に変えることで反映してください。",
    "",
    `**全 ${TOTAL_CARDS} 種 / 未確認 ${unverified} 種**`,
    "",
    "## このファイルの目的",
    "",
    "カードの名称・産地・由来などの記載は、公開前に公式情報と照合する必要があります。",
    "誤った観光情報は来訪者の不利益に直結するため、**未確認のまま公開しないでください。**",
    "",
    "### 主な確認先",
    "",
    `- 志賀町 公式サイト: ${OFFICIAL_TOWN_URL}`,
    "- 志賀町観光協会 / 石川県観光連盟の公式ページ",
    "- 各生産者団体・施設の公式サイト",
    "",
    "### 特に注意すること",
    "",
    `- ${AVAILABILITY_NOTICE}`,
    "- 「日本最古」「世界一」「日本三大」などの表現は、出典と認定機関を必ず確認する。",
    "- `エリア` 欄が「志賀町」以外のものは、志賀町の特産と誤解されない書き方になっているか確認する。",
    "",
  ];

  for (const genre of GENRE_ORDER) {
    const meta = GENRES[genre];
    const cards = CARDS.filter((c) => c.genre === genre);
    const done = cards.filter((c) => c.verified).length;

    lines.push(
      "",
      `## ${meta.icon} ${meta.fullLabel}（${cards.length}種 / 確認済み ${done}種）`,
      "",
      "| # | ID | カード名 | エリア | 確認すべき点 | 確認済み |",
      "|---|----|----------|--------|--------------|----------|"
    );

    for (const c of cards) {
      lines.push(
        `| ${c.no} | \`${c.id}\` | ${cell(c.name)} | ${cell(c.area)} | ${cell(
          c.checkPoint
        )} | ${c.verified ? "✅" : "⬜"} |`
      );
    }

    lines.push("", "<details><summary>記載本文（クリックで展開）</summary>", "");
    for (const c of cards) {
      lines.push(
        `**${c.no}. ${c.name}（${c.kana}）** — ${c.area}`,
        "",
        `- 紹介: ${c.summary}`,
        `- ペアリング: ${c.pairing}`,
        `- お酒抜き: ${c.kidsNote}`,
        `- 豆知識: ${c.trivia}`,
        ""
      );
    }
    lines.push("</details>", "");
  }

  return lines.join("\n");
}

// ───────────────────────── docs/qr-list.md ─────────────────────────

function buildQrList(): string {
  const spots = CARDS.filter((c) => c.spotId);

  const lines: string[] = [
    "# 現地掲示用 QRコード URL一覧",
    "",
    "> このファイルは `npm run gen:docs` で自動生成されます。",
    "",
    "各スポットに掲示するQRコードには、下の「QR用URL」をそのまま埋め込んでください。",
    "読み取ると、ホーム画面が開いて自動的にコインが加算されます。",
    "",
    "## 使い方",
    "",
    "1. `<公開URL>` を実際の公開先に置き換える",
    "   - 例: `https://ユーザー名.github.io/shika-meguri`",
    "2. 各行のURLをQRコード生成サービス等でQR画像にする",
    "3. 掲示物に印刷して現地に設置する",
    "",
    "## コインの付与ルール",
    "",
    "- 初めて読み取ったスポット: **+3コイン**",
    "- 同じスポットの再読み取り: **24時間に1回 +1コイン**",
    "- クールダウン中の読み取り: 0コイン（画面に次回可能時刻を表示）",
    "",
    `## 一覧（全${spots.length}スポット）`,
    "",
    "| # | スポット名 | spotId | QR用URL |",
    "|---|-----------|--------|---------|",
  ];

  for (const c of spots) {
    lines.push(
      `| ${c.no} | ${cell(c.name)} | \`${c.spotId}\` | \`<公開URL>/?spot=${c.spotId}\` |`
    );
  }

  lines.push(
    "",
    "## 動作確認",
    "",
    "ローカルで確かめる場合は、開発サーバーを起動して次のURLを開いてください。",
    "",
    "```",
    `http://localhost:3000/?spot=${spots[0]?.spotId ?? "ganmon"}`,
    "```",
    ""
  );

  return lines.join("\n");
}

// ───────────────────────── public/cards/README.md ─────────────────────────

function buildImageList(): string {
  const lines: string[] = [
    "# カード画像の置き場所",
    "",
    "> このファイルは `npm run gen:docs` で自動生成されます。",
    "",
    "このフォルダに下記のファイル名で画像を置くと、カードに自動で反映されます。",
    "画像が無いカードは、ジャンル色のプレースホルダー（番号入り）が表示されます。",
    "**画像を用意していなくてもアプリは正常に動きます。**",
    "",
    "## 推奨仕様",
    "",
    "- 形式: JPEG（写真）または PNG",
    "- サイズ: 正方形 800 × 800 ピクセル程度",
    "- 容量: 1枚あたり 200KB 以下を目安（50枚ぶんの合計が読み込み時間に効きます）",
    "",
    "## 権利について",
    "",
    "公開するアプリに載せる画像は、**必ず利用許諾を得たもの**を使ってください。",
    "撮影者・提供元を記録しておき、必要に応じてアプリ内にクレジットを表示できるようにしておくことを推奨します。",
    "",
    "## ファイル名一覧",
    "",
    "| ファイル名 | カード名 |",
    "|-----------|----------|",
  ];

  for (const c of CARDS) {
    const filename = c.image.replace(/^cards\//, "");
    lines.push(`| \`${filename}\` | ${cell(c.name)} |`);
  }

  lines.push("");
  return lines.join("\n");
}

// ───────────────────────── データの整合性チェック ─────────────────────────

function validate(): string[] {
  const errors: string[] = [];

  const ids = new Set<string>();
  const nos = new Set<number>();
  const spotIds = new Set<string>();

  for (const c of CARDS) {
    if (ids.has(c.id)) errors.push(`IDが重複: ${c.id}`);
    ids.add(c.id);

    if (nos.has(c.no)) errors.push(`図鑑番号が重複: ${c.no}（${c.name}）`);
    nos.add(c.no);

    if (c.spotId) {
      if (spotIds.has(c.spotId)) errors.push(`spotIdが重複: ${c.spotId}`);
      spotIds.add(c.spotId);
    }

    if (c.genre === "spot" && !c.spotId) {
      errors.push(`スポットなのに spotId が無い: ${c.id}（${c.name}）`);
    }
    if (c.genre !== "spot" && c.spotId) {
      errors.push(`スポット以外に spotId がある: ${c.id}（${c.name}）`);
    }
    if (!c.id.startsWith(GENRES[c.genre].prefix)) {
      errors.push(`IDの接頭辞がジャンルと一致しない: ${c.id}`);
    }
    if (c.image !== `cards/${c.id}.jpg`) {
      errors.push(`画像パスが規則と違う: ${c.id} → ${c.image}`);
    }
    for (const [key, value] of Object.entries(c)) {
      if (typeof value === "string" && value.trim() === "") {
        errors.push(`空欄がある: ${c.id} の ${key}`);
      }
    }
  }

  for (let n = 1; n <= TOTAL_CARDS; n++) {
    if (!nos.has(n)) errors.push(`図鑑番号が抜けている: ${n}`);
  }

  const counts = GENRE_ORDER.map(
    (g) => `${GENRES[g].label}=${CARDS.filter((c) => c.genre === g).length}`
  );
  console.log(`  ジャンル別枚数: ${counts.join(" / ")}`);

  return errors;
}

// ───────────────────────── 実行 ─────────────────────────

console.log(`カードデータ: 全${TOTAL_CARDS}種`);

const errors = validate();
if (errors.length > 0) {
  console.error("\nデータに問題があります:");
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log("  整合性チェック: 問題なし");

write("docs/card-facts.md", buildCardFacts());
write("docs/qr-list.md", buildQrList());
write("public/cards/README.md", buildImageList());

const unverified = CARDS.filter((c) => !c.verified).length;
if (unverified > 0) {
  console.log(
    `\n⚠ 未確認のカードが ${unverified} 件あります。公開前に docs/card-facts.md を確認してください。`
  );
}
