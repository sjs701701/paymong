# Hero Keyword Assets

Place the hero decorative image assets in this folder structure:

```text
public/design/hero-keywords/
  rent/
    orbit-shell.webp
    right-ribbon.webp
    left-sweep.webp
    bottom-echo.webp
  tuition/
    orbit-shell.webp
    right-ribbon.webp
    left-sweep.webp
    bottom-echo.webp
  labor/
    orbit-shell.webp
    right-ribbon.webp
    left-sweep.webp
    bottom-echo.webp
  contract/
    orbit-shell.webp
    right-ribbon.webp
    left-sweep.webp
    bottom-echo.webp
```

## Keyword folders

- `rent`
- `tuition`
- `labor`
- `contract`

These folder names are fixed by the current hero component code.

## Required filenames per folder

- `orbit-shell.webp`
- `right-ribbon.webp`
- `left-sweep.webp`
- `bottom-echo.webp`

These filenames are also fixed by the current code.

## Recommended asset format

- Use `.webp`
- Prefer transparent background assets
- Export in RGB/RGBA
- Keep each file lightweight for fast dev/server startup

## Practical export guidance

- `orbit-shell.webp`: organic blob or round card, around `1200x900`
- `right-ribbon.webp`: long horizontal ribbon, around `1400x600`
- `left-sweep.webp`: wide sweep band, around `1600x700`
- `bottom-echo.webp`: soft bottom accent or blob, around `1200x900`

The exact size does not need to match perfectly because the hero uses CSS
background sizing and responsive containers. A 2x export with transparent
padding usually works well.
