---
title: "Cutting our Cloudflare Workers bundle in half with Next.js 15 tree-shaking."
description: "How we used optimizePackageImports, modularizeImports, and strategic dynamic imports to shrink a Next.js 15 app down to fit comfortably inside Cloudflare Workers limits — and what we learned about icon libraries along the way."
topic: "Performance"
authors: ["Methika Fernando"]
authorInitials: ["MF"]
authorRoles: ["Software Engineer"]
date: 2025-12-03
readTime: "11 min"
featured: false
deck: "How we used optimizePackageImports, modularizeImports, and strategic dynamic imports to shrink a Next.js 15 app down to fit comfortably inside Cloudflare Workers limits."
heroImage: "/assets/nextjs.png"
---

<p class="lede">Cloudflare Workers has a 1 MB compressed bundle limit for the Worker script itself. Next.js 15 apps deployed via <code>@opennextjs/cloudflare</code> sit somewhere between "fine" and "you've exceeded the limit" depending entirely on how liberally your team imports UI libraries. We hit the wall at around 1.4 MB compressed and spent a sprint bringing it back to 580 KB. Here's the exact playbook.</p>

The app in question is a member portal and shop — active codebase, around 60 pages, heavy use of Framer Motion for page transitions, Lucide React for icons everywhere, and a healthy sprinkling of Heroicons left over from an earlier designer. The kind of codebase where "just add a component" has happened hundreds of times without anyone pausing to ask what that import actually costs.

## Why the Workers limit is different from regular Next.js

When you deploy to Vercel or a Node server, your JS bundle is large but it's split across many chunks loaded lazily. The Workers environment doesn't work that way — there's a single Worker script that has to fit inside the limit before any code splitting kicks in. The `@opennextjs/cloudflare` adapter does split routes into separate Worker scripts, but the shared chunk (your common dependencies) still needs to fit, and it's usually the shared chunk that's the problem.

The Cloudflare limit as of late 2025 is 1 MB compressed for the Worker script bundle, with a 25 MB uncompressed cap.[^1] We were hitting the compressed limit, not the uncompressed one — which meant our problem was code duplication inside the bundle, not raw size.

## Step 1: `optimizePackageImports`

The first tool Next.js gives you is `optimizePackageImports` in `next.config.ts`. This tells the bundler to treat a package as having a tree-shakeable barrel export even when it doesn't natively declare itself as one:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@heroicons/react',
      'react-icons',
    ],
  },
};
```

Before this change, `import { motion } from 'framer-motion'` was pulling in the entire library including animation primitives we never use (layout animations, drag, 3D transforms). After it, the bundler only includes what we actually reference.

The impact was immediate and significant. Framer Motion alone went from ~160 KB to ~42 KB in the shared chunk. Lucide dropped from ~74 KB to ~11 KB. The catches:

- Some packages don't tree-shake cleanly even with this hint. `react-icons` is one of them — see step 2.
- This only applies to the server bundle. Client-side bundle splitting still handles dynamic page imports separately.
- You need to restart the dev server after adding this. The build cache does not pick it up.

## Step 2: `modularizeImports` for icon libraries

`react-icons` doesn't respond well to `optimizePackageImports` because of how its internal barrel files are structured. The library re-exports from dozens of sub-packages (`/fa`, `/hi`, `/md`, etc.) and the bundler can't easily eliminate unused sub-packages even with tree-shaking hints.

The correct tool here is `modularizeImports`, which rewrites import paths at compile time:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', '@heroicons/react'],
    modularizeImports: {
      'react-icons/?(((\\w*)?/?)*)': {
        transform: 'react-icons/{{ matches.[1] }}/{{ member }}',
      },
    },
  },
};
```

This transforms:

```typescript
import { FaGithub, FaTwitter } from 'react-icons/fa';
// becomes
import FaGithub from 'react-icons/fa/FaGithub';
import FaTwitter from 'react-icons/fa/FaTwitter';
```

Each icon is now a direct file import. The bundler includes exactly two icon files instead of the entire Font Awesome subset. We had around 18 `react-icons` imports across the codebase; after `modularizeImports` the contribution of react-icons to the bundle went from ~38 KB to ~2.3 KB.

## Step 3: Dynamic imports for below-the-fold content

Icon libraries were the bulk of the problem, but the homepage still had seven section components — testimonials, pricing table, feature grid, FAQ, partner logos — all loading synchronously on first render. None of them are visible without scrolling.

We converted all seven to dynamic imports:

```typescript
// before
import { TestimonialsSection } from '@/components/home/testimonials';
import { PricingSection } from '@/components/home/pricing';
import { FaqSection } from '@/components/home/faq';

// after
import dynamic from 'next/dynamic';

const TestimonialsSection = dynamic(
  () => import('@/components/home/testimonials').then(m => m.TestimonialsSection),
  { loading: () => <SectionSkeleton /> }
);
const PricingSection = dynamic(
  () => import('@/components/home/pricing').then(m => m.PricingSection),
  { loading: () => <SectionSkeleton /> }
);
const FaqSection = dynamic(
  () => import('@/components/home/faq').then(m => m.FaqSection),
  { loading: () => <SectionSkeleton /> }
);
```

Every dynamic import needs a loading state, and the loading state has to be in the shared chunk. We wrote a generic `<SectionSkeleton />` — an animated pulse block sized to roughly match the content it replaces — so the page doesn't jump during hydration.

The key rule for skeleton loading states when deploying to Workers: keep them simple. A skeleton that imports Framer Motion for its pulse animation defeats the purpose. Ours is 12 lines of Tailwind classes with a CSS animation.

## Step 4: Audit with `@next/bundle-analyzer`

Before and after each change, we ran the bundle analyzer to verify we were actually moving the needle:

```json
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}
```

```typescript
// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
```

The treemap view is the most useful part. Look for any single block that's unexpectedly large — in our case we found a date formatting library (`date-fns`) that was being imported as a full barrel import in an admin-only component. Splitting that to named imports (`import { format, parseISO } from 'date-fns'`) trimmed another 28 KB.[^3]

## Results

<div class="stats">
  <div>
    <div class="stat-num">580<span class="unit">KB</span></div>
    <div class="stat-lbl">Compressed shared bundle after optimization, down from 1.4 MB.</div>
  </div>
  <div>
    <div class="stat-num">−74<span class="unit">%</span></div>
    <div class="stat-lbl">Reduction in Framer Motion contribution to the shared chunk.</div>
  </div>
  <div>
    <div class="stat-num">−94<span class="unit">%</span></div>
    <div class="stat-lbl">Reduction in react-icons bundle size after modularizeImports.</div>
  </div>
</div>

Everything tested against `@opennextjs/cloudflare` v1.6.3. The Cloudflare preview deployment (via `wrangler pages deploy`) went from a build warning about bundle size to no warning at all.

## What doesn't work

A few things we tried that didn't help or caused problems:

**`ssr: false` on Framer Motion components.** Disabling SSR for animated components breaks the hydration story and causes layout shift on page load. Not worth it.

**Manual chunk splitting in webpack config.** The `@opennextjs/cloudflare` adapter has its own opinions about code splitting and overriding them is poorly documented. We wasted an afternoon here. The right tools are the Next.js-native ones described above.

**Replacing Lucide with a smaller icon set.** We looked at this. The time cost of swapping ~300 icon usages across the codebase outweighed the 11 KB saving after `optimizePackageImports` was applied. Sometimes the right answer is the boring answer.

## The meta-lesson

Bundle size problems in Next.js are almost always caused by a small number of packages that import more than you think. The fix is usually one or two config changes, not a rewrite. Run the analyzer first, make the change that moves the biggest block, run it again. Three cycles of that and you're usually done.

If you're deploying to Cloudflare Workers specifically, set a CI size check so you find out about regressions before they become a deployment failure:

```yaml
# .github/workflows/build.yml
- name: Check bundle size
  run: |
    SIZE=$(wrangler pages deploy --dry-run 2>&1 | grep "gzip" | awk '{print $2}')
    echo "Bundle size: ${SIZE}"
```

The exact command depends on your wrangler version, but the principle holds: fail the PR before it merges, not after it deploys.

---

[^1]: Cloudflare Workers size limits: [developers.cloudflare.com/workers/platform/limits](https://developers.cloudflare.com/workers/platform/limits/)
[^2]: Next.js `optimizePackageImports` docs: [nextjs.org/docs/app/api-reference/next-config-js/optimizePackageImports](https://nextjs.org/docs/app/api-reference/next-config-js/optimizePackageImports)
[^3]: `@opennextjs/cloudflare` adapter: [opennext.js.org/cloudflare](https://opennext.js.org/cloudflare)
[^4]: `@next/bundle-analyzer`: [npmjs.com/package/@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

<p style="margin-top: 3em; font-family: var(--sans); font-size: 13px; color: var(--muted); padding-top: 24px; border-top: 1px solid var(--line-soft);">
  Questions or corrections: <a href="mailto:engineering@bbyb.dev">engineering@bbyb.dev</a>
</p>
