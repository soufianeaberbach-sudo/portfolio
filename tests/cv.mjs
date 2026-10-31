import { spawnSync } from 'node:child_process';
// Pixel and print checks use the same established Pillow/PyMuPDF toolchain as
// other image-production scripts; they inspect delivered files, not mocks.
const result = spawnSync(process.env.PYTHON || 'python3', ['scripts/cv/verify.py', ...process.argv.slice(2)], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
