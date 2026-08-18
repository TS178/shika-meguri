import type { Genre, GenreMeta } from "./types";

export const GENRE_ORDER: Genre[] = ["gourmet", "spot", "craft"];

export const GENRES: Record<Genre, GenreMeta> = {
  gourmet: {
    id: "gourmet",
    label: "アテ・グルメ",
    fullLabel: "アテ・グルメ",
    description: "日本酒をより美味しくする、志賀町・能登の味。",
    prefix: "gm",
    accent: "#c8912f",
    icon: "🍶",
  },
  spot: {
    id: "spot",
    label: "観光地・スポット",
    fullLabel: "観光地・スポット",
    description: "現地でQRを読むとコインがもらえる、志賀町の名所。",
    prefix: "sp",
    accent: "#1f8fa8",
    icon: "⛩️",
  },
  craft: {
    id: "craft",
    label: "伝統工芸・酒器",
    fullLabel: "伝統工芸品・酒器",
    description: "一杯を格上げする、石川の器と工芸。",
    prefix: "cr",
    accent: "#b7282e",
    icon: "🏺",
  },
};

/** 志賀町の公式サイト。カード個別のURLが無いときのリンク先 */
export const OFFICIAL_TOWN_URL = "https://www.town.shika.lg.jp/";

/** 営業状況などの注意書き。スポット詳細とホームに常時表示する */
export const AVAILABILITY_NOTICE =
  "2024年1月の能登半島地震の影響で、休業中・通行止めの場所があります。おでかけ前に必ず最新の公式情報をご確認ください。";
