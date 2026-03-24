# Paymong Remake

This project is a remake of [paymong.kr](https://paymong.kr/).

## Run locally

Requirements:

- Node.js `>= 20.9.0`
- npm

Install and run:

```bash
npm ci
npm run dev
```

The app uses Next.js 16 and Turbopack.

## Current interaction flow

### Hero keyword sequence

The hero headline advances through these keywords in order:

1. `rent`
2. `tuition`
3. `labor`
4. `contract`

These map to the localized hero copy shown in the UI.

Before the last keyword, wheel and touch input are consumed by the hero so the page does not move into the next section early.

### Hero-to-next-section transition

At the last keyword, downward scroll starts the next section reveal:

- the next section frame rises into view
- the hero title and CTA fade, blur, and scale down
- the frame stays as a single continuous rectangle

The placeholder frame is currently filled with a neutral gray surface until real media is added.

### Header behavior

The fixed header stays fully visible until the hero reaches the last keyword.

From the last keyword onward, auto-hide is enabled:

- scrolling down hides the header upward
- scrolling up shows the header again
- near the top, the header remains visible

## Workspace defaults

This repo includes workspace-level UTF-8 defaults:

- `.editorconfig` enforces `utf-8`, `lf`, final newline, and trimmed trailing whitespace
- `.vscode/settings.json` pins VS Code file encoding to UTF-8 and configures the integrated PowerShell profile for UTF-8 output

## Design asset paths

### Header logo

Place the header logo here:

- `public/brand/paymong-header-logo.svg`

### Hero keyword assets

Place keyword-specific hero assets under:

- `public/design/hero-keywords/rent/`
- `public/design/hero-keywords/tuition/`
- `public/design/hero-keywords/labor/`
- `public/design/hero-keywords/contract/`

Each keyword folder uses these base filenames:

- `orbit-shell`
- `right-ribbon`
- `left-sweep`
- `bottom-echo`

Supported extensions:

- `.svg`
- `.png`
- `.jpg`
- `.jpeg`
- `.webp`

Example:

- `public/design/hero-keywords/rent/orbit-shell.svg`
- `public/design/hero-keywords/rent/right-ribbon.png`
- `public/design/hero-keywords/rent/left-sweep.webp`
- `public/design/hero-keywords/rent/bottom-echo.jpg`

The hero component checks the supported extensions in this order:

1. `.svg`
2. `.png`
3. `.jpg`
4. `.jpeg`
5. `.webp`

The first matching file is used.

For more detailed asset guidance, see:

- `public/design/hero-keywords/README.md`
