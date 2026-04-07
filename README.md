# Raigad Mixboxing — Modernized Multi-Page Website

This repo now uses a cleaner, less cluttered design system applied globally across all pages.

## Styling/Theming direction

Instead of adding more Tailwind-specific UI patterns, the site now uses:

- a shared custom design layer in `assets/css/overhaul.css`
- runtime-loaded **Pico.css** (`@picocss/pico`) as a modern, minimal styling alternative
- improved spacing, readability, and block consistency for all content pages

## What was improved

- Unified page surfaces for all common content blocks (`about`, `bio`, `panel`, `details`, `table`, `calendar`, `contact`) with cleaner borders, softer shadows, and consistent radius.
- Better information presentation with stronger text hierarchy and readable paragraph/list rhythm.
- Cleaner navigation treatment and restrained interactions (no extra chips, no floating command widgets).
- Enhancements are global because all pages already include `assets/css/overhaul.css` and `assets/js/site-enhancements.js`.

## Cloudflare Worker deployment

The repository includes Workers deployment files:

- `worker/index.js`
- `wrangler.toml`

### Deploy

```bash
npm i -g wrangler
wrangler login
wrangler deploy
```

### Local preview

```bash
wrangler dev
```
