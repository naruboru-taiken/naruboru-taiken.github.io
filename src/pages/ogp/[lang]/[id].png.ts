import type { APIRoute } from 'astro';
import stories from '../../../data/stories.json';
import { SUPPORTED_LANGS, ui } from '../../../i18n/ui';
import type { SupportedLang } from '../../../i18n/ui';
import satori from 'satori';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ── フォント読み込み ──
const fontDir    = resolve(process.cwd(), 'node_modules/@fontsource/noto-sans-jp/files');
const fontDirKr  = resolve(process.cwd(), 'node_modules/@fontsource/noto-sans-kr/files');
const fontDirAr  = resolve(process.cwd(), 'node_modules/@fontsource/cairo/files');

const fonts = [
  { name: 'Noto Sans JP', data: readFileSync(resolve(fontDir,   'noto-sans-jp-japanese-700-normal.woff')),   weight: 700 as const, style: 'normal' as const },
  { name: 'Noto Sans JP', data: readFileSync(resolve(fontDir,   'noto-sans-jp-latin-700-normal.woff')),       weight: 700 as const, style: 'normal' as const },
  { name: 'Noto Sans JP', data: readFileSync(resolve(fontDir,   'noto-sans-jp-japanese-400-normal.woff')),   weight: 400 as const, style: 'normal' as const },
  { name: 'Noto Sans JP', data: readFileSync(resolve(fontDir,   'noto-sans-jp-latin-400-normal.woff')),       weight: 400 as const, style: 'normal' as const },
  { name: 'Noto Sans KR', data: readFileSync(resolve(fontDirKr, 'noto-sans-kr-korean-700-normal.woff')),     weight: 700 as const, style: 'normal' as const },
  { name: 'Noto Sans KR', data: readFileSync(resolve(fontDirKr, 'noto-sans-kr-korean-400-normal.woff')),     weight: 400 as const, style: 'normal' as const },
  { name: 'Cairo',        data: readFileSync(resolve(fontDirAr, 'cairo-arabic-700-normal.woff')),             weight: 700 as const, style: 'normal' as const },
  { name: 'Cairo',        data: readFileSync(resolve(fontDirAr, 'cairo-arabic-400-normal.woff')),             weight: 400 as const, style: 'normal' as const },
];

// ── satori用 要素ヘルパー ──
type Child = string | number | SNode | null | undefined;
interface SNode { type: string; props: Record<string, any>; }

function h(type: string, props: Record<string, any> = {}, ...children: (Child | Child[])[]): SNode {
  const flat = children.flat().filter(c => c != null) as (string | number | SNode)[];
  return {
    type,
    props: { ...props, ...(flat.length ? { children: flat.length === 1 ? flat[0] : flat } : {}) },
  };
}

const FONT_FAMILY: Record<string, string> = {
  ko: '"Noto Sans KR", "Noto Sans JP"',
  ar: 'Cairo, "Noto Sans JP"',
};

function getDisplayCatchphrase(story: (typeof stories)[number], lang: SupportedLang): string {
  const tr = (story as any).translations?.[lang];
  const cp = tr?.catchphrase || story.catchphrase;
  if (cp) return cp;
  const mainStory = tr?.mainStory || (story as any).mainStory || '';
  const fallback = mainStory || tr?.triggerScene || (story as any).triggerScene || '';
  return fallback.length > 60 ? fallback.slice(0, 60) + '…' : fallback;
}

function buildCard(story: (typeof stories)[number], lang: SupportedLang): SNode {
  const cp = getDisplayCatchphrase(story, lang);
  const fontSize = cp.length > 34 ? '40px' : cp.length > 22 ? '46px' : '54px';
  const siteName   = ui[lang]?.['site.name'] ?? 'Naruboru Fan Stories';
  const fontFamily = FONT_FAMILY[lang] ?? '"Noto Sans JP"';

  const pill = (text: string, bg: string) =>
    h('div', {
      style: {
        display: 'flex',
        backgroundColor: bg,
        color: '#fff',
        padding: '6px 18px',
        borderRadius: '6px',
        fontSize: '22px',
        fontWeight: 700,
      }
    }, text);

  return h('div', {
    style: {
      width: '1200px',
      height: '630px',
      display: 'flex',
      backgroundColor: '#1a1a2e',
      position: 'relative',
      fontFamily,
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
    // オレンジグロー装飾
    h('div', {
      style: {
        position: 'absolute', left: '-80px', top: '-80px',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,98,26,0.18) 0%, rgba(232,98,26,0) 70%)',
      }
    }),
    // メインコンテンツ
    h('div', {
      style: {
        display: 'flex', flexDirection: 'column',
        padding: '50px 70px 46px 84px',
        flex: 1,
      }
    },
      // ヘッダー行
      h('div', {
        style: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }
      },
        h('div', {
          style: {
            width: '60px', height: '60px',
            borderRadius: '50%',
            backgroundColor: '#e8621a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }
        },
          h('span', { style: { color: '#fff', fontSize: '32px', fontWeight: 700 } }, '忍')
        ),
        h('span', { style: { color: '#fff', fontSize: '32px', fontWeight: 700 } }, siteName)
      ),
      // 区切り線
      h('div', {
        style: {
          width: '100%', height: '2px',
          backgroundColor: 'rgba(232,98,26,0.5)',
          marginBottom: '26px',
        }
      }),
      // キャッチフレーズ
      h('div', {
        style: {
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          color: '#ffffff',
          fontSize,
          fontWeight: 700,
          lineHeight: 1.6,
          wordBreak: 'break-word',
        }
      }, `"${cp}"`),
      // ボトム行
      h('div', {
        style: {
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '22px',
        }
      },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
          h('span', { style: { color: 'rgba(255,255,255,0.65)', fontSize: '24px' } },
            `— ${story.displayName}`
          ),
          story.firstSeries ? pill(story.firstSeries, '#e8621a') : null,
          story.firstMedia ? pill(story.firstMedia, '#3d3d72') : null,
        ),
        h('span', { style: { color: 'rgba(255,255,255,0.3)', fontSize: '18px' } },
          'naruboru-taiken.github.io'
        )
      )
    )
  );
}

export function getStaticPaths() {
  const list = stories as any[];
  return SUPPORTED_LANGS.flatMap(lang =>
    list.map(story => ({
      params: { lang, id: story.id },
      props: { story, lang },
    }))
  );
}

export const GET: APIRoute = async ({ props }) => {
  const { story, lang } = props as { story: any; lang: SupportedLang };

  const svg = await satori(buildCard(story as any, lang), {
    width: 1200,
    height: 630,
    fonts,
  });

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
