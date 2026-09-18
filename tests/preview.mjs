/* One way to stand up the built site for a test run.
 *
 * `tests/smoke.mjs` grew this logic first, then the two portfolio suites were
 * written against a server somebody had started by hand on port 4339 — so they
 * could not be run by `npm test` and were never wired into CI. This module is
 * that logic, extracted, so every suite starts its own server on its own port
 * and none of them depends on the state of the machine.
 *
 * Set PORTFOLIO_QA_URL to point a suite at a server you are already running.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HOST = '127.0.0.1';

export async function startPreview(port) {
  /* An externally supplied server wins, and is not ours to stop. */
  const external = process.env.PORTFOLIO_QA_URL;
  if (external) return { base: external.replace(/\/$/, ''), stop: () => {} };

  const astroCli = fileURLToPath(new URL('../node_modules/astro/astro.js', import.meta.url));
  const base = `http://${HOST}:${port}`;
  /* --host is load-bearing: left to itself `astro preview` binds to whatever
     `localhost` resolves to first, and on a runner where /etc/hosts maps it to
     ::1 as well the server comes up IPv6-only while the tests dial 127.0.0.1.
     detached, so the whole process group can be signalled. */
  const server = spawn(process.execPath, [astroCli, 'preview', '--host', HOST, '--port', String(port)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });

  let log = '';
  server.stdout?.on('data', (chunk) => { log += chunk; });
  server.stderr?.on('data', (chunk) => { log += chunk; });
  let exited = null;
  server.on('exit', (code, signal) => { exited = signal ? `signal ${signal}` : `code ${code}`; });

  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    try { process.kill(-server.pid, 'SIGTERM'); } catch {}
    try { server.kill('SIGKILL'); } catch {}
  };
  process.on('exit', stop);
  process.on('SIGINT', () => { stop(); process.exit(130); });

  let lastError = '';
  for (let i = 0; i < 60; i += 1) {
    if (exited !== null) break;
    try {
      const res = await fetch(base + '/');
      if (res.ok) return { base, stop };
      lastError = `HTTP ${res.status}`;
    } catch (error) {
      lastError = error?.cause?.code ?? error?.code ?? String(error?.message ?? error);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  stop();
  throw new Error(
    `preview server did not start at ${base}\n`
    + `  last error: ${lastError || 'none'}\n`
    + `  process:    ${exited === null ? 'still running' : 'exited with ' + exited}\n`
    + `  output:     ${log.trim() || '(none)'}`,
  );
}
