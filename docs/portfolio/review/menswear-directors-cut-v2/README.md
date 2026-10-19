# Menswear Director's Cut V2 / THE ROOM WITHIN

**Streetwear creative proposal. Not artistic approval or production integration.**

Branch: `feat/menswear-directors-cut-v2`.
Frozen reviewed baseline: `045bedaded6e3b168dafb60b010f613eca209f6c`.
V1's technical foundation is accepted; its art direction was rejected. Both
states are preserved rather than conflated. V1 files and its review branch remain
unchanged. Main was verified at `65ab3a07c2729b42cd72e50b11ff7f63767c614b`.

The film's subject is **volume finding space**. A pale architectural obstruction
becomes a room inside the very same photograph. Its source-coordinate leaves then
open around a complete teal silhouette. The camera changes what is understood
about a photograph; five changing headlines no longer supply the narrative.

## Start with motion

- [Continuous desktop browser recording](motion/desktop.mp4).
- [Continuous mobile browser recording](motion/mobile.mp4).
- [Resized return / reduced motion / fullscreen-fallback verification](motion/verification.mp4).
- [Director's treatment](TREATMENT.md): V1 critique, three alternatives, selected
  argument, seventeen directorial answers, five-act storyboard, camera,
  atmosphere, surprise, timing and portrait staging.
- Actual alternative visual tests: [desktop](alternatives-desktop.jpg) /
  [mobile](alternatives-mobile.jpg).

Use GitHub's **View raw / Download** to play the MP4 if its file viewer does not
embed video. These are continuous browser captures with real wheel/touch and
remote-key input, not animations reconstructed from stills. See [metadata](MOTION.json).

## Frames, transitions and comparisons

| Evidence | Desktop | Mobile |
| --- | --- | --- |
| Five composed act rests | [1440×900](frames-desktop.jpg) | [390×844](frames-mobile.jpg) |
| Actual transition positions | [Transition sheet](transitions-desktop.jpg) | [Transition sheet](transitions-mobile.jpg) |
| V1 versus V2, opening / disruption / hero | [Comparison](comparison-desktop.jpg) | [Comparison](comparison-mobile.jpg) |

Other required sizes: [1366×768](frames-1366x768.jpg),
[1024×768](frames-1024x768.jpg), [768×1024](frames-768x1024.jpg),
[430×932](frames-430x932.jpg).

Professional presentation check: [1920×1080 storyboard](frames-presentation.jpg)
and five [native presentation stills](presentation/). Native desktop/mobile
compositions are in [stills/](stills/). These are actual browser renders.

## Actually experience the interactive proof

**No hosted preview was deployed. A GitHub HTML source page is not a working
preview.** The following local review needs the full repository, because fonts
and source photographs are deliberately reused rather than duplicated.

```sh
git clone --branch feat/menswear-directors-cut-v2 --single-branch https://github.com/soufianeaberbach-sudo/portfolio.git
cd portfolio
python3 -m http.server 4369 --bind 127.0.0.1
```

Open:
`http://127.0.0.1:4369/docs/portfolio/review/menswear-directors-cut-v2/index.html`.

The committed [HTML source](index.html), [script bundle](proof.js) and
[stylesheet](proof.css) run without package installation, a build, a CDN or
external requests. Do not download index.html alone and expect its relative media
paths to work. Python is only the local static file server.

For source development, install the repository dependencies and run:

```sh
ASTRO_TELEMETRY_DISABLED=1 npm run dev -- --host 127.0.0.1 --port 4377
```

Open `http://127.0.0.1:4377/lab/menswear-v2/concept`.
This route is DEV-only; it emits no production page or client bundle.

### Controls

Scroll naturally; stop whenever desired. The five numbered acts can be selected
directly. **Present** holds the current composition. With the stage focused:
arrows / Page Down / Space advance; reverse arrows / Page Up / Shift+Space go
back; Home/End choose the first/last act. Keyboard events on buttons, menus and
the reader retain their native purpose. Visible controls are the fallback for
remotes with different signals. Fullscreen is separate and optional.

**Worlds** skips immediately to Streetwear, Activewear, RTW or Tailoring, without
playing intervening scenes. The last three destinations are explicitly unchanged
V1 studies, not newly authored films. **All looks** is available from the opening,
with the four genuine Streetwear candidates. No forty-look system is being built.

Select a complete photograph to inspect it. Look Closer supports drag/pinch,
keyboard pan, +/- and Fit / 0. Return restores the exact source occurrence and
held scene or scroll position. Escape unwinds inspection → reader/dialog →
Presentation Mode. Reduced motion cuts to complete act rests. No autoplay/audio.

## Truth, verification and remaining decisions

- [Source integrity, permissions and display windows](SOURCES.md). No new photo
  download, image retouching, fake angle, common campaign or owner-work claim.
- [Visual self-assessment and refinements](CRITIQUE.md).
- [Actual executed QA and limits](QA.md), [focused machine results](RESULTS.json).
- [Exact cumulative changed files](FILES.txt), relative to the frozen V1 commit.

The central architectural transformation must be judged in continuous motion.
It is a proposal about photographic framing, not a claim of real 3D travel or a
single physically photographed set. Static source limitations and the remaining
artistic risks are explicit in CRITIQUE.md. Physical iPhone Safari, hardware
remotes, projection brightness and sustained frame pacing are not certified.

**Stop for the owner's artistic approval.** No other-world implementation,
forty-look sourcing, public router change, production PR, merge or deployment.
Womenswear and all protected application surfaces remain untouched.
