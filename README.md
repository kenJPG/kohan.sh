# kohan.sh

Personal site for Kenneth Chen Ko Han — [kohan.sh](https://kohan.sh).

Static and generated: `content.json` is the source of truth,
[`scripts/generate.mjs`](scripts/generate.mjs) renders it into `index.html`,
and Vite bundles that into `dist/`, which Cloudflare Pages serves on every push
to `main`. **Edit `content.json`, never `index.html`** — the latter is
overwritten on every build.

## Develop

```bash
pnpm install
pnpm dev      # regenerate + serve
pnpm build    # regenerate + typecheck + bundle to dist/
pnpm preview  # serve dist/
```

Node 22+, pnpm 10, both pinned in `package.json`; one lockfile.

## Content

Everything on the page comes from `content.json`:

| Key | What |
| --- | --- |
| `name`, `role`, `bio`, `location`, `email`, `greeting` | the hero |
| `photos` | portrait(s), served from `public/portraits/` |
| `links` | github / linkedin / huggingface |
| `resume` | the resume button |
| `experience`, `research`, `education`, `skills` | the sections |

`[text](url)` in `description`/`detail` strings is linkified at build time.
Tech and coursework fields are comma-separated strings.

### Photos

Put the file in `public/portraits/` and set `photos[].src` to its name. The
build serves it directly — no resize step. A missing file is a supported state
(the hero renders without a portrait), not a broken one.

### Logos

Company logos live in `logos/` and are resized to WebP into `public/img/`
(gitignored), displayed at 18px (generated at 2× for hi-dpi). sharp is a
nice-to-have: if it can't load (Windows/WSL sharing one `node_modules`), the
originals are copied through unresized.

## The Minecraft heading

`greeting` is `"[Hi]! I'm Kenneth"`. The bracketed word is painted with real
16×16 Minecraft block textures from `public/textures/`, and on a timer it
cracks through the game's own `destroy_stage` frames, bursts into shards, and
comes back as the next block in the rotation. A command-block GIF anchors the
foot of the hero.

Drop another 16×16 PNG into `public/textures/` and it joins the rotation — no
code change. All of it honours `prefers-reduced-motion`: the block is drawn but
never breaks, the GIF degrades to a still frame, and scroll reveals are
skipped.

## Resume

A Typst document ([`resume/resume.typ`](resume/resume.typ)) compiled to PDF.
The published filename is permanent — it's printed on applications and sits in
recruiters' bookmarks — so it never changes, whatever the content.

| URL | What |
| --- | --- |
| `/kenneth-chen-ko-han-resume.pdf` | Canonical (A4). Put this on applications. |
| `/kenneth-chen-ko-han-resume-letter.pdf` | US Letter, for US companies. |
| `/resume`, `/cv` | Redirect to the canonical PDF. |

### Editing

```bash
winget install --id Typst.Typst   # once
pnpm resume:watch   # recompile A4 on every save
pnpm resume:build   # compile BOTH paper sizes
pnpm resume:check   # assert both are exactly one page
```

`resume:watch` rebuilds only A4 — run `resume:build` before committing or the
US Letter PDF silently goes stale. `resume:build:full` writes `-full` variants
with the real phone number; those are gitignored and for sending directly,
never for the public site.

The PDFs are committed on purpose. Cloudflare has no Typst binary, so GitHub
Actions ([`.github/workflows/resume.yml`](.github/workflows/resume.yml))
compiles and commits them; the site build never depends on Typst.

Editing gotchas, found the hard way:

- The `#set document(...)` in `resume.typ` must stay after the
  `#show: resume.with(...)` line, or the PDF title silently loses "— Resume".
- Consecutive `#generic-one-by-two` calls need a blank line between them or
  they reflow into one run-on paragraph.
- US Letter is ~50pt shorter than A4, so the body font scales down slightly —
  add content and `resume:check` will fail before a two-page PDF ships.

## Design

Monochrome and type-led — colour never carries hierarchy. Palette: paper
`#fff`, ink `#171717`, muted `#6b6b6b`. Font is self-hosted Geist (variable
woff2 in `public/fonts/`) with system fallbacks; no Google Fonts, no
third-party font CDN. One global `:focus-visible` rule means no new element can
ship without a focus ring, and `prefers-reduced-motion` is respected
throughout.
