const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const TOKEN = process.env.USER_TOKEN;
const PRODUCT_ID = process.env.PRODUCT_ID;
const ADDRESS_ID = process.env.ADDRESS_ID;
const CONCURRENT_REQUESTS = parseInt(process.env.CONCURRENT_REQUESTS || "10", 10);

async function placeOrder(index) {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      items: [{ product: PRODUCT_ID, quantity: 1 }],
      address: ADDRESS_ID,
      idempotencyKey: `concurrency-test-${index}-${Date.now()}`,
    }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function main() {
  console.log(`Firing ${CONCURRENT_REQUESTS} concurrent order requests...`);

  const start = Date.now();
  const results = await Promise.all(
    Array.from({ length: CONCURRENT_REQUESTS }, (_, i) => placeOrder(i))
  );
  const duration = Date.now() - start;

  const succeeded = results.filter((r) => r.status === 201);
  const stockFailed = results.filter((r) => r.status === 409);
  const other = results.filter((r) => r.status !== 201 && r.status !== 409);

  console.log(`\nCompleted in ${duration}ms`);
  console.log(`Succeeded (201): ${succeeded.length}`);
  console.log(`Insufficient stock (409): ${stockFailed.length}`);
  console.log(`Other/unexpected: ${other.length}`);

  if (other.length > 0) {
    console.log("\nUnexpected results:");
    other.forEach((r, i) => console.log(`  [${i}] status=${r.status}`, r.body));
  }
}

main();