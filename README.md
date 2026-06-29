# simsfp-diary

シムズフリープレイのアップデートを、自分のプレイ結果で詳しく記録するサイトです。

## 公開サイト


|           | URL                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------- |
| **公開サイト** | [https://tain79998-glitch.github.io/simsfp-diary/](https://tain79998-glitch.github.io/simsfp-diary/) |
| **リポジトリ** | [https://github.com/tain79998-glitch/simsfp-diary](https://github.com/tain79998-glitch/simsfp-diary) |


## 2つの画面


| ページ       | URL          | 用途              |
| --------- | ------------ | --------------- |
| **公開サイト** | `index.html` | 訪問者向け（閲覧のみ）     |
| **管理画面**  | `admin.html` | あなた専用（投稿の作成・編集） |


公開サイトには管理ボタンはありません。投稿作業は `admin.html` で行います。

---

## ブラウザで動かす（重要）

`index.html` を Finder からダブルクリックして開く（`file:///...`）方法では、  
JS の読み込みや画面遷移が正しく動かないことがあります。

**必ず Web サーバー経由で開いてください。**

### 方法 A: 同じ PC のブラウザで試す（ローカル）

ターミナルで:

```bash
cd projects/simsfp-diary
npm start
```

（`npm` がない場合）

```bash
cd projects/simsfp-diary
npx serve .
```

（Python だけある場合）

```bash
cd projects/simsfp-diary
python3 -m http.server 3000
```

ブラウザで次を開きます:


| 画面    | URL                                                                  |
| ----- | -------------------------------------------------------------------- |
| 公開サイト | [http://localhost:3000/](http://localhost:3000/)                     |
| 管理画面  | [http://localhost:3000/admin.html](http://localhost:3000/admin.html) |


`serve` のポート番号が違う場合は、ターミナルに表示された URL を使ってください。

#### サーバーの止め方

ブラウザのタブを閉じても、サーバーは動き続けます。止めるには:

1. サーバーを起動した**ターミナル**を開く
2. `**Ctrl + C**` を押す

これで `http://localhost:3000/` は開けなくなります。  
ターミナルウィンドウを閉じてもサーバーは止まります。

### 方法 B: インターネットに公開する（GitHub Pages）

スマホや友人にも見せたい場合はこちらです。

**1. GitHub にリポジトリを作る**

[GitHub](https://github.com/new) で新規リポジトリを作成（例: `simsfp-diary`）

**2. プロジェクトを push**

```bash
cd projects/simsfp-diary
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/simsfp-diary.git
git push -u origin main
```

> `admin-config.js` は `.gitignore` 済みなので push されません（安全）。

**3. GitHub Pages を有効化**

1. リポジトリの **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main` / `/ (root)`
4. **Save**

数分後、次の URL で公開されます:

- 公開サイト: [https://tain79998-glitch.github.io/simsfp-diary/](https://tain79998-glitch.github.io/simsfp-diary/)
- 管理画面: [https://tain79998-glitch.github.io/simsfp-diary/admin.html](https://tain79998-glitch.github.io/simsfp-diary/admin.html)

> 無料プランで GitHub Pages を使うには、リポジトリを **Public** にする必要があります。

**4. 管理画面のセットアップ（公開後）**

GitHub Pages 上では `admin-config.js` は含まれないため、  
公開後に **ローカルで** `admin-config.js` を用意した状態で `admin.html` を開くか、  
デプロイ用に別途設定が必要です。

**おすすめ運用:**

- **記事の編集** → ローカルで `npm start` → `admin.html` で編集
- **公開** → `updates.js` を更新して GitHub に push → 全員に反映

---

## 起動方法（ローカル）

```bash
cd projects/simsfp-diary
npx serve .
```

- 公開サイト: `http://localhost:3000/`
- 管理画面: `http://localhost:3000/admin.html`

## 初回セットアップ（管理画面）

```bash
cp admin-config.example.js admin-config.js
```

`admin-config.js` の `passphrase` を自分だけのパスコードに変更してください（Git 管理外）。

## 記事の作成・編集

1. `admin.html` を開く
2. パスコードでログイン
3. **＋ 新規投稿** または一覧の **編集**
4. **下書き** にチェック → 公開サイトには表示されない
5. チェックを外して保存 → `updates.js` に反映後、全員に公開

### 保存の仕組み


| 保存先          | 見える範囲                  |
| ------------ | ---------------------- |
| 管理画面での保存     | あなたのブラウザ（localStorage） |
| `updates.js` | すべての訪問者                |


**他の人にも見せる手順:**

1. 管理画面で **エクスポート**（JSON ダウンロード）
2. 内容を `updates.js` の `ENTRIES` に反映
3. GitHub に push

## ファイル構成

```
simsfp-diary/
├── index.html          # 公開サイト（利用者向け）
├── admin.html          # 管理画面（管理者向け）
├── app.js              # 公開サイトの表示
├── admin-app.js        # 管理画面のロジック
├── common.js           # 共通ユーティリティ
├── public-store.js     # 公開用データ読み込み
├── data-store.js       # 管理用データ読み書き
├── updates.js          # 公開記事データ（Git 管理）
├── admin-config.js     # パスコード（Git 管理外）
├── style.css           # 共通スタイル
├── admin.css           # 管理画面スタイル
└── images/
```

## GitHub Pages で公開

- 公開サイト: [https://tain79998-glitch.github.io/simsfp-diary/（`index.html`](https://tain79998-glitch.github.io/simsfp-diary/（`index.html`) がトップ）
- `admin.html` は URL を知っている人だけアクセス可能（検索エンジンには `noindex`）

## 要件定義

[docs/requirements.md](docs/requirements.md)