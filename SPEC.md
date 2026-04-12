# ナルボル体験談 — サイト仕様書

> 最終更新: 2026-04-12（デザイン刷新・PROJECT 100 LP追加・hero-meta統合）

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
  "catchphrase": "一覧カードの大見出し（運営が編集して記入）",
  "mainStory": "体験談本文（Q8）",
  "triggerScene": "旧フォーム用（後方互換・新規投稿はnull）",
  "realization": "旧フォーム用（後方互換・新規投稿はnull）",
  "currentRelationship": "旧フォーム用（後方互換・新規投稿はnull）",
  "favoriteScene": "好きなシーン・セリフ（Q9）",
  "futureWish": "観てみたい作品（Q10）",
  "message": "投稿者のキャッチコピー原文（Q11）。詳細ページ「ひとこと」セクションに表示",
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
| `catchphrase` | ✅ | **運営が編集して記入する**一覧カードの大見出し。nullの場合は`mainStory`冒頭60文字にフォールバック |
| `message` | — | 投稿者のQ11原文（投稿者が書いたキャッチコピー）。詳細ページ「ひとこと」セクションに表示 |
| `mainStory` | — | 新フォーム形式（Q8）。あれば旧3フィールドより優先 |
| `favoriteCharacter` | — | **必ず日本語の正規形で入力すること**（例: `うずまきナルト`）。多言語表示は `getCharaName()` がハードコード辞書で処理するため、DeepLで翻訳しない |
| `country` | — | 居住国。**日本語の正規形で入力**（例: `韓国`、`ブラジル`）。英語・他言語での入力不可 |
| `sourceLang` | — | 省略時は `"ja"`。外国語投稿は `"pt"` 等を指定。翻訳スクリプトがJAを含む全言語に翻訳する |
| `publishedAt` | ✅ | 表示順に影響（降順） |
| `isSeedContent` | ✅ | 運営作成ならtrue |
| `translations` | — | DeepL翻訳スクリプトが自動生成（`favoriteCharacter` は含まない） |

### 現在のデータ状況

- **総件数**: 33件
- **シードコンテンツ**: 14件（運営作成サンプル、`isSeedContent: true`）
- **実投稿**: 19件（story-005, 016〜033）
  - story-020: Defensor de Boruto（ブラジル・ポルトガル語投稿、`sourceLang: "pt"`）
  - story-021: "A"（@itami_0513、うちはイタチ、〜10歳、日本）
  - story-022: Moe（m_7144_、ボルサラ推し、BORUTO TVアニメ、日本）
  - story-023: Hana（@jujuborusara、ボルサラ・サスケ推し、NARUTO TVアニメ、タイ在住）
  - story-024: リエン（韓国、ボルト推し、BORUTO、日本語勉強のきっかけ）
  - story-025: 千（@ra0hdj、ナルヒナ・ボルヒマ推し、NARUTO 漫画、日本）
  - story-026: チャーリー（@charlyoden、ナルト推し、NARUTO TVアニメ、日本）
  - story-027: Saradaisuki（@Himesara_da、うちはサラダ推し、NARUTO TVアニメ、韓国、sourceLang: ko）
  - story-028: Hatake（@Hatakesant、うずまきナルト推し、NARUTO TVアニメ、ブラジル、sourceLang: pt）
  - story-029: しろ（@shiro_boru0327、ボルサラ推し、BORUTO 漫画、日本）
  - story-030: あゆ（R_tag_uTxTu、うちはサスケ推し、NARUTO TVアニメ、日本）
  - story-031: ハリー（@Hedgehog_kwkw、ボルト推し、NARUTO TVアニメ→漫画、10代・女、日本）
  - story-032: 的（wolkiger_ks、サスケ推し、NARUTO 漫画、10代、日本）
  - story-033: だってばよ（うちはサスケ推し、NARUTO TVアニメ、20代、日本）

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
| `/stories/[id]` | 体験談詳細（33件×1言語） |
| `/characters` | 推し一覧 |
| `/submit` | 投稿フォーム |
| `/guidelines` | 投稿ガイドライン |
| `/privacy` | プライバシーポリシー |
| `/about` | このサイトについて |
| `/favorites` | お気に入り一覧（クライアント側レンダリング） |
| `/project100` | PROJECT 100 専用LP（カウンター・マイルストーン・参加者ウォール・CTA）※フッター非表示・URLから直アクセスのみ |
| `/calendar` | 記念日カレンダー（非公開中・データ整備中） |

### 多言語（`/[lang]/`）× 7言語

同じ構成が en/fr/ar/es/pt/zh/ko 各言語に展開される（favoritesは日本語のみ）。aboutページは全8言語で各言語の翻訳をページ内にハードコード。

### OGP画像

| URL | 内容 |
|---|---|
| `/ogp.png` | サイト共通OGP画像・日本語 |
| `/ogp/[lang].png` | サイト共通OGP画像・多言語版（7言語）各言語のsite.name・home.titleを使用 |
| `/ogp/[id].png` | 体験談別OGP画像・日本語（32件分） |
| `/ogp/[lang]/[id].png` | 体験談別OGP画像・多言語版（32件×7言語）翻訳済みキャッチコピー・言語別サイト名を使用 |

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

スプレッドシートの列順と stories.json フィールドの対応：

| スプレッドシート列 | フィールド | 備考 |
|---|---|---|
| タイムスタンプ | — | 無視 |
| Q1. 表示名 | `displayName` | |
| Q2. X ID | — | 保存しない（連絡用のみ・非公開） |
| Q4. 年齢層 | `ageGroup` | |
| Q5. 推し・好きなキャラクター | `favoriteCharacter` | |
| Q6. 最初に触れた作品 | `firstSeries` | "NARUTO" or "BORUTO" に正規化 |
| Q7. 最初のメディア | `firstMedia` | |
| Q8. 体験談 | `mainStory` | |
| Q9. 好きなシーン・セリフ | `favoriteScene` | |
| Q10. 観てみたい作品 | `futureWish` | |
| Q11. キャッチコピー | `message` | 投稿者の原文をそのまま入れる |
| 同意事項 | — | 無視 |
| Q3. お住まいの国 | `country` | ※列は末尾付近にあるが設問番号は3 |
| 画像URL（任意） | `imageUrl` | なければnull |

> ⚠️ **`catchphrase`（一覧カードの大見出し）は運営が編集して記入する**
> `mainStory` を読んで一覧映えする一文を考え、`message`（Q11原文）とは別に書き込む。

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
| ヒーロータイピングエフェクト | トップページ（日本語）のh1タイトルを1文字ずつタイプする演出。完了後カーソルフェードアウト |
| ヒーローVoiceスニペット | トップページ右カラム。`catchphrase`を持つ投稿からランダム3件を抽出し、タイピング完了後に時差フェードイン表示。`<script type="application/json">` 経由でデータ注入（define:vars のTypeScript制約回避） |
| hero-metaストリップ | トップページヒーロー内に件数・国数・PROJECT 100進捗バーを統合表示（Kickstarter/Campfire方式の社会的証明） |
| PROJECT 100 LP | `/project100`。カウンター・マイルストーン・参加者ウォール・CTA。オレンジ基調デザイン。フッターからは非公開 |
| チャクラ発光エフェクト | ヒーロー背景の炎エフェクト（日本語・多言語トップ共通）。`filter`と`mix-blend-mode`の同一要素競合を回避するため`::before`に分離。`translateY(-6%)`で炎が湧き上がるアニメーション（7s、opacity 0.30→1.00）。ノイズテクスチャはSVG data URIをbackground-imageに直接埋め込み（`mix-blend-mode: soft-light`） |
| 国旗絵文字 | StoryCard の card-meta エリアに `・国名 🇯🇵` 形式で表示。日本を含む25ヶ国対応 |
| キャラ名多言語表示 | `getCharaName(jaName, lang)` 関数（`src/i18n/ui.ts`）が正規日本語名→8言語に変換。21キャラ対応、`・`/`、` 区切りの複合名も分割翻訳。DeepLは使用しない（直訳で壊れるため） |
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
| 推しキャラ名の多言語表示 | `getCharaName()`ハードコード辞書で変換（DeepLは直訳で壊れるため不使用）。詳細ページ・カード・推し一覧・Xシェアテキストで言語別表示 |
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
8. SNS投稿文案・画像生成プロンプトを出力（CLAUDE.md の「投稿追加時に必ず出力する付帯情報」参照）

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

## 12. SNS運用フロー（X / @naruboru_taiken）

### 投稿スケジュール

| 曜日 | 本数 | 時間 |
|---|---|---|
| 平日（月〜金） | 1本 | 21:00 JST |
| 土・日 | 各2本 | 10:00 / 21:00 JST |
| 週計 | 9本 | |

### 投稿フォーマット

各投稿には以下をセットにする：

1. **本文**（140字以内）：出会いのシチュエーションをフックにしたテキスト＋`[URL]`＋`#NARUTO #BORUTO #ナルボル体験談`
2. **添付画像**：出会いシチュエーションを描いた情景イラスト（Gemini Imagen 生成）

### 画像生成ルール

- NARUTOキャラクター・ロゴ等のIP要素を一切含めない
- 「manga」「anime」「NARUTO」「BORUTO」などIP想起ワードを使わない（`a stack of books` / `a television casting soft warm glow` に置換）
- 人物は後ろ姿・シルエット・手元のみ（顔なし）
- 性別・年齢が判明している場合はシルエットに反映
- スタイル: `watercolor illustration, seen from behind, no face, consistent style, muted warm palette, soft grain texture`

### 進捗（2026-04-07時点）

- story-016〜032（UGC 17件）の文案・プロンプト作成済み
- 投稿期間: 2026-04-06（月）〜 2026-04-19（日）

---

## 13. 残課題

### 🟠 高優先度

- カレンダーページ データ整備中（`src/data/events.ts` に追記後、ナビリンクを復活させて公開）

### 🟡 中優先度
- ヒーロースニペット（多言語トップ `/[lang]/`）未実装。現在は日本語トップのみ
- `getCharaName()` 未登録のキャラは日本語にフォールバック。新キャラが登場したら `src/i18n/ui.ts` の `CHARA_TRANSLATIONS` に追記が必要

### 🟢 低優先度
- ページネーション未実装
- 旧フォームフィールド（triggerScene等）の将来的な廃止
- コメント機能（サイトが十分に育ったタイミングで導入。候補：Supabase+自前実装）
- Instagramストーリーズ画像のアラビア語対応：Canvas 2D API がデフォルトLTR描画のためアラビア語（RTL）は正常出力不可。対応には `ctx.direction = 'rtl'` 設定と折り返しロジックの全面書き直しが必要
