# ナルボル体験談サイト — Claude Code カスタマイズガイド

このファイルはClaude Codeが自動的に読み込みます。
「〇〇を変えて」「〇〇を追加して」と伝えるだけで、このガイドを参照して実装します。

---

## プロジェクト概要

NARUTO・BORUTOファンの体験談を収集・公開する静的Webサイト。
技術スタック: **Astro（静的サイト）+ JSON（データ管理）+ GitHub Pages（ホスティング）**

---

## ファイル構成

```
naruboru-fan-site/
├── src/
│   ├── data/
│   │   └── stories.json        ★ 投稿データ（ここを編集して投稿を追加・削除）
│   ├── pages/
│   │   ├── index.astro          トップページ
│   │   ├── stories/
│   │   │   ├── index.astro      体験談一覧ページ
│   │   │   └── [id].astro       体験談詳細ページ（動的ルーティング）
│   │   ├── submit.astro         投稿フォームページ
│   │   └── guidelines.astro     投稿ガイドラインページ
│   ├── layouts/
│   │   └── BaseLayout.astro     全ページ共通のHTML骨格（ヘッダー・フッター含む）
│   └── components/
│       └── StoryCard.astro      体験談カードコンポーネント（一覧で使用）
├── public/
│   └── styles/
│       └── global.css           ★ 全スタイル（色・フォント・レイアウトはここで変更）
├── astro.config.mjs             Astroの設定（GitHub Pages URLもここ）
├── package.json
└── CLAUDE.md                    このファイル
```

---

## よくあるカスタマイズ依頼と変更箇所

### 「投稿を追加したい」
→ `src/data/stories.json` に1件分のオブジェクトを追加する

#### スプレッドシート列 → stories.json フィールド対応表

| スプレッドシート列 | フィールド | 備考 |
|---|---|---|
| タイムスタンプ | （無視） | |
| Q1. 表示名 | `displayName` | |
| Q2. X ID | （保存しない） | 連絡用のみ・非公開 |
| Q4. 年齢層 | `ageGroup` | 〜10歳/10代/20代/30代/40代以上/覚えていない |
| Q5. 推し・好きなキャラクター | `favoriteCharacter` | |
| Q6. 最初に触れた作品 | `firstSeries` | "NARUTO" or "BORUTO" に正規化 |
| Q7. 最初のメディア | `firstMedia` | |
| Q8. 体験談 | `mainStory` | |
| Q9. 好きなシーン・セリフ | `favoriteScene` | |
| Q10. 観てみたい作品 | `futureWish` | |
| Q11. キャッチコピー | `message` | 投稿者の原文をそのまま入れる |
| 同意事項 | （無視） | |
| Q3. お住まいの国 | `country` | 列位置に注意（Q3なのに末尾に近い） |
| 画像URL | `imageUrl` | なければnull |

> ⚠️ **`catchphrase`（カードの大見出し）は運営が編集する**
> `mainStory` の内容を読んで、一覧カードに映える一文を運営側で考えて入力する。
> 投稿者のQ11テキスト（`message`）とは別物。

**投稿データの型定義:**
```json
{
  "id": "story-XXX",               // 一意のID（重複不可）
  "displayName": "表示名",
  "ageGroup": "10代",              // 〜10歳/10代/20代/30代/40代以上/覚えていない
  "favoriteCharacter": "キャラ名", // 任意
  "firstSeries": "NARUTO",         // "NARUTO" または "BORUTO"
  "firstMedia": "TVアニメ",        // 漫画（連載・単行本）/ TVアニメ / 映画 / 二次創作 / その他
  "catchphrase": "一覧カードの大見出し（運営が編集して記入）",
  "mainStory": "体験談（Q8）",
  "triggerScene": null,            // 旧フォーム用（後方互換）新規はnull
  "realization": null,             // 旧フォーム用（後方互換）新規はnull
  "currentRelationship": null,     // 旧フォーム用（後方互換）新規はnull
  "favoriteScene": "好きなシーン・セリフ（Q9）",
  "futureWish": "観てみたい作品（Q10）",
  "message": "投稿者のキャッチコピー原文（Q11）",  // 詳細ページ「ひとこと」に表示
  "imageUrl": null,
  "imageCaption": null,
  "country": "日本",               // Q3（列は末尾付近に注意）
  "publishedAt": "2025-01-01",     // 公開日（表示順に影響）
  "isSeedContent": false           // 運営作成のサンプルはtrue
}
```

**表示ロジック（詳細ページ）:**
- `mainStory` があれば「体験談」として1ブロック表示（新フォーム形式）
- `mainStory` がなければ `triggerScene` / `realization` / `currentRelationship` を個別表示（旧形式）
- `favoriteScene` / `futureWish` / `message` は条件付き表示（nullなら非表示）

### 「投稿を非公開/削除したい」
→ `src/data/stories.json` から該当オブジェクトを削除するか、ファイルから取り除く

### 「サイトの色を変えたい」
→ `public/styles/global.css` の `:root` 内の変数を変更する
```css
--color-primary: #e8621a;      /* メインカラー（現在: オレンジ） */
--color-accent: #1a1a2e;       /* アクセントカラー（現在: 深い紺） */
--color-primary-light: #fff3ec; /* 背景用薄いカラー */
```

### 「フォント/文字サイズを変えたい」
→ `public/styles/global.css` の `:root` 内:
```css
--font-size-base: 16px;
--line-height: 1.8;
```

### 「ヘッダーのナビゲーションリンクを変えたい」
→ `src/layouts/BaseLayout.astro` の `.site-nav` 内を編集

### 「トップページのキャッチコピーを変えたい」
→ `src/pages/index.astro` の `.hero` セクション内を編集

### 「ガイドラインの内容を変えたい」
→ `src/pages/guidelines.astro` を編集

### 「投稿フォームのTally.so URLを設定したい」
→ `src/pages/submit.astro` の冒頭の変数を更新:
```js
const TALLY_FORM_URL = 'https://tally.so/r/実際のフォームID';
const TALLY_EMBED_URL = 'https://tally.so/embed/実際のフォームID?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1';
```

### 「GitHub Pagesの本番URLを設定したい」
→ `astro.config.mjs` のコメントアウトを外して更新:
```js
site: 'https://GitHubユーザー名.github.io',
base: '/naruboru-fan-site',
```

### 「フッターの著作権表記を変えたい」
→ `src/layouts/BaseLayout.astro` の `.footer-note` を編集

### 「投稿カードのデザインを変えたい」
→ `src/components/StoryCard.astro`（HTML構造）と
   `public/styles/global.css` の `.story-card` 以下（CSS）を編集

### 「サイト全体のページタイトルのサフィックスを変えたい」
→ `src/layouts/BaseLayout.astro` の `<title>` タグ内:
```html
<title>{title} | ナルボル体験談</title>  ← 「ナルボル体験談」部分を変更
```

---

## ローカル開発の起動方法

```bash
cd /Users/Tsubaki/ip-news-analyzer/naruboru-fan-site
npm install   # 初回のみ
npm run dev   # http://localhost:4321 で起動
```

## ビルド & デプロイ

```bash
npm run build   # dist/ フォルダに静的ファイルが生成される
```

GitHub Actionsを使ったデプロイは `.github/workflows/deploy.yml` で自動化済み。
`main` ブランチへのpushで自動デプロイされます。

---

## Googleフォーム → stories.json の更新フロー（運営作業）

1. Googleフォームのスプレッドシートで新規回答を確認
2. 外国語投稿はコンテンツチェックを先に行う（差別・スパム等の確認）
3. スプレッドシートの1行をそのままコピーして Claude Code に貼り付け「追加して」と依頼
4. Claude Code が stories.json に追記・`catchphrase` を編集して記入
5. `DEEPL_API_KEY=... node scripts/translate-stories.mjs` で7言語に翻訳
6. `git push` → GitHub Actions が自動デプロイ

---

## 注意事項

- `stories.json` の `id` フィールドは一意であること（重複するとビルドエラー）
- 画像URLはCloudinary等の外部ホスティングのURLを使用すること
- `publishedAt` の降順（新しい順）で一覧・トップページに表示される
