/** カードの3ジャンル */
export type Genre = "gourmet" | "spot" | "craft";

export interface Card {
  /** 一意なID。gm=グルメ / sp=スポット / cr=工芸 */
  id: string;
  /** 図鑑番号 1〜50 */
  no: number;
  genre: Genre;
  /** 表示名 */
  name: string;
  /** ふりがな（子ども向け表示に使う） */
  kana: string;
  /** public/cards/ 配下のファイル名。asset() を通して参照すること */
  image: string;
  /** 一行紹介 */
  summary: string;
  /** 日本酒とのペアリングのヒント（大人向け） */
  pairing: string;
  /** お酒を飲まない人・子ども向けの楽しみ方 */
  kidsNote: string;
  /** 豆知識 */
  trivia: string;
  /** 所在エリア。「志賀町」以外の石川県内のものは正直にそう書く */
  area: string;
  /** スポットカードのみ。QRコードの ?spot= に入れる値 */
  spotId?: string;
  /** 個別の公式ページがある場合のみ。無ければ町の公式サイトにフォールバック */
  officialUrl?: string;
  /**
   * 記載内容を公式情報と照合済みか。
   * 初期値は全て false。公開前に docs/card-facts.md を使って確認する。
   */
  verified: boolean;
  /** 特に確認してほしい点（docs/card-facts.md に出力される） */
  checkPoint: string;
}

export interface GenreMeta {
  id: Genre;
  /** タブなどに出す短い名前 */
  label: string;
  /** 正式なジャンル名 */
  fullLabel: string;
  /** ジャンルの説明 */
  description: string;
  /** カードのID接頭辞 */
  prefix: string;
  /** 進捗バーやアクセントに使う色（Tailwindの任意値で使う16進） */
  accent: string;
  /** 絵文字アイコン */
  icon: string;
}
