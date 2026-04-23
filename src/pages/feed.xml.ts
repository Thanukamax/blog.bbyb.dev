import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');
  const sorted = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'B3 Engineering Blog',
    description: 'Precision engineering, one bit at a time. Notes from the teams building B3.',
    site: context.site!,
    items: sorted.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      author: post.data.authors.join(' & '),
      link: `/${post.slug}/`,
    })),
  });
}
