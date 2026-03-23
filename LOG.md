# 更新ログ

---

## 2026-03-24 — フェーズ1: デプロイ対応・公開前修正

### 対応した課題

#### A-1, A-2: GitHub Pages デプロイ時のリンク・CSS消失バグ修正
- **`astro.config.mjs`**: `site` / `base` 設定の手順コメントを整備。`undefined` をデフォルト値として明示し、設定忘れによる意図しない動作を防止。
- **`src/layouts/BaseLayout.astro`**: CSS パス・ナビゲーションリンク・フッターリンクを `import.meta.env.BASE_URL` ベースの動的パスに変更。GitHub Pages でサブパス（例: `/naruboru-fan-site/`）にデプロイした際もスタイルとリンクが正常に動作するよう修正。

#### B-4: スマートフォンでヘッダーの「体験談を読む」リンクが消える問題修正
- **`public/styles/global.css`**: モバイル（640px以下）で `.site-nav a:first-child { display: none }` を削除し、全ナビリンクを小さめのフォントサイズで両方表示するよう変更。読み専ユーザーのモバイル導線が復活。

#### D-2: フッターの著作権表記不正確問題修正
- **`src/layouts/BaseLayout.astro`**: フッターの著作権表記に池本幹雄先生・小太刀右京先生を追記。また「本サイトは権利者とは一切関係ありません」の文言を追加。

### ビルド確認
- `npm run build` → エラーなし ✅

### デプロイ前に残っている必須作業
1. ~~`astro.config.mjs` の `site` と `base` に実際のGitHubユーザー名・リポジトリ名を設定する~~ ✅ 完了
2. GitHubリポジトリを作成し、Settings > Pages > Source を「GitHub Actions」に変更する

---

## 初期構築 — フェーズ0

- Astro（静的サイト）の全ページ実装（トップ・体験談一覧・詳細・投稿・ガイドライン）
- シードコンテンツ4件を `src/data/stories.json` に収録
- GitHub Actions による自動デプロイワークフロー（`.github/workflows/deploy.yml`）を設置
- `CLAUDE.md` によるカスタマイズガイドを整備
