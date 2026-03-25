import type { APIRoute } from 'astro';
import satori from 'satori';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const fontDir = resolve(process.cwd(), 'node_modules/@fontsource/noto-sans-jp/files');
const fonts = [
  { name: 'Noto Sans JP', data: readFileSync(resolve(fontDir, 'noto-sans-jp-japanese-700-normal.woff')), weight: 700 as const, style: 'normal' as const },
  { name: 'Noto Sans JP', data: readFileSync(resolve(fontDir, 'noto-sans-jp-latin-700-normal.woff')),   weight: 700 as const, style: 'normal' as const },
  { name: 'Noto Sans JP', data: readFileSync(resolve(fontDir, 'noto-sans-jp-japanese-400-normal.woff')), weight: 400 as const, style: 'normal' as const },
  { name: 'Noto Sans JP', data: readFileSync(resolve(fontDir, 'noto-sans-jp-latin-400-normal.woff')),   weight: 400 as const, style: 'normal' as const },
];

type Child = string | number | SNode | null | undefined;
interface SNode { type: string; props: Record<string, any>; }
function h(type: string, props: Record<string, any> = {}, ...children: (Child | Child[])[]): SNode {
  const flat = children.flat().filter(c => c != null) as (string | number | SNode)[];
  return {
    type,
    props: { ...props, ...(flat.length ? { children: flat.length === 1 ? flat[0] : flat } : {}) },
  };
}

function buildCard(): SNode {
  return h('div', {
    style: {
      width: '1200px',
      height: '630px',
      display: 'flex',
      backgroundColor: '#1a1a2e',
      position: 'relative',
      fontFamily: '"Noto Sans JP"',
    }
  },
    // 左アクセントバー
    h('div', {
      style: {
        position: 'absolute', left: 0, top: 0,
        width: '14px', height: '630px',
        backgroundColor: '#e8621a',
      }
    }),
    // オレンジグロー（左上）
    h('div', {
      style: {
        position: 'absolute', left: '-80px', top: '-80px',
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,98,26,0.2) 0%, rgba(232,98,26,0) 70%)',
      }
    }),
    // オレンジグロー（右下）
    h('div', {
      style: {
        position: 'absolute', right: '-60px', bottom: '-60px',
        width: '400px', height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,98,26,0.12) 0%, rgba(232,98,26,0) 70%)',
      }
    }),
    // メインコンテンツ
    h('div', {
      style: {
        display: 'flex', flexDirection: 'column',
        padding: '54px 80px 50px 90px',
        flex: 1,
      }
    },
      // ヘッダー行（ロゴ）
      h('div', {
        style: { display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px' }
      },
        h('div', {
          style: {
            width: '64px', height: '64px',
            borderRadius: '50%',
            backgroundColor: '#e8621a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }
        },
          h('span', { style: { color: '#fff', fontSize: '34px', fontWeight: 700 } }, '忍')
        ),
        h('span', { style: { color: '#fff', fontSize: '34px', fontWeight: 700 } }, 'ナルボル体験談')
      ),
      // 区切り線
      h('div', {
        style: {
          width: '100%', height: '2px',
          backgroundColor: 'rgba(232,98,26,0.5)',
          marginBottom: '36px',
        }
      }),
      // ヒーローコピー
      h('div', {
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '20px',
        }
      },
        h('div', {
          style: {
            color: '#ffffff',
            fontSize: '58px',
            fontWeight: 700,
            lineHeight: 1.5,
          }
        }, '引き込まれたのは、'),
        h('div', {
          style: {
            color: '#ffffff',
            fontSize: '58px',
            fontWeight: 700,
            lineHeight: 1.5,
          }
        }, 'どんな瞬間でしたか。'),
        h('div', {
          style: {
            color: 'rgba(255,255,255,0.55)',
            fontSize: '26px',
            fontWeight: 400,
            marginTop: '8px',
          }
        }, 'NARUTO・BORUTOファンの体験談サイト'),
      ),
      // フッター行
      h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginTop: '24px',
        }
      },
        h('span', { style: { color: 'rgba(255,255,255,0.3)', fontSize: '20px' } },
          'naruboru-taiken.github.io'
        )
      )
    )
  );
}

export const GET: APIRoute = async () => {
  const svg = await satori(buildCard() as any, {
    width: 1200,
    height: 630,
    fonts,
  });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
