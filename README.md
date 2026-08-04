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
