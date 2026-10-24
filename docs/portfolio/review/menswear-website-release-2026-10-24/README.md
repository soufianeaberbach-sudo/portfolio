# ABERBACH — Menswear website integration and release

Forty existing original AI concepts, 120 genuine Front / Back / Editorial photographs and forty masters are integrated into Casualwear, Activewear, Outerwear and Tailoring, ten looks each. No new fashion imagery or garment design was produced in this phase. Native files, normalized panels, masters and historical records are unchanged.

## Visitor experience

The established chapter, cinematic camera system, GSAP progression, Presentation Mode, source-coordinate entry/return, inspection zoom and route grammar remain. Numeric actor keys resolve through featured positions to the independent new concept identities. Every category exposes its complete ten-look archive and a circular previous/next look sequence; Page Up / Page Down changes looks while arrow keys still select genuine views. Moving between looks retains the original exhibition door, focus and scroll position. All fifty historical Menswear subjects remain separately routable with their original media/credits. Womenswear source, photography and mappings are unchanged.

Concept name and product type are visible in the archive and reader. Original AI provenance and proposed construction notes remain honest about the absence of physical sampling/manufacture. The Casualwear studio portraits now use continuous photographic-plane camera choreography; the phone handoff keeps both complete figures visible. No generic product grid, fabricated view, anatomy morph or photo fade replaced the cinematic experience. Decorative photo outlines were removed; native white studio fields remain unretouched.

## Delivery and integrity

Existing 600px WebP previews are retained. Additional 1200px and 1800px WebP delivery derivatives come only from the already selected panels, with correct portrait proportions and recorded source/output SHA256. Full 1800px delivery totals 26.7 MB versus 410.6 MB for the PNG panels (93.5% fewer bytes). The site does not load a 5400px master for each small preview. All native files and original exports remain available and unchanged.

- [Asset integrity and source preservation](ASSET-AUDIT.json): 4,686 passed checks, including preservation of 2,676 pre-existing asset/review blobs.
- [Remote delivery verification](REMOTE-DELIVERY.json): all 240 new derivatives downloaded from the immutable source commit and SHA256 matched.
- [Served-site verification](LOCAL-SERVED-ASSETS.json): all 120 served view files byte-verified; forty masters available; all 108 historical subjects and 31 existing Womenswear AI identities retain their exact source mapping.
- [Executed QA and source hashes](QA-RUN.json): 10,722 counted local checks passed, plus the shared original-source fingerprint guard.
- [Actual six-viewport screenshots](local/RESULTS.json): 36 gallery/reader captures.
- [Visual critique and refinements](VISUAL-QA.md).
- [Actual logs](qa/).

## Release authority and status

The latest owner instruction explicitly authorizes integration, PR #48 merge and deployment using existing infrastructure, without additional artistic approval. This pre-merge dossier records the tested source and local evidence; the actual merge/deployment outcome is verified through PR #48, the Cloudflare build associated with the merged main commit, and subsequent live evidence. Earlier production/reset approval gates and no-deploy statements remain preserved as dated historical records.

The existing main commit has a successful `Workers Builds: portfolio` check from Cloudflare's GitHub app. The configured Worker name is `portfolio`; `wrangler.jsonc`, Worker code, DNS and secrets are unchanged. Wrangler in this execution is unauthenticated, so production release uses the existing Git-connected Cloudflare build and is verified after merge. A merge alone is not treated as deployment proof.

## QA scope and limitations

All forty look sequences, all 120 selected views, historical routes, Back/Forward, exact source return, keyboard, native touch, reduced motion and the six required viewport sizes were exercised. Local Womenswear checks passed: 204 content, 98 continuity, 48 measured match-cut and 16 route-identity checks, alongside shared navigation and source-integrity regressions. Source CI [40076247656](https://github.com/soufianeaberbach-sudo/portfolio/actions/runs/40076247656) passed all steps. Final PR-head checks are verified separately before merge.

Exploratory testing first asserted a view change before its asynchronous decode completed; the assertion now waits for the actual visible panel. An Astro dev toolbar also intercepted an exploratory camera click; final visual and regression evidence uses the production build without the dev toolbar. Neither preliminary attempt is counted as a final passed check. The final browser evidence is Chromium emulation, not physical iPhone/Safari or projector certification.
