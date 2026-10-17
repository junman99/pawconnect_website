# PawConnect website

A dependency-free static site, published by GitHub Pages at https://pawconnectsocial.com (the `CNAME` file). This checkout is separate from the native app at `/Users/junman/PawConnect/PawConnect-Xcode`.

## Preview

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765. No build step. The only outbound requests are the links people tap and, on `recovery.html`, one call to the PawConnect Cloud Function that holds the tag's page.

## Pages and what must not change

| Page | Notes |
|---|---|
| `index.html` (+ `site.css`, `site.js`) | The home page, built around the creator's portrait video (batch C5, N-06). English only. Contains one visible PLACEHOLDER block for app screenshots: `python3 scripts/check_website_home.py --publish` (in the app repo) fails until it is removed. |
| `privacy.html`, `terms.html`, `support.html`, `report-a-problem.html` | Linked from the app (`AppLinks`) and the App Store. Keep the addresses. Wording is a draft for the owner, not legal advice. |
| `recovery.html` | The page a pet's QR tag opens. Keep the address and the `?t=<token>` format forever (printed tags). Calls `getPetRecoveryPublic` and `reportPetFound` directly. |
| `share.html` | The page every shared link opens (`?k=post|zoomie|pet|profile|milestone|join|walk|badge`). Shows fixed copy only, never text from the address. |
| `.well-known/apple-app-site-association` | Universal Links for `/share.html` only (not `recovery.html`). `.nojekyll` makes GitHub Pages publish this folder. |
| `commission-factory-*.html`, `CNAME` | Leave exactly as they are. |

## Assets

- `assets/video/`: the creator's intro video (1080x1512, 5:7, 14.9 MB, H.264, faststart), its poster and its English captions (`.vtt`, timed to the whole file; the player starts at 1.6 s and stops at 48.3 s to skip the silence), and two example Zoomies **without any audio track** (the originals carried audio of unknown origin). Sources: `Assets_web/` in the app repo (git-ignored).
- `assets/photos/`: four compressed pet photos (cat2, dog2, dog4, rabbit2) (960 px long edge, from Pexels). Not used: `cat3`, `cat7`, `dog3`, `rabbit5`.
- `assets/og-image.jpg`: the share-preview image (1200x630).
- `assets/fonts/`: Nunito (SIL Open Font License), served locally. Logos and the app icon come from the native brand assets.

## Checks (run from the app repo; they read this folder)

`scripts/check_website_links.py` (links, anchors, alt text, tag balance, mail addresses), `check_website_home.py` (structure, accessibility basics, weight, no sideways scrolling at 320 to 1440 px), `check_website_share.py` and `check_website_recovery.py` (the two special pages in headless Chrome), `check_universal_links.py` (entitlements, association file, share kinds agree). Lighthouse (mobile, simulated throttling) on the home page at the time of writing: performance 98, accessibility 100, best practices 100, SEO 100.

## Local-only folders

`review/` (old screenshots and a verification note) is git-ignored so it can never be published by accident.
