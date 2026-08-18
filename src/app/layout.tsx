import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TabBar } from "@/components/TabBar";
import { DraftNotice } from "@/components/DraftNotice";
import { ALL_VERIFIED } from "@/data/cards";

/*
  フォントは外部から読み込まず、端末に入っている日本語フォントを使う。
  日本語のWebフォントは数MBあり、スマホでの初回表示が大きく遅くなるため。
*/

export const metadata: Metadata = {
  title: "志賀町めぐり・お宝ガチャ図鑑",
  description:
    "石川県志賀町を巡ってコインを集め、日本酒を最高に味わうための「アテ・スポット・酒器」全50種を集めるガチャ図鑑アプリ。",

  /*
    カードの記載内容の確認が済むまでは、検索エンジンに載らないようにする。
    未検証の観光情報が検索結果に出ると、それを見た人が現地で困る可能性があるため。

    全50種の確認が終わる（cards.ts の verified がすべて true になる）と、
    自動的に検索エンジンに載るようになる。設定を手で戻す必要はない。

    ※ これは検索避けであって、アクセス制限ではない。
      GitHub Pages で公開したサイトは、URLを知っていれば誰でも見られる。
  */
  robots: {
    index: ALL_VERIFIED,
    follow: ALL_VERIFIED,
  },
};

export const viewport: Viewport = {
  themeColor: "#101620",
  width: "device-width",
  initialScale: 1,
  // ガチャ演出中の誤操作を防ぎつつ、拡大は許可する（読みやすさのため）
  maximumScale: 5,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="bg-washi min-h-full flex flex-col">
        <DraftNotice />
        {/* 下部タブバーの高さぶん余白を確保する */}
        <div className="flex-1 pb-24">{children}</div>
        <TabBar />
      </body>
    </html>
  );
}
