/**
 * GitHub Pages と同じ条件（サブパス付き）でビルドし、ローカルで確認する。
 *
 *   npm run build:pages       … out/ に書き出すだけ
 *   npm run preview:pages     … 書き出したあと、本番と同じURL構造で配信して確認する
 *
 * 本番の GitHub Pages では URL が
 *   https://ユーザー名.github.io/shika-meguri/
 * のようにリポジトリ名ぶんの階層が挟まる。
 * この階層を考慮し忘れると、本番でだけ画像やCSSが読めなくなる。
 * ローカルでも同じ条件を再現し、公開前に気づけるようにするためのスクリプト。
 *
 * Windows と macOS/Linux で環境変数の書き方が違うため、Node側で設定している。
 * 配信サーバーもNode標準機能だけで書いてあり、追加のダウンロードは発生しない。
 */
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import {
  createReadStream,
  existsSync,
  rmSync,
  cpSync,
  statSync,
  readdirSync,
  renameSync,
} from "node:fs";
import { join, extname, resolve } from "node:path";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/shika-meguri";
const shouldServe = process.argv.includes("--serve");
const PORT = 4321;

// ───────────────────────── ビルド ─────────────────────────

console.log(`サブパス "${BASE_PATH}" 付きでビルドします...\n`);

const build = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: BASE_PATH },
});

if (build.status !== 0) {
  console.error("\nビルドに失敗しました。");
  process.exit(build.status ?? 1);
}

console.log(`\n✓ out/ に書き出しました（サブパス: ${BASE_PATH}）`);

if (!shouldServe) {
  console.log("\n本番と同じパスで確認するには:  npm run preview:pages\n");
  process.exit(0);
}

// ───────────────────────── 本番と同じURL構造で配信 ─────────────────────────

// out/ をサブパスの下に置いた状態を作る（.preview/shika-meguri/... ）
const previewRoot = resolve(".preview");
rmSync(previewRoot, { recursive: true, force: true });
cpSync("out", join(previewRoot, BASE_PATH), { recursive: true });

/**
 * Windows でビルドしたときだけ必要になる後始末。
 *
 * Next.js 16.3.1 には、画面遷移を速くするための小さなデータファイルの名前を
 * 組み立てる際、Windowsのフォルダ区切り文字（\）を変換し忘れる不具合がある。
 * 本来 `__next.gacha.__PAGE__.txt` という1つのファイルであるべきものが、
 * `__next.gacha` というフォルダの中の `__PAGE__.txt` として出力されてしまう。
 *
 * GitHub Actions は Linux で動くため公開後の動作には影響しないが、
 * ローカルでの確認が本番と食い違ってしまうので、ここで正しい名前に直しておく。
 * （直さなくても画面遷移自体は普通のページ読み込みに切り替わって動作する）
 */
function flattenSegmentFiles(dir: string): number {
  let fixed = 0;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (!entry.isDirectory()) continue;

    if (entry.name.startsWith("__next.")) {
      // このフォルダの中身を、フォルダ名と連結したファイル名にして親へ移す
      for (const inner of readdirSync(full, { withFileTypes: true })) {
        if (inner.isDirectory()) continue;
        renameSync(
          join(full, inner.name),
          join(dir, `${entry.name}.${inner.name}`)
        );
        fixed++;
      }
      rmSync(full, { recursive: true, force: true });
      continue;
    }

    fixed += flattenSegmentFiles(full);
  }

  return fixed;
}

if (process.platform === "win32") {
  const fixed = flattenSegmentFiles(join(previewRoot, BASE_PATH));
  if (fixed > 0) {
    console.log(
      `  Windows向けの補正: 画面遷移用データ ${fixed}件のファイル名を修正しました`
    );
  }
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

const server = createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
  let filePath = join(previewRoot, urlPath);

  // ディレクトリなら index.html を返す（trailingSlash: true の挙動に合わせる）
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }
  // 拡張子なしなら .html も試す
  if (!existsSync(filePath) && existsSync(`${filePath}.html`)) {
    filePath = `${filePath}.html`;
  }

  if (!existsSync(filePath)) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end(`404 Not Found: ${urlPath}`);
    console.log(`  404  ${urlPath}`);
    return;
  }

  res.writeHead(200, {
    "content-type": MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream",
  });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(
    `\nローカル配信を開始しました。ブラウザで次のURLを開いてください:\n` +
      `  http://localhost:${PORT}${BASE_PATH}/\n\n` +
      `画像・CSS・画面遷移が崩れていなければ、GitHub Pages でも正しく動きます。\n` +
      `404 が出たファイルはこのログに表示されます。\n\n` +
      `終了するには Ctrl+C\n`
  );
});
