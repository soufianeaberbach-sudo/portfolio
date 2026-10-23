# Womenswear art direction review board

Review-only snapshot of all nine incomplete source identities at `8e857cfb0db315dc285caeee2249913bf11ffaad`. Image production remains stopped.

Open `index.html` from this checkout to see the real source and saved native images. It uses relative file paths and embedded project fonts; it does not require a site build. For a portable offline copy, open `/workspace/artifacts/ABERBACH-Womenswear-Art-Direction-Review.html`. A printable PDF is alongside it. The portable HTML embeds the exact original image bytes, without resampling, retouching or altered garments.

The board contains nine original source images, eight saved V1 views, six owner-rejected V2 views, three unapproved V2 views and one pre-stop unreviewed output. Source and output hashes, actual dimensions and statuses are in `asset-index.json`. Technical observations and recommendations are in `technical-review.json`.

Recommendations: six preserve the original design; two improve photography; one requests an owner-defined activewear brief before any new design proposal. None authorises production or replaces an original. Fabric and rear-construction uncertainties remain explicit.

The six-viewport browser results and screenshots are in `evidence/`. Enlarged image inspection supports keyboard arrows, Escape, native-size detail and focus return. `build-board.py` recreates the board and portable HTML from this fixed manifest checkpoint and the existing image files. It generates no photographs and modifies no public Portfolio files.

Reproduction from the repository root: run `python docs/portfolio/review/womenswear-regeneration/art-direction-reset-2026-10-23/build-board.py`. With the existing project dependencies and Playwright browser installed, serve this checkout on port 4451 and run `node docs/portfolio/review/womenswear-regeneration/art-direction-reset-2026-10-23/review-board-qa.mjs`. Set `PLAYWRIGHT_BROWSERS_PATH` to the installed browser location when necessary. The browser script records screenshots and creates the portable PDF; it never runs image generation or changes featured mappings.

`evidence/VISUAL-REVIEW.md` records the manual layout review. `evidence/ARTIFACT-RECEIPT.json` records portable-output hashes and source preservation checks. These are review evidence, not owner artistic approval.

Await owner review. No merge or deployment.
