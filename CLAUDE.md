# ナルボル体験談サイト — Claude Code カスタマイズガイド

このファイルはClaude Codeが自動的に読み込みます。
「〇〇を変えて」「〇〇を追加して」と伝えるだけで、このガイドを参照して実装します。

---

## セッション開始時の必読（最優先）

Claude Code をこのリポジトリで起動したら、**最初に**以下を読み、以降の判断の前提にすること。

1. `SPEC.md`（仕様書）
2. `MEMORY.md`（運用メモリー）
3. `.cursor/rules/*.mdc`（Cursorルール。Cursor内でなくても内容は前提として扱う）

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
├── src/
│   └── components/
│       ├── StoryCard.astro      体験談カードコンポーネント（一覧で使用）
│       └── FlagIcon.astro       SVG国旗アイコン（JP/BR/KR/TH/GB/US/CN/FR/DE/IT）
├── src/
│   └── i18n/
│       └── ui.ts                全翻訳キー辞書（8言語: ja/en/fr/ar/es/pt/zh/ko）
├── scripts/
│   └── translate-stories.mjs    DeepL翻訳スクリプト（国名は辞書優先）
├── astro.config.mjs             Astroの設定（GitHub Pages URLもここ）
├── package.json
└── CLAUDE.md                    このファイル
```

### 多言語対応メモ
- **日本語版**: `src/pages/*.astro`（ルート直下）
- **海外版7言語**: `src/pages/[lang]/*.astro`（en/fr/ar/es/pt/zh/ko）
- 共通翻訳キー: `src/i18n/ui.ts` の `useTranslations(lang)` で `t('key', vars)` 呼び出し
- 国旗表示: 絵文字を避け、`<FlagIcon code="JP" />` を使用（Windows Chrome対応）
- 国名の DeepL 誤訳を避けるため、`translate-stories.mjs` の `COUNTRY_BY_CODE` 辞書を優先使用（`country` フィールドは DeepL スキップ）

### フッターナビの構成（BaseLayout.astro）
- ホーム / 体験談一覧 / 推し一覧 / **PROJECT 100** / 投稿ガイドライン / プライバシー / このサイトについて / 投稿する
- ※ ファンデータページ (`/data`) はフッターから非表示（実装は残っている）

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

#### 投稿追加時に必ず出力する付帯情報

stories.json への追記が完了したら、以下を **毎回セットで出力すること**。

**① 本番ポスト文案**（X・公開当日22時前後想定・URL付き）

構造:
1. 冒頭1-2行: 投稿者の決意 or 状況の意外性（鍵括弧 or 情景）
2. 空行
3. 中盤: 物語の圧縮弧（出会い/転機/現在）＋鍵括弧の引用
4. 空行
5. 「この声が◯人目です。」
6. URL単独行（`https://naruboru-taiken.github.io/stories/story-XXX`）
7. 空行
8. `#NARUTO #BORUTO #ナルボル体験談`

ルール:
- **絵文字ゼロ**
- ハッシュタグは3固定（`#NARUTO #BORUTO #ナルボル体験談`）
- 個人情報（名前・年齢・国）は出さない
- catchphraseの丸コピはNG。毎回新規に書き下ろす
- 予告を出している場合は、**本番ポストを予告ポストへの自己リプライとして投稿**する（スレッド連結でリーチ伸長）

**② 予告ポスト文案**（事前予告型の場合・前日21-22時投稿想定・URLなし・画像なし）

構造:
1. 「明日◯/◯(曜)◯時（日本時間）、新着投稿を公開します。」
2. 空行
3. 投稿者本人の言葉（鍵括弧で1-2行）
4. 空行
5. 「——◯◯◯に、××な人の話。」
6. 空行
7. `#NARUTO #BORUTO #ナルボル体験談`

ルール:
- 個人情報（名前・年齢・国・「◯人目」）は出さない
- 絵文字ゼロ
- 本番ポストで使う引用とは**別の引用**を選ぶ（予告と本番で2度楽しませる）
- 出会いの情景などの"おいしい所"は予告で出し切らず、本番に温存する
- 冒頭の引用は、読者が**自分の記憶や感情に重ね合わせられる普遍性**を持つものを選ぶ

**③ 画像生成プロンプト**（Gemini Imagen 用・英語）

投稿者が NARUTO/BORUTO に出会った**シチュエーション**を情景として描写する。以下のルールを厳守すること：

- NARUTO・BORUTO のキャラクター・ロゴ・固有名詞を一切含めない
- 「manga」「anime」「comic」「NARUTO」「BORUTO」などIP想起ワードを使わない
  - 代替: manga volumes → `a stack of books` / TV showing anime → `a television casting soft warm glow`
- 人物が登場する場合は **後ろ姿・シルエット・手元のみ**（顔は描写しない）
- 投稿者の性別・年齢が推定できる場合は反映する（例: `a teenage girl's silhouette`, `a young man's hands`）。不明な場合は中性的に
- スタイル指定: `watercolor illustration, seen from behind, no face`
- 全体統一オプション（スタイルを揃えたい場合末尾に追加）: `consistent style, muted warm palette, soft grain texture`

**画像プロンプト参考例**:
> A teenage girl's silhouette sitting among half-unpacked cardboard boxes in a bare new room, a television in the corner casting soft warm glow, late afternoon light through bare windows, quiet atmosphere of new beginnings, watercolor illustration, seen from behind, no face

**④ ①②の文案は必ず以下2観点で検討すること**

- **エンタメ領域SNSマーケプロ視点**: フック強度、アルゴリズム相性（冒頭の引き・改行・可読性）、ハッシュタグ設計、拡散トリガー（共感性・引用可能性）、投稿時間帯、予告→本番のスレッド連結設計
- **エンタメイベントプロデューサー視点**: 物語の温度、感情の解像度、"居合わせたい感"、体験の追体験性、作品世界への没入導線。**予告ポストには必ず本投稿を楽しみにさせる仕組みを設計する**こと（情報の温存／フックの二段構え／想像の余白／"おいしい所"は本番まで見せない／引用の使い分けで2度楽しませる 等）

両観点で磨き込み、**情報を足すより削る**ことを優先すること。

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

### 「投稿フォームのURLを変更したい」
→ `src/pages/submit.astro` の冒頭 `FORM_URL` を更新:
```js
const FORM_URL = 'https://docs.google.com/forms/d/e/.../viewform?embedded=true';
```
※ **現状 Google Forms を iframe 埋め込みで使用**（過去のドキュメントで Tally.so と記載されていた箇所があるが、実態は Google Forms）。`privacy.astro` の storage 記載も Google Forms に合わせること。

### 「アフィリエイトリンクを追加・管理したい」
→ `src/data/affiliate-items.json` に1件追記する

**フィールド説明:**
- `shopType`: `"bandai"` / `"animate"` / `"jump-store"` / `"mercari"` / `"amazon"`
- `matchCharacters`: 体験談の `favoriteCharacter` と一致した場合に表示。空配列 = キャラ条件なし
- `matchSeries`: 体験談の `firstSeries` と一致した場合に表示。空配列 = シリーズ条件なし
- `active`: `false` にすると非表示（URL切れ・在庫切れ時に使用）

```json
{
  "id": "aff-XXX",
  "title": "商品名",
  "shopName": "ショップ名（表示用）",
  "shopType": "bandai",
  "url": "https://...",
  "imageUrl": null,
  "matchCharacters": ["はたけカカシ"],
  "matchSeries": ["NARUTO"],
  "active": true,
  "note": "追加日・メモ"
}
```

体験談詳細ページの「関連グッズ・作品を探す」セクションに最大3件まで自動表示される。

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
