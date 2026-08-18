import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TabBar } from "@/components/TabBar";

/*
  フォントは外部から読み込まず、端末に入っている日本語フォントを使う。
  日本語のWebフォントは数MBあり、スマホでの初回表示が大きく遅くなるため。
*/

export const metadata: Metadata = {
  title: "志賀町めぐり・お宝ガチャ図鑑",
  description:
    "石川県志賀町を巡ってコインを集め、日本酒を最高に味わうための「アテ・スポット・酒器」全50種を集めるガチャ図鑑アプリ。",
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
        {/* 下部タブバーの高さぶん余白を確保する */}
        <div className="flex-1 pb-24">{children}</div>
        <TabBar />
      </body>
    </html>
  );
}
