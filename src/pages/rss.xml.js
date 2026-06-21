// src/pages/rss.xml.js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts', ({ data }) => !data.draft);

  return rss({
    title: 'leni.page',
    description: 'Security research and write-ups.',
    site: context.site,
    customData: '<language>en</language>',
    trailingSlash: false,
    items: posts
      .sort((a, b) => b.data.publishDate - a.data.publishDate)
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.publishDate,
        link: `/posts/${post.id}/`,
      })),
  });
}

