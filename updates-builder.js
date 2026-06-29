const UpdatesBuilder = {
  TEMPLATE_COMMENT: `/*
===== 記事オブジェクトの型（コピー用テンプレート） =====

{
  id: "2026-06-28-v5-xx-x",
  draft: false,
  date: "2026-06-28",
  version: "v5.xx.x",
  title: "アップデート詳細メモ",
  summary: "一覧に表示する1行概要",
  official: {
    text: "公式サマリの要点",
    url: "https://...",
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

*/`,

  parse(text) {
    const fn = new Function(`${text}; return { SITE, UPDATES };`);
    const result = fn();
    return {
      site: result.SITE,
      entries: result.UPDATES?.ENTRIES || [],
    };
  },

  serialize(site, entries) {
    const siteJson = JSON.stringify(site, null, 2).replace(/^/gm, "  ");
    const entriesJson = JSON.stringify(entries, null, 2)
      .split("\n")
      .map((line, index) => (index === 0 ? line : `    ${line}`))
      .join("\n");

    return `// ===== サイト設定 =====
// サイト名や説明文はここを編集してください。

const SITE = ${siteJson.trim()};

// ===== 記事データ =====
// 新しいアップデート記事を追加するときは、ENTRIES の先頭にオブジェクトを追加してください。
// 下の template-entry をコピーして使えます。

const UPDATES = {
  ENTRIES: ${entriesJson},
};

${this.TEMPLATE_COMMENT}
`;
  },
};
