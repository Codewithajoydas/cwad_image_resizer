import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { DAILY_IMAGE_LIMIT } from "@/config/rate-limit";

const redis = Redis.fromEnv();

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(DAILY_IMAGE_LIMIT, "24 h"),
});