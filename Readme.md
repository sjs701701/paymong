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
