# kohan.sh

Personal site. Static, built with Vite; deployed by Cloudflare on push to `main`.

The page is generated, not hand-edited: [`content.json`](content.json) is the
source of truth, [`scripts/generate.mjs`](scripts/generate.mjs) renders it into
`index.html`, and Vite bundles that into `dist/`. **Edit `content.json`, not
`index.html`** — the latter is overwritten on every build.

```bash
pnpm install
pnpm dev      # regenerate + serve
pnpm build    # regenerate + typecheck + bundle to dist/
pnpm preview  # serve dist/
```

Node 22+, pnpm 10. Both are pinned in `package.json`; there is deliberately only
one lockfile.

## Adding your photo

Drop a jpg or png at the repo root named to match `content.portrait.src` in
`content.json` (currently `me.jpg`) and rebuild. The build resizes it to a
square WebP at 2× and emits explicit `width`/`height`, so it costs little and
causes no layout shift.

If the file is absent the build says so and the hero renders type-only — that
is a supported state, not a broken one. There is no placeholder image.

Company logos work the same way: anything in `logos/` is resized to 36px WebP at
build time. `raid.png` was shipping 419 KB to fill an 18-pixel square; it is now
0.8 KB. Generated images go to `public/img/`, which is gitignored — unlike the
resume PDFs, which are committed.

## Design

The visual language is deliberate, and the notes are in `src/style.css`. Three
rules, in priority order:

1. **Type carries the hierarchy. Colour never does.**
2. **Colour is reserved for action.** Exactly one thing on the page is filled
   with `--action` blue: the resume button. If a second thing ever becomes blue,
   the resume button stops meaning "this is the thing to click".
3. **Every element earns its place.** No decorative dividers, no ornament.

The font stack is the system UI stack, which resolves to San Francisco on Apple
platforms and Segoe UI Variable on Windows. That is not laziness — it means zero
font requests, zero layout shift from a webfont swap, and no borrowed
personality from whichever face is currently fashionable. **Do not add a Google
Fonts link.**

Contrast is checked, not assumed. Every text colour clears WCAG AA against
`--paper`: ink 18.38:1, muted 7.05:1, action 5.13:1. The previous design used
`#999` at 2.73:1 for dates and technologies.

`:focus-visible` is defined once, globally, so a new interactive element cannot
ship without a visible focus ring.

## Table tennis

There is a game in the footer, in `src/table-tennis.ts`. It is dependency-free,
lazy-loaded only when the footer is approached, and idle until then — a game
loop running behind three screens of text is wasted battery.

It honours `prefers-reduced-motion` literally: under that setting the ball never
moves on its own, only one step per input, so nothing animates that the user did
not ask for. It is playable by keyboard and announces the score to screen
readers via a visually hidden live region.

## The resume

> ### The published filename never changes.
>
> `kenneth-chen-ko-han-resume.pdf` is printed on job applications and sits in
> recruiters' bookmarks. Renaming it breaks links that cannot be un-broken —
> you will not know who hit a dead URL. If the content needs to change, change
> the content; the filename stays.

| URL | What |
| --- | --- |
| `https://kohan.sh/kenneth-chen-ko-han-resume.pdf` | **Canonical.** A4. Put this on applications. |
| `https://kohan.sh/kenneth-chen-ko-han-resume-letter.pdf` | US Letter, for US-headquartered companies. |
| `https://kohan.sh/resume` | Redirects to the canonical PDF. |
| `https://kohan.sh/cv` | Same. |

### Editing it

The source is [`resume/resume.typ`](resume/resume.typ), written in
[Typst](https://typst.app) against the pinned package
`@preview/basic-resume:0.2.9`.

Install Typst on Windows:

```bash
winget install --id Typst.Typst
```

Then:

```bash
pnpm resume:watch
```

That recompiles the A4 PDF into `public/` on every save. Open the PDF in a
viewer that live-reloads, or run `pnpm dev` alongside it and hit
`http://localhost:5173/kenneth-chen-ko-han-resume.pdf`.

When you are done:

```bash
pnpm resume:build   # compiles BOTH paper sizes
pnpm resume:check   # asserts both are exactly one page
```

`resume:watch` only rebuilds A4. Always run `resume:build` before committing or
the US Letter version silently goes stale.

### Outstanding TODOs

The resume renders visible `TODO` markers for everything that could not be
verified from `content.json` or the SEA-VL paper byline — missing months, award
years, the Resumify URL. A fuller checklist is in a comment block at the top of
`resume/resume.typ`.

**Do not fill these in with plausible guesses.** A fabricated date on a resume
is worse than a visible gap, and the markers are deliberately ugly so the
document cannot be sent out half-finished.

### How it reaches production

Cloudflare builds the site from source but has no Typst binary, so the PDFs are
compiled in GitHub Actions instead
([`.github/workflows/resume.yml`](.github/workflows/resume.yml)) and committed
into `public/`. Vite copies `public/` verbatim into `dist/`, and Cloudflare
serves the PDFs as ordinary static assets.

This means **the PDFs are committed to the repo on purpose** — they are not
gitignored. The workflow only triggers on changes under `resume/`, and only ever
writes `public/*.pdf`, so its own commit cannot retrigger it.

The site build has no dependency on Typst. If the resume workflow breaks, the
site still deploys.

### Gotchas found the hard way

- `basic-resume` calls `set document(title: author)` internally. The
  `#set document(...)` in `resume.typ` **must** stay after the
  `#show: resume.with(...)` line or the PDF title silently loses "— Resume".
- Consecutive `#generic-one-by-two` calls need a blank line between them, or
  they reflow into a single run-on paragraph.
- `#project(role: ..., name: ...)` renders `*role*, name`, which buries the
  project name. Roles go in the first bullet instead.
- US Letter is ~50pt shorter than A4, so the body font scales down slightly for
  it. If you add content, run `pnpm resume:check` — both sizes must stay at one
  page.
- `/resume` without a trailing slash does **not** resolve to
  `public/resume/index.html`; it falls through and serves the homepage. That is
  what [`public/_redirects`](public/_redirects) is for. This host returns
  `200 text/html` for unknown paths rather than 404, so a broken asset path
  looks like a working page — check `content-type`, not just the status code.
