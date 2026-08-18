/**
 * public/ 配下のファイルを参照するときは必ずこの関数を通す。
 *
 * GitHub Pages では URL に "/shika-meguri" のようなサブパスが挟まる。
 * next/link や next/image は basePath を自動で付けてくれるが、
 * 生の <img src> や CSS の url() は付かないため、ここで明示的に付ける。
 * これを忘れると本番だけ画像が 404 になる（最も起きやすい事故）。
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return `${BASE_PATH}/${path.replace(/^\/+/, "")}`;
}

/** QRコードに埋め込む絶対URLを組み立てる（ブラウザ上でのみ使用） */
export function spotUrl(spotId: string): string {
  if (typeof window === "undefined") return `${BASE_PATH}/?spot=${spotId}`;
  return `${window.location.origin}${BASE_PATH}/?spot=${spotId}`;
}

export { BASE_PATH };
