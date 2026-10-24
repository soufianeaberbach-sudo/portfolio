# Menswear — verified production release

The actual public site at https://aberbach.co/portfolio/ serves the integrated forty-look collection. PR [#48](https://github.com/soufianeaberbach-sudo/portfolio/pull/48) merged as `a806acf1d0da0df28b5e2c52aab468de577250ca`; its tree exactly matches final tested head `6f4d45b3d1a350431f02ce6803caf1b62e4a6c7d`. An independent build of that merge completed successfully. No new fashion images were generated.

Cloudflare's existing Git-connected `portfolio` Worker deployed that merge: build `c8a7c02a-8838-46cf-8056-6056e41e4ff4`, version `24e865fc-0e30-490b-9f8e-a77cb1bec828`, successful at 2026-10-24 08:40:52 UTC. Both [final-head CI](https://github.com/soufianeaberbach-sudo/portfolio/actions/runs/40078075121) and [merged-main CI](https://github.com/soufianeaberbach-sudo/portfolio/actions/runs/40078740582) passed. See [final check-run evidence](MERGED-CHECKS-FINAL.json).

## Actual production verification

- **40/40 looks, 10/category:** Casualwear, Activewear, Outerwear, Tailoring. The original technical IDs remain compatible.
- **120/120 selected views:** all Front, Back and Editorial URLs were read from the live HTML, downloaded and SHA256 matched. All 21 cinematic actor bindings resolve to the correct new concept Front; no Pexels identity was reused. [Served assets](SERVED-ASSETS.json).
- **40/40 masters:** every live file downloaded, decoded at 5400×2700 and SHA256 matched merged main; 410,429,778 bytes checked. [Master byte verification](MASTER-BYTES.json).
- **1,452 live browser assertions passed:** all forty look sequences, all genuine views, motion/no-motion preferences, keyboard, touch, history, exact source return, presentation endpoints/interruption, media failure recovery and Womenswear continuity. [QA counts](QA-RUN.json) and [actual logs](qa/).
- **42 actual live screenshots:** 36 systematic captures across 1440×900, 1366×768, 1024×768, 768×1024, 430×932 and 390×844, plus archive, Front/Back and protected Womenswear examples. [Six-size results](screenshots/RESULTS.json), [additional capture list](EXTRA-CAPTURES.json), [screenshots](screenshots/).
- All 108 historical subjects and 31 existing Womenswear AI identities retain their exact image mappings. Live Womenswear continuity passed 98 checks and direct-source identity passed 16; the previously passing local regression suite additionally measured match-cut behavior. Historical Menswear routes passed 32 live checks. No native, normalized panel, master or historical file was changed.
- Home, Portfolio, Experience, Contact and Expertise returned HTTP 200. [Read-only page checks](OTHER-PAGES.json). No form was submitted; Worker code/configuration, DNS, secrets and credentials are unchanged.

## Visual inspection

Actual deployed screenshots were inspected at all six required sizes. Chapter hierarchy and existing typography remain clear. Full figures, heads and footwear fit their frames without stretching; Front/Back/Editorial controls and the active indicator remain distinct. Archive captions identify products, and the horizontal ten-look edit retains the editorial structure. Phone reader controls remain usable; opening construction notes gives their text space while keeping the complete image visible. Native studio backgrounds and fabric pixels are unchanged. Cinematic motion, category/garment history and original-door focus/scroll return passed on the deployed site. Womenswear remains visually intact.

Examples: [desktop chapter](screenshots/m-streetwear-1440x900.jpg), [desktop Back](screenshots/reader-back-1440x900.jpg), [phone chapter](screenshots/m-rtw-390x844.jpg), [phone Editorial](screenshots/reader-editorial-390x844.jpg), [phone archive](screenshots/archive-390x844.jpg), [Womenswear](screenshots/womenswear-390x844.jpg).

## Verification environment and limits

Chromium emulates desktop/tablet/phone sizes and touch, with the repository's production-font fixtures. Physical iPhone/Safari and hardware-projector rendering were not certified. Browser TLS verification remained enabled: the managed environment's supplied proxy CA was used through its NSS trust store. Initial Chromium trust-store access and a default Python user agent produced preflight errors; normal verified Chromium and the explicitly identified release-verification client subsequently received HTTP 200. No site security setting was changed.

These are post-deployment documentation artifacts on a dedicated verification branch. The deployed application remains the merged `a806acf1` source; no follow-up application change or additional deployment is required.
