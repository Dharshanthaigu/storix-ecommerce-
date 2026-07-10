import Redis from "ioredis";

const redisClient = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
})

redisClient.on("connect", () => {
    console.log("Redis client connected");
})

redisClient.on("error", (err) => {
    console.log("Redis client error", err)
})

export default redisClient