import Queue from "bull";

export const orderQueue = process.env.REDIS_URL
  ? new Queue("order-notifications", process.env.REDIS_URL, {
      redis: {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      },
    })
  : new Queue("order-notifications", {
      redis: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      },
    });

orderQueue.process(async (job) => {
  const { orderId, email, phone } = job.data;
  console.log(`[Queue] Sending confirmation for order ${orderId} to ${email}, ${phone}`);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(`[Queue] Confirmation sent for order ${orderId}`);
});