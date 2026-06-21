---
title: "We wanted Drizzle query caching on Cloudflare without Redis. So we built the KV adapter ourselves."
description: "Drizzle's cache layer ships with a Redis/Upstash adapter, but on Workers and D1 you rarely want to stand up Redis just to cache a few hot queries. So we built and open-sourced a Cloudflare KV cache adapter on top of Drizzle's pluggable cache interface — here's how it works and why we're committing to maintaining it."
topic: "Infrastructure"
authors: ["Thanuka Sehasna Perera", "Ranuga Disansa"]
authorInitials: ["TP", "RD"]
authorRoles: ["Software Engineer", "Software Engineer"]
date: 2026-06-21
readTime: "9 min"
featured: false
deck: "Drizzle's cache layer ships with Redis/Upstash. On Workers and D1, we wanted to reuse the KV namespace we already had — so we built and open-sourced a Cloudflare KV cache adapter, and we're committing to maintaining it."
heroImage: "/assets/drizzle-kv.png"
---

<p class="lede">Drizzle ORM has first-party query caching. You opt in with <code>.$withCache()</code>, mutations auto-invalidate, and the whole thing is backed by a pluggable cache interface. The one adapter that ships in the box talks to Redis or Upstash. That's a perfectly good default — unless you're already all-in on Cloudflare, in which case standing up a Redis instance just to cache a handful of read-heavy queries feels like adding a moving part you didn't need.</p>

We kept hitting that wall across our own projects. Workers and D1 apps where the data was read-heavy, the staleness budget was generous, and there was already a KV namespace bound to the Worker doing nothing but holding a few feature flags. KV is right there — globally replicated, free-tier friendly, one binding away. The obvious move was to point Drizzle's cache at it.

So we did, and then we open-sourced the result: [`drizzle-cloudflare-kv-cache-adapter`](https://github.com/BitByBit-B3/drizzle-cloudflare-kv-cache-adapter).

## Where this started

This didn't start as a "build our own" decision. It started as a note-to-self in the form of a feature request. In May we opened [drizzle-team/drizzle-orm#5758](https://github.com/drizzle-team/drizzle-orm/issues/5758) floating the idea of a first-party Cloudflare KV cache adapter alongside the existing `upstashCache()` — the thinking being that Cloudflare-native apps shouldn't have to pull in an external Redis dependency just to use a caching feature Drizzle already supports.[^1] We mention it here mostly as a reference point: it's where the idea is written down, and it's a credit to Drizzle's design that the cache layer is pluggable enough to make this approachable in the first place.

We could have taken a run at it as an upstream PR. We chose not to — and that's on us, not on Drizzle. Adding a Cloudflare-specific adapter to a database-agnostic ORM is a real design decision: it touches their release cadence, their support surface, and trade-offs that are rightly theirs to own. A standalone package let us move at our own pace, iterate on the KV-specific details, and keep the maintenance on our plate rather than theirs. And because the cache interface is a public extension point, we didn't need to be in core to do it properly — so we wrote the adapter against Drizzle's `Cache` base class and shipped it as its own package.

To be clear about what this is: it is **not** a fork of Drizzle and **not** a database driver. It implements exactly one thing — Drizzle's query cache layer (`.$withCache()` and `db.$cache.invalidate(...)`) — and nothing else.[^2]

## What it looks like to use

The whole point was that it should feel like the Redis adapter, just pointed at a binding you already have. You create a KV namespace, bind it in your Wrangler config, and pass it to `drizzle()`:

```ts
import { drizzle } from 'drizzle-orm/d1'
import { cloudflareKVCache } from 'drizzle-cloudflare-kv-cache-adapter'

export default {
  async fetch(request: Request, env: Env) {
    const db = drizzle(env.DB, {
      cache: cloudflareKVCache(env.CACHE),
    })

    // Only this query is cached — opt-in by default.
    const users = await db.select().from(usersTable).$withCache()
    return Response.json(users)
  },
}
```

By default the strategy is `explicit`: nothing is cached unless you ask for it with `.$withCache()`. If you'd rather cache every read and invalidate automatically, flip one option:

```ts
const db = drizzle(env.DB, {
  cache: cloudflareKVCache(env.CACHE, { strategy: 'all' }),
})
```

Per-query TTLs come through Drizzle's config, in seconds:

```ts
const posts = await db.select().from(postsTable).$withCache({ config: { ex: 600 } })
```

## How invalidation actually works

Caching is the easy half. Knowing *when to throw a cached result away* is where adapters get interesting, and KV makes you work for it because it has no "scan keys by pattern" operation. You can't ask KV "give me every query that touched the `users` table." So we maintain that mapping ourselves.

Two kinds of keys live in your namespace, both under a configurable `prefix` (default `drizzle`):

- `{prefix}:q:{hash}` — the JSON-serialized result of one cached query (tagged queries live under `{prefix}:t:{tag}`).
- `{prefix}:tindex:{table}` — a reverse index: the list of storage keys that read that table.

On a **write** (`put`), the adapter stores the result, then appends that result's key to the reverse index of every table the query referenced. On a **mutation** (`onMutate`, fired by any `insert`/`update`/`delete` through Drizzle), it reads the affected table's index, deletes every query key listed there, and then deletes the index itself. Mutations therefore invalidate exactly the cached queries that depended on the mutated tables — no pattern scan required.

One small but important detail: the reverse index is written with **double the query's TTL**. A query that races in late shouldn't write itself into an index that's about to expire out from under it, but the index also shouldn't outlive the data it points at by much. Twice the TTL is the cheap compromise that keeps both true.[^3]

You can also invalidate by hand when you mutate data outside Drizzle:

```ts
await db.$cache.invalidate({ tables: 'users' })
await db.$cache.invalidate({ tables: ['users', 'posts'] })
```

## The honest caveats

We'd rather you hit the limits in our README than in production, so here they are plainly.

KV is **eventually consistent**. A key you just invalidated may serve a stale value in another region for a short window while the change propagates. KV also enforces a **60-second minimum on key expiration** — the only TTL the adapter sets is each entry's `expirationTtl`, so it clamps anything lower rather than pretending sub-minute freshness is on the table. And invalidation is **table-scoped, not row-scoped**: mutating one row in `users` drops every cached query that reads `users`. That keeps the logic cheap and correct at the cost of some over-invalidation on hot tables.

The reverse index is best-effort and uses last-write-wins, so under heavy concurrent writes to the same table a racing index update can miss an entry. TTLs are the backstop: even a missed entry expires on its own, so the cache can't leak stale data indefinitely. The short version of all of this: KV is the right home for read-heavy data that tolerates brief staleness — config, catalogs, public profiles — and the wrong home for read-after-write strong consistency. We say so in the docs too.[^4]

## Why we're treating this as a real project

It would have been easy to leave this as an internal `lib/` file copied between repos. We deliberately didn't, for two reasons.

The first is selfish and practical: this adapter is now in the request path of several of our own Workers/D1 apps. We are the first people who get paged if it's wrong, so it gets tests, a CI gate (typecheck, test, build on every PR), semver, and a changelog regardless of whether anyone else ever installs it. Open-sourcing it doesn't add much overhead on top of the bar we already had to hold it to internally.

The second is that the need we hit is not ours alone. Every team building Drizzle-on-Cloudflare runs into the same "do I really need Redis for this?" question, and right now there's no first-party answer for it — which is a perfectly reasonable place for an ORM to draw its scope. That's exactly the kind of niche an external adapter is good at filling, so long as it's actually maintained rather than a clever gist that bit-rots in six months. So we're committing to keeping this one current with Drizzle's cache interface and stable for the long run — it's an open-source initiative from our side, not a one-off dump.

If a first-party Cloudflare KV adapter ever lands in Drizzle, wonderful — we'll happily help people migrate to it. Until then, this is the boring, tested, documented version of the thing you were about to write yourself.

It's MIT-licensed, on [npm](https://www.npmjs.com/package/drizzle-cloudflare-kv-cache-adapter), and the full docs — setup, strategies, the invalidation model, the API reference — live at [drizzle-kv-cache.bbyb.dev](https://drizzle-kv-cache.bbyb.dev). Issues and PRs are genuinely welcome.

---

[^1]: Upstream feature request: [drizzle-team/drizzle-orm#5758](https://github.com/drizzle-team/drizzle-orm/issues/5758)
[^2]: Drizzle ORM cache documentation: [orm.drizzle.team/docs/cache](https://orm.drizzle.team/docs/cache)
[^3]: How it works — key layout and invalidation: [drizzle-kv-cache.bbyb.dev/guides/how-it-works](https://drizzle-kv-cache.bbyb.dev/guides/how-it-works/)
[^4]: Cloudflare KV — consistency and limits: [developers.cloudflare.com/kv](https://developers.cloudflare.com/kv/)

<p style="margin-top: 3em; font-family: var(--sans); font-size: 13px; color: var(--muted); padding-top: 24px; border-top: 1px solid var(--line-soft);">
  Questions or corrections: <a href="mailto:engineering@bbyb.dev">engineering@bbyb.dev</a>
</p>
