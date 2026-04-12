# ナルボル体験談サイト — デザインシステム

## 1. ビジュアルテーマと雰囲気

NARUTO・BORUTOファンが「作品に引き込まれた瞬間」を語り合うコミュニティサイト。
デザインは**深い紺（#1a1a2e）を大地**に、**オレンジ（#e8621a）を炎・チャクラ**として扱う。
ヒーローセクションは暗く没入感のある紺背景に、下から湧き上がるオレンジの炎エフェクトが特徴。
コンテンツエリアは明るいグレー背景（#f4f4f6）に白いカードが並ぶ、読みやすい構成。

「引き込まれた瞬間」を届けるため、**体験談の言葉をデザインの主役**に据える。
装飾は最小限に、テキストが際立つ余白と階層を意識する。

**サイトの個性：**
- 深紺（#1a1a2e）× オレンジ（#e8621a）の2軸カラー
- ヒーローに「忍」の巨大薄文字ウォーターマーク
- 下部から湧くオレンジのチャクラ炎グロー（blur + mix-blend-mode: screen）
- 「忍」ロゴマーク（円形グラデーション、オレンジグロー付き）
- ピル型ボタン（border-radius: 100px）
- Noto Sans JP：日本語ファン向けに最適化されたフォント

---

## 2. カラーパレット

### CSS 変数（`public/styles/global.css` の `:root` で定義）

```css
--color-primary:       #e8621a;  /* オレンジ（CTA・バッジ・強調） */
--color-primary-dark:  #c04e10;  /* ホバー時のオレンジ */
--color-primary-light: #fff3ec;  /* 薄いオレンジ背景（タグ・ハイライト） */
--color-accent:        #1a1a2e;  /* 深い紺（ヒーロー・ヘッダー背景） */
--color-accent-mid:    #24243e;  /* やや明るい紺（サブ背景用） */
--color-text:          #1a1a1a;  /* 本文テキスト（温かい黒） */
--color-text-sub:      #666666;  /* サブテキスト・メタ情報 */
--color-border:        #e8e8e8;  /* ボーダー・区切り線 */
--color-bg:            #f4f4f6;  /* ページ背景（薄いグレー） */
--color-surface:       #ffffff;  /* カード・サーフェス */
```

### カラーの役割と使用場所

| カラー | 用途 | 使用コンポーネント |
|---|---|---|
| `#e8621a` | 主要CTA・タグ背景・アクセント | ボタン・NAV CTA・タグ・アイコン |
| `#c04e10` | ホバー状態 | ボタンhover・リンクhover |
| `#fff3ec` | 薄い強調背景 | タグ・ハイライト背景 |
| `#1a1a2e` | 没入感のある背景 | ヒーロー・ヘッダー・フッター |
| `#24243e` | やや明るいダーク背景 | PROJECT100バナー・サブセクション |
| `#f4f4f6` | コンテンツエリア背景 | ページ本体 |
| `#ffffff` | カード・コンテナ | ストーリーカード・フォーム |

### ダーク面のテキスト
- 主テキスト（ヒーロー内）: `#ffffff`
- サブテキスト（ヒーロー内）: `rgba(255,255,255,0.8)` / `rgba(255,255,255,0.6)`
- ボーダー（ヘッダー下線）: `rgba(232,98,26,0.18)`（オレンジの薄いライン）

### 特殊カラー
- メディア種別タグ背景: `#eef2ff`、テキスト: `#3730a3`（インディゴ系）
- 国旗絵文字は文字として直接表示

---

## 3. タイポグラフィ

### フォント

```
Noto Sans JP（Google Fonts）
ウェイト: 400 / 500 / 700
```

英語フォントへの置換は不可。日本語ファン向けサイトなので Noto Sans JP を最優先で維持する。

### タイポグラフィ階層

| 役割 | サイズ | ウェイト | 行間 | 使用箇所 |
|---|---|---|---|---|
| ヒーロー大見出し | `clamp(2rem, 5vw, 3.2rem)` | 700 | 1.3 | ヒーローキャッチコピー |
| セクション見出し | 1.5–1.8rem | 700 | 1.4 | 各セクションのh2 |
| カード見出し（catchphrase） | 1rem–1.1rem | 700 | 1.5 | ストーリーカード主文 |
| ナビゲーション | 0.9rem | 500 | — | ヘッダーナビ |
| 本文 | 1rem（16px） | 400 | 1.8 | 体験談テキスト |
| サブ・メタ情報 | 0.8–0.85rem | 400 | — | 投稿者名・年齢・タグ |
| タグ | 0.8rem | 700 | — | シリーズバッジ |
| アイウォード（eyebrow） | 0.8rem | 700 | — | letter-spacing: 0.12em + uppercase |

### 原則
- **見出しは700のみ**：ファンサイトの熱量を体現するため、300/400の細いウェイトは見出しに使わない
- **本文の行間は1.8**：長い体験談テキストを読みやすくするため広め
- ヒーロー内テキストは常に白

---

## 4. コンポーネントスタイル

### ボタン

**Primary（オレンジグラデーション）**
```css
background: linear-gradient(135deg, #e8621a 0%, #d4561a 100%);
color: white;
border-radius: 100px;  /* ピル型 */
padding: 0.75rem 1.8rem;
font-weight: 700;
box-shadow: 0 4px 14px rgba(232,98,26,0.3);

/* hover */
background: linear-gradient(135deg, #c04e10 0%, #b34412 100%);
box-shadow: 0 6px 20px rgba(232,98,26,0.45);
transform: translateY(-1px);
```

**Outline（透明背景）**
```css
background: transparent;
color: #e8621a;
border: 2px solid #e8621a;
border-radius: 100px;

/* ヒーロー内では白色に切り替え */
color: white;
border-color: rgba(255,255,255,0.5);
```

**NAV CTA（ヘッダー内投稿ボタン）**
```css
background: #e8621a;
color: white;
padding: 0.5rem 1.2rem;
border-radius: 100px;
font-weight: 700;
box-shadow: 0 0 0 rgba(232,98,26,0);  /* hover時にグロー追加 */
```

### ストーリーカード

```
[ タグ行（シリーズ・メディア種別）]
[ catchphrase：太字、1–2行 ]
[ アバター円 | 投稿者名・年齢・推しキャラ・国旗 ]
[ 続きを読む → ]
```

```css
.story-card {
  background: #ffffff;
  border-radius: 12px;  /* --radius-md */
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  position: relative;
  transition: 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
/* hover */
.story-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}
```

- **タグ**: `background: #fff3ec; color: #c04e10; border-radius: 100px; font-size: 0.8rem; font-weight: 700`
- **メディアタグ**: `background: #eef2ff; color: #3730a3`（シリーズタグと色で区別）
- **catchphrase**: `font-weight: 700; font-size: 1rem`（カードの主役）
- **カードアバター**: 投稿者名の頭文字を円形背景で表示（オレンジ系）
- **NEWバッジ**: 投稿後7日以内に表示
- **お気に入りボタン**: カード右上に♡（押下で♥）

### ヘッダー

```css
position: sticky; top: 0; z-index: 100;
background: rgba(26, 26, 46, 0.96);
backdrop-filter: blur(16px);
border-bottom: 1px solid rgba(232, 98, 26, 0.18);
box-shadow: 0 1px 24px rgba(0,0,0,0.22);
height: 64px;
```

- ロゴ: 「忍」の円形マーク（オレンジグラデーション + グロー）+ サイト名テキスト
- ナビリンク: `rgba(255,255,255,0.75)` → hover時 `#e8621a`
- モバイル: ハンバーガーアイコン（3本線 → ✕変形アニメーション）

### タグ

```css
/* シリーズタグ（NARUTO / BORUTO） */
background: #fff3ec;
color: #c04e10;
border-radius: 100px;
font-size: 0.8rem;
font-weight: 700;
padding: 0.2rem 0.7rem;

/* メディア種別タグ（TVアニメ・漫画 等） */
background: #eef2ff;
color: #3730a3;
```

### ヒーローセクション

```css
background: #1a1a2e;  /* 深い紺 */
color: white;
padding: var(--space-xl) 0;  /* 6rem上下 */
overflow: hidden;
position: relative;
```

- 背景ウォーターマーク: 「忍」の漢字（font-size: clamp(12rem, 20vw, 20rem)、opacity: 0.018）
- チャクラ炎エフェクト: 画面下部からオレンジのグロー（`mix-blend-mode: screen` + `filter: blur`）
- eyebrow（小見出し）: オレンジ・大文字・0.12em letter-spacing、左に24pxのオレンジライン
- ヒーロータイトル: clamp(2rem, 5vw, 3.2rem)、白・太字
- CTAボタン群: Primary + Outline（白縁）の横並び

### PROJECT 100 バナー

```css
background: linear-gradient(135deg, #1a1a2e 0%, #24243e 100%);
color: white;
/* 進捗バー：オレンジ（実進捗）× 薄いオレンジ（背景レール） */
```

- 投稿数カウンター（大きく表示）/ 100人
- プログレスバー（オレンジ）
- 「次の節目まであとN人」
- 参加者ウォールへのリンク

---

## 5. レイアウト原則

### スペーシングシステム

```css
--space-xs: 0.5rem  /*  8px */
--space-sm: 1rem    /* 16px */
--space-md: 2rem    /* 32px */
--space-lg: 4rem    /* 64px */
--space-xl: 6rem    /* 96px */
```

ベースユニットは8px。スペーシング指定はこの変数から選ぶ。

### コンテナ

```css
--max-width:      1100px;  /* コンテンツの最大幅 */
--max-width-text:  720px;  /* 体験談テキスト最大幅（読みやすさ重視）*/
margin: 0 auto;
padding: 0 var(--space-md);  /* 左右32px */
```

### グリッド

- **ストーリーカード一覧**: `repeat(auto-fill, minmax(300px, 1fr))`（レスポンシブ自動折返し）
- **ヒーロー + スニペット**: 左寄せコンテンツ + 右にカード群（デスクトップ2カラム）
- **フッターリンク**: 横並びフレックス、モバイルで折返し

### ボーダー半径スケール

```css
--radius:    8px;   /* ボタン・入力・小要素 */
--radius-md: 12px;  /* ストーリーカード */
--radius-lg: 18px;  /* 大きなコンテナ */
100px;              /* ピル型（ボタン・タグ全般）*/
50%;                /* 円形（アバター・ロゴマーク） */
```

---

## 6. シャドウと奥行き

```css
--shadow-sm: 0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);     /* 通常カード */
--shadow-md: 0 4px 16px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05);    /* hover時カード */
--shadow-lg: 0 12px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06);   /* モーダル・ドロップダウン */
--shadow-xl: 0 20px 48px rgba(0,0,0,0.16);                                 /* 最前面要素 */
```

**グロー（オレンジ特有）**
```css
/* ロゴマーク */
box-shadow: 0 0 12px rgba(232,98,26,0.4);
/* NAVのCTAボタン hover */
box-shadow: 0 4px 16px rgba(232,98,26,0.4);
/* Primaryボタン hover */
box-shadow: 0 6px 20px rgba(232,98,26,0.45);
```

---

## 7. アニメーション

```css
--transition-base: 0.22s cubic-bezier(0.4, 0, 0.2, 1);
```

- カードhover: `translateY(-3px)` + shadow強化
- ボタンhover: `translateY(-1px)` + グロー追加
- チャクラ炎: `emitter-breathe` 7s ease-in-out infinite（opacity + translateY変化）
- ハンバーガー→✕: `transform: rotate` 0.25s
- 言語ドロップダウン: `hidden` 属性トグル（CSS transitionなし）

---

## 8. レスポンシブ対応

| ブレークポイント | 変化内容 |
|---|---|
| ≤ 768px | ハンバーガーメニュー表示 / カードグリッド1–2列 |
| ≤ 600px | ヒーロー文字サイズ縮小 / CTAボタン縦並び |
| > 900px | カードグリッド3列 / ヒーロー2カラム |

モバイルでのタップターゲット: ボタン・カード全体・ナビリンクは最低44px確保。

---

## 9. DO / DON'T

### DO
- ヒーローセクションは常に `#1a1a2e`（深紺）を背景に使う
- オレンジ（`#e8621a`）はCTA・強調・アクセントに限定する（面積は控えめに）
- ボタンとタグは必ずピル型（`border-radius: 100px`）にする
- カードの catchphrase をビジュアルの中心に据える（画像より文字が主役）
- 見出しは `font-weight: 700` のみ使用する
- shadow はオレンジグロー（`rgba(232,98,26,0.X)`）でオレンジ要素を強調する
- 日本語テキストには常に `Noto Sans JP` を使用する

### DON'T
- オレンジを大きな背景面積に使わない（炎エフェクト的なグロー用途のみ可）
- ヒーロー内に明るい背景色を入れない（白背景カードを直置きしない）
- `font-weight: 300` や `400` を見出しに使わない
- 複数の明るいアクセントカラーを追加しない（オレンジ1色が軸）
- ストーリーカードを画像ファーストにしない（catchphraseテキストが主役）
- border-radius を 0 や 4px にしない（8px 以上のやわらかさが基本）

---

## 10. AIエージェント向けクイックリファレンス

### カラーメモ
```
ページ背景:     #f4f4f6
カード背景:     #ffffff
ヘッダー/ヒーロー背景: rgba(26,26,46,0.96) / #1a1a2e
オレンジCTA:    #e8621a
オレンジhover:  #c04e10
薄いオレンジ:   #fff3ec
本文テキスト:   #1a1a1a
サブテキスト:   #666666
ボーダー:       #e8e8e8
```

### コンポーネント生成プロンプト例

- 「ストーリーカードを作成：白背景・12px角丸・shadow-sm。上部にシリーズタグ（#fff3ec背景・#c04e10文字・ピル型）。catchphraseはfont-weight700・1rem。下部に投稿者メタ情報。右上にお気に入り♡ボタン。」

- 「ヒーローセクション：#1a1a2e背景・white文字。背景に半透明の「忍」ウォーターマーク。下部からオレンジ（#e8621a）のbluedグロー。eyebrowは小文字uppercase・letter-spacing0.12em・オレンジ。タイトルはclamp(2rem,5vw,3.2rem)・太字。CTAは2つ（primaryオレンジ + outlineホワイト）。」

- 「ヘッダー：rgba(26,26,46,0.96)・backdrop-filter:blur(16px)・高さ64px。左に「忍」円形ロゴ（オレンジグラデーション）。右にナビリンク + ピル型CTAボタン（オレンジ）。」

- 「タグバッジ：シリーズ用は#fff3ec背景・#c04e10文字・ピル型。メディア種別用は#eef2ff背景・#3730a3文字。font-size:0.8rem・font-weight:700。」
