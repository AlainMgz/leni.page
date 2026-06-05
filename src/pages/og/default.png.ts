import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const fontRegular = readFileSync(resolve('./public/fonts/JetBrainsMono-Regular.ttf'));
const fontBold    = readFileSync(resolve('./public/fonts/JetBrainsMono-Bold.ttf'));

export const GET: APIRoute = async () => {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          background: '#0a0a12',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'JetBrains Mono',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                fontSize: '72px',
                fontWeight: 700,
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: { color: 'rgba(255,255,255,0.92)' },
                    children: 'leni',
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: { color: 'rgba(139,92,246,0.9)' },
                    children: '.',
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: '18px',
                color: 'rgba(255,255,255,0.25)',
                marginTop: '16px',
                letterSpacing: '0.1em',
              },
              children: 'security research',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'JetBrains Mono', data: fontRegular, weight: 400, style: 'normal' },
        { name: 'JetBrains Mono', data: fontBold,    weight: 700, style: 'normal' },
      ],
    }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const png = resvg.render().asPng();

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
