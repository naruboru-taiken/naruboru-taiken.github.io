# ナルボル体験談 — サイト仕様書

> 最終更新: 2026-04-05

---

## 1. サービス概要

| 項目 | 内容 |
|---|---|
| サービス名 | ナルボル体験談 |
| URL | https://naruboru-taiken.github.io |
| 目的 | NARUTO・BORUTOファンの「作品に引き込まれた瞬間」のリアルな体験談を収集・公開する |
| 性質 | 非公式ファンサイト（著作権者と無関係） |
| 運営X | @naruboru_taiken |

---

## 2. 技術スタック

```
┌─────────────────────────────────────────────┐
│            GitHub Pages（ホスティング）         │
│         https://naruboru-taiken.github.io    │
└───────────────────┬─────────────────────────┘
                    │ 静的HTML配信
┌───────────────────▼─────────────────────────┐
│           Astro v4（静的サイトジェネレータ）      │
│  output: 'static' — ビルド時に全ページを生成    │
└──────┬──────────────────────┬───────────────┘
       │                      │
┌──────▼──────┐     ┌─────────▼──────────────┐
│ stories.json │     │  src/i18n/ui.ts         │
│ （投稿データ）│     │  （UI翻訳辞書・8言語）   │
└─────────────┘     └────────────────────────┘
```

### パッケージ構成

| パッケージ | 用途 |
|---|---|
| `astro ^4.16.0` | フレームワーク本体 |
| `satori ^0.26.0` | OGP画像生成（SVG→PNG） |
| `sharp ^0.34.5` | 画像処理 |
| `@fontsource/noto-sans-jp` | OGP画像内の日本語・Latin フォント |
| `@fontsource/noto-sans-kr` | OGP画像内の韓国語フォント |
| `@fontsource/cairo` | OGP画像内のアラビア語フォント（Noto Sans Arabic はsatori非互換のため Cairo を採用） |

---

## 3. ファイル構成

```
naruboru-fan-site/
│
├── src/
│   ├── data/
│   │   └── stories.json        ★ 全投稿データ（唯一のDB）
│   │
│   ├── i18n/
│   │   └── ui.ts               ★ 8言語のUI翻訳辞書
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro    全ページ共通レイアウト（ヘッダー・フッター・言語切替）
│   │
│   ├── components/
│   │   └── StoryCard.astro     体験談カードコンポーネント
│   │
│   └── pages/
│       ├── index.astro          日本語トップ
│       ├── stories/
│       │   ├── index.astro      日本語一覧
│       │   └── [id].astro       日本語詳細（動的）
│       ├── characters.astro     推し一覧（日本語）
│       ├── submit.astro         投稿フォーム（日本語）
│       ├── guidelines.astro     ガイドライン（日本語）
│       ├── privacy.astro        プライバシーポリシー（日本語）
│       ├── ogp.png.ts           共通OGP画像生成（日本語）
│       ├── ogp/
│       │   ├── [id].png.ts      体験談別OGP画像生成（日本語）
│       │   ├── [lang].png.ts    言語別サイトOGP画像生成（7言語）
│       │   └── [lang]/
│       │       └── [id].png.ts  体験談別OGP画像生成（多言語）
│       └── [lang]/              ★ 多言語ページ（自動生成）
│           ├── index.astro
│           ├── stories/
│           │   ├── index.astro
│           │   └── [id].astro
│           ├── characters.astro
│           ├── submit.astro
│           ├── guidelines.astro
│           └── privacy.astro
│
├── public/
│   └── styles/
│       └── global.css          全スタイル
│
├── scripts/
│   ├── translate-stories.mjs   DeepL翻訳スクリプト
│   └── gen-launch-announcement.mjs  SNS告知画像生成（1200×675px、ローカル実行専用）
│
├── .github/
│   └── workflows/
│       └── deploy.yml          自動デプロイ設定
│
├── astro.config.mjs
├── CLAUDE.md                   Claude Code向け運用ガイド
└── SPEC.md                     本ファイル
```

---

## 4. データモデル（stories.json）

全投稿データは `src/data/stories.json` の1ファイルで管理します。DBは使わず、JSONを直接編集します。

### 投稿スキーマ

```json
{
  "id": "story-001",
  "displayName": "表示名",
  "ageGroup": "10代",
  "favoriteCharacter": "うずまきナルト",
  "firstSeries": "NARUTO",
  "firstMedia": "TVアニメ",
  "catchphrase": "カードに表示される一言コピー",
  "mainStory": "体験談本文（新フォーム形式）",
  "triggerScene": "旧フォーム用（後方互換）",
  "realization": "旧フォーム用（後方互換）",
  "currentRelationship": "旧フォーム用（後方互換）",
  "favoriteScene": "好きなシーン・セリフ",
  "futureWish": "観てみたい作品",
  "message": "旧フォーム用・廃止済み（後方互換）",
  "imageUrl": null,
  "imageCaption": null,
  "country": "日本",
  "sourceLang": "ja",
  "publishedAt": "2025-01-01",
  "isSeedContent": false,
  "translations": {
    "en": { "catchphrase": "...", "mainStory": "...", "country": "Japan", ... },
    "fr": { ... },
    "ar": { ... },
    "es": { ... },
    "pt": { ... },
    "zh": { ... },
    "ko": { ... }
  }
}
```

### フィールド解説

| フィールド | 必須 | 説明 |
|---|---|---|
| `id` | ✅ | 一意ID。重複不可（ビルドエラーになる） |
| `displayName` | ✅ | 表示名（X IDは保存しない） |
| `catchphrase` | — | nullの場合は`mainStory`冒頭60文字にフォールバック |
| `mainStory` | — | 新フォーム形式。あれば旧3フィールドより優先 |
| `country` | — | 居住国（自由記述・翻訳される） |
| `sourceLang` | — | 省略時は `"ja"`。外国語投稿は `"pt"` 等を指定。翻訳スクリプトがJAを含む全言語に翻訳する |
| `publishedAt` | ✅ | 表示順に影響（降順） |
| `isSeedContent` | ✅ | 運営作成ならtrue |
| `translations` | — | DeepL翻訳スクリプトが自動生成 |

### 現在のデータ状況

- **総件数**: 21件
- **シードコンテンツ**: 14件（運営作成サンプル）
- **実投稿**: 7件（story-005, 016, 017, 018, 019, 020, 021）
  - story-020: Defensor de Boruto（ブラジル・ポルトガル語投稿、`sourceLang: "pt"`）
  - story-021: "A"（@itami_0513、うちはイタチ、〜10歳、日本）

---

## 5. 多言語化の仕組み

### 対応言語（8言語）

| コード | 言語 | URLパス | 専用フォーム |
|---|---|---|---|
| `ja` | 日本語 | `/`（ルート） | ✅ |
| `en` | English | `/en/` | ✅ |
| `fr` | Français | `/fr/` | ✅ |
| `ar` | العربية | `/ar/` | ✅ |
| `es` | Español | `/es/` | ✅ |
| `pt` | Português | `/pt/` | ✅ |
| `zh` | 中文 | `/zh/` | ✅ |
| `ko` | 한국어 | `/ko/` | ✅ |

### UI翻訳の流れ

```
src/i18n/ui.ts
  └── useTranslations(lang)     → t('nav.read') などのUI文字列を返す
  └── getStoryText(story, lang) → 翻訳済みor原文の体験談テキストを返す
  └── getAgeGroupLabel(age, lang) → 年齢層ラベルを各言語で返す
```

### 体験談の翻訳フロー

```
1. stories.json に投稿を追加（日本語 or 外国語）
        ↓
2. node scripts/translate-stories.mjs を実行
   （DeepL Free API: 500,000文字/月）
   ※ sourceLang が ja の場合 → EN/FR/AR/ES/PT/ZH/KO に翻訳
   ※ sourceLang が ja 以外の場合 → JA を含む全言語に翻訳
        ↓
3. 翻訳結果が story.translations[lang][field] にキャッシュされる
   ※ 翻訳済みフィールドは再翻訳しない（API節約）
        ↓
4. ビルド時に各言語ページが自動生成される
```

### RTL（右→左）対応

アラビア語（ar）のみ `<html dir="rtl">` を付与し、CSSで左右レイアウトを反転。

---

## 6. ページ構成（～200ページ）

### 日本語（ルート `/`）

| URL | ページ |
|---|---|
| `/` | トップ |
| `/stories` | 体験談一覧 |
| `/stories/[id]` | 体験談詳細（21件×1言語） |
| `/characters` | 推し一覧 |
| `/submit` | 投稿フォーム |
| `/guidelines` | 投稿ガイドライン |
| `/privacy` | プライバシーポリシー |
| `/favorites` | お気に入り一覧（クライアント側レンダリング） |

### 多言語（`/[lang]/`）× 7言語

同じ構成が en/fr/ar/es/pt/zh/ko 各言語に展開される（favoritesは日本語のみ）。

### OGP画像

| URL | 内容 |
|---|---|
| `/ogp.png` | サイト共通OGP画像・日本語 |
| `/ogp/[lang].png` | サイト共通OGP画像・多言語版（7言語）各言語のsite.name・home.titleを使用 |
| `/ogp/[id].png` | 体験談別OGP画像・日本語（21件分） |
| `/ogp/[lang]/[id].png` | 体験談別OGP画像・多言語版（21件×7言語）翻訳済みキャッチコピー・言語別サイト名を使用 |

---

## 7. 投稿フォームの仕組み

### フォーム構成

Googleフォームをiframeで各ページに埋め込み。言語ごとに専用フォームを使用。

```
[ユーザー] → Googleフォームに入力・送信
                ↓
        Googleスプレッドシートに回答が蓄積
                ↓
        [運営者] スプレッドシートで確認
                ↓
        Claude Codeに回答を貼り付けて「追加して」と依頼
                ↓
        stories.json に追記 → 翻訳 → git push → 自動デプロイ
```

### 送信完了の検知

Googleフォームiframeは送信後に再読み込みが発生する。この「2回目のloadイベント」を検知してカスタム完了メッセージを表示（iframeのクロスオリジン制約を回避）。

### フォームの設問（全言語共通）

1. 表示名（必須）→ `displayName`
2. X ID（必須・非公開・連絡用のみ）
3. お住まいの国（任意）→ `country`
4. 出会いのころの年齢（任意）→ `ageGroup`
5. 推し・好きなキャラクター（任意）→ `favoriteCharacter`
6. 最初に触れた作品（任意）→ `firstSeries`
7. 最初のメディア（任意）→ `firstMedia`
8. 体験談（任意）→ `mainStory`
9. 好きなシーン・セリフ（任意）→ `favoriteScene`
10. 観てみたい作品（任意）→ `futureWish`
11. キャッチコピー（任意）→ `catchphrase`

---

## 8. ビルドとデプロイ

### ローカル開発

```bash
npm run dev    # http://localhost:4321 で起動
npm run build  # dist/ に静的ファイルを生成
```

### 自動デプロイ

```
git push（mainブランチ）
        ↓
GitHub Actions（.github/workflows/deploy.yml）が起動
        ↓
npm run build
        ↓
dist/ の内容を GitHub Pages に公開
        ↓
https://naruboru-taiken.github.io に反映（数分以内）
```

---

## 9. 主要機能一覧

| 機能 | 説明 |
|---|---|
| NARUTO/BORUTOフィルター | 一覧ページで作品別に絞り込み |
| 年齢層ソート | 新しい順 / 若い順 / 年上順 |
| キャラクターフィルター | `?chara=` URLパラメータで絞り込み |
| ランダムに読む | 一覧ページ＋詳細ページ。現在のフィルター状態を反映してランダム遷移 |
| NEWバッジ | 投稿から7日以内のカードにバッジ表示 |
| 既読バッジ | 閲覧済みカードにグレー「既読」バッジ表示（localStorage） |
| 関連体験談 | 詳細ページ下部にスコアリングでTop3表示 |
| 前後ナビゲーション | 詳細ページ下部に「←前の話 / 次の話→」リンク |
| わかる！ボタン | 詳細ページ。共感数をlocalStorageで保存 |
| お気に入り保存 | 詳細ページ＋カードのハートアイコン。localStorageで管理 |
| お気に入り一覧 | `/favorites` ページ。保存済み体験談をクライアント側レンダリング |
| Xシェア | 体験談詳細からワンクリックでシェア |
| Instagramストーリーズ | Canvas APIで1080×1920px画像を生成してDL。各言語ページで表示言語に合わせたテキストを出力（外国語投稿も日本語ページでは日本語翻訳を表示） |
| OGP画像 | satori+sharpでビルド時に体験談別画像を生成（日本語 + 言語別の2種）。韓国語・アラビア語は専用フォント（Noto Sans KR / Cairo）を追加して文字化けを解消 |
| 推しキャラ名の多言語表示 | favoriteCharacterをDeepLで翻訳。詳細ページ・Xシェアテキストで言語別表示 |
| Google Analytics 4 | 訪問者数・国別・言語別・流入元の計測（ID: G-H3Q2S0XNS3） |
| 言語切り替え | ヘッダーのドロップダウンで8言語を切り替え |
| ハンバーガーメニュー | 640px以下でモバイル対応メニュー表示 |
| sitemap.xml | `@astrojs/sitemap` でビルド時自動生成（OGP画像URL除外） |
| robots.txt | `public/robots.txt`、sitemapのURL明記 |
| 404ページ | `src/pages/404.astro`（トップ・体験談一覧への導線付き） |
| Google Search Console | 所有権確認済み・sitemap送信済み（2026-04-02） |
| canonical URL | 全ページに `<link rel="canonical">` + 8言語分の `hreflang`（x-default含む）を出力 |
| 言語別サイトOGP画像 | `/ogp/[lang].png`（7言語）各言語URL共有時に言語別アイキャッチを表示 |
| 外国語投稿の日本語自動翻訳 | `sourceLang`フィールドで言語指定。翻訳スクリプトがJA含む全言語に翻訳 |

---

## 10. セキュリティ

| 項目 | 対応状況 |
|---|---|
| `.env`（DeepL APIキー） | `.gitignore` 済み・GitHubに上がらない ✅ |
| `.claude/`（設定ファイル） | `.gitignore` 済み ✅ |
| GitHubトークン | macOS キーチェーンで管理・URLに含まない ✅ |
| X ID（投稿者） | stories.json に保存しない・Googleフォームのみ ✅ |
| GitHub上のコミット履歴 | 機密情報の混入なし（確認済み） ✅ |

### 定期メンテナンス

- **GitHubトークン更新**: 毎年1月・4月・7月・10月1日にClaude Codeから自動リマインド

---

## 11. 運用ルール

### 新規投稿の追加手順

1. Googleフォームのスプレッドシートで回答を確認
2. **外国語投稿は Claude Code がコンテンツチェック**（差別・スパム等の確認）
3. Claude Code に回答を貼り付けて「追加して」と依頼
4. stories.json に追記
5. `DEEPL_API_KEY=... node scripts/translate-stories.mjs` で翻訳
6. `git push` → 自動デプロイ
7. X（@naruboru_taiken）で投稿者に掲載通知

### CSSカスタマイズの変更箇所

```css
/* public/styles/global.css の :root */
--color-primary: #e8621a;       /* メインカラー（オレンジ） */
--color-accent: #1a1a2e;        /* アクセント（深い紺） */
--color-primary-light: #fff3ec; /* 背景用薄いカラー */

/* フォーム埋め込みの高さ */
.form-embed-wrapper iframe { height: 3200px; }
```

---

## 12. 残課題

### 🟠 高優先度
- カレンダーページ データ整備中（`src/data/events.ts` に追記後、ナビリンクを復活させて公開）

### 🟡 中優先度
- （完了済み案件なし）

### 🟢 低優先度
- ページネーション未実装
- 旧フォームフィールド（triggerScene等）の将来的な廃止
- コメント機能（サイトが十分に育ったタイミングで導入。候補：Supabase+自前実装）
- Instagramストーリーズ画像のアラビア語対応：Canvas 2D API がデフォルトLTR描画のためアラビア語（RTL）は正常出力不可。対応には `ctx.direction = 'rtl'` 設定と折り返しロジックの全面書き直しが必要
