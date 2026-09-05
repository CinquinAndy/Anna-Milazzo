# 21st.dev, primary-source investigation

Research date: 2026-09-04. Target build: Next.js 16 App Router + Tailwind v4 + shadcn/ui + Payload CMS, neo-brutalist bilingual portfolio, paid client project.

Every claim below was verified by fetching the live site/API. Anything not directly observed is marked **INFERRED**.

---

## Summary

- **21st.dev is a shadcn-compatible registry, but its registry endpoints are paywalled.** `GET https://21st.dev/r/{author}/{slug}` returns `403 {"error":"Authentication required","reason":"authentication_required"}`, verified against [`/r/shadcn/accordion`](https://21st.dev/r/shadcn/accordion) and [`/r/edwinvakayil/faq-pro`](https://21st.dev/r/edwinvakayil/faq-pro). The advertised `npx shadcn@latest add https://21st.dev/r/...` does **not** work anonymously.
- **The free tier is 2 installs/day, hard-enforced.** Their own tRPC endpoint `copyGuard.status` returns `{"signedIn":false,"isMember":false,"limit":2,"remaining":2,"used":0}`. Unlimited copies start at $6/mo ([pricing](https://21st.dev/pricing)).
- **Licensing is the dealbreaker for client work.** There is no blanket MIT. Licence is a **per-component free-text field set by the uploader**, and observed values include `MIT`, `mit`, `no-license`, and **empty string**. See the plain-English licence section below.
- **The published components are a Tailwind-version lottery.** Verified: the `@ekmas` neobrutalism set is Tailwind **v3** (config-driven `bg-main`, `shadow-shadow`, `rounded-base`, `translate-x-boxShadowX`), while `@retroui` ships Tailwind **v4** (`@import "tailwindcss"; @theme inline {...}`). You cannot assume v4.
- **Neo-brutalist coverage on 21st.dev is thin.** `s/neobrutalism` returns **19** results, `s/brutalist` returns **2**, against 199-result caps on `badge`, `cta`, `gallery`, `text`. It is overwhelmingly a glassmorphic/gradient/shader SaaS catalogue. Do not oversell it.
- **The genuinely valuable find is not 21st.dev itself, it is [neobrutalism.com](https://neobrutalism.com/)** (formerly retroui.dev, which now 301s there). Public, unauthenticated, spec-compliant shadcn registry at [`/r/registry.json`](https://neobrutalism.com/r/registry.json): 54 items, Tailwind v4, `--radius: 0`, `--border: #000`, hard offset shadows, both Base UI and Radix builds, **MIT**.
- **"Folders to hold projects" is only weakly served.** Real folder components exist but they are macOS/Finder-flavoured, not manila-folder scrapbook. Expect to build this yourself.
- **Verdict: use 21st.dev as a free visual reference library, not as a dependency.** Adopt neobrutalism.com's *tokens*, write your own components.

---

## How it works

### Registry mechanics (verified)

| Thing | Finding |
|---|---|
| Registry item URL shape | `https://21st.dev/r/{author}/{slug}`, `.json` suffix optional/ignored. Confirmed by error payloads: bad slug -> `{"error":"Component not found"}`, bad author -> `{"error":"User not found"}`. |
| Public index / `registry.json` | **None.** `https://21st.dev/registry.json`, `/r/registry.json`, `/r/index.json` all return the SPA HTML shell (soft 404). |
| Anonymous access | **Blocked.** 403 `authentication_required`. The 403 body still leaks metadata: `{"error":... "component":{"name","title","description","author","url"}}`. |
| `type` / `files` / `dependencies` / `cssVars` | **Could not be observed**, the auth wall returns before any registry-item body. This is the one question in the brief unanswerable from 21st.dev anonymously. **INFERRED** (from the [21st source repo](https://github.com/serafimcloud/21st) and shadcn's [registry-item spec](https://ui.shadcn.com/docs/registry/registry-item-json)) that it is standard `registry:ui` shape. |
| CLI | `npx @21st-dev/cli@latest install <client> --api-key <key>`. Login "opens the browser and saves a token locally"; CI uses `--api-key $API_KEY_21ST` ([21st.dev/mcp](https://21st.dev/mcp)). |
| MCP server | Yes. Formerly `@21st-dev/magic`, now the unified **21st MCP** ([repo](https://github.com/21st-dev/magic-mcp), [setup](https://21st.dev/mcp)). Tools: search, generate, design exploration, UI audit, publish. |
| Account/API key required? | **Yes**, for every install path. Search and browsing are free. |

### The paywall, precisely

```
GET https://21st.dev/api/trpc/copyGuard.status
-> {"signedIn":false,"isMember":false,"limit":2,"remaining":2,"used":0,"resetsAt":null}
```

Two component copies per day, then it stops. [Pricing](https://21st.dev/pricing): Builder $6/mo (yearly), Builder+AI $15/mo, Team $7.50/seat/mo.

### What *is* free without an account

Component detail pages render the **usage source** in plain text, the full `Usage.tsx` for [`@retroui/table`](https://21st.dev/@retroui/components/table) was read while signed out. Some authors' component source is also world-readable on the CDN at `https://cdn.21st.dev/{user_id}/{slug}/code.tsx`, e.g. [the ekmas button](https://cdn.21st.dev/user_2reteS3IODi8OJpbNYOpgLKdwT7/button/code.tsx). Inconsistent (most components 404 on that path), but it means **21st.dev works fine as a free reference tool** even though installs are gated.

### neobrutalism.com registry (public, verified)

`retroui.dev` -> **301** -> `https://neobrutalism.com/`.

```
GET https://neobrutalism.com/r/registry.json
{"$schema":"https://ui.shadcn.com/schema/registry.json",
 "name":"neobrutalism","homepage":"https://neobrutalism.com","items":[ ...54 items... ]}

GET https://neobrutalism.com/r/base/button.json
{"name":"button","type":"registry:ui",
 "dependencies":["@base-ui/react","class-variance-authority"],
 "files":[{"path":"button.tsx","type":"registry:ui","target":"components/ui/button.tsx"}]}
```

- Install: `npx shadcn@latest add https://neobrutalism.com/r/base/button.json`, works today, no key.
- **Two builds**: `/r/base/*` (Base UI, `@base-ui/react`) and `/r/radix/*` (Radix, `radix-ui`). Both verified.
- 54 `registry:ui` items: `accordion alert alert-dialog aspect-ratio avatar badge breadcrumb button button-group calendar card carousel checkbox collapsible combobox command context-menu dialog direction drawer dropdown-menu empty field hover-card input input-group input-otp item kbd label menubar native-select navigation-menu pagination popover progress radio-group resizable scroll-area select separator sheet sidebar skeleton slider sonner spinner switch table tabs textarea toggle toggle-group tooltip`
- Includes shadcn's 2025/26-era primitives (`button-group`, `empty`, `field`, `input-group`, `item`, `kbd`, `spinner`), actively tracking upstream.
- All 54 items carry **no `cssVars` and no `css` block**, the theme is *not* shipped by the registry. You must paste the token block yourself (below).

---

## neobrutalism.com token block (verbatim)

We are adopting these **tokens**, not the components. Extracted from the compiled stylesheet `https://neobrutalism.com/_next/static/chunks/3-liagetnisz0.css` (the registry itself ships no `cssVars`, so this is the authoritative source for the live values).

### `@theme`, the parts that define the neo-brutalist geometry

```css
--radius-sm: calc(var(--radius) * .6);
--radius-md: calc(var(--radius) * .8);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) * 1.4);

--shadow-xs:  1px  1px  0 0 var(--shadow-color);
--shadow-sm:  2px  2px  0 0 var(--shadow-color);
--shadow:     3px  3px  0 0 var(--shadow-color);
--shadow-md:  4px  4px  0 0 var(--shadow-color);
--shadow-lg:  6px  6px  0 0 var(--shadow-color);
--shadow-xl: 10px 10px  0 1px var(--shadow-color);
--shadow-2xl:16px 16px  0 1px var(--shadow-color);

--font-heading: var(--font-heading);
--font-head:    var(--font-heading);
--font-body:    var(--font-sans);
--font-mono:    var(--font-mono);

--color-primary-hover: var(--primary-hover);
--color-background: var(--background);
--color-foreground: var(--foreground);
--color-card: var(--card);
--color-card-foreground: var(--card-foreground);
--color-primary: var(--primary);
--color-primary-foreground: var(--primary-foreground);
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
```

Two things to note. **First: every shadow is `Npx Npx 0 0`, zero blur, zero spread.** That single convention is what makes the whole system read as neo-brutalist; it is worth copying exactly. **Second: `--radius-*` are all derived by multiplying `--radius`**, so setting `--radius: 0` once zeroes every rounding utility in the system (`rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`). This resolves open question 3 from the earlier draft, components can safely keep using `rounded` utilities and still render square.

### `:root` (light), verbatim

```css
:root {
  --radius: 0;
  --background: #fff7e8;
  --foreground: #000;
  --card: #fff;
  --card-foreground: #000;
  --popover: #fff;
  --popover-foreground: #000;
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
  --shadow-color: #000;
  --background-image: url(/images/banner_void_2.webp);
  --chart-1: #c4a1ff;
  --chart-2: #01ffcc;
  --chart-3: #e7f192;
  --chart-4: #000;
  --chart-5: #ff30cd;
  --sidebar: var(--background);
  --sidebar-foreground: var(--foreground);
  --sidebar-primary: var(--primary);
  --sidebar-primary-foreground: var(--primary-foreground);
  --sidebar-accent: var(--accent);
  --sidebar-accent-foreground: var(--accent-foreground);
  --sidebar-border: var(--border);
  --sidebar-ring: var(--ring);
  --surface: var(--card);
  --surface-foreground: var(--card-foreground);
  --code: var(--muted);
  --code-foreground: var(--foreground);
  --code-highlight: var(--accent);
  --code-number: var(--muted-foreground);
  --selection: var(--primary);
  --selection-foreground: var(--primary-foreground);
  --decor-ink: #000;
  --decor-paper: #fff;
  --decor-accent: var(--primary);
}
```

### `.dark`, verbatim

```css
.dark {
  --background: #1a1815;
  --foreground: #f5f0e6;
  --card: #262320;
  --card-foreground: #f5f0e6;
  --popover: #262320;
  --popover-foreground: #f5f0e6;
  --primary: #ffdc58;
  --primary-hover: #ffd12e;
  --primary-foreground: #000;
  --secondary: #3a352f;
  --secondary-foreground: #f5f0e6;
  --muted: #2e2a24;
  --muted-foreground: #b3ac9e;
  --accent: #38342b;
  --accent-foreground: #f5f0e6;
  --destructive: #ff6b6b;
  --destructive-foreground: #1a1815;
  --border: #6f675a;
  --input: #262320;
  --ring: #ffdc58;
  --shadow-color: #4a443c;
  --background-image: url(/images/bg_void_3.png);
  --chart-1: #ffdc58;
  --chart-2: #f5f0e6;
  --chart-3: #aeaeae;
  --chart-4: #ffe7a3;
  --chart-5: #ff6b6b;
  --sidebar: var(--background);
  --sidebar-foreground: var(--foreground);
  --sidebar-primary: var(--primary);
  --sidebar-primary-foreground: var(--primary-foreground);
  --sidebar-accent: var(--accent);
  --sidebar-accent-foreground: var(--accent-foreground);
  --sidebar-border: var(--border);
  --sidebar-ring: var(--ring);
  --surface: var(--card);
  --surface-foreground: var(--card-foreground);
  --code: var(--muted);
  --code-foreground: var(--foreground);
  --code-highlight: var(--accent);
  --code-number: var(--muted-foreground);
  --selection: var(--primary);
  --selection-foreground: var(--primary-foreground);
  --decor-accent: #ffdc58;
  --decor-ink: #000;
  --decor-paper: #fff;
}
```

### Mapping this to our palette

Their light theme is structurally *exactly* our brief, an off-white paper ground (`#fff7e8`), pure-black keylines and shadow (`--border: #000`, `--shadow-color: #000`), `--radius: 0`, and a flat saturated primary that carries black text (`--primary-foreground: #000`). The substitutions are mechanical:

| Token | Theirs | Ours |
|---|---|---|
| `--primary` | `#ffdc58` (yellow) | `#3866A8` (blue) |
| `--primary-foreground` | `#000` | `#FFFFFF`, **our blue carries white text, theirs carries black. This is the one place their convention inverts ours.** |
| `--accent` | `#ffe7a3` | `#F79E76` (cantaloupe) |
| `--accent-foreground` | `#000` | `#000`, matches the "cantaloupe carries black text ONLY" rule already |
| `--background` | `#fff7e8` | our off-white paper |
| `--border` / `--shadow-color` / `--ring` | `#000` | `#000`, keep |
| `--radius` | `0` | `0`, keep |
| `--secondary` / `--secondary-foreground` | `#000` / `#fff` | keep |

They also carry a `--decor-ink` / `--decor-paper` / `--decor-accent` triple for decorative elements, a useful convention to steal for our lime-as-decoration-only rule (`--decor-accent: <lime>`).

Note `--background-image` points at their own asset; drop it.

### Border-width and shadow conventions baked into the components

Fetched verbatim from the registry.

**Button** ([`/r/base/button.json`](https://neobrutalism.com/r/base/button.json), deps `@base-ui/react`, `class-variance-authority`), cva base:

```
group/button font-head font-medium inline-flex cursor-pointer items-center justify-center gap-2 rounded whitespace-nowrap select-none transition-all duration-200
disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60
focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-destructive
[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4
```

`variant: default`:

```
border-2 border-black bg-primary text-primary-foreground shadow-md transition duration-200
hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg
active:translate-x-1 active:translate-y-1 active:shadow-none
```

**Card** ([`/r/base/card.json`](https://neobrutalism.com/r/base/card.json), deps `@base-ui/react`), root:

```
group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded border-2 bg-card
py-(--card-spacing) text-sm text-card-foreground shadow-md [--card-spacing:--spacing(4)]
has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0
data-[size=sm]:[--card-spacing:--spacing(3)] ...
```

**Input** ([`/r/base/input.json`](https://neobrutalism.com/r/base/input.json), deps `@base-ui/react`):

```
h-8 w-full min-w-0 rounded border-2 bg-input px-3 py-2 text-sm shadow-sm transition-colors outline-none
... focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
disabled:... aria-invalid:border-destructive
```

**The conventions to copy:**

1. **`border-2` everywhere**, never `border` (1px). Buttons additionally hardcode `border-black`; card and input inherit `--border`.
2. **Shadow scale by element weight**: `shadow-sm` (2px) for inputs, `shadow-md` (4px) for buttons and cards, `shadow-lg` (6px) on button hover.
3. **The press interaction is a shadow-offset trade**, not a colour change: `hover:-translate-x-0.5 -translate-y-0.5` + `shadow-lg` (lift away from the shadow), then `active:translate-x-1 translate-y-1 shadow-none` (slam into it). This is the signature motion of the style, worth reproducing exactly.
4. **Focus is an `outline`, not a `ring`**, `focus-visible:outline-2 outline-offset-2 outline-primary`. Consistent across all three.
5. Tailwind v4-only syntax is used (`gap-(--card-spacing)`, `--spacing(4)`), and components are React 19-era: plain functions with `React.ComponentProps<"div">` and `data-slot` attributes, no `forwardRef`.

---

## The licence position, plainly

Read this before any code is copied. Quotes are verbatim from the sources named.

### 21st.dev, treat as look-only

**There is no site-wide licence.** Licence is a free-text field each uploader fills in, and it is frequently blank. All values below were read off the live pages:

| Component | `license` value |
|---|---|
| [`@retroui/table`](https://21st.dev/@retroui/components/table) | `MIT` |
| [`@chetanverma16/audio-player`](https://21st.dev/@chetanverma16/components/audio-player) | `mit` |
| [`@uilayout.contact/scroll-text-marquee`](https://21st.dev/@uilayout.contact/components/scroll-text-marquee) | `MIT` |
| [`@radiumcoders/brutal-button`](https://21st.dev/@radiumcoders/components/brutal-button) | `mit` |
| [`@0xUrvish/folder-interaction`](https://21st.dev/@0xUrvish/components/folder-interaction) | `mit` |
| [`@theorcdev/8bit-timeline2`](https://21st.dev/@theorcdev/components/8bit-timeline2) | `MIT` |
| [`@mara.stefana.ilie/hero-personal-website`](https://21st.dev/@mara.stefana.ilie/components/hero-personal-website) | `mit` |
| [`@saurabh-2607/great-ui-vinyl-album-card`](https://21st.dev/@saurabh-2607/components/great-ui-vinyl-album-card) | `mit` |
| [`@felipemenezes098/hero-04`](https://21st.dev/@felipemenezes098/components/hero-04) | **`no-license`** |
| [`@ravikatiyar162/folder-card`](https://21st.dev/@ravikatiyar162/components/folder-card) | **`""` (empty)** |
| [`@urmauur/folder-components`](https://21st.dev/@urmauur/components/folder-components) | **`""` (empty)** |
| [`@urmauur/file-card-collections`](https://21st.dev/@urmauur/components/file-card-collections) | **`""` (empty)** |
| [`@ln-dev7/tag-input`](https://21st.dev/@ln-dev7/components/tag-input) | **`""` (empty)** |
| [`@daiwiikharihar/neo-brutalist-kinetic-deck`](https://21st.dev/@daiwiikharihar/components/neo-brutalist-kinetic-deck) | **`""` (empty)** |
| [`@nayan_radadiya6/timeline-rail`](https://21st.dev/@nayan_radadiya6/components/timeline-rail) | **`""` (empty)** |
| [`@lovesickfromthe6ix/music-portfolio`](https://21st.dev/@lovesickfromthe6ix/components/music-portfolio) | **`""` (empty)** |

`license_url` was `null` in every case checked.

From the [21st.dev Terms of Service](https://21st.dev/terms), verbatim:

> "All code, content, and materials published on the Marketplace, including but not limited to components, documentation, metadata (such as names and descriptions), and all associated media assets (such as images, videos, and thumbnails), are the sole and exclusive property of their respective authors and 21st Labs Inc." *(Section 2)*

> "When your item builds on someone else's open-source work, keep their licence and give visible credit to the original author on the component page, even where the licence is permissive." *(Section 3.1)*

And prohibited *(Section 3)*:

> "Copying and redistributing components originally published on the Marketplace to other websites, social media platforms, or any other medium without providing a clear and visible link back to the original component page on 21st.dev"

**The Terms never grant users a licence to use community components in commercial or client projects.** They say the opposite, that everything is the property of its author and 21st Labs.

Note also: the "21st.dev is MIT" you will find via Google refers to the *platform* repo, [serafimcloud/21st `LICENSE`](https://github.com/serafimcloud/21st/blob/main/LICENSE), the website's own source code, **not** the community components. Secondary blogs conflate the two. Do not rely on them.

**What you can and cannot do, for this paid client project:**

- **CAN**: browse, screenshot, and study any component; read its usage source (public, no account); use it as visual reference and write your own implementation from scratch.
- **CAN**: copy a component whose page explicitly declares `MIT`/`mit`, *provided* you retain the author's copyright notice, as MIT requires.
- **CANNOT**: copy a component whose licence field is blank or `no-license`. An empty licence field is not permission; the default is all-rights-reserved, and the Terms explicitly assign ownership to the author.
- **CANNOT**: assume "it's on a public component marketplace" implies a usage grant. It does not.
- **AVOID**: the `@ElevenLabs-crawled` and `@vercel-crawled` accounts. The `-crawled` suffix indicates automated scraping of third-party sites (**INFERRED** from the naming); the uploader is not the author and cannot have granted a licence.
- **AVOID**: `shadcnblockscom` (Shadcnblocks.com) and similar commercial libraries mirrored onto 21st, their own paid licence governs, not the 21st page.

### neobrutalism.com, clean, with one catch

**Free components: MIT.** The [neobrutalism/neobrutalism repo](https://github.com/neobrutalism/neobrutalism) carries a `LICENCE.md` and the README states MIT under its License section. The site's [Terms](https://neobrutalism.com/terms) say, verbatim:

> "The UI components provided on Neobrutalism.com are open source and available for use in your projects."

> "You are free to use components in personal and commercial projects"

> "Modify and customize components to fit your needs"

> "Share and distribute your modifications"

> "Attribution is appreciated but not required"

That is an unambiguous grant covering paid client work. **The 54-item free registry is safe to use and safe to bill for.**

**Pro blocks/templates are seat-licensed, and the cheapest tier does not cover client work.** From [neobrutalism.com/pricing](https://neobrutalism.com/pricing), verbatim:

> "Individual is for personal and open-source work only. If you invoice clients or charge end users, pick Team or Organization."

> **Can I use Pro for commercial work?** "Yes, with Team or Organization. Build unlimited end products for unlimited clients"

And on redistribution:

> "No. Pro ships inside your end products, not as a standalone block repo, component library, theme pack, website builder, starter kit"

So: Individual ($389/yr) is **not** usable here because this is an invoiced client project. Team ($789/yr) is the entry point for Pro. **The free MIT components plus the token block need none of this**, Pro is only required if you want their 158 pre-built blocks.

### Bottom line for the client

Build on neobrutalism.com's free MIT registry and its token block. Use 21st.dev signed-out as a mood board. Copy nothing from 21st.dev unless that specific page says MIT, and keep the notice if you do. No subscription is needed for either site.

---

## Tailwind v4 / React 19 / Next 16 compatibility

**It varies per author. There is no platform-wide guarantee on 21st.dev.**

**Tailwind v3, config-driven, `@ekmas` neobrutalism set** ([source](https://cdn.21st.dev/user_2reteS3IODi8OJpbNYOpgLKdwT7/button/code.tsx)):

```tsx
import { Slot } from "@radix-ui/react-slot"
const buttonVariants = cva(
  "inline-flex ... rounded-base text-sm font-base ring-offset-white ...", {
  variants: { variant: {
    default: "text-mtext bg-main border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none",
```

`rounded-base`, `bg-main`, `text-mtext`, `shadow-shadow`, `translate-x-boxShadowX` are **`tailwind.config.js` theme keys**. They silently no-op under Tailwind v4 unless every one is hand-ported into `@theme`. It also uses `React.forwardRef` and `@radix-ui/react-slot`. Upstream ([ekmas/neobrutalism-components](https://github.com/ekmas/neobrutalism-components)) is **MIT but explicitly "no longer maintained."**

**Tailwind v4, `@retroui`** ([source](https://cdn.21st.dev/retroui/table/index.1787186592259-1ef5f04a-eed2-421b-b211-6eb35c86642d.css)):

```css
@import "tailwindcss";
@import "tw-animate-css";
@theme inline {
  --shadow-sm: 2px 2px 0 0 var(--border);
  --shadow:    3px 3px 0 0 var(--border);
  --shadow-lg: 6px 6px 0 0 var(--border);
}
:root {
  --radius: 0;
  --background: #fff;  --foreground: #000;
  --primary: #ffdb33;  --primary-foreground: #000;
  --secondary: #000;   --secondary-foreground: #fff;
  --border: #000;
}
```

Note this is the *older* RetroUI shape (shadows keyed off `--border`); the current neobrutalism.com system uses a dedicated `--shadow-color`, prefer the latter.

**Radix vs Base UI:** both exist in the wild. neobrutalism.com's default `/r/base/*` line is **Base UI** (`@base-ui/react`) with a `/r/radix/*` fallback (`radix-ui`). On 21st.dev, Radix predominates.

**Next 16 / React 19:** no compatibility statement found on 21st.dev either way. **INFERRED**: since components are copied source rather than npm deps, Next 16 compat is a non-issue; the real risks are `framer-motion` (very common in these components, should be `motion/react` now) and `forwardRef`-era code. neobrutalism.com's components are already React 19-shaped (`data-slot`, `React.ComponentProps`, no `forwardRef`).

**Common dependencies observed** across sampled 21st.dev components: `framer-motion`, `lucide-react`, `class-variance-authority`, `radix-ui`, `motion`.

---

## Component inventory

Every row was fetched and returned HTTP 200. Registry JSON follows the verified shape `https://21st.dev/r/{author}/{slug}`, **all of these 403 without an account**, so the pattern is given rather than a working link. Blank/`no-license` components are flagged; per the licence section, those are reference-only.

### Explicitly neobrutalist / brutalist

| Category | Component | Author | URL | Fits neo-brutalist? | Notes |
|---|---|---|---|---|---|
| Neobrutalist | Table | retroui | [link](https://21st.dev/@retroui/components/table) | **Yes, best on site** | Site's own words: "thick black borders, bold headers and hard offset shadows". Tailwind v4, `--radius: 0`. `license: MIT`. |
| Neobrutalist | Badge | retroui | [link](https://21st.dev/@retroui/components/badge) | Yes | Same v4 token system. Good base for skill tags. |
| Neobrutalist | Popover | retroui | [link](https://21st.dev/@retroui/components/popover) | Yes | Same system. |
| Neobrutalist | Menu | retroui | [link](https://21st.dev/@retroui/components/menu-style-default) | Yes | Same system. |
| Neobrutalist | Tooltip | retroui | [link](https://21st.dev/@retroui/components/tooltip) | Yes | Same system. |
| Neobrutalist | Toggle Group | retroui | [link](https://21st.dev/@retroui/components/toggle-group) | Yes | Same system. |
| Neobrutalist | Switch | retroui | [link](https://21st.dev/@retroui/components/switch-style-disabled) | Yes | Only **7** retroui items are mirrored to 21st.dev, the other ~47 are at neobrutalism.com, free and MIT. |
| Neobrutalist | Button | Samuel Breznjak (`@ekmas`) | [link](https://21st.dev/@ekmas/components/button/button-demo) | Yes, but **Tailwind v3** | `variant="reverse" \| "noShadow" \| "neutral"`, shadow-offset-on-hover is exactly the idiom. Needs full v3->v4 token port. |
| Neobrutalist | Alert / Input / Slider / Checkbox / Accordion / Pagination / Image Card | Samuel Breznjak (`@ekmas`) | [alert](https://21st.dev/@ekmas/components/alert/alert-demo), [input](https://21st.dev/@ekmas/components/input/input-demo), [slider](https://21st.dev/@ekmas/components/slider/slider-demo), [checkbox](https://21st.dev/@ekmas/components/checkbox/checkbox-demo), [accordion](https://21st.dev/@ekmas/components/accordion), [pagination](https://21st.dev/@ekmas/components/pagination/pagination-demo), [image-card](https://21st.dev/@ekmas/components/image-card/image-card-demo) | Yes, but v3 | Same caveat. Upstream MIT but unmaintained. |
| Neobrutalist | Brutal Button | jay sharma (`@radiumcoders`) | [link](https://21st.dev/@radiumcoders/components/brutal-button) | Yes | `license: mit`. |
| Neobrutalist | Neo-Brutalist Kinetic Deck | daiv09 (`@daiwiikharihar`) | [link](https://21st.dev/@daiwiikharihar/components/neo-brutalist-kinetic-deck) | Yes | **`license` blank, reference only.** Card-deck interaction; possible "projects" holder. |
| Neobrutalist | Cartoon Button | SEONG HUN (`@oldkong88`) | [link](https://21st.dev/@oldkong88/components/cartoon-button) | Partly | Thick-outline cartoon style, softer than brutalist. |
| Adjacent (retro/8-bit) | 8-bit set (~40 items: badge, tabs, table, input, select, progress, alert, timeline...) | OrcDev (`@theorcdev`) | [8bit-badge](https://21st.dev/@theorcdev/components/8bit-badge), [8bit-tabs](https://21st.dev/@theorcdev/components/8bit-tabs), [8bit-table](https://21st.dev/@theorcdev/components/8bit-table) | Adjacent, not the brief | Pixel/retro-game aesthetic. Hard edges and flat colour overlap, but pixel-stepped borders read as *arcade*, not *editorial*. Wrong register for a music-school portfolio. |
| Theme | "Neo Brutalism" shadcn theme | serafimcloud (mirroring tweakcn) | [link](https://21st.dev/@serafimcloud/themes/neo-brutalism) | Yes | Also "Notebook" and "Retro Arcade" in the same set. Client-rendered, so token values were not machine-readable; **INFERRED** these mirror the tweakcn theme set. Not served over `/r/` (404). Superseded by the neobrutalism.com token block above. |

### Folders / file-tab metaphors, the client's "folders to hold projects"

| Category | Component | Author | URL | Fits neo-brutalist? | Notes |
|---|---|---|---|---|---|
| Folder | Interactive Folder Gallery | Alex Reino (`@alexperezcedeno`) | [link](https://21st.dev/@alexperezcedeno/components/interactive-folder-gallery) | **Closest to the brief** | "macOS-inspired folder that springs open on click, fanning out photo cards... drag-to-close." Fan-out is exactly the scrapbook gesture. **`license` blank, reference only.** |
| Folder | Folder Interaction | 0xUrvish | [link](https://21st.dev/@0xUrvish/components/folder-interaction) | Restyle needed | "Animated folder with interactive open/close mechanics." `license: mit`, **the only cleanly-licensed folder on the list.** |
| Folder | Folder Components | Faisal Amir (`@urmauur`) | [link](https://21st.dev/@urmauur/components/folder-components) | Restyle needed | Simple `<Folder label="..." />`. Clean base to re-skin. Uses `framer-motion`. **`license` blank.** |
| Folder | Folder Card | Ravi Katiyar (`@ravikatiyar162`) | [link](https://21st.dev/@ravikatiyar162/components/folder-card) | Restyle needed | **`license` blank.** |
| Folder | Interactive Folder | Erik (`@aghasisahakyan1`) | [link](https://21st.dev/@aghasisahakyan1/components/interactive-folder) | Restyle needed |, |
| Folder | 3D Folder | Jatin Yadav (`@jatin-yadav05`) | [link](https://21st.dev/@jatin-yadav05/components/3d-folder) | Maybe | 3D depth fights flat neo-brutalism. |
| Folder | 3D Folder | Awanish Verma (`@avanishverma4`) | [link](https://21st.dev/@avanishverma4/components/3d-folder) | Maybe | As above. |
| Folder | Folder | Anish Mourya (`@anish-1144`) | [link](https://21st.dev/@anish-1144/components/folder) | Restyle needed |, |
| File tab | **Tabs like bookmark** | kemendev (`@k3menn`) | [link](https://21st.dev/@k3menn/components/tabs-like-bookmark) | **Yes, conceptually** | The single closest thing to a manila-folder tab strip on the site. |
| File cards | File Card Collections | Faisal Amir (`@urmauur`) | [link](https://21st.dev/@urmauur/components/file-card-collections) | Restyle needed | Stacked file-card cluster. **`license` blank.** |
| File tree | File Tree | Dillion Verma (`@dillionverma`) | [link](https://21st.dev/@dillionverma/components/file-tree) | No | IDE sidebar, wrong metaphor. |
| File tree | Filesystem Item | Build UI (`@builduilabs`) | [link](https://21st.dev/@builduilabs/components/filesystem-item) | No | As above. |

**Honest read:** none is a manila-folder-with-tab scrapbook object. They are Finder/OS folder icons. Take the *interaction* (spring-open, fan-out) and draw your own folder.

### Audio / music players

| Category | Component | Author | URL | Fits neo-brutalist? | Notes |
|---|---|---|---|---|---|
| Audio | Audio Player | Chetan Verma (`@chetanverma16`) | [link](https://21st.dev/@chetanverma16/components/audio-player) | Restyle needed | Real player: `src`, `cover`, `title` props. `license: mit`. `framer-motion` + `lucide-react`. **Best structural starting point.** |
| Audio | WaveformPlayer | Ruixen (`@ruixen.ui`) | [link](https://21st.dev/@ruixen.ui/components/waveform-player) | Restyle needed | Ships its own Tailwind v4 CSS (`@import "tailwindcss"`, `--wave-color`, `--progress-color`), easy to retint. |
| Audio | Music Player | Ravi Katiyar (`@ravikatiyar162`) | [link](https://21st.dev/@ravikatiyar162/components/music-player) | Restyle needed |, |
| Audio | Music Player Card | Ravi Katiyar (`@ravikatiyar162`) | [link](https://21st.dev/@ravikatiyar162/components/music-player-card) | Restyle needed |, |
| Audio | Music Player Widget | Muhammad Ammar (`@smammar100`) | [link](https://21st.dev/@smammar100/components/music-player-widget) | Restyle needed |, |
| Audio | MusicPlayerCard | Dhileep Kumar GM (`@dhileepkumargm`) | [link](https://21st.dev/@dhileepkumargm/components/music-player-card) | Restyle needed | This author's catalogue is heavily glassmorphic/shader. |
| Audio | Audio Player | ElevenLabs (`@ElevenLabs-crawled`) | [link](https://21st.dev/@ElevenLabs-crawled/components/audio-player) | Restyle needed | **`-crawled` account, avoid, see licence section.** |
| Waveform | Waveform | thegridcn (`@thegridcn`) | [link](https://21st.dev/@thegridcn/components/waveform) | Restyle needed | Pure visualiser. |
| Waveform | Bar Visualizer / Live Waveform | ElevenLabs (`@ElevenLabs-crawled`) | [bar](https://21st.dev/@ElevenLabs-crawled/components/bar-visualizer), [live](https://21st.dev/@ElevenLabs-crawled/components/live-waveform) | Chunky bars suit the style | Same provenance caveat, avoid. |
| Music card | Great UI Vinyl Album Card | Saurabh Sharma (`@saurabh-2607`) | [link](https://21st.dev/@saurabh-2607/components/great-ui-vinyl-album-card) | **Yes, thematically** | Vinyl slides out of sleeve on hover. `license: mit`. Strong fit for a music portfolio. |
| Music card | Spotify Card | Jatin Yadav (`@jatin-yadav05`) | [link](https://21st.dev/@jatin-yadav05/components/spotify-card/spotify-card) | Restyle needed | Trade-dress risk, do not ship Spotify branding on a client site. |
| Music card | Music Artwork | Derek Miller (`@diriktv`) | [link](https://21st.dev/@diriktv/components/music-artwork) | Restyle needed |, |
| Music page | Music Portfolio | scott clayton (`@lovesickfromthe6ix`) | [link](https://21st.dev/@lovesickfromthe6ix/components/music-portfolio) | Reference only | Whole-page music portfolio layout. **`license` blank.** |

### Marquees / scrolling tickers

| Category | Component | Author | URL | Fits neo-brutalist? | Notes |
|---|---|---|---|---|---|
| Marquee | Marquee | Samuel Breznjak (`@ekmas`) | [link](https://21st.dev/@ekmas/components/marquee/marquee-demo) | **Yes, already neobrutalist** | Part of the v3 set; port tokens. |
| Marquee | Scroll Text Marquee | ui layout (`@uilayout.contact`) | [link](https://21st.dev/@uilayout.contact/components/scroll-text-marquee) | **Yes** | Scroll-velocity-driven speed/direction. `license: MIT`. Big-type ticker = core neo-brutalist device. |
| Marquee | Text Marque | ui layout (`@uilayout.contact`) | [link](https://21st.dev/@uilayout.contact/components/text-marque) | Yes | Simpler sibling. |
| Marquee | Infinite Ribbon | Edwin Vakayil (`@edwinvakayil`) | [link](https://21st.dev/@edwinvakayil/components/infinite-ribbon) | **Yes** | Angled ribbon banner, very on-style. |
| Marquee | Marquee | tom (`@tom_ui`) | [link](https://21st.dev/@tom_ui/components/marquee) | Yes | Plain, easy to restyle. |
| Marquee | Marquee | lukacho/ui (`@lukacho`) | [link](https://21st.dev/@lukacho/components/marquee) | Yes |, |
| Marquee | Marquee Along SVG Path | Daniel Petho (`@danielpetho`) | [link](https://21st.dev/@danielpetho/components/marquee-along-svg-path) | Decorative | Text on a curve, good "doodle/arrow" substitute. |
| Marquee | CTA with Text Marquee | Liana Pepanyan (`@lyanchouss`) | [link](https://21st.dev/@lyanchouss/components/cta-with-text-marquee) | Yes | Marquee + CTA combined; horizontal and vertical variants. |
| Marquee | Gooey Marquee | Ali Imam (`@designali-in`) | [link](https://21st.dev/@designali-in/components/gooey-marquee) | No | Gooey blur is the opposite aesthetic. |

### Heroes

| Category | Component | Author | URL | Fits neo-brutalist? | Notes |
|---|---|---|---|---|---|
| Hero (collage) | **Editorial Collage Hero** | felipemenezes098 | [link](https://21st.dev/@felipemenezes098/components/hero-04) | **Closest to "scrapbook"** | The one hero matching the collage/sticker brief. **`license: no-license`, reference only, do not copy.** |
| Hero (personal) | Hero - Personal Website | Mara Ilie (`@mara.stefana.ilie`) | [link](https://21st.dev/@mara.stefana.ilie/components/hero-personal-website) | Good base | Tagged `retro`. `license: mit`. Personal-portfolio framing fits a graduate site. |
| Hero (typographic) | Underline Hero Section | vvisedev Crafts (`@waleedkibhen`) | [link](https://21st.dev/@waleedkibhen/components/underline-hero-section) | Yes | Big type + hand-underline. |
| Hero (typographic) | Text Rotate (landing hero) | Daniel Petho (`@danielpetho`) | [link](https://21st.dev/@danielpetho/components/text-rotate/landing-hero) | Yes | Rotating word in a big headline, works flat. |
| Hero (typographic) | Outline Text | Arunachalam (`@arunachalam`) | [link](https://21st.dev/@arunachalam/components/outline-text) | Yes | Outlined display type. |
| Hero (typographic) | Hero Shutter Text | daiv09 (`@daiwiikharihar`) | [link](https://21st.dev/@daiwiikharihar/components/hero-shutter-text) | Yes | Hard block reveal, no gradient. |
| Hero (typographic) | Apple Hello Effect | Chánh Đại (`@ncdai`) | [link](https://21st.dev/@ncdai/components/apple-hello-effect) | Decorative | SVG handwriting stroke, usable as a doodle accent. |
| Hero (handwriting) | Handwriting Text | `@davailospirasto` | [link](https://21st.dev/@davailospirasto/components/handwriting-text) | Decorative | Nearest thing to the "doodle" ask. |
| Hero (portrait) | Split Hero With Image Cards | felipemenezes098 | [link](https://21st.dev/@felipemenezes098/components/hero-08) | Restyle needed | Portrait-friendly split layout. |
| Hero (portrait) | Centered Hero with Image Fan | felipemenezes098 | [link](https://21st.dev/@felipemenezes098/components/hero-10) | Restyle needed | Fanned photos ~ scrapbook. |
| Hero (portrait) | Hero with image, text and two buttons | Tommy Jepsen (`@tommyjepsen`) | [link](https://21st.dev/@tommyjepsen/components/hero-with-image-text-and-two-buttons) | Restyle needed | Plain, unopinionated, easy to brutalise. |
| Hero (portrait) | Hero with group of images, text and two buttons | Tommy Jepsen (`@tommyjepsen`) | [link](https://21st.dev/@tommyjepsen/components/hero-with-group-of-images-text-and-two-buttons) | Restyle needed |, |
| Hero (photo) | Diced Hero Section | Maxim Bortnikov (`@maxim.bort.devel`) | [link](https://21st.dev/@maxim.bort.devel/components/diced-hero-section) | Maybe | Photo split into tiles, bold, grid-y. |

The rest of the `hero` tag (167 unique results) is dominated by shaders, galaxies, auroras, glows and gradients, `galaxy-interactive-hero-section`, `grain-gradient-hero-section`, `neural-noise`, `hyperdrive-hero`, `aurora-background-2`, `glsl-hills`. Not usable here.

### Cards, bento grids, galleries

| Category | Component | Author | URL | Fits neo-brutalist? | Notes |
|---|---|---|---|---|---|
| Bento | Bento Dashboard | daiv09 (`@daiwiikharihar`) | [link](https://21st.dev/@daiwiikharihar/components/bento-dashboard) | Yes, tagged neobrutalism | **`license` blank.** |
| Bento | Colorful Bento Grid | Radu Popescu (`@radu`) | [link](https://21st.dev/@radu/components/colorful-bento-grid) | Yes | Flat saturated blocks, closest to the palette brief. |
| Bento | Bento Monochrome | 21st Indexer (`@larsen66`) | [link](https://21st.dev/@larsen66/components/bento-monochrome) | Yes | Monochrome grid, good keyline base. |
| Bento | Bento Grid | Kokonut Baffier (`@kokonutd`) | [link](https://21st.dev/@kokonutd/components/bento-grid) | Restyle needed | Clean structure. |
| Bento | Bento Grid | Manu Arora (`@manuarora700`) | [link](https://21st.dev/@manuarora700/components/bento-grid) | Restyle needed | Aceternity, gradient-heavy by default. |
| Bento | Bento Gallery | Ravi Katiyar (`@ravikatiyar162`) | [link](https://21st.dev/@ravikatiyar162/components/bento-gallery) | Restyle needed | Image-first, fits "projects". |
| Case study | Bento Grid (casestudy-5) | Shadcnblocks.com (`@shadcnblockscom`) | [link](https://21st.dev/@shadcnblockscom/components/casestudy-5) | Restyle needed | **Commercial library, their own licence governs.** |
| Gallery | Dynamic Frame Layout | John (`@oeneco`) | [link](https://21st.dev/@oeneco/components/dynamic-frame-layout) | Yes | Hard frames, very keyline-friendly. |
| Gallery | Interactive Bento Gallery | Anurag Mishra (`@anurag-mishra22`) | [link](https://21st.dev/@anurag-mishra22/components/interactive-bento-gallery) | Restyle needed |, |
| Gallery | Expandable Gallery | 0xUrvish | [link](https://21st.dev/@0xUrvish/components/expandable-gallery) | Restyle needed |, |
| Gallery | Layout Grid | Manu Arora (`@manuarora700`) | [link](https://21st.dev/@manuarora700/components/layout-grid) | Restyle needed |, |
| Gallery | Portfolio and Image Gallery | `@iamsatish4564` | [link](https://21st.dev/@iamsatish4564/components/portfolio-and-image-gallery) | Reference | Portfolio-shaped. |
| Card | Card Fan Carousel | AAYUSH duhan (`@aayush-duhan`) | [link](https://21st.dev/@aayush-duhan/components/card-fan-carousel) | Yes, thematically | Fanned cards ~ photos spilling from a folder. |
| Card | Cards Stack | YoucefBnm (`@youcefbnm`) | [link](https://21st.dev/@youcefbnm/components/cards-stack) | Yes | Stacked-deck scroll. |
| Card | Quick Links Card | Erik (`@aghasisahakyan1`) | [link](https://21st.dev/@aghasisahakyan1/components/quick-links-card) | Yes, tagged neobrutalism |, |

### Skill tags / badges

| Category | Component | Author | URL | Fits neo-brutalist? | Notes |
|---|---|---|---|---|---|
| Tags | Badge | retroui | [link](https://21st.dev/@retroui/components/badge) | **Yes, use this** | Native v4 neobrutalist badge. `license: MIT`. Or take `badge` free from neobrutalism.com. |
| Tags | Stamp | Ali Imam (`@designali-in`) | [link](https://21st.dev/@designali-in/components/stamp) | **Yes, sticker-adjacent** | Nearest thing on the site to a "sticker" element. |
| Tags | Tags Selector | LN (`@ln-dev7`) | [link](https://21st.dev/@ln-dev7/components/tags-selector) | Restyle needed | Multi-select tag cloud. |
| Tags | Tag Input | LN (`@ln-dev7`) | [link](https://21st.dev/@ln-dev7/components/tag-input) | Restyle needed | **`license` blank.** |
| Tags | Tag Input | Kokonut Baffier (`@kokonutd`) | [link](https://21st.dev/@kokonutd/components/tag-input) | Restyle needed |, |
| Tags | Chip | Preet Suthar (`@preetsuthar17`) | [link](https://21st.dev/@preetsuthar17/components/chip) | Restyle needed |, |
| Tags | Selector Chips | Preet Suthar (`@preetsuthar17`) | [link](https://21st.dev/@preetsuthar17/components/selector-chips) | Restyle needed | Good for filtering projects by skill. |
| Tags | Cuisine Selector Chips | Sonu kumar (`@uniquesonu`) | [link](https://21st.dev/@uniquesonu/components/cuisine-selector-chips) | Restyle needed | Generic chip-filter despite the name. |
| Tags | Pill | Hayden Bleasel (`@haydenbleasel`) | [link](https://21st.dev/@haydenbleasel/components/pill) | Restyle needed | Kibo UI. |

### Timelines

| Category | Component | Author | URL | Fits neo-brutalist? | Notes |
|---|---|---|---|---|---|
| Timeline | Timeline | Manu Arora (`@manuarora700`) | [link](https://21st.dev/@manuarora700/components/timeline) | Restyle needed | Most-used scroll timeline; sticky year headers suit education/experience. |
| Timeline | 8bit Timeline Horizontal | OrcDev (`@theorcdev`) | [link](https://21st.dev/@theorcdev/components/8bit-timeline2) | Adjacent | `license: MIT`. Horizontal, good for an education strip. Pixel styling needs removing. |
| Timeline | Timeline Rail | nayan_radadiya6 | [link](https://21st.dev/@nayan_radadiya6/components/timeline-rail) | Restyle needed | Also `timeline-rail-variants-one`. **`license` blank.** |
| Timeline | Timeline | Prism UI (`@Codehagen`) | [link](https://21st.dev/@Codehagen/components/timeline) | Restyle needed |, |
| Timeline | Timeline | Nyxb UI (`@nyxbui`) | [link](https://21st.dev/@nyxbui/components/timeline) | Restyle needed |, |
| Timeline | Modern Timeline | Caio Bonato (`@chowlol202`) | [link](https://21st.dev/@chowlol202/components/modern-timeline) | Restyle needed |, |
| Timeline | Process Timeline | YoucefBnm (`@youcefbnm`) | [link](https://21st.dev/@youcefbnm/components/process-timeline) | Restyle needed |, |
| Timeline | How It Works Timeline | 7ovr | [link](https://21st.dev/@7ovr/components/how-it-works-2) | Restyle needed |, |
| Timeline | Impact Experience | ui layout (`@uilayout.contact`) | [link](https://21st.dev/@uilayout.contact/components/impact-experience) | Restyle needed | Explicitly experience-shaped. |

### Contact / CTA

| Category | Component | Author | URL | Fits neo-brutalist? | Notes |
|---|---|---|---|---|---|
| CTA | CTA with Text Marquee | Liana Pepanyan (`@lyanchouss`) | [link](https://21st.dev/@lyanchouss/components/cta-with-text-marquee) | **Yes** | Marquee-in-CTA is a signature neo-brutalist move. |
| Contact | Contact Card | Efferd (`@efferd`) | [link](https://21st.dev/@efferd/components/contact-card) | Restyle needed |, |
| Contact | Simple Contact Us Form | prebuiltui | [link](https://21st.dev/@prebuiltui/components/form-1/simple-contact-us-form) | Restyle needed | Plain structure, easy to brutalise. |
| CTA | Call to Action | Tommy Jepsen (`@tommyjepsen`) | [link](https://21st.dev/@tommyjepsen/components/call-to-action) | Restyle needed | Unopinionated. |
| CTA | Call To Action (with mail form) | Méschac Irung (`@meschacirung`) | [link](https://21st.dev/@meschacirung/components/call-to-action/call-to-action-with-mail-form) | Restyle needed | Tailark. |
| CTA | Call to Action | brijr | [link](https://21st.dev/@brijr/components/call-to-action-1) | Restyle needed |, |
| CTA | Call to Action 01 | Ali Imam (`@designali-in`) | [link](https://21st.dev/@designali-in/components/call-to-action-01) | Restyle needed |, |
| CTA | 8bit CTA 1, Comparison | OrcDev (`@theorcdev`) | [link](https://21st.dev/@theorcdev/components/8bit-cta1) | Adjacent |, |

### Categories with no usable results (verified negative)

Searched, returned **0 results**: `sticky-note`, `tape`, `doodle`, `sticker`, `scrapbook`, `asterisk`, `arrow`, `file tab`, `music-player`, `bento grid`.

(Multi-word queries always return 0, the search is slug-based. `music-player` and `bento grid` were re-run as `music`/`audio-player` and `bento`, which do return results. The decorative terms returned 0 as single slugs too, and the search does match component *names*, verified, since `brutalist` returns "Brutalist Deck Loader" which has no such tag. So these are true negatives.)

**There are no sticky-note, tape, doodle, arrow or asterisk decorative components on 21st.dev.** Nearest substitutes: [Stamp](https://21st.dev/@designali-in/components/stamp), [Handwriting Text](https://21st.dev/@davailospirasto/components/handwriting-text), [Apple Hello Effect](https://21st.dev/@ncdai/components/apple-hello-effect), [Marquee Along SVG Path](https://21st.dev/@danielpetho/components/marquee-along-svg-path). Everything in the "scrapbook decoration" column of the brief must be hand-built.

The canonical tag vocabulary is ~72 tags: `accordion ai-chat alert announcement avatar background badge border button calendar card carousel checkbox chip clients comparison cta cursor dashboard data-visualization date-picker dock dropdown empty-state faq features file-tree footer form gallery globe grid hero hook icon image input link list map marquee menu modal navigation-menu notification number onboarding pagination popover pricing-section profile progress radio-group scroll-area search select shader sidebar sign-in sign-up slider spinner stat steps table tabs team testimonials text textarea timeline toast toggle tooltip upload-download video`. There is no folder, audio, music or decoration tag among them; those searches match component *names* instead.

---

## Neo-brutalist coverage: honest verdict

**21st.dev does not have a meaningful neo-brutalist set.** Counts, all measured:

| Query | Results |
|---|---|
| `neobrutalism` | **19** |
| `brutalist` | **2** |
| `8bit` | 66 (retro-game, adjacent at best) |
| `retro` | 144 (mostly CRT/ASCII/dither/vaporwave, not brutalist) |
| `badge` | 199 (cap) |
| `cta` | 199 (cap) |
| `gallery` | 199 (cap) |
| `marquee` | 88 |
| `bento` | 46 |

Of those 19 neobrutalism hits, **roughly half are one author's unmaintained Tailwind v3 library** (`@ekmas`) and **seven are a partial mirror of RetroUI/neobrutalism.com**. Genuinely independent neobrutalist contributions number in the low single digits.

The catalogue's centre of gravity is unmistakable from the hero listing alone: galaxy shaders, grain gradients, aurora backgrounds, neural noise, GLSL hills, holographic interfaces, liquid glass. **It is a glassmorphic/gradient SaaS marketplace.** Neo-brutalism is a rounding error in it.

The one thing 21st.dev genuinely gave us is a *pointer*: RetroUI -> neobrutalism.com, which is the real library.

---

## Verdict

1. **Do not buy a 21st.dev subscription for this project.** The components worth having (RetroUI's) are available free, in greater number and better quality, direct from [neobrutalism.com](https://neobrutalism.com/) under MIT.
2. **Adopt neobrutalism.com's token block** (verbatim above) as the project's theme layer, with the palette substitutions in the mapping table. Keep the `Npx Npx 0 0` shadow scale and `--radius: 0` exactly; they are what make the style work.
3. **Adopt its component conventions**, `border-2` everywhere, `shadow-sm`/`md`/`lg` by element weight, the translate-on-hover / slam-on-active shadow trade, and `outline`-based focus rather than `ring`.
4. **Use its free MIT registry for primitives** where convenient: `npx shadcn@latest add https://neobrutalism.com/r/base/{component}.json` (or `/r/radix/` to stay on Radix). Public, unauthenticated, 54 items, Tailwind v4, React 19-shaped.
5. **Use 21st.dev free, signed out, as a visual reference library.** Usage source is readable without an account. Browse via `https://21st.dev/community/components/s/{tag}`. Take ideas; write your own components. This sidesteps the licence problem entirely.
6. **If any 21st.dev code is copied verbatim, check that component's licence field first** and record it. Blank and `no-license` are common, including on the most on-brief hero (`hero-04`). For a paid client project this is a real, not theoretical, risk.
7. **Budget for hand-building the personality.** Folders-as-project-holders, sticky notes, tape, doodles, arrows, asterisks, stickers, none of it exists on 21st.dev. That is the site's signature layer and it is bespoke work.
8. **Only consider neobrutalism.com Pro (Team tier, $789/yr) if you want its 158 pre-built blocks.** Nothing above requires it, and the Individual tier explicitly cannot be used for invoiced client work.

---

## Open questions

1. **Actual registry-item JSON shape from 21st.dev** (`type`, `files`, `dependencies`, `cssVars`), blocked by the 403 auth wall. Answerable with any free account (2 installs/day). Worth five minutes only if you ever intend to install from 21st.
2. **How the shadcn CLI authenticates against `/r/`**, whether the 21st CLI rewrites the URL with a token, injects a header, or proxies. Not determinable anonymously.
3. **Provenance of `@ElevenLabs-crawled` and `@vercel-crawled` accounts.** The `-crawled` suffix suggests automated scraping of third-party sites. **INFERRED**; licence status unclear. Avoid for client work.
4. **The `@serafimcloud/themes/*` set** appears to mirror tweakcn's theme library (Neo Brutalism, Notebook, Retro Arcade, Doom 64, Bubblegum, Catppuccin...). Attribution and licence for the mirrored themes are not stated on 21st.dev. Theme pages are client-rendered and not served over `/r/` (404). Moot now that we have neobrutalism.com's block, but flagged if anyone wants the tweakcn variant, check [tweakcn.com](https://tweakcn.com/) as upstream.
5. **Whether the 19 `neobrutalism` results are the complete set.** The tag search matches names and tags, but its ranking/cap behaviour is undocumented. Other categories capped at exactly 199, so 19 looks like a true count rather than a cap, not certain.
6. **Whether neobrutalism.com's MIT covers the token values themselves.** The repo is MIT and the Terms grant commercial use of "components"; colour values are not copyrightable in any case, so this is almost certainly moot. **INFERRED**, no action needed, noted for completeness.

---

### Resolved since first draft

- **`--radius: 0` propagation** (previously open): confirmed resolved. neobrutalism.com derives `--radius-sm/md/lg/xl` from `calc(var(--radius) * n)`, so a single `--radius: 0` zeroes every rounding utility; components can keep using `rounded` classes and still render square.
