// ローンチ告知画像生成スクリプト (1200×675px)
// 実行: node scripts/gen-launch-announcement.mjs
// 出力: launch-ja.png / launch-en.png

import satori from 'satori';
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const fontDir = resolve(process.cwd(), 'node_modules/@fontsource/noto-sans-jp/files');
const fonts = [
  { name: 'Noto Sans JP', data: readFileSync(resolve(fontDir, 'noto-sans-jp-japanese-700-normal.woff')), weight: 700, style: 'normal' },
  { name: 'Noto Sans JP', data: readFileSync(resolve(fontDir, 'noto-sans-jp-latin-700-normal.woff')),   weight: 700, style: 'normal' },
  { name: 'Noto Sans JP', data: readFileSync(resolve(fontDir, 'noto-sans-jp-japanese-400-normal.woff')), weight: 400, style: 'normal' },
  { name: 'Noto Sans JP', data: readFileSync(resolve(fontDir, 'noto-sans-jp-latin-400-normal.woff')),   weight: 400, style: 'normal' },
];

function h(type, props = {}, ...children) {
  const flat = children.flat().filter(c => c != null);
  return {
    type,
    props: { ...props, ...(flat.length ? { children: flat.length === 1 ? flat[0] : flat } : {}) },
  };
}

function buildCard({ badge, line1, line2, sub, url, stories }) {
  return h('div', {
    style: {
      width: '1200px',
      height: '675px',
      display: 'flex',
      background: 'linear-gradient(135deg, #c04408 0%, #e8621a 35%, #2a1a4e 70%, #0d0d1f 100%)',
      position: 'relative',
      fontFamily: '"Noto Sans JP"',
      overflow: 'hidden',
    }
  },
    // ── 背景装飾レイヤー ──

    // 大きな忍マーク（右側・背景アート）
    h('div', {
      style: {
        position: 'absolute', right: '-60px', top: '-60px',
        width: '580px', height: '580px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }
    },
      h('span', {
        style: {
          color: 'rgba(255,255,255,0.08)',
          fontSize: '440px',
          fontWeight: 700,
          lineHeight: 1,
          marginTop: '40px',
        }
      }, '忍')
    ),

    // 中央グロー（明るいオレンジ放射）
    h('div', {
      style: {
        position: 'absolute', left: '-80px', top: '-80px',
        width: '700px', height: '700px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,140,40,0.35) 0%, rgba(232,98,26,0.15) 40%, rgba(232,98,26,0) 70%)',
      }
    }),

    // 右下サブグロー
    h('div', {
      style: {
        position: 'absolute', right: '100px', bottom: '-120px',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(100,60,200,0.2) 0%, rgba(100,60,200,0) 65%)',
      }
    }),

    // 斜め装飾ライン①
    h('div', {
      style: {
        position: 'absolute', left: '0', top: '0',
        width: '4px', height: '675px',
        background: 'linear-gradient(180deg, #ff9940 0%, #e8621a 50%, rgba(232,98,26,0) 100%)',
      }
    }),
    // 斜め装飾ライン②
    h('div', {
      style: {
        position: 'absolute', left: '12px', top: '0',
        width: '2px', height: '675px',
        background: 'linear-gradient(180deg, rgba(255,153,64,0.5) 0%, rgba(255,153,64,0) 60%)',
      }
    }),

    // ── コンテンツレイヤー ──
    h('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '56px 72px 56px 80px',
        flex: 1,
      }
    },

      // 上段: ロゴ + バッジ
      h('div', {
        style: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }
      },
        h('div', {
          style: {
            width: '48px', height: '48px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }
        },
          h('span', { style: { color: '#fff', fontSize: '24px', fontWeight: 700 } }, '忍')
        ),
        h('span', { style: { color: 'rgba(255,255,255,0.9)', fontSize: '24px', fontWeight: 700 } }, 'ナルボル体験談'),
        h('div', {
          style: {
            background: 'linear-gradient(90deg, #ff9940, #e8621a)',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 700,
            padding: '5px 18px',
            borderRadius: '20px',
            marginLeft: '4px',
          }
        }, badge),
      ),

      // メインコピー（大）
      h('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '0px', marginBottom: '20px' }
      },
        h('div', {
          style: {
            color: '#ffffff',
            fontSize: '76px',
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
          }
        }, line1),
        h('div', {
          style: {
            color: '#ffffff',
            fontSize: '76px',
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
          }
        }, line2),
      ),

      // 区切りライン
      h('div', {
        style: {
          width: '80px', height: '3px',
          background: 'linear-gradient(90deg, #ff9940, rgba(255,153,64,0))',
          marginBottom: '20px',
        }
      }),

      // サブコピー + ストーリー数 + URL
      h('div', {
        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
      },
        h('div', {
          style: { display: 'flex', flexDirection: 'column', gap: '6px' }
        },
          h('span', { style: { color: 'rgba(255,255,255,0.8)', fontSize: '22px', fontWeight: 400 } }, sub),
          h('span', { style: { color: 'rgba(255,255,255,0.4)', fontSize: '18px' } }, url),
        ),
        // ストーリー数バッジ
        h('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,153,64,0.4)',
            borderRadius: '12px',
            padding: '14px 28px',
          }
        },
          h('span', { style: { color: '#ff9940', fontSize: '42px', fontWeight: 700, lineHeight: 1 } }, stories),
          h('span', { style: { color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginTop: '4px' } }, 'stories'),
        ),
      ),
    )
  );
}

async function generate(filename, config) {
  const svg = await satori(buildCard(config), { width: 1200, height: 675, fonts });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  writeFileSync(filename, png);
  console.log(`✅ ${filename} を生成しました`);
}

await generate('launch-ja.png', {
  badge: '🎉 公開しました',
  line1: '引き込まれたのは、',
  line2: 'どんな瞬間でしたか。',
  sub: 'NARUTO・BORUTOファンの体験談サイト — 8言語対応',
  url: 'naruboru-taiken.github.io',
  stories: '20',
});

await generate('launch-en.png', {
  badge: '🎉 Now Live',
  line1: 'What was the moment',
  line2: 'that pulled you in?',
  sub: 'NARUTO / BORUTO Fan Stories — 8 languages',
  url: 'naruboru-taiken.github.io',
  stories: '20',
});

console.log('\n📁 launch-ja.png → 日本語・韓国語・中国語ツイートに添付');
console.log('📁 launch-en.png → 英語・仏語・西語・葡語・アラビア語ツイートに添付');
