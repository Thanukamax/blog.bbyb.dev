# blog.bbyb.dev

Source code for the [BitByBit blog](https://blog.bbyb.dev) — a statically generated blog built with [Astro](https://astro.build) and deployed on [Cloudflare Pages](https://pages.cloudflare.com).

## Tech Stack

- **Framework:** [Astro](https://astro.build) (static output)
- **Content:** Markdown / MDX via Astro Content Collections
- **Syntax Highlighting:** Shiki (`github-dark` theme)
- **RSS:** `@astrojs/rss`
- **Deployment:** Cloudflare Pages (via Wrangler)

## Local Development

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

## Project Structure

```
src/
├── content/
│   └── blog/        # Markdown / MDX blog posts
├── components/      # Reusable Astro components
├── layouts/         # Page layouts
├── pages/           # Route pages (index, [slug], feed.xml)
├── styles/          # Global styles
└── utils/           # Helper utilities
public/              # Static assets served as-is
```

## Writing a Post

Create a new `.md` or `.mdx` file inside `src/content/blog/`. Every post requires the following frontmatter:

```yaml
---
title: "Your Post Title"
description: "A short description of the post."
topic: "Category"
authors: ["Author Name"]
authorInitials: ["AN"]
authorRoles: ["Role"]   # optional
date: 2025-01-01
readTime: "5 min"
featured: false         # optional, default false
deck: "Subtitle text"   # optional
heroImage: "/hero.png"  # optional
---
```

## License

This project is **source available**. You may read and reference the source code, but you may not copy, distribute, or use it to build your own product or service. See [LICENSE](./LICENSE) for the full terms.
