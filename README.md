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

> `admin-config.js` はリポジトリに含まれます（パスコードはハッシュ化）。GitHub トークンは各端末のブラウザにのみ保存されます。

**3. GitHub Pages を有効化**

1. リポジトリの **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main` / `/ (root)`
4. **Save**

数分後、次の URL で公開されます:

- 公開サイト: [https://tain79998-glitch.github.io/simsfp-diary/](https://tain79998-glitch.github.io/simsfp-diary/)
- 管理画面: [https://tain79998-glitch.github.io/simsfp-diary/admin.html](https://tain79998-glitch.github.io/simsfp-diary/admin.html)

> 無料プランで GitHub Pages を使うには、リポジトリを **Public** にする必要があります。

**4. 別の端末から管理画面を使う（GitHub 連携）**

スマホなど別端末からも記事を書けるようにするには、管理画面で **GitHub 連携** を設定します。

1. 管理画面にログイン（パスコードは `admin-config.js` に設定）
2. **GitHub連携** を開く
3. GitHub の [Personal Access Token](https://github.com/settings/tokens) を作成
   - **Fine-grained token** 推奨
   - 対象リポジトリ: `simsfp-diary`
   - 権限: **Contents** の Read and write
4. トークンを入力して **連携する**

連携後は、記事の保存がそのまま `updates.js` に反映され、数分後に公開サイトへ載ります。  
トークンは各端末のブラウザに1回だけ保存されます（GitHub には送られません）。

**おすすめ運用:**

- **記事の編集** → どの端末でも `admin.html` を開く（GitHub Pages またはローカル）
- **公開** → 保存すると自動で GitHub に反映（連携時）／未連携時は手動で `updates.js` を push

---

## 起動方法（ローカル）

```bash
cd projects/simsfp-diary
npx serve .
```

- 公開サイト: `http://localhost:3000/`
- 管理画面: `http://localhost:3000/admin.html`

## 初回セットアップ（管理画面）

`admin-config.js` にパスコード（ハッシュ）と GitHub リポジトリ情報が入っています。  
初回ログイン後、別端末から編集する場合は **GitHub連携** でトークンを設定してください。

パスコードを変えるときは、新しい文字列の SHA-256 ハッシュを `passphraseHash` に設定します。

```bash
python3 -c "import hashlib; print(hashlib.sha256('新しいパスコード'.encode()).hexdigest())"
```

> パスコードは完全な秘密にはなりません（リポジトリが Public のため）。  
> なりすまし防止と偶然のアクセス防止程度の用途です。本格的な保護には GitHub トークンの管理が重要です。

## 記事の作成・編集

1. `admin.html` を開く（ローカルまたは GitHub Pages）
2. パスコードでログイン
3. 初回のみ **GitHub連携** でトークンを設定（別端末でも同様に1回ずつ）
4. **＋ 新規投稿** または一覧の **編集**
5. **下書き** にチェック → 公開サイトには表示されない
6. **保存する** → GitHub 連携時は自動公開／未連携時はエクスポートして手動反映

### 保存の仕組み

| モード | 保存先 | 見える範囲 |
|--------|--------|-----------|
| GitHub 連携あり | `updates.js`（GitHub 経由） | すべての訪問者 |
| GitHub 連携なし | ブラウザ（localStorage） | その端末だけ |

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
├── updates-builder.js  # updates.js の生成・解析
├── github-sync.js      # GitHub API 連携
├── updates.js          # 公開記事データ（Git 管理）
├── admin-config.js     # パスコードと GitHub 設定
├── style.css           # 共通スタイル
├── admin.css           # 管理画面スタイル
└── images/
```

## GitHub Pages で公開

- 公開サイト: [https://tain79998-glitch.github.io/simsfp-diary/（`index.html`](https://tain79998-glitch.github.io/simsfp-diary/（`index.html`) がトップ）
- `admin.html` は URL を知っている人だけアクセス可能（検索エンジンには `noindex`）

## 要件定義

[docs/requirements.md](docs/requirements.md)