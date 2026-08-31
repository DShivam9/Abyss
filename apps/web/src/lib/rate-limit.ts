import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstashEnv =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const upstashLimiter = hasUpstashEnv
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
    })
  : null;

const memoryStore = new Map<string, number[]>();

export async function checkRateLimit(ip: string): Promise<{ success: boolean; remaining: number }> {
  if (upstashLimiter) {
    const result = await upstashLimiter.limit(ip);
    return { success: result.success, remaining: result.remaining };
  }

  const now = Date.now();
  const windowMs = 60_000;
  const maxReqs = 60;

  const timestamps = (memoryStore.get(ip) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxReqs) {
    return { success: false, remaining: 0 };
  }

  timestamps.push(now);
  memoryStore.set(ip, timestamps);
  return { success: true, remaining: maxReqs - timestamps.length };
}
