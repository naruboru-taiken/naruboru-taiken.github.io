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
const TARGET_LANGS = ['EN', 'FR', 'AR', 'ES', 'PT'];
// DeepL言語コード → stories.jsonのキー
const LANG_MAP = { EN: 'en', FR: 'fr', AR: 'ar', ES: 'es', PT: 'pt' };

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
];

const STORIES_PATH = resolve(process.cwd(), 'src/data/stories.json');

async function translate(text, targetLang) {
  const resp = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      source_lang: 'JA',
      target_lang: targetLang,
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`DeepL API error ${resp.status}: ${err}`);
  }
  const data = await resp.json();
  return data.translations[0].translated_text;
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

    for (const deeplLang of TARGET_LANGS) {
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

        console.log(`  翻訳中: ${story.id} → ${storyLang}.${field} (${originalText.length}文字)`);
        try {
          const translated = await translate(originalText, deeplLang);
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
