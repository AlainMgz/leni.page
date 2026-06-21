import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const fontRegular = readFileSync(resolve('./public/fonts/JetBrainsMono-Regular.ttf'));
const fontBold    = readFileSync(resolve('./public/fonts/JetBrainsMono-Bold.ttf'));

const severityColor: Record<string, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#eab308',
  low:      '#22c55e',
  info:     '#6366f1',
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.map(post => ({
    params: { slug: post.id },
    props: {
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags,
      severity: post.data.severity,
      publishDate: post.data.publishDate,
    },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, description, tags, severity, publishDate } = props as {
    title: string;
    description: string;
    tags: string[];
    severity?: string;
    publishDate: Date;
  };

  const accentColor = severity ? severityColor[severity] : '#8b5cf6';

  const date = publishDate.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const shortDesc = description.length > 120
    ? `${description.slice(0, 120)}…`
    : description;

  const allTags = [
    ...(severity ? [{ label: severity, color: accentColor, bg: `${accentColor}22`, border: `${accentColor}55` }] : []),
    ...tags.slice(0, 3).map(t => ({
      label: t,
      color: 'rgba(255,255,255,0.3)',
      bg: 'rgba(255,255,255,0.05)',
      border: 'rgba(255,255,255,0.15)',
    })),
  ];

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
          justifyContent: 'space-between',
          padding: '64px 72px',
          fontFamily: 'JetBrains Mono',
        },
        children: [
          // Top accent bar
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '0px', left: '0px', right: '0px',
                height: '3px',
                background: accentColor,
                display: 'flex',
              },
            },
          },
          // Main content
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '0px',
              },
              children: [
                // Tags row
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'row',
                      gap: '8px',
                      marginBottom: '28px',
                    },
                    children: allTags.map(tag => ({
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: tag.color,
                          background: tag.bg,
                          border: `1px solid ${tag.border}`,
                          borderRadius: '4px',
                          padding: '3px 8px',
                        },
                        children: tag.label,
                      },
                    })),
                  },
                },
                // Title
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      fontSize: title.length > 50 ? '40px' : '52px',
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.92)',
                      lineHeight: 1.15,
                      letterSpacing: '-0.02em',
                      marginBottom: '20px',
                      maxWidth: '1000px',
                    },
                    children: title,
                  },
                },
                // Description
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      fontSize: '18px',
                      color: 'rgba(255,255,255,0.4)',
                      lineHeight: 1.6,
                      maxWidth: '900px',
                    },
                    children: shortDesc,
                  },
                },
              ],
            },
          },
          // Footer
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      fontSize: '18px',
                      fontWeight: 700,
                    },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: { color: 'rgba(255,255,255,0.9)' },
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
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.2)',
                    },
                    children: date,
                  },
                },
              ],
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
