# AIFieldNotes

A static, content-driven AI notebook by Akshit Pratiush, built with Astro. Warm editorial layouts, lightweight animated diagrams, and a searchable library bring practical AI writing together without a client-side framework.

## Run locally

Use Node **22.12 or newer** (Astro 7 requires it). `.nvmrc` selects Node 22.

```bash
nvm use
npm ci
npm run dev
```

## Manage content

- **Learning notes:** add Markdown to `src/content/articles/`. The schema in `src/content.config.ts` requires `title`, `summary`, `date` (the content label), `topics`, and `readTime`. Set `featured: true` for the homepage editor’s pick.
- **Published articles, videos, and builds:** edit the corresponding arrays in `src/data.ts`. External URLs open in a new tab. YouTube thumbnails come from the existing video IDs.
- **Author information:** edit `profile` in `src/data.ts`; the concise homepage introduction lives in `src/pages/index.astro`. The placeholder email is not displayed.
- **Topics:** `src/lib/content.ts` maps note topics into Foundations, Inference, RAG & Agents, and Cloud & Tools. External published work is grouped under Cloud & Tools.
- **Homepage order:** `curatedOrder` in `src/pages/index.astro` puts six introductory notes first. There are no publication timestamps, so the site intentionally does not label this list “latest”.
- **Draft material:** `makearticles.md` remains an unpublished source notebook; it is not included in the site build.

The library supports keyword search, topic filters, empty states, and progressive loading on the homepage. Searches are shareable, for example `/articles?topic=Inference&q=cache`. All articles remain available without JavaScript. Reading pages include a table of contents, related notes, reading progress, and copy-link support in secure browser contexts. Animations respect reduced-motion preferences.

The Builds pages are explicitly marked as in-progress experiments because detailed implementation logs have not been provided. The existing “DigitalOcean Inference Mode Comparison” link still points to the general Community tutorials page; replace it with the exact published URL when available.

## Build and preview

```bash
ASTRO_TELEMETRY_DISABLED=1 npm run build
npm run preview
```

The build runs Astro’s TypeScript checks and generates static output in `dist/`. There is no backend, database, or additional runtime service.

## DigitalOcean App Platform

Keep the existing GitHub-backed **Static Site** component:

- Build command: `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Output directory: `dist`
- Node version: `22.12` or newer, consistent with `package.json`
- Site URL: `https://ai-notes-5hklj.ondigitalocean.app` (configured in `astro.config.mjs`)

Review and commit the changes, then push to the branch connected to App Platform. If automatic deployment is enabled, that push triggers the rebuild; otherwise deploy from the App Platform dashboard. No live deployment is performed by editing the local repository.

Google Fonts supplies the typefaces, with system fallbacks. YouTube supplies video thumbnails. All diagrams are local SVG/CSS, with no animation library or generated image dependency.
