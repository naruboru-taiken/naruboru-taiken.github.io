// X（Twitter）ヘッダー画像生成スクリプト (1500×500px)
// 実行: node scripts/gen-x-header.mjs

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

// ── モバイル安全ゾーン: 左約280px×下200pxはプロフィールアイコンに隠れるため装飾のみ ──
const card = h('div', {
  style: {
    width: '1500px',
    height: '500px',
    display: 'flex',
    background: 'linear-gradient(120deg, #c04e10 0%, #e8621a 30%, #1a1a2e 68%)',
    position: 'relative',
    fontFamily: '"Noto Sans JP"',
    overflow: 'hidden',
  }
},
  // 左：大きな忍マーク装飾（プロフィールアイコン重複エリア＝アイコンに隠れても問題なし）
  h('div', {
    style: {
      position: 'absolute', left: '-30px', top: '-40px',
      width: '420px', height: '420px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.07)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }
  },
    h('span', {
      style: {
        color: 'rgba(255,255,255,0.18)',
        fontSize: '260px',
        fontWeight: 700,
        lineHeight: 1,
      }
    }, '忍')
  ),
  // 左下グロー（装飾エリア）
  h('div', {
    style: {
      position: 'absolute', left: '-60px', bottom: '-60px',
      width: '380px', height: '380px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 65%)',
    }
  }),
  // 中央〜右：テキストエリア（安全ゾーン）
  h('div', {
    style: {
      position: 'absolute',
      left: '380px', top: 0,
      right: 0, bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '40px 100px 40px 60px',
      gap: '16px',
    }
  },
    // ロゴ行
    h('div', {
      style: { display: 'flex', alignItems: 'center', gap: '16px' }
    },
      h('div', {
        style: {
          width: '52px', height: '52px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.2)',
          border: '2px solid rgba(255,255,255,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }
      },
        h('span', { style: { color: '#fff', fontSize: '26px', fontWeight: 700 } }, '忍')
      ),
      h('span', { style: { color: 'rgba(255,255,255,0.85)', fontSize: '28px', fontWeight: 700 } },
        'ナルボル体験談'
      ),
    ),
    // ヒーローコピー
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
      h('div', {
        style: { color: '#ffffff', fontSize: '68px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.01em' }
      }, '引き込まれたのは、'),
      h('div', {
        style: { color: '#ffffff', fontSize: '68px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.01em' }
      }, 'どんな瞬間でしたか。'),
    ),
    // サブコピー＋URL
    h('div', {
      style: { display: 'flex', alignItems: 'center', gap: '28px', marginTop: '8px' }
    },
      h('span', { style: { color: 'rgba(255,255,255,0.7)', fontSize: '22px', fontWeight: 400 } },
        'NARUTO・BORUTOファンの体験談サイト'
      ),
      h('span', { style: { color: 'rgba(255,255,255,0.45)', fontSize: '20px' } },
        'naruboru-taiken.github.io'
      ),
    ),
  )
);

const svg = await satori(card, { width: 1500, height: 500, fonts });
const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync('x-header.png', png);
console.log('✅ x-header.png を生成しました');
