# Cover-focus investigation — final pre-PR hardening

Executed 2026-10-18 UTC, Chromium / Playwright 1.56.1, built preview 4371.
Starting integration: `929f24fa487352c8216664d503862df58cbc6d2e`.

## Finding

The disclosed BODY failure is reproducible. It is a test-positioning interaction,
not evidence that the router forgets its opener. The old smoke helper used
`scrollTo(0, end)` on a page with CSS smooth scrolling, then Playwright's locator
click performed automatic scroll-into-view. Under concurrent load, a further
viewport scroll continued after the chapter opened. The return target was still
stored correctly, but its opening timeline made it `visibility:hidden` at the new
scroll position, so `focus({preventScroll:true})` could not focus it.

A captured failure started at scrollY 1260, moved to 928 behind the open chapter,
and called focus on `#smoke-trigger` while it was hidden. When the closing layer
became hidden, focus fell to BODY. Window-scroll instrumentation found no router
`window.scrollTo` call producing that subsequent movement. The experiment does
not attribute a particular internal Blink algorithm; it isolates the problematic
animated positioning / automatic-scrolling combination through a one-variable A/B.

## Controlled comparisons

Same build, viewport, category-list sequence, Escape presses and 700ms final wait.
The original smoke assertion remains intact. No extra retry or longer final wait.

| Condition | Result |
| --- | --- |
| Original animated setup, serial, 5 fresh contexts | 5/5 restored focus |
| Original setup, 4 workers × 3 fresh contexts | **8/12 failed**, BODY |
| Same setup, direct pointer coordinates instead of locator auto-scroll, 4 × 2 | 8/8 restored focus |
| Only initial positioning changed to `behavior:'instant'`, 4 × 3 | 12/12 restored focus |
| Committed reproducer, old setup control, 4 × 3 | **2/12 failed**, BODY |
| Committed runner, instant setup, 4 × 3, **4× CPU throttle** | 12/12 restored focus, chapter closed, hash empty, inert released |
| Committed runner, instant setup, keyboard Enter, 4 × 2, **4× CPU throttle** | 8/8 restored focus with the same closure checks |
| Complete smoke and opening suites run concurrently after stabilization | **352/352 and 100/100**, including the unchanged smoke focus assertion |

Failure frequency varies with scheduling. The failing controls are deliberately
reported, not counted as passing regressions. Representative traces and settings
are in [focus-evidence.json](focus-evidence.json).

## Correction and reproduction

Only the smoke helper's initial fixture scroll is synchronous now. The protected
opening, production chapter router, focus restoration and image transitions were
not changed for this investigation. Test positioning does not simulate visitor
scrolling; the opening suite still exercises the actual cinematic scroll.

`tests/rtw-focus.mjs` retains the exact navigation sequence and records focus,
visibility, inert state, hash and viewport scroll. With a built preview running:

```sh
PORTFOLIO_QA_URL=http://127.0.0.1:4371 FOCUS_CPU=4 node tests/rtw-focus.mjs
PORTFOLIO_QA_URL=http://127.0.0.1:4371 FOCUS_CPU=4 FOCUS_INPUT=keyboard FOCUS_RUNS=2 node tests/rtw-focus.mjs
# Diagnostic control: can exit 1, intentionally reinstates the old setup.
PORTFOLIO_QA_URL=http://127.0.0.1:4371 FOCUS_SETUP=smooth node tests/rtw-focus.mjs
```

Use the installed matching Playwright Chromium (`PLAYWRIGHT_BROWSERS_PATH` where
needed). The default regression mode is instant; the old control is opt-in.

## CI isolation

Build once before launching browsers. Never rebuild or replace `dist` while a
suite navigates. Run smoke as its existing dedicated CI step; it owns a preview
port and the following fixture port. Reserve both (locally 4380/4381). Other suites
need a separate immutable preview (locally 4371). Avoid parallel screenshot/video
capture jobs on the same small runner. The final concurrent smoke/opening run
passed, so serialization is resource isolation, not a substitute for the fix.
No CI/deployment configuration was modified.

The additional input suite passed **373 checks**: keyboard discovery of every
archive link, touch swipes, repeated exact occurrence/scroll returns, early
pointer interruption and reduced-motion preference changes. Existing suites add
cold deep links, Back/Forward, all front/back sources, inspection, pinch and resize.
Physical Safari and hardware frame-time certification remain separate limitations.
