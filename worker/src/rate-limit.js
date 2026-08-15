// Simple fixed-window counter per IP, stored in Workers KV.
// Not perfectly precise at window boundaries, but cheap and good enough to stop
// a leaked URL from running up an API bill.
const WINDOW_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 8;

export async function isRateLimited(ip, env) {
  const bucket = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  const key = `ratelimit:${ip}:${bucket}`;

  const current = parseInt((await env.RATE_LIMIT_KV.get(key)) || '0', 10);
  if (current >= MAX_REQUESTS_PER_WINDOW) return true;

  await env.RATE_LIMIT_KV.put(key, String(current + 1), { expirationTtl: WINDOW_SECONDS * 2 });
  return false;
}
