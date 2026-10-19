# Menswear / HELD — REVEALED

**Phase A–C creative proposal, 19 October 2026. Not approved for production.**

Branch: `feat/menswear-cinematic-presentation`, based on verified main
`65ab3a07c2729b42cd72e50b11ff7f63767c614b`. No public page, Womenswear source,
shared router, production asset or configuration has changed.

The proposed film is **luxury fashion drama × visual suspense × a
speaker-controlled keynote**. Complete photographic rooms establish presence;
a controlled ink-stage reveal changes their reading without changing the images.
An oversized teal silhouette is withheld for the Streetwear payoff. Visitors can
jump directly to another world, scene or available garment at any moment.

Streetwear is the authored motion experiment. The other three worlds are five
composed storyboard/keynote studies, not finished four-world films. The proof
contains **14 distinct candidates**, not forty garments. The 40-slot plan has
26 honestly unsourced positions; none renders as a fabricated garment.

## Review in this order

1. [Read-only reconnaissance](RECONNAISSANCE.md).
2. [Director's treatment and twenty scene specifications](DIRECTORS-TREATMENT.md):
   emotion, photographic roles, camera, atmosphere, transitions and mobile staging.
3. Watch the actual browser recordings: [desktop](motion/desktop.mp4) and
   [mobile](motion/mobile.mp4). Use GitHub's **View raw / Download** if necessary.
4. Compare the four storyboard pairs below, then try the interactive proof.
5. Read the [visual critique and corrections](CRITIQUE.md), [executed QA](QA.md)
   and [navigation / presentation specification](INTERACTION.md).

| World | Desktop / five frames | Mobile / five frames |
| --- | --- | --- |
| Streetwear — Presence | [Storyboard](storyboards/desktop-m-streetwear.jpg) | [Storyboard](storyboards/mobile-m-streetwear.jpg) |
| Activewear — Momentum | [Storyboard](storyboards/desktop-m-activewear.jpg) | [Storyboard](storyboards/mobile-m-activewear.jpg) |
| Ready-to-Wear — Evolution | [Storyboard](storyboards/desktop-m-rtw.jpg) | [Storyboard](storyboards/mobile-m-rtw.jpg) |
| Tailoring — Authority | [Storyboard](storyboards/desktop-m-tailoring.jpg) | [Storyboard](storyboards/mobile-m-tailoring.jpg) |

Actual main versus proposal: [desktop](comparison-desktop.jpg) /
[mobile](comparison-mobile.jpg). These compare the public baseline with the
isolated concept; they do not imply that production was modified.

Native [1440px Streetwear opening](stills/1440-m-streetwear-0.jpg),
[threshold](stills/1440-m-streetwear-2.jpg),
[payoff](stills/1440-m-streetwear-4.jpg),
[390px opening](stills/390-m-streetwear-0.jpg),
[mobile threshold](stills/390-m-streetwear-2.jpg) and
[mobile payoff](stills/390-m-streetwear-4.jpg) are in [stills/](stills/).
The folder also contains all four worlds' native openings/endings and both-size
world selector, archive, reader and inspection screenshots.

All twenty composed frames, at every agreed size:
[1440×900](viewport-review/1440x900.jpg) ·
[1366×768](viewport-review/1366x768.jpg) ·
[1024×768](viewport-review/1024x768.jpg) ·
[768×1024](viewport-review/768x1024.jpg) ·
[430×932](viewport-review/430x932.jpg) ·
[390×844](viewport-review/390x844.jpg).
An additional [1920×1080 in-page presentation frame](projector-1920.jpg)
checks projector-sized composition, not physical projection quality.

## Run the interactive proof

GitHub's HTML source viewer does **not** execute this proof. No hosting or public
preview deployment was made. Choose either local option after cloning this branch.

**Without a build or package installation:** from the repository root run:

```sh
python3 -m http.server 4359 --bind 127.0.0.1
```

Open `http://127.0.0.1:4359/docs/portfolio/review/menswear-cinematic-concept/index.html`.
This [review HTML](index.html) uses the committed [bundle](proof.js),
[styles](proof.css), review photos and existing repository fonts/photos. It needs
the repository directory structure, not just an individually downloaded HTML.
The local proof was tested with external network requests blocked.

**Astro development:** install the repository dependencies, then:

```sh
ASTRO_TELEMETRY_DISABLED=1 npm run dev -- --host 127.0.0.1 --port 4357
```

Open `http://127.0.0.1:4357/lab/menswear/concept`.
The lab route generates **no production page or client bundle**.

Scroll to explore. **Worlds** jumps directly, bypassing other scenes. The five
numbered scene buttons and **All looks** are available immediately. **Present**
holds each composition; with the stage focused, use arrows, Page Up/Down, Space /
Shift+Space, Home/End. Fullscreen is optional; denied requests retain in-page
presentation. Visible controls are the remote-independent fallback. Open a photo,
use Look Closer, drag/pinch or +/−/0 and return to the exact occurrence. Escape
unwinds inspection, reader/dialog and then Presentation Mode.

## Evidence and content contract

- [Content / replacement strategy](CONTENT.md) and [forty proposed slots](TEN-SLOT-STRATEGY.tsv).
- [Attribution](ATTRIBUTION.md) and [fourteen-source dimensions, rights, hashes and modifications](ASSETS.json).
- [970-check results](RESULTS.json), [21 stress/input checks](STRESS.json) and
  [motion capture metadata](MOTION.json).
- [Exact cumulative changed-file manifest](FILES.txt), relative to the main base above.

All photographs are independent temporary references. The proof claims no
ABERBACH ownership, common campaign, manufactured garment relationship, hidden
Back/Side angle or technical development evidence. Current photos have one
supplied view; the reader says **PRIMARY PHOTOGRAPH**.

## Approval checkpoint

Review the photographic-room concept, ink-stage reveal, complete silhouettes,
withheld Streetwear payoff, direct Worlds selector and speaker controls. Approval
of this vocabulary is separate from approval of every category film, forty-look
curation or production integration. Activewear's mobile ending and Tailoring's
consecutive light-studio study still need stronger differentiation; see CRITIQUE.md.

No PR, merge or deployment. Stop here for the owner's artistic decision before
the full forty-look implementation or changes to protected shared code.
