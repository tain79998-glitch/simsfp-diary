// ===== サイト設定 =====
// サイト名や説明文はここを編集してください。

const SITE = {
  title: "慎一郎の simsfreeplay 日記",
  tagline: "公式サマリでは分からないことを、自分のプレイ結果で記録しています。",
  author: "慎一郎",
};

// ===== 記事データ =====
// 新しいアップデート記事を追加するときは、ENTRIES の先頭にオブジェクトを追加してください。
// 下の template-entry をコピーして使えます。

const UPDATES = {
  ENTRIES: [
    {
      id: "verify-2026",
      draft: false,
      date: "2026-06-28",
      version: "検証用",
      title: "【検証】無料運用テスト記事",
      summary: "ローカルサーバーと GitHub Pages の動作確認用です。問題なければ削除して構いません。",
      official: {
        text: "この記事はサイトの無料運用が実際に動くか確認するためのサンプルです。",
        url: "https://github.com/pages",
        label: "GitHub Pages について",
      },
      verified: {
        intro: "公開サイトに記事が表示され、詳細ページへ遷移できれば OK です。",
        sections: [
          {
            heading: "確認ポイント",
            items: [
              "一覧にこの記事が表示される",
              "タップ（クリック）で詳細が開く",
              "スマホ幅でも読みやすい",
            ],
          },
        ],
      },
      screenshots: [
        {
          src: "images/placeholder.svg",
          alt: "プレースホルダー画像",
          caption: "実際の記事ではゲームのスクリーンショットを置きます。",
        },
      ],
      conclusion: "この記事が見えていれば、無料構成での公開は問題なく動いています。",
    },
    {
      id: "template-entry",
      draft: true,
      date: "2026-06-28",
      version: "v5.xx.x",
      title: "【テンプレート】アップデート詳細メモ",
      summary: "この記事はテンプレートです。内容を書き換えて draft: false にしてください。",
      official: {
        text: "（公式が発表しているサマリを2〜3行で要約）",
        url: "https://example.com/official-announcement",
        label: "公式告知を見る",
      },
      verified: {
        intro: "（任意）今回のアップデートで特に確認したポイントを1文で。",
        sections: [
          {
            heading: "追加・変更された要素",
            items: [
              "（例）新イベント「〇〇」が開始",
              "（例）新アイテムがショップに追加",
            ],
          },
          {
            heading: "操作・進め方",
            steps: [
              "（例）ホーム画面の通知バナーをタップ",
              "（例）クエストを順番にクリアしていく",
            ],
          },
          {
            heading: "気づいた注意点",
            items: [
              "（例）イベント期限は〇月〇日まで",
              "（例）特定の建物が必要",
            ],
          },
        ],
      },
      screenshots: [
        {
          src: "images/placeholder.svg",
          alt: "スクリーンショットのプレースホルダー",
          caption: "（キャプション）例: 新イベント画面。右上から参加できる。",
        },
      ],
      conclusion: "（まとめ）例: 今回は新イベントがメイン。早めに参加すると報酬を取りやすい。",
    },
  ],
};

/*
===== 記事オブジェクトの型（コピー用テンプレート） =====

{
  id: "2026-06-28-v5-xx-x",     // 英数字とハイフン（URL に使われます）
  draft: false,                  // true = 下書き（一覧に表示されるが dashed 枠）
  date: "2026-06-28",            // 更新日（YYYY-MM-DD）
  version: "v5.xx.x",            // ゲームのバージョン
  title: "アップデート詳細メモ",
  summary: "一覧に表示する1行概要",
  official: {
    text: "公式サマリの要点",
    url: "https://...",          // 公式告知の URL
    label: "公式告知を見る",
  },
  verified: {
    intro: "（任意）導入文",
    sections: [
      { heading: "見出し", items: ["箇条書き1", "箇条書き2"] },
      { heading: "見出し", steps: ["手順1", "手順2"] },
      { heading: "見出し", body: "段落テキスト（items/steps の代わり）" },
    ],
  },
  screenshots: [
    { src: "images/ファイル名.png", alt: "説明", caption: "キャプション" },
  ],
  conclusion: "まとめ",
},

*/
