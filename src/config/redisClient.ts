import Redis from "ioredis";

const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      retryStrategy(times) {
        return Math.min(times * 100, 2000);
      },
    })
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
    });

redisClient.on("connect", () => {
    console.log("Redis client connected");
})

redisClient.on("error", (err) => {
    console.log("Redis client error", err)
})

export default redisClient