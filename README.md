# OpenSentry Pixel

Standalone retro arcade C-UAS side project concept.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production build is emitted to `dist/`.

## Deploy

Vercel can use the default Vite settings:

- Build command: `npm run build`
- Output directory: `dist`

GitHub Pages should build with the repo base path:

```bash
GITHUB_PAGES=true npm run build
```

The included workflow at `.github/workflows/deploy.yml` publishes `dist/` to Pages.

## Original Build Prompt

See `PROMPT.md` for the initial MVP brief.
