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

**投稿データの型定義:**
```json
{
  "id": "story-XXX",               // 一意のID（重複不可）
  "displayName": "表示名",
  "ageGroup": "10代",              // 〜10歳/10代/20代/30代/40代以上/覚えていない
  "favoriteCharacter": "キャラ名", // 任意
  "firstWork": ["NARUTOアニメ"],   // 配列。選択肢: NARUTOアニメ/NARUTO漫画/BORUTOアニメ/BORUTO漫画/二次創作/その他
  "catchphrase": "キャッチコピー", // 必須。カードのメインテキストになる
  "triggerScene": "ハマったシーン",
  "realization": "気づいた瞬間",
  "currentRelationship": "今の関係", // 任意
  "message": "一言メッセージ",       // 任意
  "imageUrl": null,                  // 画像URLまたはnull
  "imageCaption": null,              // 画像の説明またはnull
  "publishedAt": "2025-01-01",       // 公開日（表示順に影響）
  "isSeedContent": false             // 運営作成のサンプルはtrue
}
```

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

## Airtable → stories.json の更新フロー（運営作業）

1. Airtableで投稿を「公開中」ステータスに変更
2. 「公開中」ビューのレコードをJSONエクスポート（またはAPIで取得）
3. `src/data/stories.json` を上記データで更新
4. GitHubにpush → GitHub Actionsが自動でサイトを再ビルド・デプロイ

---

## 注意事項

- `stories.json` の `id` フィールドは一意であること（重複するとビルドエラー）
- 画像URLはCloudinary等の外部ホスティングのURLを使用すること
- `publishedAt` の降順（新しい順）で一覧・トップページに表示される
