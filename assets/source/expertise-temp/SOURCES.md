# Expertise page — temporary visual placeholders

**TEMPORARY PLACEHOLDER — REPLACE WITH SOUFIANE'S OWN WORK.**

None of the four images referenced by `/expertise-temp/` is Soufiane Aberbach's
work. They are free-use stock photographs standing in for his own photography
of each of the four systems. Nothing in the page layout depends on anything
inside them, so replacing one means overwriting two files and nothing else.

Alt text in `src/components/ExpertiseVisual.astro` describes only what each
photograph literally depicts and never attributes it to Soufiane.

---

## 01 — Design intent

| | |
|---|---|
| Pexels photo ID | `7256861` |
| Title | Sketchbook with design of clothes |
| Photographer | Anete Lusina |
| Source page | https://www.pexels.com/photo/7256861/ |
| Licence | Pexels License (free to use, no attribution required) |
| Files | `public/expertise-temp/01-design-intent-{800,1400}.webp` |

## 02 — Fit system

| | |
|---|---|
| Pexels photo ID | `9852972` |
| Title | Women Designing Clothes |
| Photographer | Ron Lach |
| Source page | https://www.pexels.com/photo/9852972/ |
| Licence | Pexels License (free to use, no attribution required) |
| Files | `public/expertise-temp/02-fit-system-{800,1400}.webp` |

## 03 — Technical translation

| | |
|---|---|
| Pexels photo ID | `36731157` |
| Title | Fashion Designer Working in Studio with Designs |
| Photographer | Vitaly Gariev |
| Source page | https://www.pexels.com/photo/36731157/ |
| Licence | Pexels License (free to use, no attribution required) |
| Files | `public/expertise-temp/03-technical-translation-{800,1400}.webp` |

## 04 — Production control

| | |
|---|---|
| Pexels photo ID | `31091547` |
| Title | Textile Factory Worker in Quality Control Department |
| Photographer | EqualStock IN |
| Source page | https://www.pexels.com/photo/31091547/ |
| Licence | Pexels License (free to use, no attribution required) |
| Files | `public/expertise-temp/04-production-control-{800,1400}.webp` |

---

## Current state of the files in `public/expertise-temp/`

The four photographs above **could not be downloaded in the environment this
page was built in**: its egress proxy permits only package registries, so
`www.pexels.com`, `images.pexels.com` and `api.pexels.com` all return
`connect_rejected`.

The eight files currently in `public/expertise-temp/` are therefore neutral
holding plates — a plain toned field carrying the stage number only. They are
not photographs, they do not pretend to be, and they exist so the page has no
broken image requests and no layout shift while the real files are pending.

## Getting the real images in

From any machine with network access, in the repository root:

```sh
bash .devtools/fetch-expertise-temp.sh
```

That downloads the four photo IDs above and writes the eight WebP renditions at
the exact paths the page already references. No code change is required.

To use Soufiane's own photography instead, overwrite the same eight filenames
(or change the `file` value for that stage in `ExpertiseVisual.astro`'s
`STAGES` array) and delete this note.
