/**
 * translate-stories.mjs
 * DeepL Free APIを使ってstories.jsonの体験談を翻訳し、
 * `translations` フィールドにキャッシュします。
 *
 * 実行: DEEPL_API_KEY=your_key node scripts/translate-stories.mjs
 *
 * 無料枠: 500,000文字/月
 * 翻訳済みフィールドは再翻訳しません（API節約）。
 * --force オプションで全フィールドを再翻訳できます。
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const API_KEY = process.env.DEEPL_API_KEY;
if (!API_KEY) {
  console.error('❌ DEEPL_API_KEY 環境変数が設定されていません。');
  console.error('   実行例: DEEPL_API_KEY=your_key node scripts/translate-stories.mjs');
  process.exit(1);
}

const FORCE = process.argv.includes('--force');
const TARGET_LANGS = ['EN', 'FR', 'AR', 'ES', 'PT', 'ZH', 'KO'];
// DeepL言語コード → stories.jsonのキー
const LANG_MAP = { EN: 'en', FR: 'fr', AR: 'ar', ES: 'es', PT: 'pt', ZH: 'zh', KO: 'ko', JA: 'ja' };
// DeepL言語コード（大文字）← sourceLang（小文字）
const SOURCE_LANG_MAP = { ja: 'JA', en: 'EN', fr: 'FR', ar: 'AR', es: 'ES', pt: 'PT', zh: 'ZH', ko: 'KO' };

// 翻訳対象フィールド
const TRANSLATABLE_FIELDS = [
  'catchphrase',
  'mainStory',
  'triggerScene',
  'realization',
  'currentRelationship',
  'favoriteScene',
  'futureWish',
  'message',
  'country',
  // 'favoriteCharacter' は getCharaName() ハードコード辞書で処理するため除外
];

// 国名辞書（固有名詞保護・DeepL誤訳の回避）
// 例: 「タイ」→ "tai (species of ... sea bream)" と誤訳される問題を防ぐ
const COUNTRY_BY_CODE = {
  JP: { ja: '日本',     en: 'Japan',          fr: 'Japon',          ar: 'اليابان',         es: 'Japón',         pt: 'Japão',         zh: '日本',   ko: '일본' },
  TH: { ja: 'タイ',     en: 'Thailand',       fr: 'Thaïlande',      ar: 'تايلاند',         es: 'Tailandia',     pt: 'Tailândia',     zh: '泰国',   ko: '태국' },
  BR: { ja: 'ブラジル', en: 'Brazil',         fr: 'Brésil',         ar: 'البرازيل',        es: 'Brasil',        pt: 'Brasil',        zh: '巴西',   ko: '브라질' },
  KR: { ja: '韓国',     en: 'Korea',          fr: 'Corée',          ar: 'كوريا',           es: 'Corea',         pt: 'Coreia',        zh: '韩国',   ko: '한국' },
  GB: { ja: '英国',     en: 'United Kingdom', fr: 'Royaume-Uni',    ar: 'المملكة المتحدة', es: 'Reino Unido',   pt: 'Reino Unido',   zh: '英国',   ko: '영국' },
  US: { ja: 'アメリカ', en: 'United States',  fr: 'États-Unis',     ar: 'الولايات المتحدة', es: 'Estados Unidos', pt: 'Estados Unidos', zh: '美国', ko: '미국' },
  CN: { ja: '中国',     en: 'China',          fr: 'Chine',          ar: 'الصين',           es: 'China',         pt: 'China',         zh: '中国',   ko: '중국' },
  FR: { ja: 'フランス', en: 'France',         fr: 'France',         ar: 'فرنسا',           es: 'Francia',       pt: 'França',        zh: '法国',   ko: '프랑스' },
  DE: { ja: 'ドイツ',   en: 'Germany',        fr: 'Allemagne',      ar: 'ألمانيا',         es: 'Alemania',      pt: 'Alemanha',      zh: '德国',   ko: '독일' },
  IT: { ja: 'イタリア', en: 'Italy',          fr: 'Italie',          ar: 'إيطاليا',         es: 'Italia',        pt: 'Itália',        zh: '意大利', ko: '이탈리아' },
};

// 逆引きテーブル: どの言語の国名からでも国コードを特定できる
const COUNTRY_CODE_LOOKUP = {};
for (const [code, names] of Object.entries(COUNTRY_BY_CODE)) {
  for (const name of Object.values(names)) {
    COUNTRY_CODE_LOOKUP[name] = code;
  }
}
// 既知の DeepL 誤訳パターンも吸収
COUNTRY_CODE_LOOKUP['tai (species of reddish-brown Pacific sea bream, Pagrus major)'] = 'TH';

/**
 * 国名を翻訳辞書から取得。未登録の国の場合は null を返す（DeepLにフォールバック）
 */
function lookupCountry(originalText, targetLang) {
  const code = COUNTRY_CODE_LOOKUP[originalText?.trim()];
  if (!code) return null;
  return COUNTRY_BY_CODE[code][targetLang] ?? null;
}

const STORIES_PATH = resolve(process.cwd(), 'src/data/stories.json');

async function translate(text, targetLang, sourceLang = 'JA') {
  const resp = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      source_lang: sourceLang,
      target_lang: targetLang,
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`DeepL API error ${resp.status}: ${err}`);
  }
  const data = await resp.json();
  return data.translations[0].text;
}

async function checkUsage() {
  const resp = await fetch('https://api-free.deepl.com/v2/usage', {
    headers: { 'Authorization': `DeepL-Auth-Key ${API_KEY}` },
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  return data;
}

async function main() {
  const stories = JSON.parse(readFileSync(STORIES_PATH, 'utf-8'));

  // 使用状況確認
  const usage = await checkUsage();
  if (usage) {
    const remaining = usage.character_limit - usage.character_count;
    console.log(`📊 DeepL使用状況: ${usage.character_count.toLocaleString()} / ${usage.character_limit.toLocaleString()} 文字`);
    console.log(`   残り: ${remaining.toLocaleString()} 文字`);
    if (remaining < 10000) {
      console.warn('⚠️  残り文字数が少なくなっています。無料枠の上限に注意してください。');
    }
  }

  let totalTranslated = 0;
  let totalSkipped = 0;
  let totalChars = 0;

  for (const story of stories) {
    // translations フィールドがなければ初期化
    if (!story.translations) story.translations = {};

    // sourceLang が ja 以外の場合は JA にも翻訳する
    const storySourceLang = story.sourceLang ?? 'ja';
    const deeplSourceLang = SOURCE_LANG_MAP[storySourceLang] ?? 'JA';
    const storyTargetLangs = storySourceLang === 'ja'
      ? TARGET_LANGS
      : [...TARGET_LANGS.filter(l => l !== deeplSourceLang), 'JA'];

    for (const deeplLang of storyTargetLangs) {
      const storyLang = LANG_MAP[deeplLang];
      if (!story.translations[storyLang]) story.translations[storyLang] = {};

      for (const field of TRANSLATABLE_FIELDS) {
        const originalText = story[field];
        if (!originalText) continue; // フィールドが空なら skip

        const alreadyTranslated = !!story.translations[storyLang][field];
        if (alreadyTranslated && !FORCE) {
          totalSkipped++;
          continue;
        }

        // country フィールドは固有名詞辞書を優先（DeepL 誤訳の回避）
        if (field === 'country') {
          const dictTranslation = lookupCountry(originalText, storyLang);
          if (dictTranslation) {
            story.translations[storyLang][field] = dictTranslation;
            totalTranslated++;
            console.log(`  📖 辞書: ${story.id} → ${storyLang}.country = "${dictTranslation}"`);
            continue;
          }
          // 辞書にない国の場合は DeepL にフォールバック（警告）
          console.warn(`  ⚠️  未登録の国名: "${originalText}" → DeepL にフォールバック`);
        }

        console.log(`  翻訳中: ${story.id} → ${storyLang}.${field} (${originalText.length}文字)`);
        try {
          const translated = await translate(originalText, deeplLang, deeplSourceLang);
          story.translations[storyLang][field] = translated;
          totalTranslated++;
          totalChars += originalText.length;
          // API制限対策: 少し待機
          await new Promise(r => setTimeout(r, 200));
        } catch (e) {
          console.error(`  ❌ エラー: ${story.id}.${field} (${storyLang}): ${e.message}`);
          // エラーが発生しても続行（途中保存するため）
        }
      }
    }
  }

  // 保存
  writeFileSync(STORIES_PATH, JSON.stringify(stories, null, 2) + '\n', 'utf-8');

  console.log('\n✅ 完了');
  console.log(`   翻訳済み: ${totalTranslated} フィールド (合計 ${totalChars.toLocaleString()} 文字)`);
  console.log(`   スキップ: ${totalSkipped} フィールド（既翻訳）`);
  if (FORCE) console.log('   ※ --force モードで実行（既翻訳フィールドも再翻訳）');
}

main().catch(e => {
  console.error('❌ 予期しないエラー:', e);
  process.exit(1);
});
