# Manny Bhidya Developer Portfolio

Static portfolio site for walking through the public `abhidya` GitHub repo archive.

The site turns the full repo list into:

- a guided tour across systems, games, data/ML, automation, and AI-assisted tooling
- featured case studies for the strongest projects
- a searchable and filterable repo atlas
- a demo shelf that labels live, static-safe, multi-device, hardware-gated, script/install, and narrated walkthrough projects

## Run locally

This site loads `data/portfolio-data.json`, so serve it over HTTP instead of opening `index.html` directly:

```sh
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Data workflow

The portfolio data is generated from the local clone inventory in the parent workspace:

```sh
node scripts/scan-repos.mjs
node scripts/build-portfolio-data.mjs
```

The generated runtime file is:

```text
data/portfolio-data.json
```

## Design source of truth

Product, UX, visual language, and implementation constraints live in:

```text
DESIGN.md
```

## Deployment

The site is static and can deploy on GitHub Pages, Vercel, Netlify, or any static host. No build step is required for the current implementation.
