# PawConnect website

A dependency-free static site, published by GitHub Pages at https://pawconnectsocial.com (the `CNAME` file). This checkout is separate from the native app at `/Users/junman/PawConnect/PawConnect-Xcode`.

## Preview

```sh
python3 /Users/junman/PawConnect/scripts/website/serve.py . 8765     # from this folder; like http.server, plus byte ranges so video seeking works
```

Open http://127.0.0.1:8765 (English) and http://127.0.0.1:8765/zh/ (Chinese). The only outbound requests are the links people tap and, on `recovery.html` and `zh/recovery.html`, one call to the PawConnect Cloud Function that holds the tag's page. Asset paths in the new pages are root-absolute (`/assets/...`), so serve this folder as the site root (GitHub Pages with the `CNAME` does).

## How the site is made (second design, batch C5b)

The pages are generated from the app repo (`/Users/junman/PawConnect/scripts/website/`) and committed here; there is no build step on the host.

| Script | Makes |
|---|---|
| `build_assets.py` | `assets/app/stills` (AVIF and WebP, 360/540/720 px, from `LAUNCH_AUDIT/screenshots`), `assets/app/clips` (muted screen recordings from `Assets_web/demo/recordings`), the intro video and its poster |
| `build_site.py` | `index.html`, `zh/index.html` (English and Chinese copy side by side), `site.css`, `site.js`, the caption tracks `pawconnect_intro.en.vtt` and `.zh-Hans.vtt` (from `src/cues.json`, re-timed from the audio) |
| `build_pages.py` | the Chinese twins of support, report-a-problem, share and recovery; Chinese summaries of privacy and terms (`zh/privacy.html`, `zh/terms.html`); the language link, hreflang and first-visit script on every page |
| `build_zh_font.py` | `assets/fonts/noto-sans-sc-display.woff2` (Chinese display weight, only the characters the headings use) |
| `make_og.py` | `assets/og-image.jpg` (1200x630, from a still of the owner's video) and `LAUNCH_AUDIT/OG_CANDIDATES.png` |

## Pages and what must not change

| Page | Notes |
|---|---|
| `index.html`, `zh/index.html` (+ `site.css`, `site.js`) | The home pages: a pinned phone whose screen follows the story (care, moments, Zoomies, chat, PawAI, nearby, PawShop, Pet ID), the creator's video on a coral field with a drawn caption overlay (no box), FAQ. Real app screens and recordings (batch C7), no stock photos, no emoji. Motion is an enhancement and is off for visitors who ask for less motion; a "Pause motion" button stops everything that moves. |
| `support.html`, `report-a-problem.html`, `privacy.html`, `terms.html` (+ `zh/` twins) | Linked from the app (`AppLinks`) and the App Store. Keep the addresses. Privacy and Terms stay English as the governing text; `zh/privacy.html` and `zh/terms.html` are plain-language Chinese summaries, **not a legal translation**. Wording is a draft for the owner, not legal advice. |
| `recovery.html`, `zh/recovery.html` | The page a pet's QR tag opens. Keep the address and the `?t=<token>` format forever (printed tags). Both languages live in one script (`STR`), chosen by `<html lang>`. |
| `share.html`, `zh/share.html` | The page every shared link opens (`?k=post|zoomie|pet|profile|milestone|join|walk|badge`). Fixed copy only, never text from the address. |
| `.well-known/apple-app-site-association` | Universal Links for `/share.html` only (not `recovery.html`). `.nojekyll` makes GitHub Pages publish this folder. |
| `commission-factory-*.html`, `CNAME` | Leave exactly as they are. |

Language handling: every page has hreflang tags and a visible language link; the choice is remembered in the browser (`localStorage` key `pc-lang`, nothing is sent anywhere); a visitor whose browser prefers Chinese is taken from an English page to its Chinese twin on the first visit only (the query string survives), and an explicit visit to a `/zh/` address stays there.

## Assets

- `assets/video/`: the creator's intro video (1080x1512, 5:7, H.264, faststart, **tone-mapped to ordinary BT.709**: the first version kept the HDR curve, which made it look pale), its poster (JPEG and WebP) and the English and Chinese caption files (timed to the whole file; the player starts at 1.5 s and stops at 48.3 s to skip the silence). Source: `Videos/` in the app repo (git-ignored, never modified).
- `assets/app/`: stills and muted recordings of the app (fictional pets, people and records; the nearby screen is left out on purpose).
- `assets/badges/`: Apple's official "Download on the App Store" badges, unmodified. `assets/brand/`: three cartoon avatars used on the share card.
- `assets/og-image.jpg`: the share-preview image (1200x630). The owner chooses between three candidates (`LAUNCH_AUDIT/OG_CANDIDATES.png` in the app repo).
- `assets/fonts/`: Bricolage Grotesque, Nunito and a Chinese display subset of Noto Sans SC (all SIL Open Font License), served locally.

## Checks (run from the app repo; they read this folder)

`scripts/check_website_home.py` (both home pages: structure, hreflang, no emoji, muted clips, weight, language handling, captions, reduced motion, contrast, touch targets, overflow at 320 to 1440 px), `check_website_links.py` (all 15 pages: links, anchors, alt text, tag balance, hreflang pairs), `check_website_recovery.py` and `check_website_share.py` (English special pages), `check_website_zh_pages.py` (their Chinese twins), `check_universal_links.py`. Lighthouse (mobile, simulated throttling, local server) at the time of writing: home en 95 / zh 95, desktop 100; accessibility, best practices and SEO 100; support, report and legal pages 100/100/100/100 on desktop.

## Local-only folders

`review/` (old screenshots and a verification note) is git-ignored so it can never be published by accident.
