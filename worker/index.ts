interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface KvBinding {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

interface Env {
  ASSETS: AssetsBinding;
  BRIEFS: KvBinding;
  RESEND_API_KEY?: string;
  BRIEF_TO?: string;
  BRIEF_FROM?: string;
  TURNSTILE_SECRET?: string;
}

interface BriefFields {
  name: string;
  company: string;
  email: string;
  stage: string;
  message: string;
  referenceUrl: string;
}

interface SendStatus {
  state: 'pending' | 'sent' | 'config_missing' | 'failed';
  provider: 'resend';
  providerId?: string;
  updatedAt?: string;
  httpStatus?: number;
}

interface StoredBrief {
  id: string;
  timestamp: string;
  fields: BriefFields;
  sendStatus: SendStatus;
}

const ALLOWED_STAGES = new Set([
  'idea-reference',
  'in-development',
  'fit-sample',
  'pre-production',
  'production-issue',
]);
const RATE_WINDOW_SECONDS = 10 * 60;
const RATE_LIMIT = 5;
const MIN_SUBMIT_MS = 2_500;
const MAX_BODY_BYTES = 64 * 1024;
const DIRECT_EMAIL = 'soufiane.aberbach@gmail.com';

const responseHeaders = {
  'Cache-Control': 'no-store',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'",
  'X-Content-Type-Options': 'nosniff',
};

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...responseHeaders, ...extraHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] ?? character);
}

function htmlError(message: string, status: number) {
  return new Response(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Brief not sent</title>
<style>body{margin:0;background:#f4f0e7;color:#11110f;font:16px/1.6 system-ui,sans-serif}main{max-width:42rem;margin:auto;padding:12vh 7vw}h1{font-size:clamp(2.5rem,8vw,5rem);line-height:.95}a{color:#c94719;font-weight:700}</style></head>
<body><main><p>Development brief</p><h1>The brief was not sent.</h1><p>${escapeHtml(message)}</p><p><a href="/contact/">Return to the form</a> or <a href="mailto:${DIRECT_EMAIL}">send a direct email</a>.</p></main></body></html>`, {
    status,
    headers: { ...responseHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function failure(request: Request, code: string, message: string, status: number, errors?: Record<string, string>) {
  const wantsJson = request.headers.get('Accept')?.includes('application/json') || request.headers.get('Content-Type')?.includes('application/json');
  return wantsJson ? json({ ok: false, code, message, errors }, status) : htmlError(message, status);
}

function readString(input: Record<string, unknown>, key: string) {
  const value = input[key];
  return typeof value === 'string' ? value.trim() : '';
}

async function readPayload(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('Content-Type') ?? '';
  if (contentType.includes('application/json')) {
    const value = await request.json();
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('INVALID_BODY');
    return value as Record<string, unknown>;
  }
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    return Object.fromEntries((await request.formData()).entries());
  }
  throw new Error('UNSUPPORTED_MEDIA_TYPE');
}

function validate(input: Record<string, unknown>) {
  const fields: BriefFields = {
    name: readString(input, 'name'),
    company: readString(input, 'company'),
    email: readString(input, 'email').toLowerCase(),
    stage: readString(input, 'stage'),
    message: readString(input, 'message'),
    referenceUrl: readString(input, 'referenceUrl'),
  };
  const errors: Record<string, string> = {};

  if (fields.name.length < 2 || fields.name.length > 120) errors.name = 'Enter a name between 2 and 120 characters.';
  if (fields.company.length > 160) errors.company = 'Keep the company or brand name under 160 characters.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) || fields.email.length > 254) errors.email = 'Enter a valid email address.';
  if (!ALLOWED_STAGES.has(fields.stage)) errors.stage = 'Choose the current product stage.';
  if (fields.message.length < 10 || fields.message.length > 5000) errors.message = 'Describe the problem in 10 to 5,000 characters.';
  if (fields.referenceUrl) {
    try {
      const url = new URL(fields.referenceUrl);
      if (!['http:', 'https:'].includes(url.protocol) || fields.referenceUrl.length > 2048) throw new Error('INVALID_URL');
    } catch {
      errors.referenceUrl = 'Enter a complete http or https link.';
    }
  }

  return { fields, errors };
}

async function hash(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function checkRateLimit(request: Request, env: Env) {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const window = Math.floor(Date.now() / (RATE_WINDOW_SECONDS * 1000));
  const key = `rate:${await hash(ip)}:${window}`;
  const count = Number.parseInt(await env.BRIEFS.get(key) ?? '0', 10);
  if (Number.isFinite(count) && count >= RATE_LIMIT) return false;
  await env.BRIEFS.put(key, String((Number.isFinite(count) ? count : 0) + 1), { expirationTtl: RATE_WINDOW_SECONDS });
  return true;
}

async function verifyTurnstile(input: Record<string, unknown>, request: Request, env: Env) {
  if (!env.TURNSTILE_SECRET) return true;
  const token = readString(input, 'cf-turnstile-response');
  if (!token) return false;

  const body = new FormData();
  body.set('secret', env.TURNSTILE_SECRET);
  body.set('response', token);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) body.set('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  if (!response.ok) return false;
  const result = await response.json() as { success?: boolean };
  return result.success === true;
}

function emailBody(brief: StoredBrief) {
  const stageLabels: Record<string, string> = {
    'idea-reference': 'Idea / reference',
    'in-development': 'In development',
    'fit-sample': 'Fit / sample',
    'pre-production': 'Pre-production',
    'production-issue': 'Production issue',
  };
  return [
    `Brief reference: ${brief.id}`,
    `Submitted: ${brief.timestamp}`,
    '',
    `Name: ${brief.fields.name}`,
    `Company / brand: ${brief.fields.company || 'Not provided'}`,
    `Email: ${brief.fields.email}`,
    `Product stage: ${stageLabels[brief.fields.stage]}`,
    `Reference link: ${brief.fields.referenceUrl || 'Not provided'}`,
    '',
    'What needs solving:',
    brief.fields.message,
  ].join('\n');
}

async function sendEmail(brief: StoredBrief, env: Env) {
  const apiKey = env.RESEND_API_KEY?.trim();
  const to = env.BRIEF_TO?.trim();
  const from = env.BRIEF_FROM?.trim();
  if (!apiKey || !to || !from) return { ok: false as const, configMissing: true as const };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: brief.fields.email,
      subject: `Development brief — ${brief.fields.name}`,
      text: emailBody(brief),
    }),
  });
  if (!response.ok) return { ok: false as const, configMissing: false as const, status: response.status };
  const data = await response.json() as { id?: string };
  return { ok: true as const, id: data.id };
}

async function handleBrief(request: Request, env: Env) {
  const declaredSize = Number.parseInt(request.headers.get('Content-Length') ?? '0', 10);
  if (declaredSize > MAX_BODY_BYTES) return failure(request, 'BODY_TOO_LARGE', 'The submitted brief is too large.', 413);
  if (!env.BRIEFS) return failure(request, 'STORAGE_UNAVAILABLE', 'Brief storage is not configured yet.', 503);

  let input: Record<string, unknown>;
  try {
    input = await readPayload(request);
  } catch (error) {
    const unsupported = error instanceof Error && error.message === 'UNSUPPORTED_MEDIA_TYPE';
    return failure(request, unsupported ? 'UNSUPPORTED_MEDIA_TYPE' : 'INVALID_BODY', unsupported ? 'Submit the brief as JSON or a standard web form.' : 'The submitted brief could not be read.', unsupported ? 415 : 400);
  }

  if (readString(input, 'website')) return failure(request, 'SPAM_DETECTED', 'The anti-spam check rejected this brief.', 400);
  const startedAt = Number(readString(input, 'startedAt'));
  if (!Number.isFinite(startedAt) || startedAt <= 0 || Date.now() - startedAt < MIN_SUBMIT_MS) {
    return failure(request, 'SPAM_DETECTED', 'The brief was submitted too quickly. Please try again.', 400);
  }

  const { fields, errors } = validate(input);
  if (Object.keys(errors).length) return failure(request, 'INVALID', 'Please check the highlighted fields.', 400, errors);

  try {
    if (!(await checkRateLimit(request, env))) return failure(request, 'RATE_LIMITED', 'Too many briefs were sent from this connection. Please wait before trying again.', 429, undefined);
  } catch (error) {
    console.error('Brief rate-limit storage failed', error);
    return failure(request, 'STORAGE_UNAVAILABLE', 'Brief storage is temporarily unavailable.', 503);
  }

  try {
    if (!(await verifyTurnstile(input, request, env))) return failure(request, 'TURNSTILE_FAILED', 'The anti-spam check could not verify this brief.', 400);
  } catch (error) {
    console.error('Turnstile verification failed', error);
    return failure(request, 'TURNSTILE_FAILED', 'The anti-spam check is temporarily unavailable.', 503);
  }

  const now = new Date().toISOString();
  const brief: StoredBrief = {
    id: `brief_${crypto.randomUUID()}`,
    timestamp: now,
    fields,
    sendStatus: { state: 'pending', provider: 'resend', updatedAt: now },
  };
  const storageKey = `brief:${brief.timestamp}:${brief.id}`;

  try {
    await env.BRIEFS.put(storageKey, JSON.stringify(brief));
  } catch (error) {
    console.error('Brief persistence failed', error);
    return failure(request, 'STORAGE_UNAVAILABLE', 'The brief could not be recorded. Your information has not been reported as sent.', 503);
  }

  const delivery = await sendEmail(brief, env).catch((error) => {
    console.error('Brief email request failed', error);
    return { ok: false as const, configMissing: false as const, status: 0 };
  });

  if (!delivery.ok) {
    brief.sendStatus = {
      state: delivery.configMissing ? 'config_missing' : 'failed',
      provider: 'resend',
      updatedAt: new Date().toISOString(),
      ...(!delivery.configMissing && { httpStatus: delivery.status }),
    };
    await env.BRIEFS.put(storageKey, JSON.stringify(brief)).catch((error) => console.error('Brief status update failed', error));
    return failure(
      request,
      delivery.configMissing ? 'EMAIL_NOT_CONFIGURED' : 'EMAIL_DELIVERY_FAILED',
      delivery.configMissing ? 'The brief was recorded, but email delivery is not configured yet. Please use direct email.' : 'The brief was recorded, but email delivery failed. Please retry or use direct email.',
      delivery.configMissing ? 503 : 502,
    );
  }

  brief.sendStatus = { state: 'sent', provider: 'resend', providerId: delivery.id, updatedAt: new Date().toISOString() };
  try {
    await env.BRIEFS.put(storageKey, JSON.stringify(brief));
  } catch (error) {
    console.error('Brief sent-status update failed', error);
    return failure(request, 'STATUS_UPDATE_FAILED', 'The email was sent, but its stored delivery status could not be updated. Please do not resubmit; use direct email if needed.', 500);
  }

  const wantsJson = request.headers.get('Accept')?.includes('application/json') || request.headers.get('Content-Type')?.includes('application/json');
  if (wantsJson) return json({ ok: true, id: brief.id }, 201);
  return new Response(null, { status: 303, headers: { Location: '/contact/sent/', 'Cache-Control': 'no-store' } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/brief') {
      if (request.method !== 'POST') {
        return failure(request, 'METHOD_NOT_ALLOWED', 'Only POST requests are accepted for this endpoint.', 405, undefined);
      }
      return handleBrief(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
