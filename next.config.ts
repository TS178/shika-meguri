import type { NextConfig } from "next";

/**
 * GitHub Pages はリポジトリ名のサブパス（例: /shika-meguri/）で配信される。
 * ビルド時に NEXT_PUBLIC_BASE_PATH を渡すと、そのサブパス向けに書き出す。
 * ローカル開発では未設定なので "" になり、http://localhost:3000/ で動く。
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // out/ に静的HTMLを書き出す（サーバー不要）
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  // 画像最適化サーバーが無いため必須
  images: { unoptimized: true },
  // /gacha → /gacha/index.html で解決させる
  trailingSlash: true,
};

export default nextConfig;
