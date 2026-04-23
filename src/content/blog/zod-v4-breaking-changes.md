---
title: "Zod v4 broke our error handling. Here's how we migrated 23 files in a day."
description: "A practical walkthrough of the breaking changes in Zod v4 — error shape rewrites, enum errorMap, record types, and the mechanical steps that got us through a 23-file migration without a single regression."
topic: "TypeScript"
authors: ["Sithumli Nanyakara"]
authorInitials: ["SN"]
authorRoles: ["Frontend Engineer"]
date: 2025-11-12
readTime: "9 min"
featured: false
deck: "A practical walkthrough of the breaking changes in Zod v4 — error shape rewrites, enum errorMap, record types, and the steps that got us through a 23-file migration without a single regression."
heroImage: "/assets/zod.png"
---

<p class="lede">We upgraded Zod from v3 to v4 on a Friday afternoon. By Monday morning every single validation path in the codebase was green. That's the good version of the story. The bad version is the four hours on Saturday where we discovered that the error shape we'd been passing around for a year no longer existed.</p>

This is a migration guide born from that experience. We touched 23 files across payment routes, shop CRUD, analytics pipelines, and membership forms. The patterns repeat, so if you're staring at a Zod v4 upgrade and wondering where to start, this should save you most of the Saturday.

## What actually changed

Zod v4 is not a polish release. The core primitives mostly survive intact, but the error reporting layer was rebuilt from the ground up. Three specific changes caused 90% of our breakage.

### 1. `.errors` is now `.issues`

In Zod v3, when you called `safeParse` and the result was not ok, you reached for `result.error.errors`:

```typescript
// v3
const result = schema.safeParse(input);
if (!result.success) {
  const messages = result.error.errors.map(e => e.message);
}
```

In v4, the canonical array on `ZodError` is `.issues`. The `.errors` alias was removed in the final release (it existed briefly as a shim during the beta period, which is why our tests passed locally against an older dist):

```typescript
// v4
const result = schema.safeParse(input);
if (!result.success) {
  const messages = result.error.issues.map(e => e.message);
}
```

The `ZodIssue` type itself didn't change — the items in the array have the same shape. It's purely the property name on `ZodError` that moved. This is the change that hit us in the most places because we had a shared `formatZodError` utility that every API route imported.

### 2. `errorMap` signature for enums changed

We use `z.enum()` with custom error messages in several places — most visibly in the payment flow where the user selects a currency and we want a human-readable error instead of "Invalid enum value":

```typescript
// v3 — no longer compiles in v4
const CurrencySchema = z.enum(['LKR', 'USD', 'GBP'], {
  errorMap: (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_enum_value) {
      return { message: `"${ctx.data}" is not a supported currency` };
    }
    return { message: ctx.defaultError };
  },
});
```

In v4 the `errorMap` option was removed from enum-specific constructors and the recommended pattern became a refinement or a custom schema:

```typescript
// v4
const CurrencySchema = z.enum(['LKR', 'USD', 'GBP']).refine(
  val => ['LKR', 'USD', 'GBP'].includes(val),
  val => ({ message: `"${val}" is not a supported currency` })
);
```

For most of our cases the refine approach is fine because the enum is small and the custom message only fires on invalid input — never on the hot path.

### 3. `z.record()` type narrowing

The third breaking change was subtler. We use `z.record()` heavily in the analytics layer to validate incoming event payloads whose keys we don't know in advance:

```typescript
// v3 — worked fine
const EventMetaSchema = z.record(z.unknown());
type EventMeta = z.infer<typeof EventMetaSchema>; // Record<string, unknown>
```

In v4, `z.record()` requires an explicit key type as the first argument (previously it defaulted to `z.string()`):

```typescript
// v4 — explicit key type required for complex cases
const EventMetaSchema = z.record(z.string(), z.unknown());
```

For simple cases the implicit string key still works. But anywhere we had `z.record(z.union([...]))` as the value type, TypeScript started complaining because v4 resolves the overloads differently. The fix was mechanical: always pass both arguments.

## The migration playbook

We did this in three passes.

**Pass 1 — Error shape.** Find every `.errors` property access on a `ZodError`. In our codebase that was almost entirely inside the shared utility and a handful of API route error handlers:

```bash
grep -rn "\.errors\b" src/ --include="*.ts" --include="*.tsx" \
  | grep -v "node_modules"
```

Rename `.errors` to `.issues`. Run `tsc --noEmit`. Fix the type errors that surface (usually the downstream code that expected `ZodError` had to be re-typed).

**Pass 2 — Enum errorMaps.** Find custom `errorMap` options on `z.enum()`:

```bash
grep -rn "errorMap" src/ --include="*.ts" --include="*.tsx"
```

For each one, decide: is the custom message worth keeping? If yes, convert to `.refine()`. If the only reason the errorMap existed was to improve a message during development, remove it and let the default message stand.

**Pass 3 — Record types.** Find every `z.record(` call and make the key type explicit. This is a one-line change per occurrence but it's easy to miss because the TypeScript error only appears in strict mode:

```typescript
// before
z.record(z.string().max(100))

// after
z.record(z.string(), z.string().max(100))
```

After all three passes: `tsc --noEmit`, then the test suite. We had zero logic regressions. The only real work was in pass 1, and only because our `formatZodError` helper was inlined in a few places rather than imported.

## What we'd do differently

Two things in hindsight:

**Centralize error formatting sooner.** If you have a `ZodError` to string conversion that lives in more than one place, put it in a shared utility before you upgrade. Migrations like this are mechanical when there's a single source of truth and a grep-and-replace away from done when there isn't.

**Pin your Zod version in a root-level lockfile entry.** We were on the same major version across our monorepo but different patch releases, which meant the beta-era `.errors` alias was present in some Workers and absent in others. The resulting "passes locally, fails in CI" situation cost us two hours we shouldn't have lost.

## The upside

Zod v4 is meaningfully faster — the maintainers benchmarked it at roughly 2–7× the parse speed of v3 depending on schema complexity.[^1] For us, the hot path is membership form validation on submit (not a tight loop), so the speed difference wasn't the reason we upgraded. We upgraded because the v3 security advisory track was winding down and v4 was where future fixes would land.

The migration is about a day of focused work for a mid-sized TypeScript codebase. The patterns above cover the majority of it. The rest is TypeScript telling you what to fix, which is the right way to do a migration.

---

[^1]: Zod v4 release notes and benchmarks: [zod.dev/v4](https://zod.dev/v4)
[^2]: Zod GitHub migration guide: [github.com/colinhacks/zod/blob/main/MIGRATION.md](https://github.com/colinhacks/zod/blob/main/MIGRATION.md)
[^3]: Zod v4 `ZodError` API reference: [zod.dev/error-handling](https://zod.dev/error-handling)

<p style="margin-top: 3em; font-family: var(--sans); font-size: 13px; color: var(--muted); padding-top: 24px; border-top: 1px solid var(--line-soft);">
  Questions or corrections: <a href="mailto:engineering@bbyb.dev">engineering@bbyb.dev</a>
</p>
