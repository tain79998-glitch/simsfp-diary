// 管理者用設定（リポジトリに含めます）
// パスコードはハッシュで保存します。変更するときは README を参照してください。

const ADMIN_CONFIG = {
  // SHA-256("0000") — 本番運用前にパスコードを変更すること
  passphraseHash: "9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0",
  github: {
    owner: "tain79998-glitch",
    repo: "simsfp-diary",
    branch: "main",
    updatesPath: "updates.js",
  },
};
