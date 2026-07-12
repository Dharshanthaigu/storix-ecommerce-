const autocannon = require("autocannon");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

async function run() {
  console.log("Load testing GET /api/products (20 connections, 15s)...\n");

  const result = await autocannon({
    url: `${BASE_URL}/api/products`,
    connections: 20,
    duration: 15,
  });

  autocannon.printResult(result);
}

run();