# Hero Keyword Assets

Place the hero decorative image assets in this folder structure:

```text
public/design/hero-keywords/
  rent/
    orbit-shell.(svg|png|jpg|jpeg|webp)
    right-ribbon.(svg|png|jpg|jpeg|webp)
    left-sweep.(svg|png|jpg|jpeg|webp)
    bottom-echo.(svg|png|jpg|jpeg|webp)
  tuition/
    orbit-shell.(svg|png|jpg|jpeg|webp)
    right-ribbon.(svg|png|jpg|jpeg|webp)
    left-sweep.(svg|png|jpg|jpeg|webp)
    bottom-echo.(svg|png|jpg|jpeg|webp)
  labor/
    orbit-shell.(svg|png|jpg|jpeg|webp)
    right-ribbon.(svg|png|jpg|jpeg|webp)
    left-sweep.(svg|png|jpg|jpeg|webp)
    bottom-echo.(svg|png|jpg|jpeg|webp)
  contract/
    orbit-shell.(svg|png|jpg|jpeg|webp)
    right-ribbon.(svg|png|jpg|jpeg|webp)
    left-sweep.(svg|png|jpg|jpeg|webp)
    bottom-echo.(svg|png|jpg|jpeg|webp)
```

## Keyword folders

- `rent`
- `tuition`
- `labor`
- `contract`

These folder names are fixed by the current hero component code.

## Required base filenames per folder

- `orbit-shell`
- `right-ribbon`
- `left-sweep`
- `bottom-echo`

Use one of these extensions for each file:

- `.svg`
- `.png`
- `.jpg`
- `.jpeg`
- `.webp`

The current code checks these extensions in that order and uses the first file
it finds.

## Recommended asset format

- Supported: `.svg`, `.png`, `.jpg`, `.jpeg`, `.webp`
- Prefer transparent background assets
- Keep each file lightweight for fast dev/server startup
- Outline shapes and clean vector fills work best

## Practical export guidance

- `orbit-shell.svg`: organic blob or round card
- `right-ribbon.svg`: long horizontal ribbon
- `left-sweep.svg`: wide sweep band
- `bottom-echo.svg`: soft bottom accent or blob

The exact canvas size does not need to match perfectly because the hero uses
CSS background sizing and responsive containers. Keep the SVG viewBox clean and
leave a bit of internal padding if the shape needs breathing room.
