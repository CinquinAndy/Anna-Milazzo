# Neo-brutalist shadcn/ui + Tailwind v4 + tweakcn + Motion — primary-source research

Research date: **2026-09-03**. All version numbers verified against the npm registry on that date.
Every claim carries an inline source link. Anything not stated by a source is marked **INFERRED**.

Verified current versions (npm registry `/latest` endpoint, 2026-09-03):

| Package | Version |
| --- | --- |
| `tailwindcss` | **4.3.3** |
| `shadcn` (the CLI) | **4.20.1** |
| `motion` | **13.2.0** |
| `framer-motion` | **13.2.0** (same version line as `motion`) |
| `next` | **16.3.4** |

---

## Summary

- Tailwind v4 has no `tailwind.config.js` by default — theme tokens are CSS custom properties inside an `@theme { }` block after `@import "tailwindcss"`; a JS config only loads if you explicitly `@config "..."` it ([tailwindcss.com/docs/upgrade-guide](https://tailwindcss.com/docs/upgrade-guide)).
- Each theme namespace generates utilities: `--color-*` → `bg-*`/`text-*`, `--shadow-*` → `shadow-*`, `--radius-*` → `rounded-*`, `--font-*` → `font-*` ([tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme)).
- There is **no `--border-width-*` namespace** in v4 — custom border widths are `border-<number>` (px) or arbitrary `border-[3px]` ([tailwindcss.com/docs/border-width](https://tailwindcss.com/docs/border-width)).
- shadcn/ui theming is a `:root` / `.dark` block of raw semantic variables in **oklch**, re-exported to Tailwind via `@theme inline { --color-primary: var(--primary); … }` ([ui.shadcn.com/docs/theming](https://ui.shadcn.com/docs/theming)).
- The current shadcn `globals.css` also does `@import "shadcn/tailwind.css";` — a package-shipped stylesheet of `@custom-variant data-*` variants and utilities ([ui.shadcn.com/docs/theming](https://ui.shadcn.com/docs/theming), file content at [unpkg.com/shadcn@latest/tailwind.css](https://unpkg.com/shadcn@latest/tailwind.css)).
- shadcn CLI v4 adds `apply`, `--preset`, `--base <base|radix|aria>`, `--dry-run/--diff/--view`, `registry:base` and `registry:font` ([ui.shadcn.com/docs/changelog/2026-03-cli-v4](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4), [skills/shadcn/cli.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/cli.md)). **Base UI is now the default primitive set**, not Radix ([ui.shadcn.com/docs/changelog](https://ui.shadcn.com/docs/changelog)).
- tweakcn is a real visual theme editor whose themes are served as **shadcn `registry:style` JSON**: `npx shadcn@latest add https://tweakcn.com/r/themes/<id>.json` (verified by fetching the endpoint; generator source at [utils/registry/themes.ts](https://github.com/jnsahaj/tweakcn/blob/main/utils/registry/themes.ts)).
- tweakcn's shadow model is **offset+blur+spread+opacity driven and auto-derives a 2-layer scale** — it cannot express a pure hard-offset neo-brutalist shadow ladder ([utils/shadows.ts](https://github.com/jnsahaj/tweakcn/blob/main/utils/shadows.ts)).
- neobrutalism.com is a live shadcn registry: `npx shadcn@latest add https://neobrutalism.com/r/<base|radix>/<component>.json`, plus a **hand-pasted** token block that sets `--radius: 0` and redefines the whole `--shadow-*` scale as hard offsets of `var(--border)` ([neobrutalism.com/docs/installation](https://neobrutalism.com/docs/installation)).
- `motion` 13.2.0 needs `"use client"` in the App Router, or `import * as motion from "motion/react-client"` to keep the boundary server-side ([motion.dev/docs/react-installation](https://motion.dev/docs/react-installation)).
- Computed: `#3866A8` = `oklch(0.5104 0.1169 257.59)`, contrast 5.78:1 on white / 3.63:1 on black; `#F79E76` = `oklch(0.7803 0.1196 44.76)`, 2.08:1 on white / **10.11:1 on black**.

---

## 1. Tailwind CSS v4 theming mechanics

### 1.1 What replaced `tailwind.config.js`

> "In v4, configuration moved from JavaScript to **CSS using `@theme` variables**"
> — ([tailwindcss.com/docs/upgrade-guide](https://tailwindcss.com/docs/upgrade-guide))

The `@import "tailwindcss"` directive replaces the old `@tailwind base/components/utilities` directives. JS config files "are still supported but no longer auto-detected"; you load one explicitly:

```css
@config "../../tailwind.config.js";
```

`corePlugins`, `safelist` and `separator` from the JS config are **not supported** in v4.0 ([tailwindcss.com/docs/upgrade-guide](https://tailwindcss.com/docs/upgrade-guide)).

Package moves in v4: PostCSS plugin → `@tailwindcss/postcss`, a dedicated `@tailwindcss/vite` plugin, CLI → `@tailwindcss/cli`. `postcss-import` and `autoprefixer` should be removed — imports and prefixing are handled automatically ([tailwindcss.com/docs/upgrade-guide](https://tailwindcss.com/docs/upgrade-guide)).

Browser floor: Safari 16.4+, Chrome 111+, Firefox 128+ (depends on `@property` and `color-mix()`). Migration codemod: `npx @tailwindcss/upgrade` (Node 20+) ([tailwindcss.com/docs/upgrade-guide](https://tailwindcss.com/docs/upgrade-guide)).

### 1.2 `@theme` and the namespaces

`@theme` variables are not just CSS variables:

> "Theme variables aren't _just_ CSS variables — they also instruct Tailwind to create new utility classes that you can use in your HTML."
> — ([tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme))

Full namespace table, verbatim from the docs ([tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme)):

| Namespace | Utility classes |
| --- | --- |
| `--color-*` | `bg-red-500`, `text-sky-300`, … |
| `--font-*` | `font-sans` |
| `--text-*` | `text-xl` |
| `--font-weight-*` | `font-bold` |
| `--tracking-*` | `tracking-wide` |
| `--leading-*` | `leading-tight` |
| `--tab-size-*` | `tab-github` |
| `--breakpoint-*` | `sm:*` |
| `--container-*` | `@sm:*`, `max-w-md` |
| `--spacing-*` | `px-4`, `max-h-16`, … |
| `--radius-*` | `rounded-sm` |
| `--shadow-*` | `shadow-md` |
| `--inset-shadow-*` | `inset-shadow-xs` |
| `--drop-shadow-*` | `drop-shadow-md` |
| `--blur-*` | `blur-md` |
| `--perspective-*` | `perspective-near` |
| `--zoom-*` | `zoom-compact` |
| `--aspect-*` | `aspect-video` |
| `--ease-*` | `ease-out` |
| `--animate-*` | `animate-spin` |

Note there is **no border-width namespace** in that list — see §1.5.

### 1.3 Custom colours

```css
@import "tailwindcss";

@theme {
  --color-mint-500: oklch(0.72 0.11 178);
}
```

produces `bg-mint-500`, `text-mint-500`, `fill-mint-500` ([tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme)).

Reset an entire namespace with `*: initial`:

```css
@theme {
  --color-*: initial;
  --color-white: #fff;
  --color-purple: #3f3cbb;
  --color-midnight: #121063;
  --color-tahiti: #3ab7bf;
  --color-bermuda: #78dcca;
}
```

> "When you do this, all of the default utilities that use that namespace _(like `bg-red-500`)_ will be removed, and only your custom values _(like `bg-midnight`)_ will be available."
> — ([tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme))

`--*: initial;` nukes every default namespace at once, for a fully custom theme ([tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme)).

### 1.4 `@theme inline` — the one that matters for shadcn

When a theme variable **references another variable**, you must use `inline`, otherwise the generated utility points at the theme variable rather than the value:

```css
@theme inline {
  --font-sans: var(--font-inter);
}
```

> With `inline` the output is `.font-sans { font-family: var(--font-inter); }`; without it you get `.font-sans { font-family: var(--font-sans); }` — a self-reference.
> — ([tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme))

This is exactly why shadcn's `@theme inline` block exists (§2.2).

Two other modifiers:
- `@theme static { … }` forces **all** listed variables to be emitted, not just the ones used ([tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme)).
- `@theme` must be top-level; it also accepts nested `@keyframes` for `--animate-*` values ([tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme)).

### 1.5 Custom shadows and custom border widths

**Shadows.** The default scale is `shadow-2xs … shadow-2xl` mapped to `--shadow-*` variables ([tailwindcss.com/docs/box-shadow](https://tailwindcss.com/docs/box-shadow)). Custom entries:

```css
@theme {
  --shadow-custom: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```
→ `shadow-custom`. Arbitrary values use underscore-for-space syntax: `shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]`. Shadow **colour** is a separate axis (`shadow-black`, `shadow-red-500`, `shadow-(color:--my-var)`), and `inset-shadow-*` / `ring-*` / `inset-ring-*` are distinct utilities ([tailwindcss.com/docs/box-shadow](https://tailwindcss.com/docs/box-shadow)).

Also relevant to neo-brutalism, from the v4 upgrade guide ([tailwindcss.com/docs/upgrade-guide](https://tailwindcss.com/docs/upgrade-guide)):
- shadow scale renamed: old `shadow-sm` → `shadow-xs`, old `shadow` → `shadow-sm`.
- **Default ring width changed 3px → 1px**; use `ring-3` for v3 behaviour.
- **Default ring colour changed** from `blue-500` to `currentColor`.
- **Default border colour changed** from `gray-200` to `currentColor` — so `border-2` alone now inherits text colour, which is actually convenient for a black-outline design but must be set deliberately.

**Border widths.** The docs show `border` (1px) and `border-<number>` (→ `<number>px`), plus per-side (`border-t/r/b/l`), axis (`border-x/y`) and logical (`border-s/e`, `border-bs/be`) variants. Arbitrary: `border-[2vw]`; from a variable: `border-(length:--my-border-width)` ([tailwindcss.com/docs/border-width](https://tailwindcss.com/docs/border-width)).

> The border-width docs page does **not** document a `--border-width-*` theme namespace, and no such namespace appears in the `@theme` namespace table.
> — ([tailwindcss.com/docs/border-width](https://tailwindcss.com/docs/border-width), [tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme))

**INFERRED:** for a neo-brutalist system you therefore cannot make `border-brutal` a theme token the way you can `shadow-brutal`. The options are (a) use the numeric scale directly (`border-2`, `border-4`), (b) define a plain CSS variable `--border-width-brutal: 4px` and write `border-(length:--border-width-brutal)`, or (c) define an `@utility` (Tailwind v4 custom-utility directive, referenced in `shadcn/tailwind.css` at [unpkg.com/shadcn@latest/tailwind.css](https://unpkg.com/shadcn@latest/tailwind.css) as `@utility no-scrollbar { … }`).

### 1.6 Referencing theme variables elsewhere

In custom CSS and in `calc()` inside arbitrary values:

```css
@layer components {
  .typography p { font-size: var(--text-base); color: var(--color-gray-700); }
}
```

```html
<div class="absolute inset-px rounded-[calc(var(--radius-xl)-1px)]">
```

And from JS: `getComputedStyle(document.documentElement).getPropertyValue("--shadow-xl")` ([tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme)).

Themes can be shared across packages by putting an `@theme { }` block in its own file and `@import`-ing it after `@import "tailwindcss"` ([tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme)).

---

## 2. shadcn/ui theming

### 2.1 The token convention

> "The background suffix is omitted for the surface token. For example, `primary` pairs with `primary-foreground`."
> — ([ui.shadcn.com/docs/theming](https://ui.shadcn.com/docs/theming))

Token list ([ui.shadcn.com/docs/theming](https://ui.shadcn.com/docs/theming), cross-checked against [skills/shadcn/customization.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/customization.md)):

`background`/`foreground`, `card`/`card-foreground`, `popover`/`popover-foreground`, `primary`/`primary-foreground`, `secondary`/`secondary-foreground`, `muted`/`muted-foreground`, `accent`/`accent-foreground`, `destructive`, `border`, `input`, `ring`, `radius`, `chart-1…chart-5`, `sidebar`/`sidebar-foreground`/`sidebar-primary(-foreground)`/`sidebar-accent(-foreground)`/`sidebar-border`/`sidebar-ring`. The skill doc additionally lists `--surface` / `--surface-foreground` ("Secondary surface") ([skills/shadcn/customization.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/customization.md)).

### 2.2 Colour format and the actual CSS block

The format is **oklch**, not hsl:

> "Colors use OKLCH: `--primary: oklch(0.205 0 0)` where values are lightness (0–1), chroma (0 = gray), and hue (0–360)."
> — ([skills/shadcn/customization.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/customization.md))

The Tailwind-v4 migration converted HSL → OKLCH and dropped the `hsl()` wrappers around chart colours ([ui.shadcn.com/docs/tailwind-v4](https://ui.shadcn.com/docs/tailwind-v4)).

Current `globals.css` head, extracted verbatim from the theming page ([ui.shadcn.com/docs/theming](https://ui.shadcn.com/docs/theming)):

```css
@import "tailwindcss";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  /* … chart-2..5, sidebar-* … */
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  /* … */
}
```

Two things worth flagging for a neo-brutalist build:

1. **The radius scale is multiplicative off `--radius`.** Setting `--radius: 0` makes every `rounded-*` utility resolve to `0` in one move — `calc(0 * 1.4)` is still `0`. This is exactly what neobrutalism.com does (§4.2).
2. `@import "shadcn/tailwind.css"` is new. That file ships `@custom-variant data-open/data-closed/data-checked/data-selected/data-disabled/data-active/data-horizontal/data-vertical`, an `@utility no-scrollbar`, accordion keyframes, and `@property`-backed `scroll-fade` / `shimmer` machinery ([unpkg.com/shadcn@latest/tailwind.css](https://unpkg.com/shadcn@latest/tailwind.css)). It is the delivery mechanism for the `data-*` variants Base UI components use.

Note also the older docs statement that `rounded-md` = `calc(var(--radius) - 2px)` ([skills/shadcn/customization.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/customization.md)) contradicts the multiplicative scale on the theming page. **INFERRED:** the theming page's `calc(var(--radius) * n)` scale is the current one; the skill doc paragraph is stale. Either way, `--radius: 0` zeroes both.

### 2.3 Adding your own tokens

Define under `:root` and `.dark`, then expose via `@theme inline` — verbatim from the docs ([ui.shadcn.com/docs/theming](https://ui.shadcn.com/docs/theming)):

```css
:root {
  --warning: oklch(0.84 0.16 84);
  --warning-foreground: oklch(0.28 0.07 46);
}
.dark {
  --warning: oklch(0.41 0.11 46);
  --warning-foreground: oklch(0.99 0.02 95);
}
@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

> "Add variables to the file at `tailwindCssFile` from `npx shadcn@latest info` (typically `globals.css`). **Never create a new CSS file for this.**"
> — ([skills/shadcn/customization.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/customization.md))

### 2.4 Global vs per-component customisation

The official preference order ([skills/shadcn/customization.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/customization.md), [skills/shadcn/rules/styling.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/rules/styling.md)):

1. Built-in variants (`<Button variant="outline">`).
2. Semantic tokens via `className` (`bg-primary`, `text-muted-foreground`).
3. New `cva` variant added to the component source (`warning: "bg-warning text-warning-foreground hover:bg-warning/90"`).
4. Wrapper components composing primitives.

Explicit rules that bite a neo-brutalist design:
- `className` is "for layout only … **not** for overriding component colors or typography."
- "No raw color values for status/state indicators."
- "No manual `dark:` color overrides — use semantic tokens."
- "Prefer `size-*` over `w-* h-*`", "No `space-x-*`/`space-y-*` — use `gap-*`", "Use `cn()` for conditional classes", "No manual z-index on overlay components."
— all ([skills/shadcn/rules/styling.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/rules/styling.md))

**INFERRED:** a neo-brutalist look means every button/card gets `border-4 border-black shadow-[4px_4px_0_0_#000]`. Rule 2 above says don't do that in per-instance `className`. The compliant route is to bake it into the component's `cva` base string (i.e. edit `components/ui/button.tsx`) or to redefine the global `--shadow-*` / `--radius` tokens so the default `shadow-md`/`rounded-lg` already look brutal — which is precisely the neobrutalism.com strategy.

### 2.5 `components.json`

Schema keys ([ui.shadcn.com/docs/components-json](https://ui.shadcn.com/docs/components-json)):

| Key | Values / notes |
| --- | --- |
| `$schema` | `https://ui.shadcn.com/schema.json` |
| `style` | `"new-york"` (`default` deprecated). "Cannot be changed after initialization" |
| `tailwind.config` | path to JS/TS config — **"Leave this blank" for Tailwind v4** |
| `tailwind.css` | path to the stylesheet that imports Tailwind |
| `tailwind.baseColor` | `neutral \| stone \| zinc \| mauve \| olive \| mist \| taupe` — immutable post-init |
| `tailwind.cssVariables` | `true` (default; semantic tokens) or `false` (inline utility classes) — immutable post-init |
| `tailwind.prefix` | e.g. `"tw-"` |
| `rsc` | `true` adds `"use client"` directives automatically |
| `tsx` | `false` emits `.jsx` |
| `aliases.utils / components / ui / lib / hooks` | import-path aliases driving where files land |
| `registries` | URL templates or objects; supports public and private registries with auth |

Immutable-after-init: `style`, `tailwind.baseColor`, `tailwind.cssVariables` ([ui.shadcn.com/docs/components-json](https://ui.shadcn.com/docs/components-json)).

### 2.6 CLI behaviour (v4.20.1) and Tailwind v4 support

Tailwind v4 support landed **February 2025** and new projects default to Tailwind v4 + React 19 ([ui.shadcn.com/docs/tailwind-v4](https://ui.shadcn.com/docs/tailwind-v4), [ui.shadcn.com/docs/changelog](https://ui.shadcn.com/docs/changelog)). Other v4-migration changes: `forwardRef` removed ("We've removed the forwardRefs and adjusted the types"), every component carries a `data-slot` attribute, `size-*` supported, buttons use the default cursor, and **"We've deprecated `tailwindcss-animate` in favor of `tw-animate-css`"** ([ui.shadcn.com/docs/tailwind-v4](https://ui.shadcn.com/docs/tailwind-v4)).

`init` flags ([skills/shadcn/cli.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/cli.md)):

```bash
npx shadcn@latest init [components...] [options]
```

| Flag | Short | Description | Default |
| --- | --- | --- | --- |
| `--template <template>` | `-t` | next, start, vite, next-monorepo, react-router | — |
| `--preset [name]` | `-p` | named, code, or URL | — |
| `--yes` | `-y` | skip confirmation | `true` |
| `--defaults` | `-d` | `--template=next --preset=base-nova` | `false` |
| `--force` | `-f` | overwrite existing config | `false` |
| `--cwd <cwd>` | `-c` | working directory | current |
| `--name <name>` | `-n` | name for new project | — |
| `--rtl` | | RTL support | — |
| `--reinstall` | | re-install existing UI components | `false` |
| `--monorepo` / `--no-monorepo` | | monorepo scaffold | — |

`create` is an alias for `init`. The docs page additionally lists `--base <base|radix|aria>` and `--css-variables` ([ui.shadcn.com/docs/cli](https://ui.shadcn.com/docs/cli)).

`add` accepts **"component names, registry-prefixed names (`@magicui/shimmer-button`), GitHub item addresses (`owner/repo/item`), URLs, or local paths"** ([skills/shadcn/cli.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/cli.md)). Preview flags:

```bash
npx shadcn@latest add button --dry-run          # preview all changes, write nothing
npx shadcn@latest add button --diff             # diffs, first 5 files
npx shadcn@latest add button --diff globals.css # CSS diff for one file
npx shadcn@latest add button --view button.tsx  # full contents of one file
npx shadcn@latest add https://api.npoint.io/abc123 --dry-run
```

Other commands: `apply` (apply a preset to an existing project), `search`, `view`, `docs`, `info`, `build`, `migrate` ([skills/shadcn/cli.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/cli.md), [ui.shadcn.com/docs/cli](https://ui.shadcn.com/docs/cli)).

**Presets** — three forms of `--preset` ([skills/shadcn/cli.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/cli.md)):

1. Named: `--preset nova` / `--preset lyra`
2. Code: `--preset a2r6bw` (opaque version-prefixed base62 string)
3. URL: `--preset "https://ui.shadcn.com/init?base=radix&style=nova&..."`

> "Never try to decode, fetch, or resolve preset codes manually. Preset codes are opaque."
> — ([skills/shadcn/cli.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/cli.md))

Switching presets on an existing project has three modes ([skills/shadcn/cli.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/cli.md)):
- Overwrite → `npx shadcn@latest apply --preset <code>` (rewrites all detected component files).
- Merge → `npx shadcn@latest init --preset <code> --force --no-reinstall`, then merge components one by one.
- Skip → same command; only config + CSS variables change.

`registry-item.json` `type` values ([ui.shadcn.com/docs/registry/registry-item-json](https://ui.shadcn.com/docs/registry/registry-item-json)): `registry:base` ("Use for entire design systems"), `registry:block`, `registry:component`, `registry:font`, `registry:lib`, `registry:hook`, `registry:ui`, `registry:page`, `registry:file`, `registry:style`, `registry:theme`, `registry:item`. A registry item can carry theme-only payload via `cssVars` and `css`:

```json
"cssVars": {
  "theme": { "font-heading": "Poppins, sans-serif" },
  "light": { "brand": "oklch(0.205 0.015 18)" },
  "dark":  { "brand": "oklch(0.205 0.015 18)" }
},
"css": {
  "@layer base": { "body": { "font-size": "var(--text-base)" } },
  "@layer components": { "button": { "color": "var(--color-white)" } }
}
```

Also current, per the changelog ([ui.shadcn.com/docs/changelog](https://ui.shadcn.com/docs/changelog)): **Base UI became the default framework in July 2026** (Radix and React Aria remain selectable), plus GitHub registries (June 2026), private GitHub registries (Aug 2026), `shadcn/typeset`, and `@shadcn/helpers`.

---

## 3. tweakcn

### 3.1 What it is

> "**tweakcn** is a powerful Visual Theme Editor for tailwind CSS & shadcn/ui components. It comes with Beautiful theme presets to get started, while aiming to offer advanced customisation for each aspect of your UI"
> — ([github.com/jnsahaj/tweakcn README](https://github.com/jnsahaj/tweakcn))

Apache-2.0, ~10.3k stars ([github.com/jnsahaj/tweakcn](https://github.com/jnsahaj/tweakcn)). Editor lives at `tweakcn.com/editor/theme/[[...themeId]]` ([repo tree](https://github.com/jnsahaj/tweakcn)).

### 3.2 Tailwind v4 / oklch support — confirmed in source

The editor's preference store defaults to Tailwind **v4** and colour format **oklch**, and oklch is only offered on v4 ([store/preferences-store.ts](https://github.com/jnsahaj/tweakcn/blob/main/store/preferences-store.ts)):

```ts
const colorFormatsByVersion = {
  "3": ["hex", "rgb", "hsl"] as const,
  "4": ["hex", "rgb", "hsl", "oklch"] as const,
};
// …
tailwindVersion: "4",
colorFormat: "oklch",
```

### 3.3 Export mechanism 1 — copy a CSS block

The code panel has tabs (`index.css`, a Tailwind-config tab, and a `layout.tsx` tab for fonts) generated by `generateThemeCode`, `generateTailwindConfigCode`, `generateLayoutCode`, parameterised by `colorFormat` and `tailwindVersion` ([components/editor/code-panel.tsx](https://github.com/jnsahaj/tweakcn/blob/main/components/editor/code-panel.tsx)). The emitted variables are exactly the shadcn set plus fonts, shadows, tracking and spacing ([utils/theme-style-generator.ts](https://github.com/jnsahaj/tweakcn/blob/main/utils/theme-style-generator.ts)):

```
--background, --foreground, --card(-foreground), --popover(-foreground),
--primary(-foreground), --secondary(-foreground), --muted(-foreground),
--accent(-foreground), --destructive(-foreground), --border, --input, --ring,
--chart-1..5, --sidebar*,
--font-sans, --font-serif, --font-mono,
--shadow-2xs, --shadow-xs, --shadow-sm, --shadow, --shadow-md, --shadow-lg, --shadow-xl, --shadow-2xl,
--shadow-x, --shadow-y, --shadow-blur, --shadow-spread, --shadow-opacity, --shadow-color,
--tracking-tighter … --tracking-widest
```

There is also a **CSS import** dialog (`components/editor/css-import-dialog.tsx`) — i.e. round-tripping an existing theme block back into the editor ([repo tree](https://github.com/jnsahaj/tweakcn)).

### 3.4 Export mechanism 2 — a real shadcn registry URL (the important one)

Confirmed by fetching the live endpoint. `https://tweakcn.com/r/themes/<id>.json` returns a valid shadcn **`registry:style`** item. Verbatim head of `https://tweakcn.com/r/themes/northern-lights.json` (fetched 2026-09-03):

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "northern-lights",
  "type": "registry:style",
  "css": { "@layer base": { "body": { "letter-spacing": "var(--tracking-normal)" } } },
  "cssVars": {
    "theme": {
      "font-sans": "Plus Jakarta Sans, sans-serif",
      "font-mono": "JetBrains Mono, monospace",
      "font-serif": "Source Serif 4, serif",
      "radius": "0.5rem",
      "tracking-tighter": "calc(var(--tracking-normal) - 0.05em)",
      "…": "…"
    },
    "light": { "background": "oklch(0.9824 0.0013 286.3757)", "primary": "oklch(0.6487 0.1538 150.3071)", "…": "…" },
    "dark":  { "background": "oklch(0.2303 0.0125 264.2926)", "…": "…" }
  }
}
```

The route source validates against the official schema before serving ([app/r/themes/[id]/route.ts](https://github.com/jnsahaj/tweakcn/blob/main/app/r/themes/%5Bid%5D/route.ts)):

```ts
import { registryItemSchema } from "shadcn/schema";
// …
const generatedRegistryItem = generateThemeRegistryItemFromStyles(themeName, themeStyles);
const parsedRegistryItem = registryItemSchema.safeParse(generatedRegistryItem);
```

It serves `Access-Control-Allow-Origin: *`, is `dynamic = "force-static"`, and falls back to a DB lookup for user-saved themes when the id isn't a built-in preset ([app/r/themes/[id]/route.ts](https://github.com/jnsahaj/tweakcn/blob/main/app/r/themes/%5Bid%5D/route.ts)).

The exact install command the UI generates ([components/editor/code-panel.tsx](https://github.com/jnsahaj/tweakcn/blob/main/components/editor/code-panel.tsx)):

```ts
const url = isSaved
  ? `https://tweakcn.com/r/themes/${id}`      // saved (DB) theme — NO .json suffix
  : `https://tweakcn.com/r/themes/${id}.json`; // built-in preset — WITH .json suffix
// pnpm: `pnpm dlx shadcn@latest add ${url}`
// npm:  `npx shadcn@latest add ${url}`
// yarn: `yarn dlx shadcn@latest add ${url}`
// bun:  `bunx shadcn@latest add ${url}`
```

So, concretely:

```bash
npx shadcn@latest add https://tweakcn.com/r/themes/northern-lights.json
```

A **registry index** also exists: `https://tweakcn.com/r/themes/registry.json` — `{"name":"tweakcn-theme-registry","homepage":"https://tweakcn.com","items":[…]}` with **42 items**, all `registry:style` (verified by fetch, 2026-09-03). There is a second endpoint `app/r/v0/[id]/route.ts` — **INFERRED:** a v0.dev-flavoured export.

### 3.5 Export mechanism 3 — MCP server

The editor's MCP dialog emits this config verbatim ([components/editor/action-bar/components/mcp-dialog.tsx](https://github.com/jnsahaj/tweakcn/blob/main/components/editor/action-bar/components/mcp-dialog.tsx)):

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["-y", "shadcn@canary", "registry:mcp"],
      "env": { "REGISTRY_URL": "https://tweakcn.com/r/themes/registry.json" }
    }
  }
}
```

i.e. it is not a bespoke MCP server — it points shadcn's own `registry:mcp` at the tweakcn registry index. Instructions target `.cursor/mcp.json` and `.codeium/windsurf/mcp_config.json`.

Also present in the repo: a REST API (`app/api/v1/themes/route.ts`, `app/api/v1/themes/[themeId]/route.ts`), OAuth routes, AI theme generation (`app/api/generate-theme/route.ts`), and Polar-based subscriptions — so there is a paid tier, though the pricing page is client-rendered and its tiers could not be read ([repo tree](https://github.com/jnsahaj/tweakcn)).

### 3.6 The catch for neo-brutalism

tweakcn does **not** let you author the eight shadow steps independently. It stores one `shadow-color / -opacity / -blur / -spread / -offset-x / -offset-y` set and derives the scale, adding a **second layer with hard-coded blur** for `shadow-sm/md/lg/xl` ([utils/shadows.ts](https://github.com/jnsahaj/tweakcn/blob/main/utils/shadows.ts)):

```ts
"shadow-md": `${offsetX} ${offsetY} ${blur} ${spread} ${color(1.0)}, ${secondLayer("2px", "4px")}`,
"shadow-lg": `${offsetX} ${offsetY} ${blur} ${spread} ${color(1.0)}, ${secondLayer("4px", "6px")}`,
"shadow-xl": `${offsetX} ${offsetY} ${blur} ${spread} ${color(1.0)}, ${secondLayer("8px", "10px")}`,
```

Its shadow colour is also flattened to `hsl(<h s l> / <opacity>)` rather than `var(--border)` ([utils/shadows.ts](https://github.com/jnsahaj/tweakcn/blob/main/utils/shadows.ts)).

**INFERRED:** tweakcn is a good tool for picking and validating the *colour* half of the theme (it even ships a `contrast-checker.tsx`), but the neo-brutalist *shadow* half will have to be hand-written afterwards as a `--shadow-*` override in `globals.css`. Expect to run `shadcn add <tweakcn url>` and then edit the shadow lines it wrote.

---

## 4. Neo-brutalism with shadcn

There are **two distinct projects** with confusingly similar names.

### 4.1 neobrutalism.dev (ekmas) — older, unmaintained

> "A collection of neobrutalism-styled Tailwind components" — 5.3k stars, MIT, and the repo carries a notice that it is **"No longer maintained."**
> — ([github.com/ekmas/neobrutalism-components](https://github.com/ekmas/neobrutalism-components))

Consumption: init shadcn, then "Delete the existing styling from your `globals.css` and paste desired styling", then install components via per-component CLI commands ([src/markdown/docs/installation.mdx](https://github.com/ekmas/neobrutalism-components/blob/main/src/markdown/docs/installation.mdx)). It notes: "Neobrutalism components doesn't support utility class components anymore, only css variables components. Also, it doesn't matter which baseColor you choose, because it doesn't change the styling."

Its themes *are* `registry:style` items though — e.g. `public/r/styling/lime.json`, verbatim ([github.com/ekmas/neobrutalism-components](https://github.com/ekmas/neobrutalism-components/blob/main/public/r/styling/lime.json)):

```json
{
  "name": "neobrutalism-lime",
  "type": "registry:style",
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "cssVars": {
    "light": {
      "background": "oklch(95.37% 0.0549 125.19)",
      "secondary-background": "oklch(23.93% 0 0)",
      "main": "oklch(83.29% 0.2331 132.51)",
      "ring": "oklch(0% 0 0)",
      "foreground": "oklch(0% 0 0)",
      "main-foreground": "oklch(0% 0 0)",
      "border": "oklch(0% 0 0)",
      "overlay": "rgba(0, 0, 0, 0.8)",
      "shadow": "4px 4px 0px 0px var(--border)"
    },
    "dark": { "…": "…", "shadow": "4px 4px 0px 0px var(--border)" },
    "theme": {
      "color-main": "var(--main)",
      "color-background": "var(--background)",
      "color-secondary-background": "var(--secondary-background)",
      "color-foreground": "var(--foreground)",
      "color-main-foreground": "var(--main-foreground)",
      "color-border": "var(--border)",
      "color-ring": "var(--ring)",
      "color-overlay": "var(--overlay)",
      "spacing-boxShadowX": "4px",
      "spacing-boxShadowY": "4px",
      "spacing-reverseBoxShadowX": "-4px",
      "spacing-reverseBoxShadowY": "-4px",
      "radius-base": "5px",
      "font-weight-base": "500",
      "font-weight-heading": "700",
      "shadow-shadow": "var(--shadow)"
    }
  },
  "extends": "none",
  "dependencies": ["tw-animate-css", "class-variance-authority", "lucide-react"],
  "registryDependencies": ["utils"]
}
```

Note what this token set does differently from stock shadcn: it **abandons the `primary/secondary/muted/accent` vocabulary** for `main` / `secondary-background` / `overlay`, adds `spacing-boxShadowX/Y` + `reverseBoxShadowX/Y` (so the hover "lift" is `translate-x-boxShadowX` and the pressed state is the reverse), pins `radius-base: 5px`, and adds `font-weight-base: 500` / `font-weight-heading: 700`. Also note `"extends": "none"` — this item replaces rather than extends the base style. A lime variant exists (relevant to the client's lime question), alongside 16 other hues.

### 4.2 neobrutalism.com — current, actively maintained, a real registry

> "Neobrutalism.com is a registry for the shadcn CLI. There's no package to install and no provider to wrap your app in — the CLI copies each component's source from neobrutalism.com into your project, and from that point it's your code."
> — ([neobrutalism.com/docs/installation](https://neobrutalism.com/docs/installation))

Its own definition of the style ([neobrutalism.com/docs](https://neobrutalism.com/docs)):
1. "Thick borders — every element is outlined, usually in solid black."
2. "Hard shadows — flat offsets with no blur, so elements look physically stacked on the page."
3. "Loud color — high-contrast, saturated fills. No gradients, no glassmorphism."
4. "Square corners and heavy type."
5. "Tactile interaction — buttons visibly press into their shadows when clicked."

**Consumption mechanism** ([neobrutalism.com/docs/installation](https://neobrutalism.com/docs/installation)):

```bash
npx shadcn@latest add https://neobrutalism.com/r/base/button.json
npx shadcn@latest add https://neobrutalism.com/r/radix/button.json
npx shadcn@latest view https://neobrutalism.com/r/base/button.json   # preview first
```

> "the pattern is always `https://neobrutalism.com/r/<base|radix>/<component>.json`"

Verified by direct fetch (2026-09-03): `/r/registry.json` returns `{"$schema":"https://ui.shadcn.com/schema/registry.json","name":"neobrutalism","homepage":"https://neobrutalism.com","items":[…]}` with **54 `registry:ui` items** (accordion → tooltip, including sidebar, sonner, calendar, command, carousel, data-table-adjacent pieces). `/r/base/registry.json` also returns 200, and `/r/aria/button.json` returns 200 — so a **React Aria** variant exists in addition to the documented base|radix pair, even though the docs page only names two. `/r/theme.json` and `/r/base/theme.json` both 404 — **there is no theme registry item; the tokens are copy-paste.**

**Fonts** ([neobrutalism.com/docs/installation](https://neobrutalism.com/docs/installation)): Archivo Black for headings (`--font-head`), Space Grotesk for body (`--font-sans`), loaded via `next/font/google`.

**The token set — verbatim** ([neobrutalism.com/docs/installation](https://neobrutalism.com/docs/installation)):

```css
@import "tailwindcss";

@theme inline {
  --font-head: var(--font-head);
  --font-sans: var(--font-sans);
  --radius: var(--radius);
  --shadow-xs:  1px 1px 0 0 var(--border);
  --shadow-sm:  2px 2px 0 0 var(--border);
  --shadow:     3px 3px 0 0 var(--border);
  --shadow-md:  4px 4px 0 0 var(--border);
  --shadow-lg:  6px 6px 0 0 var(--border);
  --shadow-xl:  10px 10px 0 1px var(--border);
  --shadow-2xl: 16px 16px 0 1px var(--border);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary-hover: var(--primary-hover);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}

:root {
  --radius: 0;
  --background: #fff7e8;
  --foreground: #000;
  --card: #fff;
  --card-foreground: #000;
  --primary: #ffdc58;
  --primary-hover: #ffd12e;
  --primary-foreground: #000;
  --secondary: #000;
  --secondary-foreground: #fff;
  --muted: #efe7d6;
  --muted-foreground: #6b6355;
  --accent: #ffe7a3;
  --accent-foreground: #000;
  --destructive: #e63946;
  --destructive-foreground: #fff;
  --border: #000;
  --input: #fff;
  --ring: #000;
}

.dark { /* …same keys, dark values; --border stays #000 … */ }
```

The docs' own framing: "The hard offset shadows and `--radius: 0` are doing most of the work — the rest is palette, and all of it is plain Tailwind v4 theming you can change later."

**What a neo-brutalist token set actually changes vs default shadcn** (comparing the block above against §2.2):

| Axis | Default shadcn | neobrutalism.com |
| --- | --- | --- |
| `--radius` | `0.625rem` (drives a ×0.6…×2.6 scale) | `0` — the whole scale collapses |
| `--shadow-*` | Tailwind defaults: blurred, `rgb(0 0 0 / 0.1)` | Redefined: **zero blur**, offsets 1→16px, colour = `var(--border)` |
| `--border` | a light grey oklch | `#000` in **both** light and dark |
| `--ring` | mid-grey | `#000` (light) / `#ffdc58` (dark) |
| Colour space | oklch | plain hex |
| Extra tokens | — | `--primary-hover`, `--font-head` |
| Border width | not a token; components use `border` (1px) | components hard-code `border-2 border-black` in their `cva` base |

**Border width is not a theme token in either project.** Confirmed from the fetched component source, `https://neobrutalism.com/r/base/button.json` — the `cva` default variant is:

```
"border-2 border-black bg-primary text-primary-foreground shadow-md transition duration-200
 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg
 active:translate-x-1 active:translate-y-1 active:shadow-none"
```

That single string is the whole neo-brutalist interaction model: hover nudges the element up-left and grows the shadow; active pushes it down-right and removes the shadow. The base string also uses `font-head font-medium` and `rounded` ([fetched from neobrutalism.com/r/base/button.json, 2026-09-03](https://neobrutalism.com/r/base/button.json)). The components depend on `@base-ui/react` — i.e. this registry is aligned with shadcn's current Base UI default ([registry.json](https://neobrutalism.com/r/registry.json), [ui.shadcn.com/docs/changelog](https://ui.shadcn.com/docs/changelog)).

**Other neo-brutalist sets** seen in search but not verified in depth: retroui.dev ([retroui.dev](https://retroui.dev/)) and a shadcn-vue port ([jqueryscript listing](https://next.jqueryscript.net/shadcn-ui/neobrutalism-components-vue-tailwindcss/)) — neither is relevant to a Next.js/React build beyond being an alternative aesthetic source.

---

## 5. Motion

### 5.1 Package and version

Package name is **`motion`**; `npm install motion`; `import { motion } from "motion/react"` ([motion.dev/docs/react-installation](https://motion.dev/docs/react-installation)). The docs describe it as "Motion for React (previously Framer Motion)" ([motion.dev/docs/react](https://motion.dev/docs/react)).

Current version **13.2.0** for both `motion` and `framer-motion` (npm registry, 2026-09-03). Peer deps: `react` / `react-dom` `^18.0.0 || ^19.0.0`. The docs state Motion requires "React versions `18.2` and higher" ([motion.dev/docs/react-installation](https://motion.dev/docs/react-installation)).

**INFERRED:** since `framer-motion` publishes the same 13.2.0 version, the old package is still a maintained alias. New code should use `motion`.

### 5.2 RSC / Next.js App Router

Two documented approaches ([motion.dev/docs/react-installation](https://motion.dev/docs/react-installation)):

```tsx
"use client"
import { motion } from "motion/react"

export default function MyComponent() {
  return <motion.div animate={{ scale: 1.5 }} />
}
```

or, to keep the file a Server Component:

```tsx
import * as motion from "motion/react-client"
```

> Replacing the import with `motion/react-client` "reduce[s] the amount of JS delivered to the client."
> — ([motion.dev/docs/react-installation](https://motion.dev/docs/react-installation))

Vite needs no special configuration ([motion.dev/docs/react-installation](https://motion.dev/docs/react-installation)).

**INFERRED:** `motion/react-client` is a pre-`"use client"`-marked re-export, so declarative props (`initial`/`animate`/`whileInView`) work from a server file, but hooks (`useScroll`, `useReducedMotion`, `useInView`) still require a client component. The docs do not state this limitation explicitly — treat as an assumption to verify in the build.

### 5.3 Entrance animation (scroll-triggered)

> "Scroll-triggered: An animation is triggered when an element enters or leaves the viewport."
> — ([motion.dev/docs/react-scroll-animations](https://motion.dev/docs/react-scroll-animations))

```jsx
<motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} />
```

Viewport options: set `once: true` "so an animation only plays the first time an element scrolls into view"; `root` takes a ref for a non-window scroll container ([motion.dev/docs/react-scroll-animations](https://motion.dev/docs/react-scroll-animations)).

```jsx
<motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} />
```

For React state rather than animation, the `useInView` hook ([motion.dev/docs/react-scroll-animations](https://motion.dev/docs/react-scroll-animations)):

```jsx
function Component() {
  const ref = useRef(null)
  const isInView = useInView(ref)
  return <div ref={ref}>{isInView ? "Hello!" : "Bye..."}</div>
}
```

### 5.4 Scroll-linked animation

`useScroll` (React) / `scroll()` (vanilla) return `scrollX`/`scrollY` (px) and `scrollXProgress`/`scrollYProgress` (0–1). Options include `target` (track one element's progress) and `offset` (e.g. `["start end", "end start"]`) ([motion.dev/docs/react-scroll-animations](https://motion.dev/docs/react-scroll-animations)).

> "Motion is the only animation library that runs scroll-linked animations on the browser's native `ScrollTimeline` where possible, for fully hardware-accelerated animations."
> — ([motion.dev/docs/react-scroll-animations](https://motion.dev/docs/react-scroll-animations))

It falls back to JS when `ScrollTimeline` is unavailable. Typical pattern:

```jsx
const { scrollYProgress } = useScroll();
const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
```

### 5.5 `prefers-reduced-motion`

Site-wide via `MotionConfig` ([motion.dev/docs/react-accessibility](https://motion.dev/docs/react-accessibility)):

```jsx
<MotionConfig reducedMotion="user">{children}</MotionConfig>
```

With `"user"`, "all `motion` components will **automatically** disable transform and layout animations, while preserving the animation of other values like `opacity` and `backgroundColor`". `"always"` and `"never"` let a user profile setting override the system preference.

Per-component via the `useReducedMotion` hook, which returns a boolean from the system setting ([motion.dev/docs/react-accessibility](https://motion.dev/docs/react-accessibility)):

```jsx
function Parallax() {
  const shouldReduceMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1], [0, -0.2])
  return <motion.div style={{ y: shouldReduceMotion ? 0 : y }} />
}
```

The docs also show it used to disable autoplaying video (`<video autoplay={!shouldReduceMotion} />`) and to swap an `x` slide for an `opacity` fade ([motion.dev/docs/react-accessibility](https://motion.dev/docs/react-accessibility)).

**INFERRED, important for this project:** `reducedMotion="user"` does **not** disable scroll-linked `useScroll`/`useTransform` values — the docs' own parallax example gates that by hand. A neo-brutalist page that leans on parallax or scroll-scrub needs explicit `useReducedMotion()` guards on top of `MotionConfig`.

---

## 6. Colour maths

Computed locally (sRGB → linear → OKLab → OKLCh; WCAG 2.x relative luminance). These are derivations from the given hex values, not quoted from a source.

| Colour | hex | oklch | hsl | contrast on white | contrast on black |
| --- | --- | --- | --- | --- | --- |
| Client blue | `#3866A8` | `oklch(0.5104 0.1169 257.59)` | `hsl(215.4 50% 43.9%)` | **5.78 : 1** | 3.63 : 1 |
| Cantaloupe (Pantone 15-1239 approx.) | `#F79E76` | `oklch(0.7803 0.1196 44.76)` | `hsl(18.6 89% 71.6%)` | 2.08 : 1 | **10.11 : 1** |

Blue-on-cantaloupe (as adjacent blocks) is **2.78 : 1** — fine as a colour-block boundary with a black keyline, not usable as text-on-fill.

Constraints these numbers impose:

- `#3866A8` passes WCAG **AA for normal text with white on it** (5.78 ≥ 4.5) but fails AAA (needs 7). Black text on it fails AA (3.63 < 4.5) — it only clears AA for large text (≥ 3.0).
- `#F79E76` is a **light** colour (L ≈ 0.78). White text on it fails badly (2.08). Black text on it is excellent (10.11). Treat cantaloupe as a background/fill that always carries black type — which suits neo-brutalism anyway.
- The two hues are near-complementary in OKLCh: 257.6° vs 44.8° — a 212.8° separation. Chroma is nearly matched (0.117 vs 0.120), but lightness differs by 0.27, so the pair reads as dark-blue-vs-light-orange rather than as two equal-weight blocks.

Third-colour candidates, same maths (contrast columns: W = vs white, B = vs black):

| Candidate | hex | oklch | W | B | vs blue | vs cantaloupe |
| --- | --- | --- | --- | --- | --- | --- |
| Lime (soft) | `#C6F04A` | `oklch(0.8957 0.1915 122.72)` | 1.32 | 15.96 | 4.39 | 1.58 |
| Lime (saturated) | `#B8E62E` | `oklch(0.8621 0.2007 123.57)` | 1.46 | 14.40 | 3.96 | 1.42 |
| Chartreuse | `#D4FF3F` | `oklch(0.9378 0.2089 121.91)` | 1.16 | 18.18 | 5.00 | 1.80 |
| Warm cream (paper) | `#FFF7E8` | `oklch(0.9783 0.0215 83.26)` | 1.06 | 19.72 | 5.43 | 1.95 |
| Black (keyline) | `#000000` | `oklch(0 0 0)` | 21.00 | 1.00 | 3.63 | 10.11 |
| Yellow (nb.com default) | `#FFDC58` | `oklch(0.9004 0.1520 94.19)` | 1.34 | 15.63 | 4.30 | 1.55 |
| Teal | `#2EC4B6` | `oklch(0.7423 0.1214 185.36)` | 2.17 | 9.69 | 2.67 | 1.04 |
| Magenta | `#E85D9E` | `oklch(0.6740 0.1835 354.06)` | 3.24 | 6.49 | 1.79 | 1.56 |

Factual constraints on the third colour, not a recommendation:

- **Hue gap.** Blue sits at 257.6°, cantaloupe at 44.8°. The largest unoccupied arc between them runs ~80°–250°, i.e. yellow-green through green, cyan and teal. Lime (≈ 122°) sits near the middle of that arc; teal (≈ 185°) also does.
- **Lightness collision.** Lime at L ≈ 0.86–0.90 is *lighter* than cantaloupe (0.78). Any lime adjacent to cantaloupe has a luminance ratio of only 1.4–1.8 : 1 — the two will not separate without a black border between them. This is a real argument for lime *in a neo-brutalist system specifically*, because black keylines are mandatory anyway, and an argument against it in any system without them.
- **Teal is disqualified against cantaloupe** on luminance (1.04 : 1 — effectively invisible as an adjacent block).
- Every light candidate (lime, chartreuse, cream, yellow) requires black text; only black itself takes white text.
- Chroma parity: to sit at the same "loudness" as the two given colours (C ≈ 0.117–0.120), the lime candidates listed are markedly louder (C ≈ 0.19–0.21). A lower-chroma lime around `oklch(0.86 0.13 123)` would match the existing pair's saturation.

---

## Decisions this forces

1. **Fork the neobrutalism.com registry, or hand-roll the tokens?** Its registry is live, current, Base-UI-based and covers 54 components — but it has no theme registry item, so the palette must be pasted and then rewritten to the client's blue/cantaloupe anyway. Alternative: `shadcn init` plain, then paste only the `--shadow-*` / `--radius: 0` half of its token block and skip its components. Pulling a component from it means adopting its `cva` strings (`border-2 border-black`, `font-head`) as your baseline.
2. **Base UI vs Radix.** shadcn's default is now Base UI; neobrutalism.com publishes `/r/base/`, `/r/radix/` and (undocumented but live) `/r/aria/`. This is set at `init` time via `--base` and recorded in `components.json`; the CLI preserves it across preset changes. Picking wrong means a migration (`skills/migrate-radix-to-base` exists, which tells you it's non-trivial).
3. **tweakcn as source of truth, or as a colour picker only?** Its `registry:style` export is a clean `shadcn add <url>` path, but its shadow model cannot express hard offsets. Either (a) use tweakcn for colours and overwrite `--shadow-*` by hand afterwards, accepting that re-importing the theme clobbers your shadows, or (b) treat tweakcn as a throwaway design tool and keep `globals.css` hand-authored.
4. **Whose token vocabulary?** Stock shadcn (`primary`/`secondary`/`muted`/`accent`) vs the ekmas `main`/`secondary-background`/`overlay` + `spacing-boxShadowX` vocabulary. Stock keeps every future `shadcn add` compatible; the ekmas vocabulary makes hover/press offsets tokenised but breaks compatibility with the wider registry ecosystem.
5. **Does `--radius: 0` apply site-wide?** Setting it once zeroes every `rounded-*` in every component, including popovers and inputs. Softening one component later means overriding with an arbitrary value, not a token.
6. **Border width policy.** No `--border-width-*` namespace exists. Choose one: numeric utilities baked into `cva` bases (`border-2` / `border-4`), a `--border-width-brutal` variable consumed via `border-(length:--border-width-brutal)`, or a custom `@utility`. This must be decided once because it is repeated in every component file.
7. **Lime: in or out.** The maths says lime works *only* against black keylines (1.4–1.8 : 1 vs cantaloupe). If the design ever drops the black outline — e.g. a plain image caption — the lime/cantaloupe pairing fails immediately. Also decide chroma: a "matched-loudness" lime (C ≈ 0.13) vs the conventional neo-brutalist screaming lime (C ≈ 0.20).
8. **Which colour is `--primary`?** Blue takes white text at AA and is the only one of the two that can be a text-bearing fill with light type. Cantaloupe must always carry black. That constrains which is the CTA fill.
9. **Motion boundary strategy.** `"use client"` per animated component vs `motion/react-client` imports. Hooks (`useScroll`, `useReducedMotion`) force client components regardless, so a bilingual marketing page with scroll-scrub effects will end up mostly client anyway.
10. **Reduced-motion policy.** `MotionConfig reducedMotion="user"` covers transforms and layout but not scroll-linked values. Decide whether scroll effects are gated by hand or simply not used.
11. **Where does bilingual copy live?** Not covered by any source here — no shadcn/Tailwind mechanism is involved. Needs its own decision (next-intl / route segments / static dictionaries).

---

## Open questions / not found

- **tweakcn pricing tiers.** The `/pricing` page is client-rendered and returned only a title. The repo contains `app/api/subscription/route.ts` and a Polar webhook, so a paid tier exists, but its boundary (e.g. whether saved themes / the registry URL for saved themes are gated) is unverified.
- **tweakcn saved-theme URL stability.** The code shows saved themes use `https://tweakcn.com/r/themes/<id>` (no `.json`) and hit a DB. Whether that URL survives account changes or requires auth was not determined.
- **`app/r/v0/[id]/route.ts`.** A second tweakcn export endpoint. Its output format was not fetched.
- **Whether `motion/react-client` supports hooks.** The docs do not say. Assumed no.
- **neobrutalism.com `/r/aria/` variant.** Returns 200 but is undocumented on the installation page; its stability is unknown.
- **neobrutalism.com licence and pricing.** The site has "Pricing", "Templates" and "Figma" nav items and an MCP server banner. Licence terms for the registry components were not located.
- **`tw-animate-css` vs `shadcn/tailwind.css`.** The Tailwind-v4 page says `tailwindcss-animate` is deprecated in favour of `tw-animate-css` ([ui.shadcn.com/docs/tailwind-v4](https://ui.shadcn.com/docs/tailwind-v4)), but the current `globals.css` on the theming page imports `shadcn/tailwind.css` and does not show a `tw-animate-css` import. Which one a fresh `shadcn init` emits in v4.20.1 was not verified by running the CLI.
- **`--radius` derivation discrepancy.** The theming page gives a multiplicative scale (`--radius-md: calc(var(--radius) * 0.8)`); `skills/shadcn/customization.md` says `rounded-md = calc(var(--radius) - 2px)`. Not reconciled; both collapse to 0 when `--radius: 0`.
- **Exact Pantone 15-1239 sRGB value.** `#F79E76` was supplied in the brief as approximate; no Pantone-licensed source was consulted, and all §6 numbers derive from that hex, not from the Pantone specification.
- **`--surface` / `--surface-foreground`.** Listed in the shadcn skill doc's variable table but not in the theming page's token list. Its status (new, or skill-doc-only) is unclear.
- **shadcn CLI `--base` on `init`.** Documented on the docs page but absent from the flag table in `skills/shadcn/cli.md`; the switching-presets section confirms `--base <current-base>` exists. Minor inconsistency between the two official sources.
