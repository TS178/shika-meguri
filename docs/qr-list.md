# 現地掲示用 QRコード URL一覧

> このファイルは `npm run gen:docs` で自動生成されます。

各スポットに掲示するQRコードには、下の「QR用URL」をそのまま埋め込んでください。
読み取ると、ホーム画面が開いて自動的にコインが加算されます。

## 使い方

1. `<公開URL>` を実際の公開先に置き換える
   - 例: `https://ユーザー名.github.io/shika-meguri`
2. 各行のURLをQRコード生成サービス等でQR画像にする
3. 掲示物に印刷して現地に設置する

## コインの付与ルール

- 初めて読み取ったスポット: **+3コイン**
- 同じスポットの再読み取り: **24時間に1回 +1コイン**
- クールダウン中の読み取り: 0コイン（画面に次回可能時刻を表示）

## 一覧（全20スポット）

| # | スポット名 | spotId | QR用URL |
|---|-----------|--------|---------|
| 21 | 巌門 | `ganmon` | `<公開URL>/?spot=ganmon` |
| 22 | 世界一長いベンチ | `long-bench` | `<公開URL>/?spot=long-bench` |
| 23 | 機具岩 | `hatagoiwa` | `<公開URL>/?spot=hatagoiwa` |
| 24 | ヤセの断崖 | `yase` | `<公開URL>/?spot=yase` |
| 25 | 義経の舟隠し | `funakakushi` | `<公開URL>/?spot=funakakushi` |
| 26 | 旧福浦灯台 | `fukura-lighthouse` | `<公開URL>/?spot=fukura-lighthouse` |
| 27 | 能登金剛遊覧船 | `yuransen` | `<公開URL>/?spot=yuransen` |
| 28 | 増穂浦の桜貝 | `sakuragai` | `<公開URL>/?spot=sakuragai` |
| 29 | 関野鼻 | `sekinohana` | `<公開URL>/?spot=sekinohana` |
| 30 | 福浦港 | `fukura-port` | `<公開URL>/?spot=fukura-port` |
| 31 | 大島海岸 | `oshima` | `<公開URL>/?spot=oshima` |
| 32 | 冨木八幡神社 | `togi-hachiman` | `<公開URL>/?spot=togi-hachiman` |
| 33 | 道の駅 とぎ海街道 | `michinoeki-togi` | `<公開URL>/?spot=michinoeki-togi` |
| 34 | 能登金剛遊歩道 | `kongo-trail` | `<公開URL>/?spot=kongo-trail` |
| 35 | 碁石ヶ峰 | `goishigamine` | `<公開URL>/?spot=goishigamine` |
| 36 | 『ゼロの焦点』文学碑 | `zero-monument` | `<公開URL>/?spot=zero-monument` |
| 37 | 鷹ノ巣岩 | `takanosuiwa` | `<公開URL>/?spot=takanosuiwa` |
| 38 | 巌門の千畳敷 | `senjojiki` | `<公開URL>/?spot=senjojiki` |
| 39 | 腰巻地蔵 | `koshimaki` | `<公開URL>/?spot=koshimaki` |
| 40 | 西海海岸 | `saikai` | `<公開URL>/?spot=saikai` |

## 動作確認

ローカルで確かめる場合は、開発サーバーを起動して次のURLを開いてください。

```
http://localhost:3000/?spot=ganmon
```
