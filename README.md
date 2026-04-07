# Raigad Mixboxing — Nextgen Website Revamp

This repository now ships a **2026-style visual system** across every page, with a shared enhancement layer and Cloudflare Workers deployment.

## What changed

- A unified **nextgen theme** was added in `assets/css/overhaul.css`:
  - layered aurora gradients
  - glassmorphism shells
  - neon accents and modern nav hover states
  - persistent command-dock styling
- Global UX upgrades were expanded in `assets/js/site-enhancements.js`:
  - dynamic loading of **Pico.css** (modern, minimal UI library)
  - floating “Quick Actions” command dock with drawer navigation
  - page identity “Neo Edition” badges
  - existing accessibility/performance enhancements kept intact
- Cloudflare Worker deployment support was added:
  - `wrangler.toml`
  - `worker/index.js`
  - pretty URL redirects (`/about-us` -> `/about-us.html`)
  - security headers and caching rules

## Deploy to Cloudflare Workers

### 1) Install Wrangler

```bash
npm i -g wrangler
```

### 2) Authenticate

```bash
wrangler login
```

### 3) Deploy

```bash
wrangler deploy
```

This publishes the static site using Workers Assets, with the Worker acting as an edge router + header/caching layer.

## Local preview

```bash
wrangler dev
```

Open the local URL shown in terminal and test all pages:

- `/`
- `/about-us`
- `/gallery`
- `/founder`
- `/contact-us`
- `/calendar`
- committee/official pages

## Project structure

- `*.html` — all site pages
- `assets/css/overhaul.css` — global design system + nextgen theme
- `assets/js/site-enhancements.js` — global interaction/enhancement layer
- `worker/index.js` — Cloudflare Worker edge handler
- `wrangler.toml` — deployment configuration
