---
title: "AI-expandable components: rethinking what open-source maintainership looks like."
description: "We built a component library and then asked what happens if AI can extend it as well as a human contributor can. The answer changed how we think about library design, documentation, and the future of open source maintenance."
topic: "Open Source"
authors: ["Ranuga Disansa"]
authorInitials: ["RD"]
authorRoles: ["Software Engineer"]
date: 2026-02-18
readTime: "10 min"
featured: false
deck: "We built a component library and then asked what happens if AI can extend it as well as a human contributor. The answer changed how we think about library design, documentation, and the future of open-source maintenance."
heroImage: "/assets/elements.png"
---

there's a failure mode that every open source component library eventually hits.

it launches well. people start using it. PRs come in. and then the PRs come in faster than you can review them, and each one is slightly off — the component is there but the docs aren't, or the docs are there but the tokens are hardcoded, or everything's present but the accessibility is wrong. you spend more time fixing contributions than writing code. eventually you stop merging things. the library goes stale.

we've all seen it happen to projects we relied on.

when we started building Elements — a React component library on Radix UI primitives and Tailwind — we wanted to avoid that arc. so we started thinking about what actually makes a component library easy to contribute to. and somewhere in that process we ended up somewhere unexpected.

## the real cost of contributing a component

adding a component to Elements correctly means:

- matching the visual design language
- implementing accessibility (ARIA roles, keyboard navigation, focus management)
- writing Storybook stories
- updating the VitePress docs site
- adding tests
- using the existing design token system properly

a contributor who knows the codebase can do all of that in a few hours. a new contributor — someone who found the library, wants to add something, and has an afternoon — usually does maybe half of it. not out of laziness, just because there's a lot to know and it's not obvious where it's written down.

reviewing and fixing the other half takes maintainer time. multiply that by the number of PRs you get and suddenly maintainership is a second job.

at some point i started asking a different question. not "how do we review faster" but "what would it take for the contribution to be right the first time?" what would the spec need to look like for someone to follow it cold, with no prior context?

## what makes a codebase machine-legible

turns out the answer is the same stuff that makes a codebase legible to an experienced human contributor. just applied more rigorously than most projects bother with.

**consistent file structure.** every component in Elements lives in `packages/react/src/components/<Name>/` and has exactly four files: `index.ts`, `<Name>.tsx`, `<Name>.stories.tsx`, `<Name>.test.tsx`. no exceptions, no variations. when the structure is always the same, you don't need to explain it — it's just visible from any existing component.

**named design tokens everywhere.** colors, spacing, typography, shadows — all defined as CSS custom properties in `packages/core/src/tokens/`. components reference `var(--color-surface-2)`, not `#1c1c1e`. the token names are self-documenting. you can look at one component and know what's available without reading a separate style guide.

**typed props with JSDoc inline.** every prop is typed and documented in the same place as the type definition. not in a separate markdown file that drifts from the code over time. the source of truth is the TypeScript.

**a CONTRIBUTING.md that reads like a spec, not encouragement.** most contributing guides say things like "we welcome contributions!" and then leave the hard part out. ours is a checklist. file structure, naming conventions, accessibility test commands, review criteria. all of it, in one place.

once we had all of this locked down for human contributors, we noticed something: an LLM following the same guide produces roughly the same quality output as a human following it. which made sense in retrospect — machine-legible and human-legible turn out to be the same property.

## what we changed once we leaned into this

**AGENTS.md in every package.** this is the biggest one. each package has an `AGENTS.md` alongside the `README.md`. the README explains what the package is for. the `AGENTS.md` explains how to extend it — which files need to change when adding a component, which tokens to prefer, what the test assertions should verify, how stories should be structured.

it's usually 80–120 lines. but it's the difference between a first draft that passes review and a first draft that needs three rounds of back-and-forth. we've seen this clearly enough now that i wouldn't build a library without one.

**slots, not props.** the hardest thing for any contributor is adding behavior to an existing component without breaking existing users. the easy answer is to add a prop. the problem is that props accumulate and components become unmanageable.

we use Radix UI's slot pattern instead, which pushes composition to the callsite:

```tsx
// before — "badge" needs a new prop on Button
<Button badge={count}>Notifications</Button>

// after — composition at callsite, no changes to Button internals
<Button>
  <Button.Content>Notifications</Button.Content>
  <Button.Badge>{count}</Button.Badge>
</Button>
```

contributors add slots, not props. they almost never need to touch existing component internals. the surface area for breaking changes is dramatically smaller.[^1]

**generated docs from source.** the VitePress docs site has a build step that reads component prop types and generates the props table automatically. docs can't drift from the code because they're derived from it. a contributor who only touches `<Name>.tsx` gets correct documentation without doing anything extra.[^2]

## six months in

some actual numbers:

before the AGENTS.md approach, a new component addition took an average of four review cycles and about a week of wall-clock time. now it's closer to one cycle and two days.

we run a custom ESLint rule that flags hardcoded color values in component files. the violation rate was running at about 30% of new components before we made the token system explicit in the spec. it's near zero now.

when contributors use Claude or Cursor to help write a component, the quality of the first draft is noticeably better than it was before. we can usually tell from the PR description when AI was involved, and those PRs require fewer revision cycles on average. the structured context does what it's supposed to do.

## what this isn't

i want to be honest about what we're actually claiming here, because "AI-expandable" sounds bigger than it is.

this is not AI-generated components. every component was written by a human, reviewed by a human, merged by a human. what we've done is structure things consistently enough that AI can assist contributors more effectively. that's a real improvement but it's not magic.

this is not novel as a technique. "AI-expandable" is basically "well-structured with good documentation," just named differently to make the point that the same properties that help human contributors help AI-assisted contributors. the insight is the connection, not the individual practices.

and it's not a guarantee. consistency helps but it doesn't eliminate bad contributions. accessibility errors still sneak through. our CI runs axe checks on every Storybook story which catches most of it, but it catches it in CI, not before the PR is opened.[^4]

## the actual claim

i think "AI-expandable" is going to become a real axis for evaluating open source projects. not because AI is taking over, but because the contributor base is becoming increasingly AI-assisted. projects with consistent structure and machine-legible contribution patterns will get better contributions from that base. projects that don't will keep struggling with the same maintenance economics.

the thing is, none of this requires anything exotic. it requires being rigorous about consistency — naming things the same way, structuring files the same way, writing specs instead of encouragement. that rigor pays off for human contributors first. the AI-assisted dividend is secondary.

if your library is starting to feel like a maintenance burden, it's probably worth asking whether the problem is lack of contributors or lack of structure. in my experience it's usually both, and fixing the structure fixes both at once.

---

Elements is open source at [github.com/b3/elements](https://github.com/b3/elements). steal the `AGENTS.md` pattern if it's useful.

[^1]: Radix UI slot pattern: [radix-ui.com/primitives/docs/utilities/slot](https://www.radix-ui.com/primitives/docs/utilities/slot)
[^2]: VitePress documentation framework: [vitepress.dev](https://vitepress.dev)
[^3]: pnpm workspaces: [pnpm.io/workspaces](https://pnpm.io/workspaces)
[^4]: axe-core accessibility testing: [github.com/dequelabs/axe-core](https://github.com/dequelabs/axe-core)
[^5]: Anthropic's guidance on AGENTS.md files: [docs.anthropic.com/en/docs/claude-code/memory](https://docs.anthropic.com/en/docs/claude-code/memory)

<p style="margin-top: 3em; font-family: var(--sans); font-size: 13px; color: var(--muted); padding-top: 24px; border-top: 1px solid var(--line-soft);">
  Questions or corrections: <a href="mailto:engineering@bbyb.dev">engineering@bbyb.dev</a>
</p>
