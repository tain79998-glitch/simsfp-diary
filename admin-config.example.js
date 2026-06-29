// 管理者用設定の例
// admin-config.js を編集してパスコードを変更してください。

const ADMIN_CONFIG = {
  passphraseHash: "ここに SHA-256 ハッシュを設定",
  github: {
    owner: "あなたのユーザー名",
    repo: "simsfp-diary",
    branch: "main",
    updatesPath: "updates.js",
  },
};
