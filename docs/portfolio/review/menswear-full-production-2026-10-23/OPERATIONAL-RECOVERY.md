# Operational recovery log

No image-generation refusal or provider error has occurred in the production attempts recorded so far. Generation outcomes are counted in PRODUCTION.json, separately from these local engineering issues.

- Initial Astro build encountered an unavailable telemetry config directory. Re-running with the supported `ASTRO_TELEMETRY_DISABLED=1` environment option succeeded. No application defect was concealed.
- Historical licensing tests first found assets absent from the sparse checkout. Extending the sparse checkout restored tracked historical files; no historical bytes or Git records changed.
- That checkout refresh also excluded earlier locally present generated files that were outside its configured paths. Casualwear 09 master assembly stopped because the selected Front export was absent locally. All native/export files were already committed and remotely preserved. The checkout was expanded to include original, corrected and full Menswear generated asset directories, restoring exact Git bytes. Assembly and the saved selection batch resumed without image regeneration. The local copies being absent was not counted as an image-generation failure.
- Remote verification is repeated against the final selected native and master inventories, including any earlier receipt that skipped a non-materialized local path.

- A managed runtime restart interrupted an in-flight six-request image batch. Five genuine native outputs survived in `/workspace/generated_images` and were recovered, visually inspected and registered without regeneration: Activewear 06 Back/Editorial, 07 Back/Editorial and 08 Front. Activewear 09 Front had no recoverable output and is retried as a runtime interruption, not a provider safety refusal. The Git checkpoint and production manifest survived intact.
