# PawConnect website

A dependency-free static marketing site. This checkout is separate from the native app at `/Users/junman/PawConnect/PawConnect-Xcode`.

## Preview

From this folder:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765. No build step or package installation is needed. All visual assets are served locally; the only outbound action is following a link.

## Design

Cream `#FFF8F4`, peach `#FFF0EB`, coral `#D95A48`, charcoal `#29262D`, and PawAI lavender `#806FE8` follow the current native Theme.swift. Clean system typography, large product views and continuous chapters replace the previous serif/sticker direction. Native scroll drives the desktop care product sequence; mobile exposes direct feature controls. No scroll interception. Reduced motion disables transitions and mascot motion; a pause control is also provided. The cat’s animation stops outside the viewport and in hidden tabs.

## Assets and screenshots

- `coco.jpg`, `mochi.jpg`, `buddy.jpg`: resized copies of native Welcome* photography, with the same pet identities. Original native assets untouched. Existing app assets are reused; their upstream photo licenses were not documented in the checkout and should be confirmed before publication.
- `logo-primary.svg` and `logo-white.svg`: exact current SVG exports from the native `output/brand/PawConnect-Brand-Assets/SVG` folder. The coral P mark, pet silhouette and heart preserve the original geometry and color. `app-logo.png` and `app-icon.png` are the matching new native brand exports. Used throughout navigation, footer, download, support/legal/recovery pages and browser icons.
- `cat-rig/` and `coral-cat.png`: copies of the existing coral mascot, preserving its likeness. Canvas layout is based on the app’s own mascot preview. No new AI images were generated.
- `app-welcome.jpg` (original in `review/simulator-welcome.png`): genuine `simctl` screenshot captured on October 8, 2026, from the installed PawConnect 1.6 build on the booted iOS 26.5 simulator. The app is signed out. No authenticated feature screenshots could be obtained; the screenshot is not a capture of the latest uncommitted SwiftUI build. That older welcome capture is retained for evidence but is no longer displayed on the homepage. The new HTML app design previews use example content and are explicitly labeled; they are not screenshots of the latest app.

## Content verification

Inspected current native owners: `Core/Theme/Theme.swift`, `Models/Pet.swift`, `Models/HealthRecord.swift`, `Models/ActivityRecord.swift`, `Features/Pets/PetIDCardView.swift`, `HealthTimelineView.swift`, `MedicalDocumentVaultView.swift`, `Features/AI/PawAIPanel.swift`, and feed/Zoomies navigation. PawAI is beta, does not replace a veterinarian, and suggested records require review. Oomi was not found; Zoomies is the confirmed video feature. Current development features may differ from the published version; the site carries that note.

The App Store URL was verified against the public listing. The obsolete browser-only waitlist and unverified numbers, booking, price and advertising claims were removed. Privacy, terms, support, report and recovery pages received matching typography and branding and remain at their existing URLs. No backend, native app files, legal wording or live deployment were changed.

Inspiration: the visual pacing and focused product chapters of https://www.apple.com/iphone/, and the focused motion of https://www.apple.com/airpods-pro/. No layouts or assets copied from either.

See `review/verification.md` for final browser checks.
