const buckets = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const BURST_MS = 30 * 1000;
const WINDOW_LIMIT = 20;
const BURST_LIMIT = 5;

export function checkAiRateLimit({ userId, assistantType, now = Date.now() }) {
  const key = `${userId}:${assistantType}`;
  const bucket = buckets.get(key) || [];
  const active = bucket.filter((timestamp) => now - timestamp < WINDOW_MS);
  const burst = active.filter((timestamp) => now - timestamp < BURST_MS);

  if (active.length >= WINDOW_LIMIT || burst.length >= BURST_LIMIT) {
    buckets.set(key, active);
    return { allowed: false, retryAfterSeconds: 60 };
  }

  active.push(now);
  buckets.set(key, active);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetAiRateLimits() {
  buckets.clear();
}
