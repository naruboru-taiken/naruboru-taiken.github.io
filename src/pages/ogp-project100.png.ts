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
      background: 'linear-gradient(to right, #e8621a 0%, #b84010 50%, #1a0808 100%)',
      position: 'relative',
      fontFamily: '"Noto Sans JP"',
      overflow: 'hidden',
    }
  },
    // 中央グロー（明るさを左寄りに）
    h('div', {
      style: {
        position: 'absolute',
        left: '-100px',
        top: '-100px',
        width: '900px',
        height: '900px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,140,60,0.3) 0%, rgba(255,140,60,0) 65%)',
      }
    }),
    // メインコンテンツ（中央揃え）
    h('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        padding: '60px 100px',
        position: 'relative',
        gap: '0px',
      }
    },
      // PROJECT 100 ラベル
      h('div', {
        style: {
          border: '1.5px solid rgba(255,255,255,0.6)',
          color: 'rgba(255,255,255,0.85)',
          fontSize: '16px',
          fontWeight: 700,
          letterSpacing: '0.2em',
          padding: '6px 20px',
          borderRadius: '4px',
          marginBottom: '48px',
        }
      }, 'PROJECT 100'),
      // メインコピー 1行目
      h('div', {
        style: {
          color: '#ffffff',
          fontSize: '80px',
          fontWeight: 700,
          lineHeight: 1.4,
          textAlign: 'center',
        }
      }, '100人の記憶を、'),
      // メインコピー 2行目
      h('div', {
        style: {
          color: '#ffffff',
          fontSize: '80px',
          fontWeight: 700,
          lineHeight: 1.4,
          textAlign: 'center',
          marginBottom: '40px',
        }
      }, 'ここに残す。'),
      // サブコピー
      h('div', {
        style: {
          color: 'rgba(255,255,255,0.75)',
          fontSize: '26px',
          fontWeight: 400,
          textAlign: 'center',
          lineHeight: 1.6,
          letterSpacing: '0.02em',
        }
      }, 'NARUTO・BORUTOに引き込まれた瞬間は、みんな違う。'),
      // URL
      h('div', {
        style: {
          position: 'absolute',
          bottom: '36px',
          right: '56px',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '18px',
          letterSpacing: '0.02em',
        }
      }, 'naruboru-taiken.github.io'),
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
